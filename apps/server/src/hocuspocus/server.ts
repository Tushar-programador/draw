import { Server as HocuspocusServer } from "@hocuspocus/server";
import { MongodbPersistence } from "@hocuspocus/extension-mongodb";
import type { Db } from "mongodb";
import type { Server as SocketIOServer } from "socket.io";

/**
 * Builds the Hocuspocus server that handles Yjs CRDT sync and persists
 * document snapshots to MongoDB.  The Socket.io server proxies WebSocket
 * upgrade events into Hocuspocus so both live on the same HTTP port.
 */
export function createHocuspocusServer(mongo: Db, io: SocketIOServer) {
  const hocuspocus = HocuspocusServer.configure({
    extensions: [
      new MongodbPersistence({
        database: mongo,
        collection: "yjs_documents",
      }),
    ],

    async onAuthenticate({ token }) {
      // TODO: validate JWT token extracted from the WebSocket connection params
      // and return the user payload so it is available in hooks.
      if (!token) throw new Error("Authentication required");
    },

    async onChange({ documentName, document }) {
      // Optionally: update `DocumentMeta.updatedAt` in PostgreSQL here via
      // an event emitter / queue to avoid tight coupling.
      void documentName;
      void document;
    },
  });

  // Bridge Socket.io's underlying WebSocket transport into Hocuspocus
  io.of("/collab").on("connection", (socket) => {
    const ws = (socket as unknown as { conn: { transport: { socket: WebSocket } } }).conn.transport
      .socket;
    hocuspocus.handleConnection(ws, socket.request);
  });

  return hocuspocus;
}
