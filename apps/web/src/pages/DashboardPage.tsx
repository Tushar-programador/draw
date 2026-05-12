import { useCallback, useEffect, useRef, useState } from "react";
import {
  exportLocalCanvasSnapshot,
  readLocalCanvasSnapshot,
  writeLocalCanvasSnapshot,
} from "../hooks/useLocalCanvas.js";
import type { AuthState } from "../App.js";

interface Props {
  auth: NonNullable<AuthState>;
  onLogout: () => void;
  onOpenFile: (file: DashboardOpenFile) => void;
}

type DashboardFile = {
  id: string;
  title: string;
  stage: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  workspaceName: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  driveWebViewLink?: string | null;
  lastSyncedAt?: string | null;
};

type DashboardTab = "all" | "recent" | "mine" | "folders" | "unsorted";

export type DashboardOpenFile = {
  id: string;
  title: string;
  workspaceName: string;
};

const stageLabel: Record<DashboardFile["stage"], string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recents" },
  { id: "mine", label: "Created by Me" },
  { id: "folders", label: "Folders" },
  { id: "unsorted", label: "Unsorted" },
];

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths <= 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears <= 1 ? "1 year ago" : `${diffYears} years ago`;
}

function getFileAccent(stage: DashboardFile["stage"]): string {
  switch (stage) {
    case "DONE":
      return "#34d399";
    case "REVIEW":
      return "#f59e0b";
    case "IN_PROGRESS":
      return "#60a5fa";
    case "BACKLOG":
    default:
      return "#a78bfa";
  }
}

function getExportFileName(title: string): string {
  const normalized = title.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ");
  return `${normalized || "untitled-file"}.tldr`;
}

function toOpenFile(file: DashboardFile): DashboardOpenFile {
  return {
    id: file.id,
    title: file.title,
    workspaceName: file.workspaceName,
  };
}

