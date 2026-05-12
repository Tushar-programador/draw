import { useCallback, useEffect, useRef } from "react";
import * as Y from "yjs";
import type { TLStore } from "@tldraw/tldraw";
import { getSocket } from "../lib/socket.js";

interface Options {
  documentId: string;
  token: string;
  store: TLStore;
}

/**
 * Connects the tldraw store to the Hocuspocus/Yjs back-end via Socket.io.
 *
 * Flow:
 *  1. Open a Socket.io connection to the server.
 *  2. Join the document room for cursor presence.
 *  3. Create a Y.Doc and sync it with the server via the /collab namespace.
 *  4. Mirror Y.Map<TLRecord> changes ↔ tldraw store changes.
 */
export function useCollaboration({ documentId, token, store }: Options) {
  const ydocRef = useRef<Y.Doc | null>(null);

  const bindStore = useCallback(() => {
    const socket = getSocket(token);

    // Join the document room for cursor presence
    socket.emit("join-document", documentId);

    // Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const yRecords = ydoc.getMap<unknown>("records");

    // ── tldraw → Yjs ──────────────────────────────────────────────────────────
    const unsubscribe = store.listen(
      ({ changes }) => {
        ydoc.transact(() => {
          for (const [id, record] of Object.entries(changes.added)) {
            yRecords.set(id, record);
          }
          for (const [id, [, updated]] of Object.entries(changes.updated)) {
            yRecords.set(id, updated);
          }
          for (const id of Object.keys(changes.removed)) {
            yRecords.delete(id);
          }
        }, "tldraw");
      },
      { source: "user", scope: "document" }
    );

    // ── Yjs → tldraw ──────────────────────────────────────────────────────────
    yRecords.observe((event) => {
      if (event.transaction.origin === "tldraw") return;
      store.mergeRemoteChanges(() => {
        for (const [key, change] of event.changes.keys) {
          if (change.action === "delete") {
            store.remove([key as Parameters<typeof store.remove>[0][0]]);
          } else {
            store.put([yRecords.get(key) as Parameters<typeof store.put>[0][0]]);
          }
        }
      });
    });

    return () => {
      unsubscribe();
      ydoc.destroy();
    };
  }, [documentId, token, store]);

  // Cursor broadcasting
  useEffect(() => {
    const socket = getSocket(token);

    const handleMouseMove = (e: MouseEvent) => {
      socket.emit("cursor-move", { documentId, x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [documentId, token]);

  return { bindStore };
}
