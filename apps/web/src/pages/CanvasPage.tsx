import { useEffect, useRef, useState } from "react";
import { TldrawCanvas } from "../components/Canvas/TldrawCanvas.js";
import type { AuthState } from "../App.js";

interface Props {
  auth: NonNullable<AuthState>;
  onLogout: () => void;
}

export function CanvasPage({ auth, onLogout }: Props) {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    // Bootstrap: create or load the first workspace & document for this user
    void (async () => {
      // 1. Get workspaces
      let wsRes = await fetch("/api/workspaces", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      let workspaces = (await wsRes.json()) as Array<{ id: string }>;

      if (!workspaces.length) {
        wsRes = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify({ name: `${auth.name}'s Workspace`, slug: auth.userId }),
        });
        const ws = (await wsRes.json()) as { id: string };
        workspaces = [ws];
      }

      const wid = workspaces[0]!.id;
      setWorkspaceId(wid);

      // 2. Get documents
      let docsRes = await fetch(`/api/workspaces/${wid}/documents`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      let docs = (await docsRes.json()) as Array<{ id: string }>;

      if (!docs.length) {
        docsRes = await fetch(`/api/workspaces/${wid}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify({ title: "My First Canvas" }),
        });
        const doc = (await docsRes.json()) as { id: string };
        docs = [doc];
      }

      setDocumentId(docs[0]!.id);
    })();
  }, [auth]);

  if (!documentId || !workspaceId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>Loading canvas…</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 16px",
          background: "rgba(15,15,15,0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15 }}>⚡ Zenith Canvas</span>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{auth.name}</span>
        <button
          onClick={onLogout}
          style={{ fontSize: 12, background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      {/* Canvas fills the rest of the viewport */}
      <TldrawCanvas
        documentId={documentId}
        token={auth.token}
        style={{ paddingTop: 40 }}
      />
    </div>
  );
}