function DashboardSkeletonLoader() {
  return (
    <div style={loadingShellStyle}>
      <aside style={loadingSidebarStyle}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ ...skeletonBlockStyle, width: 124, height: 24, borderRadius: 8 }} />
          <div style={{ ...skeletonBlockStyle, width: "100%", height: 48, borderRadius: 10 }} />
          <div style={{ ...skeletonBlockStyle, width: 84, height: 12, borderRadius: 999 }} />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ ...skeletonBlockStyle, width: "100%", height: 38, borderRadius: 10 }} />
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} style={{ ...skeletonBlockStyle, width: "100%", height: 18, borderRadius: 8 }} />
          ))}
          <div style={{ ...skeletonBlockStyle, width: "100%", height: 48, borderRadius: 10, marginTop: 8 }} />
        </div>
      </aside>

      <div style={loadingContentStyle}>
        <div style={loadingTopBarStyle}>
          <div style={{ display: "flex", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} style={{ ...skeletonBlockStyle, width: 76, height: 32, borderRadius: 8 }} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ ...skeletonBlockStyle, width: 280, height: 38, borderRadius: 10 }} />
            <div style={{ ...skeletonBlockStyle, width: 78, height: 34, borderRadius: 999 }} />
            <div style={{ ...skeletonBlockStyle, width: 96, height: 38, borderRadius: 8 }} />
          </div>
        </div>

        <div style={loadingActionGridStyle}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={{ ...skeletonBlockStyle, height: 106, borderRadius: 12 }} />
          ))}
        </div>

        <div style={loadingTableCardStyle}>
          <div style={loadingTableHeaderStyle}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{ ...skeletonBlockStyle, height: 10, borderRadius: 999 }} />
            ))}
          </div>

          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={loadingTableRowStyle}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ ...skeletonBlockStyle, width: 180, height: 14, borderRadius: 999 }} />
                <div style={{ ...skeletonBlockStyle, width: 80, height: 10, borderRadius: 999 }} />
              </div>
              <div style={{ ...skeletonBlockStyle, width: 90, height: 12, borderRadius: 999 }} />
              <div style={{ ...skeletonBlockStyle, width: 70, height: 12, borderRadius: 999 }} />
              <div style={{ ...skeletonBlockStyle, width: 70, height: 12, borderRadius: 999 }} />
              <div style={{ ...skeletonBlockStyle, width: 24, height: 12, borderRadius: 999 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ ...skeletonBlockStyle, width: 22, height: 22, borderRadius: 999 }} />
                  <div style={{ ...skeletonBlockStyle, width: 84, height: 12, borderRadius: 999 }} />
                </div>
                <div style={{ ...skeletonBlockStyle, width: 78, height: 32, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ auth, onLogout, onOpenFile }: Props) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [dashboardFiles, setDashboardFiles] = useState<DashboardFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState("");
  const [menuFileId, setMenuFileId] = useState<string | null>(null);
  const initialised = useRef(false);

  const tokenHeader = { Authorization: `Bearer ${auth.token}` };

  const loadDashboardFiles = useCallback(async () => {
    const res = await fetch("/api/auth/dashboard/files", { headers: tokenHeader });
    if (!res.ok) throw new Error("Could not load dashboard files");
    const data = (await res.json()) as DashboardFile[];
    setDashboardFiles(data);
  }, [tokenHeader]);

  const loadWorkspaceAndDocs = useCallback(async () => {
    let wsRes = await fetch("/api/workspaces", { headers: tokenHeader });
    if (!wsRes.ok) throw new Error(`Workspace fetch failed: ${wsRes.status}`);
    let workspaces = (await wsRes.json()) as Array<{ id: string }>;

    if (!workspaces.length) {
      wsRes = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({
          name: `${auth.name}'s Team`,
          slug: auth.userId.slice(0, 40),
          isEncrypted: false,
        }),
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
        body: JSON.stringify({ title: "Untitled File" }),
      });
      if (!docsRes.ok) throw new Error(`Document create failed: ${docsRes.status}`);
      docs = [(await docsRes.json()) as DashboardFile];
    }

    setDocumentId((current) => current ?? docs[0]?.id ?? null);
  }, [auth.name, auth.userId, tokenHeader]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadWorkspaceAndDocs(), loadDashboardFiles()]);
  }, [loadDashboardFiles, loadWorkspaceAndDocs]);

  const openCanvasFile = useCallback(
    (file: DashboardFile) => {
      setDocumentId(file.id);
      setMenuFileId(null);
      onOpenFile(toOpenFile(file));
    },
    [onOpenFile]
  );

  const createDocument = useCallback(
    async (title?: string, openCanvas = false) => {
      if (!workspaceId) return;
      setError(null);
      const res = await fetch(`/api/workspaces/${workspaceId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ title: title ?? `Untitled File ${dashboardFiles.length + 1}` }),
      });
      if (!res.ok) {
        setError("Failed to create file");
        return;
      }

      const created = (await res.json()) as DashboardFile;
      setDocumentId(created.id);
      await refreshAll();
      if (openCanvas) onOpenFile(toOpenFile(created));
    },
    [dashboardFiles.length, onOpenFile, refreshAll, tokenHeader, workspaceId]
  );

  const renameDocument = useCallback(
    async (file: DashboardFile) => {
      const nextTitle = window.prompt("Rename file", file.title)?.trim();
      if (!nextTitle || nextTitle === file.title) {
        setMenuFileId(null);
        return;
      }

      const res = await fetch(`/api/workspaces/${file.workspaceId}/documents/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ title: nextTitle }),
      });

      if (!res.ok) {
        setError("Failed to rename file");
        return;
      }

      setInfo(`Renamed to ${nextTitle}.`);
      setMenuFileId(null);
      await refreshAll();
    },
    [refreshAll, tokenHeader]
  );

  const deleteDocument = useCallback(
    async (file: DashboardFile) => {
      const confirmed = window.confirm(`Delete ${file.title}?`);
      if (!confirmed) {
        setMenuFileId(null);
        return;
      }

      const res = await fetch(`/api/workspaces/${file.workspaceId}/documents/${file.id}`, {
        method: "DELETE",
        headers: tokenHeader,
      });

      if (!res.ok) {
        setError("Failed to delete file");
        return;
      }

      if (documentId === file.id) {
        setDocumentId(null);
      }
      setMenuFileId(null);
      setInfo(`Deleted ${file.title}.`);
      await refreshAll();
    },
    [documentId, refreshAll, tokenHeader]
  );

  const copyDocument = useCallback(
    async (file: DashboardFile) => {
      const res = await fetch(`/api/workspaces/${file.workspaceId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader },
        body: JSON.stringify({ title: `${file.title} Copy` }),
      });

      if (!res.ok) {
        setError("Failed to copy file");
        return;
      }

      const created = (await res.json()) as DashboardFile;
      const snapshot = readLocalCanvasSnapshot(file.id);
      if (snapshot) {
        writeLocalCanvasSnapshot(created.id, snapshot);
      }

      setMenuFileId(null);
      setInfo(`Created ${created.title}.`);
      await refreshAll();
    },
    [refreshAll, tokenHeader]
  );

  const exportDocument = useCallback((file: DashboardFile) => {
    const exported = exportLocalCanvasSnapshot(file.id, getExportFileName(file.title));
    if (!exported) {
      setError("No local canvas data found to export for this file");
      return;
    }

    setMenuFileId(null);
    setInfo(`Exported ${file.title}.`);
  }, []);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    void (async () => {
      try {
        await refreshAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      }
    })();
  }, [refreshAll]);

  useEffect(() => {
    if (!documentId) {
      if (dashboardFiles[0]?.id) setDocumentId(dashboardFiles[0].id);
      return;
    }

    if (!dashboardFiles.some((file) => file.id === documentId)) {
      setDocumentId(dashboardFiles[0]?.id ?? null);
    }
  }, [dashboardFiles, documentId]);

  useEffect(() => {
    if (!menuFileId) return;

    const handleWindowClick = () => setMenuFileId(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, [menuFileId]);

  const selectedFile = dashboardFiles.find((file) => file.id === documentId) ?? dashboardFiles[0] ?? null;
  const folders = Array.from(new Set(dashboardFiles.map((file) => file.workspaceName))).filter(Boolean);
  const filteredFiles = dashboardFiles.filter((file) => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !lowerSearch ||
      file.title.toLowerCase().includes(lowerSearch) ||
      file.workspaceName.toLowerCase().includes(lowerSearch) ||
      file.authorName.toLowerCase().includes(lowerSearch);

    if (!matchesSearch) return false;

    switch (activeTab) {
      case "recent":
        return Date.now() - new Date(file.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 14;
      case "mine":
        return file.authorName.toLowerCase() === auth.name.toLowerCase();
      case "folders":
        return file.workspaceName.length > 0;
      case "unsorted":
        return file.stage === "BACKLOG";
      case "all":
      default:
        return true;
    }
  });

  const stageCounts = {
    BACKLOG: dashboardFiles.filter((file) => file.stage === "BACKLOG").length,
    IN_PROGRESS: dashboardFiles.filter((file) => file.stage === "IN_PROGRESS").length,
    REVIEW: dashboardFiles.filter((file) => file.stage === "REVIEW").length,
    DONE: dashboardFiles.filter((file) => file.stage === "DONE").length,
  };

  if (!documentId && !dashboardFiles.length) {
    return <DashboardSkeletonLoader />;
  }

  return (
    <div style={shellStyle}>
      {sidebarOpen && (
        <aside style={sidebarStyle}>
          <div>
            <div style={brandRowStyle}>
              <div style={brandMarkStyle}>
                <span style={{ ...brandCubeStyle, background: "#f43f5e" }} />
                <span style={{ ...brandCubeStyle, background: "#22d3ee" }} />
              </div>
              <div>
                <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 700 }}>{(auth.name.split(" ")[0] ?? auth.name).toLowerCase()}'s Team</div>
              </div>
            </div>

            <button onClick={() => setActiveTab("all")} style={primarySidebarButtonStyle}>
              <span>All Files</span>
              <span style={{ color: "#8f98aa" }}>A</span>
            </button>

            <div style={sidebarSectionTitleStyle}>Team Folders</div>
            <div style={{ display: "grid", gap: 8 }}>
              {folders.length ? (
                folders.map((folder) => (
                  <button key={folder} style={sidebarFolderStyle} onClick={() => setActiveTab("folders")}>
                    <span>{folder}</span>
                    <span style={{ color: "#7c8697" }}>↗</span>
                  </button>
                ))
              ) : (
                <div style={sidebarHintStyle}>No folders yet</div>
              )}
            </div>

            <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
              {(["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((stage) => (
                <div key={stage} style={stageSummaryStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: getFileAccent(stage) }} />
                    <span style={{ color: "#f3f4f6", fontSize: 13 }}>{stageLabel[stage]}</span>
                  </div>
                  <span style={{ color: "#9aa4b2", fontSize: 12 }}>{stageCounts[stage]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Eraserbot", badge: "BETA" },
              { label: "AI Presets", badge: "C" },
              { label: "Team Templates", badge: "T" },
              { label: "Github Sync", badge: "BETA" },
              { label: "Private Files", badge: "UPGRADE" },
              { label: "Archive", badge: "E" },
            ].map((item) => (
              <div key={item.label} style={sidebarMetaRowStyle}>
                <span>{item.label}</span>
                <span style={item.badge === "UPGRADE" ? upgradeBadgeStyle : betaBadgeStyle}>{item.badge}</span>
              </div>
            ))}

            <button onClick={() => void createDocument("Untitled File", true)} style={newFileButtonStyle}>
              <span>New File</span>
              <span style={{ opacity: 0.72 }}>Alt N</span>
            </button>
          </div>
        </aside>
      )}

      <main style={{ ...mainStyle, marginLeft: sidebarOpen ? 244 : 0 }}>
        <header style={topBarStyle}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={tab.id === activeTab ? activeTabStyle : tabStyle}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={searchBoxStyle}>
              <span style={{ color: "#8f98aa" }}>⌕</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                style={searchInputStyle}
              />
              <span style={searchShortcutStyle}>Ctrl K</span>
            </div>
            <div style={avatarStackStyle}>
              <span style={{ ...avatarDotStyle, background: "#8b5cf6" }}>{auth.name[0]?.toLowerCase()}</span>
              <span style={{ ...avatarDotStyle, background: "#4b5563" }} />
              <span style={{ ...avatarDotStyle, background: "#9ca3af" }} />
            </div>
            <button onClick={() => void createDocument("Shared Board", false)} style={inviteButtonStyle}>Invite</button>
          </div>
        </header>

        {(error || info) && (
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {error && <div style={errorBannerStyle}>{error}</div>}
            {info && <div style={infoBannerStyle}>{info}</div>}
          </div>
        )}

        <section style={actionGridStyle}>
          <button onClick={() => void createDocument("Untitled File", true)} style={actionCardStyle}>
            <div style={actionIconStyle}>＋</div>
            <div style={actionTitleStyle}>Create a Blank File</div>
          </button>
          <button onClick={() => void createDocument("AI Diagram", true)} style={actionCardStyle}>
            <div style={actionIconStyle}>✧</div>
            <div style={actionTitleStyle}>Generate an AI Diagram</div>
          </button>
          <button onClick={() => void createDocument("AI Document", false)} style={actionCardStyle}>
            <div style={actionIconStyle}>✦</div>
            <div style={actionTitleStyle}>Generate an AI Document</div>
          </button>
        </section>

        <section style={tableCardStyle}>
          <div style={tableHeaderRowStyle}>
            <span>NAME</span>
            <span>LOCATION</span>
            <span>CREATED</span>
            <span>EDITED</span>
            <span>COMMENTS</span>
            <span>AUTHOR</span>
          </div>

          {filteredFiles.map((file) => {
            const isSelected = file.id === selectedFile?.id;
            const isMenuOpen = menuFileId === file.id;
            return (
              <div
                key={file.id}
                onClick={() => openCanvasFile(file)}
                style={{
                  ...tableRowStyle,
                  background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                <div style={nameCellStyle}>
                  <span style={{ fontWeight: 600, color: "#f8fafc" }}>{file.title}</span>
                  <span style={stagePillStyle(file.stage)}>{stageLabel[file.stage]}</span>
                </div>
                <span style={tableMutedTextStyle}>{file.workspaceName || "—"}</span>
                <span style={tableValueStyle}>{formatRelativeDate(file.createdAt)}</span>
                <span style={tableValueStyle}>{formatRelativeDate(file.updatedAt)}</span>
                <span style={tableValueStyle}>0</span>
                <div style={authorCellStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ ...avatarDotStyle, background: "#7c3aed" }}>{file.authorName[0]?.toLowerCase()}</span>
                    <span style={tableValueStyle}>{file.authorName}</span>
                  </div>
                  <div style={rowActionsStyle}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCanvasFile(file);
                      }}
                      style={openButtonStyle}
                    >
                      Open
                    </button>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentId(file.id);
                          setMenuFileId((current) => (current === file.id ? null : file.id));
                        }}
                        aria-label={`File actions for ${file.title}`}
                        style={menuTriggerStyle}
                      >
                        ⋯
                      </button>

                      {isMenuOpen && (
                        <div onClick={(e) => e.stopPropagation()} style={menuPopoverStyle}>
                          <button onClick={() => openCanvasFile(file)} style={menuItemStyle}>Edit</button>
                          <button onClick={() => void renameDocument(file)} style={menuItemStyle}>Rename</button>
                          <button onClick={() => void copyDocument(file)} style={menuItemStyle}>Copy</button>
                          <button onClick={() => exportDocument(file)} style={menuItemStyle}>Export</button>
                          <button onClick={() => void deleteDocument(file)} style={dangerMenuItemStyle}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!filteredFiles.length && <div style={emptyStateStyle}>No files match this filter.</div>}
        </section>

        <section style={dashboardFooterStyle}>
          <div style={dashboardFooterCardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Selected file</div>
            <div style={{ color: "#8f98aa", fontSize: 13 }}>
              {selectedFile ? `${selectedFile.title} in ${selectedFile.workspaceName}` : "Choose a file from the table."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setSidebarOpen((value) => !value)} style={secondaryActionStyle}>
              {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            </button>
            <button onClick={onLogout} style={secondaryActionStyle}>Sign out</button>
            <button
              onClick={() => selectedFile && openCanvasFile(selectedFile)}
              disabled={!selectedFile}
              style={{ ...primaryActionStyle, opacity: selectedFile ? 1 : 0.45 }}
            >
              Open selected file
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  background: "#171717",
  color: "#f8fafc",
};

const loadingShellStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  background: "#171717",
};

const loadingSidebarStyle: React.CSSProperties = {
  width: 244,
  padding: "26px 20px 18px",
  borderRight: "1px solid #262626",
  background: "#161616",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const loadingContentStyle: React.CSSProperties = {
  flex: 1,
  padding: "26px 32px 22px",
  display: "grid",
  gap: 28,
};

const loadingTopBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const loadingActionGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const loadingTableCardStyle: React.CSSProperties = {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #232323",
  background: "#181818",
};

const loadingTableHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.3fr 1fr 0.8fr 0.8fr 0.6fr 1.2fr",
  gap: 18,
  padding: "18px 18px 14px",
  borderBottom: "1px solid #222",
};

const loadingTableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.3fr 1fr 0.8fr 0.8fr 0.6fr 1.2fr",
  gap: 18,
  padding: "18px",
  borderBottom: "1px solid #222",
  alignItems: "center",
};

const skeletonBlockStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #232323 0%, #2b2b2b 45%, #232323 100%)",
  opacity: 0.95,
};

const sidebarStyle: React.CSSProperties = {
  position: "fixed",
  inset: "0 auto 0 0",
  width: 244,
  padding: "26px 20px 18px",
  borderRight: "1px solid #262626",
  background: "#161616",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brandRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 28,
};

const brandMarkStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 10px)",
  gap: 2,
};

const brandCubeStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 2,
  display: "block",
};

const primarySidebarButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 8,
  border: "1px solid #303030",
  background: "#2a2a2a",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: 28,
};

const sidebarSectionTitleStyle: React.CSSProperties = {
  color: "#f0f0f0",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 12,
};

const sidebarFolderStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: "#9ca3af",
  border: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  padding: "6px 0",
  cursor: "pointer",
};

const sidebarHintStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 12,
  padding: "4px 0 10px",
};

const stageSummaryStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "#1d1d1d",
  border: "1px solid #262a32",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const sidebarMetaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#e5e7eb",
  fontSize: 13,
};

const betaBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#c4b5fd",
  background: "rgba(76, 29, 149, 0.32)",
  border: "1px solid rgba(139, 92, 246, 0.26)",
  borderRadius: 999,
  padding: "2px 7px",
};

const upgradeBadgeStyle: React.CSSProperties = {
  ...betaBadgeStyle,
  color: "#fcd34d",
  background: "rgba(120, 53, 15, 0.3)",
  border: "1px solid rgba(234, 179, 8, 0.22)",
};

const newFileButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 12,
  padding: "14px 16px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
};

const mainStyle: React.CSSProperties = {
  height: "100%",
  padding: "26px 32px 22px",
  overflow: "auto",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 28,
  flexWrap: "wrap",
};

const tabStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#8f98aa",
  fontSize: 14,
  fontWeight: 600,
  padding: "7px 10px",
  borderRadius: 8,
  cursor: "pointer",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  background: "#262626",
  color: "#ffffff",
  border: "1px solid #323232",
};

const searchBoxStyle: React.CSSProperties = {
  minWidth: 300,
  padding: "0 12px",
  height: 38,
  borderRadius: 10,
  border: "1px solid #353535",
  background: "#171717",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 13,
};

const searchShortcutStyle: React.CSSProperties = {
  padding: "5px 8px",
  borderRadius: 8,
  background: "#1f1f1f",
  border: "1px solid #313131",
  color: "#a1a1aa",
  fontSize: 11,
};

const avatarStackStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const avatarDotStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  border: "2px solid #171717",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 11,
  marginLeft: -6,
};

const inviteButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "11px 16px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const actionGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
  marginBottom: 28,
};

const actionCardStyle: React.CSSProperties = {
  minHeight: 106,
  borderRadius: 10,
  border: "1px solid #343434",
  background: "#202020",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  color: "#f5f5f5",
  cursor: "pointer",
};

const actionIconStyle: React.CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
  color: "#d4d4d8",
};

const actionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#e5e7eb",
};

const tableCardStyle: React.CSSProperties = {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #232323",
  background: "#181818",
};

const tableHeaderRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.3fr 1fr 0.8fr 0.8fr 0.6fr 1.2fr",
  gap: 18,
  padding: "18px 18px 14px",
  fontSize: 11,
  fontWeight: 700,
  color: "#8f98aa",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderBottom: "1px solid #222",
};

const tableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.3fr 1fr 0.8fr 0.8fr 0.6fr 1.2fr",
  gap: 18,
  padding: "18px",
  borderBottom: "1px solid #222",
  cursor: "pointer",
  alignItems: "center",
};

const nameCellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const tableMutedTextStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 13,
};

const tableValueStyle: React.CSSProperties = {
  color: "#dbe1eb",
  fontSize: 13,
};

const authorCellStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const rowActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const openButtonStyle: React.CSSProperties = {
  border: "1px solid #313131",
  background: "#232323",
  color: "#f8fafc",
  borderRadius: 8,
  padding: "7px 10px",
  cursor: "pointer",
};

const menuTriggerStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid #313131",
  background: "#202020",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: 20,
  lineHeight: 1,
};

const menuPopoverStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  minWidth: 160,
  padding: 6,
  borderRadius: 12,
  border: "1px solid #2f2f2f",
  background: "#171717",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
  display: "grid",
  gap: 4,
  zIndex: 10,
};

const menuItemStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "#f3f4f6",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

const dangerMenuItemStyle: React.CSSProperties = {
  ...menuItemStyle,
  color: "#fca5a5",
};

const emptyStateStyle: React.CSSProperties = {
  padding: 28,
  color: "#8f98aa",
  fontSize: 14,
};

const dashboardFooterStyle: React.CSSProperties = {
  marginTop: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const dashboardFooterCardStyle: React.CSSProperties = {
  minWidth: 280,
  padding: "16px 18px",
  borderRadius: 12,
  border: "1px solid #2a2a2a",
  background: "#1d1d1d",
  display: "grid",
  gap: 6,
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

const stagePillStyle = (stage: DashboardFile["stage"]): React.CSSProperties => ({
  padding: "4px 8px",
  borderRadius: 999,
  background: `${getFileAccent(stage)}22`,
  color: getFileAccent(stage),
  fontSize: 11,
  fontWeight: 700,
  border: `1px solid ${getFileAccent(stage)}33`,
});