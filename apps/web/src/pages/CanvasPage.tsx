import { useEffect, useRef, useState, useCallback } from "react";
import type { Editor } from "@tldraw/tldraw";
import { TldrawCanvas } from "../components/Canvas/TldrawCanvas.js";
import { useLocalCanvas } from "../hooks/useLocalCanvas.js";
import type { AuthState } from "../App.js";

interface Props {
  auth: NonNullable<AuthState>;
  onLogout: () => void;
}

const statusLabel: Record<string, string> = {
  saved: "Saved locally",
  saving: "Saving…",
  unsaved: "Unsaved changes",
};

const statusColor: Record<string, string> = {
  saved: "#4ade80",
  saving: "#fbbf24",
  unsaved: "#f87171",
};

export function CanvasPage({ auth, onLogout }: Props) {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const initialised = useRef(false);

  const { saveToFile, loadFromFile, saveStatus } = useLocalCanvas(editor, documentId ?? "default");

  const handleEditorMount = useCallback((e: Editor) => setEditor(e), []);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    void (async () => {
      try {
        let wsRes = await fetch("/api/workspaces", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!wsRes.ok) throw new Error(`Workspace fetch failed: ${wsRes.status}`);
        let workspaces = (await wsRes.json()) as Array<{ id: string }>;

        if (!workspaces.length) {
          wsRes = await fetch("/api/workspaces", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
            body: JSON.stringify({ name: `${auth.name}'s Workspace`, slug: auth.userId.slice(0, 40) }),
          });
          if (!wsRes.ok) throw new Error(`Workspace create failed: ${wsRes.status}`);
          workspaces = [(await wsRes.json()) as { id: string }];
        }

        const wid = workspaces[0]!.id;

        let docsRes = await fetch(`/api/workspaces/${wid}/documents`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!docsRes.ok) throw new Error(`Documents fetch failed: ${docsRes.status}`);
        let docs = (await docsRes.json()) as Array<{ id: string }>;

        if (!docs.length) {
          docsRes = await fetch(`/api/workspaces/${wid}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
            body: JSON.stringify({ title: "My First Canvas" }),
          });
          if (!docsRes.ok) throw new Error(`Document create failed: ${docsRes.status}`);
          docs = [(await docsRes.json()) as { id: string }];
        }

        setDocumentId(docs[0]!.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load canvas");
      }
    })();
  }, [auth]);

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
        <p style={{ color: "#f87171" }}>{error}</p>
        <button onClick={onLogout} style={btnStyle}>Sign out and try again</button>
      </div>
    );
  }

  if (!documentId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "#94a3b8" }}>Loading canvas…</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={topBarStyle}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Zenith Canvas</span>

        {/* Save status indicator */}
        <span style={{ fontSize: 12, color: statusColor[saveStatus] }}>
          ● {statusLabel[saveStatus]}
        </span>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => void saveToFile()} style={btnStyle} title="Save canvas to a .tldr file on your drive">
            Export
          </button>
          <button onClick={() => void loadFromFile()} style={{ ...btnStyle, background: "transparent", border: "1px solid #334155" }} title="Open a .tldr file from your drive">
            Open file
          </button>
          <span style={{ fontSize: 13, color: "#64748b", borderLeft: "1px solid #1e293b", paddingLeft: 8 }}>
            {auth.name}
          </span>
          <button onClick={onLogout} style={{ ...btnStyle, background: "transparent", border: "1px solid #334155", color: "#94a3b8" }}>
            Sign out
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <TldrawCanvas
        documentId={documentId}
        token={auth.token}
        style={{ top: 40 }}
        onEditorMount={handleEditorMount}
      />
    </div>
  );
}

const topBarStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 16px",
  background: "rgba(15,15,15,0.9)",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid #1e293b",
  height: 40,
};

const btnStyle: React.CSSProperties = {
  fontSize: 12,
  background: "#1e293b",
  border: "none",
  borderRadius: 6,
  color: "#f0f0f0",
  padding: "4px 10px",
  cursor: "pointer",
};
