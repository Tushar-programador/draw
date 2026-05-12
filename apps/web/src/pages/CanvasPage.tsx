import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tldraw/tldraw";
import { TldrawCanvas } from "../components/Canvas/TldrawCanvas.js";
import { useLocalCanvas } from "../hooks/useLocalCanvas.js";
import type { AuthState } from "../App.js";
import type { DashboardOpenFile } from "./DashboardPage.js";
import { getGoogleDriveAccessToken } from "../lib/googleDrive.js";
import "./CanvasPage.css";

const DRIVE_SYNC_INTERVAL_MS = 8000;

interface Props {
  auth: NonNullable<AuthState>;
  onLogout: () => void;
  onBack: () => void;
  selectedFile: DashboardOpenFile;
}

const statusLabel: Record<string, string> = {
  saved: "Saved locally",
  saving: "Saving…",
  unsaved: "Unsaved changes",
};

const statusColor: Record<string, string> = {
  saved: "#6ee7b7",
  saving: "#fbbf24",
  unsaved: "#f87171",
};

export function CanvasPage({ auth, onLogout, onBack, selectedFile }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [driveConnected, setDriveConnected] = useState(Boolean(auth.googleDriveConnected));
  const [driveSyncStatus, setDriveSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState("");
  const [driveSyncError, setDriveSyncError] = useState<string | null>(null);

  const { saveToFile, loadFromFile, saveStatus } = useLocalCanvas(editor, selectedFile.id);

  const tokenHeader = { Authorization: `Bearer ${auth.token}` };

  const handleEditorMount = useCallback((mountedEditor: Editor) => {
    setEditor(mountedEditor);
  }, []);

  const uploadSnapshotToDrive = useCallback(
    async (snapshot: string, silentTokenRefresh: boolean) => {
      const token = await getGoogleDriveAccessToken(silentTokenRefresh ? "" : "consent");
      const boundary = "zenith-canvas-boundary";
      const metadata = {
        name: `zenith-${selectedFile.id}.tldr`,
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
          documentId: selectedFile.id,
          driveFileId: uploaded.id,
          driveWebViewLink: uploaded.webViewLink,
        }),
      });
    },
    [selectedFile.id, tokenHeader]
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

  useEffect(() => {
    setEditor(null);
    setError(null);
    setInfo("");
    setDriveSyncError(null);
    setDriveSyncStatus("idle");
  }, [selectedFile.id]);

  useEffect(() => {
    void (async () => {
      const meRes = await fetch("/api/auth/me", { headers: tokenHeader });
      if (!meRes.ok) return;
      const me = (await meRes.json()) as { googleDriveConnected?: boolean };
      setDriveConnected(Boolean(me.googleDriveConnected));
    })();
  }, [tokenHeader]);

  useEffect(() => {
    if (!editor || !driveConnected) return;

    let dirty = false;
    let syncing = false;

    const unlisten = editor.store.listen(
      () => {
        dirty = true;
      },
      { source: "user", scope: "document" }
    );

    const interval = setInterval(() => {
      if (!dirty || syncing) return;

      syncing = true;
      dirty = false;
      setDriveSyncStatus("syncing");

      const snapshot = JSON.stringify(editor.getSnapshot(), null, 2);
      void uploadSnapshotToDrive(snapshot, true)
        .then(() => {
          setDriveSyncStatus("synced");
          setDriveSyncError(null);
        })
        .catch((err) => {
          setDriveSyncStatus("error");
          setDriveSyncError(err instanceof Error ? err.message : "Drive auto-sync failed");
        })
        .finally(() => {
          syncing = false;
        });
    }, DRIVE_SYNC_INTERVAL_MS);

    return () => {
      unlisten();
      clearInterval(interval);
    };
  }, [driveConnected, editor, uploadSnapshotToDrive]);

  return (
    <div className="canvas-page">
      <div className="canvas-atmosphere" />

      <header className="canvas-header">
        <div className="canvas-file-meta">
          <button onClick={onBack} style={secondaryActionStyle}>← Files</button>
          <div className="canvas-title-wrap">
            <h1 className="canvas-title">{selectedFile.title}</h1>
            <p className="canvas-subtitle">{selectedFile.workspaceName || "Workspace"}</p>
          </div>
        </div>

        <div className="canvas-actions">
          <span style={{ fontSize: 12, color: statusColor[saveStatus] }}>● {statusLabel[saveStatus]}</span>
          {!driveConnected && (
            <>
              <button onClick={() => void connectGoogleDrive()} style={driveButtonStyle(false)}>
                Connect Drive
              </button>
            </>
          )}
          {driveConnected && (
            <span className="drive-connected-chip">
              {driveSyncStatus === "syncing"
                ? "Drive syncing..."
                : driveSyncStatus === "synced"
                  ? "Drive auto-synced"
                  : driveSyncStatus === "error"
                    ? "Drive sync paused"
                    : "Drive permission granted"}
            </span>
          )}
          <button onClick={() => void saveToFile()} style={secondaryActionStyle}>Export</button>
          <button onClick={() => void loadFromFile()} style={secondaryActionStyle}>Open file</button>
          <button onClick={onLogout} style={secondaryActionStyle}>Sign out</button>
        </div>
      </header>

      {(error || info) && (
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {error && <div style={errorBannerStyle}>{error}</div>}
          {info && <div style={infoBannerStyle}>{info}</div>}
          {driveSyncError && <div style={errorBannerStyle}>{driveSyncError}</div>}
        </div>
      )}

      <div className="canvas-shell">
        <div className="canvas-frame">
          <TldrawCanvas
            key={selectedFile.id}
            documentId={selectedFile.id}
            token={auth.token}
            onEditorMount={handleEditorMount}
          />
        </div>
      </div>
    </div>
  );
}

const secondaryActionStyle: React.CSSProperties = {
  border: "1px solid #313131",
  borderRadius: 8,
  padding: "11px 14px",
  background: "#202020",
  color: "#f8fafc",
  cursor: "pointer",
};

const errorBannerStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(127, 29, 29, 0.8)",
  color: "#fee2e2",
  fontSize: 13,
  border: "1px solid rgba(239, 68, 68, 0.25)",
};

const infoBannerStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(20, 83, 45, 0.82)",
  color: "#dcfce7",
  fontSize: 13,
  border: "1px solid rgba(34, 197, 94, 0.2)",
};

const driveButtonStyle = (connected: boolean): React.CSSProperties => ({
  ...secondaryActionStyle,
  background: connected ? "#123624" : "#202020",
  borderColor: connected ? "#1d6d45" : "#313131",
  color: connected ? "#d1fae5" : "#f8fafc",
});