import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tldraw/tldraw";
import { jsPDF } from "jspdf";
import { toJpeg, toPng, toSvg } from "html-to-image";
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
  const [driveFileId, setDriveFileId] = useState<string | null>(selectedFile.driveFileId ?? null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState("");
  const [driveSyncError, setDriveSyncError] = useState<string | null>(null);
  const canvasFrameRef = useRef<HTMLDivElement | null>(null);

  const { saveToFile, saveStatus } = useLocalCanvas(editor, selectedFile.id);

  const tokenHeader = { Authorization: `Bearer ${auth.token}` };

  const handleEditorMount = useCallback((mountedEditor: Editor) => {
    setEditor(mountedEditor);
  }, []);

  const downloadDataUrl = useCallback((dataUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    a.click();
  }, []);

  const exportVisual = useCallback(
    async (kind: "png" | "jpeg" | "svg" | "pdf") => {
      if (!canvasFrameRef.current) {
        setError("Canvas is not ready to export");
        return;
      }

      setError(null);
      setInfo("");

      try {
        const node = canvasFrameRef.current;
        const baseName = selectedFile.title.trim().replace(/[\\/:*?"<>|]+/g, "-") || "canvas";

        if (kind === "png") {
          const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
          downloadDataUrl(dataUrl, `${baseName}.png`);
          setInfo("Exported PNG.");
          return;
        }

        if (kind === "jpeg") {
          const dataUrl = await toJpeg(node, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
          downloadDataUrl(dataUrl, `${baseName}.jpeg`);
          setInfo("Exported JPEG.");
          return;
        }

        if (kind === "svg") {
          const dataUrl = await toSvg(node, { cacheBust: true, pixelRatio: 2 });
          downloadDataUrl(dataUrl, `${baseName}.svg`);
          setInfo("Exported SVG.");
          return;
        }

        const pngDataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(pngDataUrl, "PNG", 0, 0, width, height);
        pdf.save(`${baseName}.pdf`);
        setInfo("Exported PDF.");
      } catch {
        setError("Could not export this format right now");
      }
    },
    [downloadDataUrl, selectedFile.title]
  );

  const shareByEmail = useCallback(() => {
    const subject = encodeURIComponent(`OUTDRAW: ${selectedFile.title}`);
    const body = encodeURIComponent(
      `Hi,%0D%0A%0D%0AI am sharing this canvas: ${selectedFile.title}%0D%0A${window.location.href}%0D%0A%0D%0ARegards`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [selectedFile.title]);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setInfo("Share link copied.");
    } catch {
      setError("Could not copy share link");
    }
  }, []);

  const uploadSnapshotToDrive = useCallback(
    async (snapshot: string, silentTokenRefresh: boolean) => {
      const token = await getGoogleDriveAccessToken(silentTokenRefresh ? "" : "consent");

      const createFile = async () => {
        const boundary = "outdraw-canvas-boundary";
        const metadata = {
          name: `outdraw-${selectedFile.id}.tldr`,
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

        const createRes = await fetch(
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

        if (!createRes.ok) throw new Error("Google Drive upload failed");
        return (await createRes.json()) as { id: string; webViewLink?: string };
      };

      let uploaded: { id: string; webViewLink?: string };
      if (driveFileId) {
        const updateRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media&fields=id,webViewLink`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              "Content-Type": "application/json",
            },
            body: snapshot,
          }
        );

        if (updateRes.ok) {
          uploaded = (await updateRes.json()) as { id: string; webViewLink?: string };
        } else if (updateRes.status === 404) {
          uploaded = await createFile();
        } else {
          throw new Error("Google Drive update failed");
        }
      } else {
        uploaded = await createFile();
      }

      setDriveFileId(uploaded.id);
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
    [driveFileId, selectedFile.id, tokenHeader]
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
    setDriveFileId(selectedFile.driveFileId ?? null);
    setError(null);
    setInfo("");
    setDriveSyncError(null);
    setDriveSyncStatus("idle");
  }, [selectedFile.driveFileId, selectedFile.id]);

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
          <div style={{ position: "relative", zIndex: 9999 }}>
            <button onClick={() => setShareMenuOpen((value) => !value)} style={secondaryActionStyle}>Share</button>
            {shareMenuOpen && (
              <div style={shareMenuStyle}>
                <div style={shareMenuSectionStyle}>
                  <div style={shareMenuSectionTitleStyle}>Share</div>
                  <button style={shareMenuItemStyle} onClick={() => { shareByEmail(); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>✉️</span> Email
                  </button>
                  <button style={shareMenuItemStyle} onClick={() => { void copyShareLink(); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>🔗</span> Copy Link
                  </button>
                </div>

                <div style={shareMenuSectionStyle}>
                  <div style={shareMenuSectionTitleStyle}>Export</div>
                  <button style={shareMenuItemStyle} onClick={() => { void saveToFile(); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>📄</span> .tldr
                  </button>
                  <button style={shareMenuItemStyle} onClick={() => { void exportVisual("pdf"); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>📕</span> PDF
                  </button>
                  <button style={shareMenuItemStyle} onClick={() => { void exportVisual("png"); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>🖼️</span> PNG
                  </button>
                  <button style={shareMenuItemStyle} onClick={() => { void exportVisual("jpeg"); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>🖼️</span> JPEG
                  </button>
                  <button style={shareMenuItemStyle} onClick={() => { void exportVisual("svg"); setShareMenuOpen(false); }}>
                    <span style={{ marginRight: 8 }}>📐</span> SVG
                  </button>
                </div>
              </div>
            )}
          </div>
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
        <div className="canvas-frame" ref={canvasFrameRef}>
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

const shareMenuStyle: React.CSSProperties = {
  position: "absolute",
  top: 44,
  right: 0,
  width: 220,
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#0f172a",
  boxShadow: "0 20px 40px rgba(2, 6, 23, 0.45)",
  overflow: "hidden",
  zIndex: 9999,
};

const shareMenuSectionStyle: React.CSSProperties = {
  paddingBottom: 8,
};

const shareMenuSectionTitleStyle: React.CSSProperties = {
  padding: "10px 12px 6px",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const shareMenuItemStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: "1px solid #1e293b",
  background: "transparent",
  color: "#e2e8f0",
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  fontSize: 13,
  transition: "background-color 0.2s",
};