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

type DashboardFile = {
  id: string;
  title: string;
  stage: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  workspaceName: string;
  workspaceId: string;
  updatedAt: string;
  driveWebViewLink?: string | null;
};

type GoogleTokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type GoogleOAuth = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void;
    }) => GoogleTokenClient;
  };
};

type GoogleWindow = Window & {
  google?: {
    accounts?: GoogleOAuth;
  };
};

let gsiLoader: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (gsiLoader) return gsiLoader;
  gsiLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google identity script"));
    document.head.appendChild(script);
  });
  return gsiLoader;
}

async function getGoogleDriveAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is missing in apps/web/.env");
  }

  await loadGoogleScript();
  const win = window as GoogleWindow;
  const oauth = win.google?.accounts;
  if (!oauth) throw new Error("Google accounts SDK is not available");

  return new Promise((resolve, reject) => {
    const tokenClient = oauth.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (response) => {
        if (!response.access_token || !response.expires_in || response.error) {
          reject(new Error(response.error ?? "Failed to obtain Google Drive permission"));
          return;
        }
        resolve({ accessToken: response.access_token, expiresIn: response.expires_in });
      },
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

const stageLabel: Record<DashboardFile["stage"], string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export function CanvasPage({ auth, onLogout }: Props) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DashboardFile[]>([]);
  const [dashboardFiles, setDashboardFiles] = useState<DashboardFile[]>([]);
  const [driveConnected, setDriveConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const initialised = useRef(false);

  const { saveToFile, loadFromFile, saveStatus } = useLocalCanvas(editor, documentId ?? "default");

  const handleEditorMount = useCallback((e: Editor) => setEditor(e), []);

  const tokenHeader = { Authorization: `Bearer ${auth.token}` };

  const loadDashboardFiles = useCallback(async () => {
    const res = await fetch("/api/auth/dashboard/files", { headers: tokenHeader });
    if (!res.ok) throw new Error("Could not load dashboard files");
    const data = (await res.json()) as DashboardFile[];
    setDashboardFiles(data);
  }, [auth.token]);

  const loadWorkspaceAndDocs = useCallback(async () => {
    let wsRes = await fetch("/api/workspaces", { headers: tokenHeader });
    if (!wsRes.ok) throw new Error(`Workspace fetch failed: ${wsRes.status}`);
    let workspaces = (await wsRes.json()) as Array<{ id: string }>;

    if (!workspaces.length) {
      wsRes = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ name: `${auth.name}'s Workspace`, slug: auth.userId.slice(0, 40), isEncrypted: false }),
      });
      if (!wsRes.ok) throw new Error(`Workspace create failed: ${wsRes.status}`);
      workspaces = [(await wsRes.json()) as { id: string }];
    }

    const wid = workspaces[0]!.id;
    setWorkspaceId(wid);

    let docsRes = await fetch(`/api/workspaces/${wid}/documents`, { headers: tokenHeader });
    if (!docsRes.ok) throw new Error(`Documents fetch failed: ${docsRes.status}`);
    let docs = (await docsRes.json()) as DashboardFile[];

    if (!docs.length) {
      docsRes = await fetch(`/api/workspaces/${wid}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ title: "My First Canvas" }),
      });
      if (!docsRes.ok) throw new Error(`Document create failed: ${docsRes.status}`);
      docs = [(await docsRes.json()) as DashboardFile];
    }

    setDocuments(docs);
    setDocumentId(docs[0]!.id);
  }, [auth.name, auth.token, auth.userId]);

  const createDocument = useCallback(async () => {
    if (!workspaceId) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...tokenHeader },
      body: JSON.stringify({ title: `Canvas ${documents.length + 1}` }),
    });
    if (!res.ok) {
      setError("Failed to create document");
      return;
    }
    const created = (await res.json()) as DashboardFile;
    setDocuments((prev) => [created, ...prev]);
    setDocumentId(created.id);
    await loadDashboardFiles();
  }, [workspaceId, tokenHeader, documents.length, loadDashboardFiles]);

  const updateDocumentStage = useCallback(
    async (id: string, stage: DashboardFile["stage"]) => {
      if (!workspaceId) return;
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) {
        setError("Failed to update file stage");
        return;
      }
      await Promise.all([loadWorkspaceAndDocs(), loadDashboardFiles()]);
    },
    [workspaceId, tokenHeader, loadDashboardFiles, loadWorkspaceAndDocs]
  );

  const connectGoogleDrive = useCallback(async () => {
    setError(null);
    try {
      const token = await getGoogleDriveAccessToken();
      const res = await fetch("/api/auth/google-drive/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ accessToken: token.accessToken, expiresIn: token.expiresIn }),
      });
      if (!res.ok) throw new Error("Could not connect Google Drive");
      setDriveConnected(true);
      setInfo("Google Drive permission granted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Drive permission failed");
    }
  }, [tokenHeader]);

  const saveCurrentToDrive = useCallback(async () => {
    if (!editor || !documentId) {
      setError("Open a canvas before saving to Google Drive");
      return;
    }

    try {
      const token = await getGoogleDriveAccessToken();
      const snapshot = JSON.stringify(editor.getSnapshot(), null, 2);
      const boundary = "zenith-canvas-boundary";
      const metadata = {
        name: `zenith-${documentId}.tldr`,
        mimeType: "application/json",
      };
      const multipartBody =
        `--${boundary}\r\n` +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        "Content-Type: application/json\r\n\r\n" +
        `${snapshot}\r\n` +
        `--${boundary}--`;

      const uploadRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (!uploadRes.ok) throw new Error("Google Drive upload failed");

      const uploaded = (await uploadRes.json()) as { id: string; webViewLink?: string };
      await fetch("/api/auth/google-drive/save-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({
          documentId,
          driveFileId: uploaded.id,
          driveWebViewLink: uploaded.webViewLink,
        }),
      });

      setInfo("Canvas saved to Google Drive.");
      await loadDashboardFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save to Drive");
    }
  }, [editor, documentId, tokenHeader, loadDashboardFiles]);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    void (async () => {
      try {
        await Promise.all([loadWorkspaceAndDocs(), loadDashboardFiles()]);
        const meRes = await fetch("/api/auth/me", { headers: tokenHeader });
        if (meRes.ok) {
          const me = (await meRes.json()) as { googleDriveConnected?: boolean };
          setDriveConnected(Boolean(me.googleDriveConnected));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load canvas");
      }
    })();
  }, [loadDashboardFiles, loadWorkspaceAndDocs, tokenHeader]);

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
          <button onClick={() => setSidebarOpen((prev) => !prev)} style={{ ...btnStyle, background: "#0f172a" }}>
            {sidebarOpen ? "Hide Shutter" : "Show Shutter"}
          </button>
          <button onClick={() => void createDocument()} style={{ ...btnStyle, background: "#0b5" }}>
            New file
          </button>
          <button
            onClick={() => void connectGoogleDrive()}
            style={{ ...btnStyle, background: driveConnected ? "#14532d" : "#1d4ed8" }}
            title="Grant Google Drive access permission"
          >
            {driveConnected ? "Drive connected" : "Connect Drive"}
          </button>
          <button onClick={() => void saveToFile()} style={btnStyle} title="Save canvas to a .tldr file on your drive">
            Export
          </button>
          <button onClick={() => void saveCurrentToDrive()} style={{ ...btnStyle, background: "#7c3aed" }} title="Save this file to Google Drive">
            Save to Drive
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

      {error && (
        <div style={{ position: "absolute", top: 44, right: 12, zIndex: 400, background: "#7f1d1d", color: "#fee2e2", padding: "8px 10px", borderRadius: 8, fontSize: 12 }}>
          {error}
        </div>
      )}
      {info && (
        <div style={{ position: "absolute", top: 44, left: sidebarOpen ? 336 : 12, zIndex: 380, background: "#14532d", color: "#dcfce7", padding: "8px 10px", borderRadius: 8, fontSize: 12 }}>
          {info}
        </div>
      )}

      {sidebarOpen && (
        <aside style={sidebarStyle}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Dashboard</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>All files + Kanban shutter</p>

          <div style={fileListStyle}>
            {dashboardFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setDocumentId(file.id)}
                style={{
                  ...fileItemStyle,
                  borderColor: file.id === documentId ? "#38bdf8" : "#334155",
                }}
              >
                <span style={{ fontWeight: 600, textAlign: "left" }}>{file.title}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{file.workspaceName}</span>
                <span style={{ fontSize: 11, color: "#cbd5e1" }}>{stageLabel[file.stage]}</span>
                {file.driveWebViewLink ? (
                  <a
                    href={file.driveWebViewLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", fontSize: 11 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Drive
                  </a>
                ) : (
                  <span style={{ fontSize: 11, color: "#64748b" }}>Not synced</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <h4 style={{ fontSize: 13, marginBottom: 10 }}>Kanban</h4>
            {(["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((stage) => (
              <div key={stage} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{stageLabel[stage]}</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {documents
                    .filter((doc) => doc.stage === stage)
                    .map((doc) => (
                      <div key={doc.id} style={{ ...fileItemStyle, background: "#0f172a", border: "1px solid #334155" }}>
                        <strong style={{ fontSize: 12 }}>{doc.title}</strong>
                        <select
                          value={doc.stage}
                          onChange={(e) => void updateDocumentStage(doc.id, e.target.value as DashboardFile["stage"])}
                          style={{ marginTop: 6, borderRadius: 6, background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", fontSize: 11, padding: "4px 6px" }}
                        >
                          <option value="BACKLOG">Backlog</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <TldrawCanvas
        documentId={documentId}
        token={auth.token}
        style={{ top: 40, left: sidebarOpen ? 324 : 0 }}
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

const sidebarStyle: React.CSSProperties = {
  position: "absolute",
  top: 40,
  left: 0,
  bottom: 0,
  width: 324,
  zIndex: 260,
  background: "linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%)",
  borderRight: "1px solid #1e293b",
  padding: 12,
  overflowY: "auto",
};

const fileListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  maxHeight: 220,
  overflowY: "auto",
  paddingRight: 6,
};

const fileItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 4,
  width: "100%",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "8px 10px",
  background: "#111827",
  color: "#e2e8f0",
  cursor: "pointer",
  textAlign: "left",
};
