import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tldraw/tldraw";

const AUTOSAVE_INTERVAL_MS = 5_000;
const STORAGE_PREFIX = "zenith_canvas_";

type SaveStatus = "saved" | "saving" | "unsaved";

/**
 * Persists canvas state entirely on the user's own device:
 *  - Auto-saves to localStorage every 5 s when dirty
 *  - Restores from localStorage on first mount
 *  - saveToFile()  → File System Access API (Chrome/Edge) or fallback download
 *  - loadFromFile() → File System Access API or fallback <input type="file">
 *
 * The server never receives raw drawing data — only document metadata.
 */
export function useLocalCanvas(editor: Editor | null, documentId: string) {
  const storageKey = `${STORAGE_PREFIX}${documentId}`;
  const dirty = useRef(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  // ── Restore from localStorage on first mount ───────────────────────────────
  useEffect(() => {
    if (!editor) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        editor.loadSnapshot(JSON.parse(saved) as Parameters<typeof editor.loadSnapshot>[0]);
      }
    } catch {
      // corrupted data — start fresh
    }
  }, [editor, storageKey]);

  // ── Track dirty state ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return;
    const unlisten = editor.store.listen(
      () => {
        dirty.current = true;
        setSaveStatus("unsaved");
      },
      { source: "user", scope: "document" }
    );
    return unlisten;
  }, [editor]);

  // ── Auto-save to localStorage every 5 s when dirty ────────────────────────
  useEffect(() => {
    if (!editor) return;
    const interval = setInterval(() => {
      if (!dirty.current) return;
      dirty.current = false;
      setSaveStatus("saving");
      try {
        localStorage.setItem(storageKey, JSON.stringify(editor.getSnapshot()));
        setSaveStatus("saved");
      } catch {
        // localStorage quota exceeded — silently skip
        setSaveStatus("unsaved");
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [editor, storageKey]);

  // ── Save to file ───────────────────────────────────────────────────────────
  const saveToFile = useCallback(async () => {
    if (!editor) return;
    const json = JSON.stringify(editor.getSnapshot(), null, 2);

    // Modern: File System Access API (Chrome 86+, Edge 86+)
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (
          window as unknown as {
            showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
          }
        ).showSaveFilePicker({
          suggestedName: "canvas.tldr",
          types: [
            {
              description: "Zenith Canvas file",
              accept: { "application/json": [".tldr"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return;
      } catch (err) {
        // User cancelled (AbortError) — do nothing; other errors fall through to download
        if ((err as { name?: string }).name === "AbortError") return;
      }
    }

    // Fallback: trigger a browser download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas.tldr";
    a.click();
    URL.revokeObjectURL(url);
  }, [editor]);

  // ── Load from file ─────────────────────────────────────────────────────────
  const loadFromFile = useCallback(async () => {
    if (!editor) return;

    const applySnapshot = (text: string) => {
      try {
        editor.loadSnapshot(
          JSON.parse(text) as Parameters<typeof editor.loadSnapshot>[0]
        );
      } catch {
        alert("Could not load file — it may be corrupted or an unsupported format.");
      }
    };

    // Modern: File System Access API
    if ("showOpenFilePicker" in window) {
      try {
        const [handle] = await (
          window as unknown as {
            showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>;
          }
        ).showOpenFilePicker({
          types: [
            {
              description: "Zenith Canvas file",
              accept: { "application/json": [".tldr"] },
            },
          ],
          multiple: false,
        });
        if (!handle) return;
        const file = await handle.getFile();
        applySnapshot(await file.text());
        return;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
      }
    }

    // Fallback: hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".tldr,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      applySnapshot(await file.text());
    };
    input.click();
  }, [editor]);

  return { saveToFile, loadFromFile, saveStatus };
}
