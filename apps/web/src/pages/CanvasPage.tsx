import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tldraw/tldraw";
import { TldrawCanvas } from "../components/Canvas/TldrawCanvas.js";
import { useLocalCanvas } from "../hooks/useLocalCanvas.js";
import type { AuthState } from "../App.js";
import type { DashboardOpenFile } from "./DashboardPage.js";

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
  if (!clientId || clientId.includes("your_google_oauth_client_id")) {
    throw new Error(
      "Set VITE_GOOGLE_CLIENT_ID in apps/web/.env.local with your Google OAuth Web Client ID, then restart the web dev server."
    );
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

export function CanvasPage({ auth, onLogout, onBack, selectedFile }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  const { saveToFile, loadFromFile, saveStatus } = useLocalCanvas(editor, selectedFile.id);

  const tokenHeader = { Authorization: `Bearer ${auth.token}` };

  const handleEditorMount = useCallback((mountedEditor: Editor) => {
    setEditor(mountedEditor);
  }, []);

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
    if (!editor) {
      setError("Open a canvas before saving to Google Drive");
      return;
    }

    try {
      const token = await getGoogleDriveAccessToken();
      const snapshot = JSON.stringify(editor.getSnapshot(), null, 2);
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

      setInfo("Canvas saved to Google Drive.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save to Drive");
    }
  }, [editor, selectedFile.id, tokenHeader]);

  useEffect(() => {
    setEditor(null);
    setError(null);
    setInfo("");
  }, [selectedFile.id]);

  useEffect(() => {
    void (async () => {
      const meRes = await fetch("/api/auth/me", { headers: tokenHeader });
      if (!meRes.ok) return;
      const me = (await meRes.json()) as { googleDriveConnected?: boolean };
      setDriveConnected(Boolean(me.googleDriveConnected));
    })();
  }, [tokenHeader]);

  return (
    <div style={shellStyle}>
      <header style={canvasTopBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={secondaryActionStyle}>← Back to files</button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedFile.title}</div>
            <div style={{ fontSize: 12, color: "#8f98aa" }}>{selectedFile.workspaceName || "Workspace"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: statusColor[saveStatus] }}>● {statusLabel[saveStatus]}</span>
          <button onClick={() => void connectGoogleDrive()} style={driveButtonStyle(driveConnected)}>
            {driveConnected ? "Drive connected" : "Connect Drive"}
          </button>
          <button onClick={() => void saveCurrentToDrive()} style={primaryActionStyle}>Save to Drive</button>
          <button onClick={() => void saveToFile()} style={secondaryActionStyle}>Export</button>
          <button onClick={() => void loadFromFile()} style={secondaryActionStyle}>Open file</button>
          <button onClick={onLogout} style={secondaryActionStyle}>Sign out</button>
        </div>
      </header>

      {(error || info) && (
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {error && <div style={errorBannerStyle}>{error}</div>}
          {info && <div style={infoBannerStyle}>{info}</div>}
        </div>
      )}

      <div style={canvasShellStyle}>
        <div style={canvasFrameStyle}>
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

const shellStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "18px 18px 14px",
  background: "#171717",
  color: "#f8fafc",
  overflow: "hidden",
};

const canvasTopBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  marginBottom: 16,
};

const canvasShellStyle: React.CSSProperties = {
  height: "calc(100% - 92px)",
  minHeight: 560,
  display: "block",
};

const canvasFrameStyle: React.CSSProperties = {
  position: "relative",
  height: "100%",
  minHeight: 0,
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid #2b2b2b",
  background: "#0f172a",
};

const primaryActionStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "11px 14px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

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