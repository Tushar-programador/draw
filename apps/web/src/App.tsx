import { Suspense, lazy, useState } from "react";
import { DashboardPage, type DashboardOpenFile } from "./pages/DashboardPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { HomePage } from "./pages/HomePage.js";

const CanvasPage = lazy(async () => import("./pages/CanvasPage.js").then((mod) => ({ default: mod.CanvasPage })));

export type AuthState = {
  token: string;
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  googleDriveConnected: boolean;
} | null;
type Page = "home" | "login" | "dashboard" | "canvas";

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const raw = localStorage.getItem("zenith_auth");
    return raw ? (JSON.parse(raw) as AuthState) : null;
  });
  const [page, setPage] = useState<Page>(() => (localStorage.getItem("zenith_auth") ? "dashboard" : "home"));
  const [selectedFile, setSelectedFile] = useState<DashboardOpenFile | null>(null);

  const handleLogin = (state: NonNullable<AuthState>) => {
    localStorage.setItem("zenith_auth", JSON.stringify(state));
    setAuth(state);
    setPage("dashboard");
  };

  const handleOpenFile = (file: DashboardOpenFile) => {
    setSelectedFile(file);
    setPage("canvas");
  };

  const handleBackToDashboard = () => {
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("zenith_auth");
    setAuth(null);
    setSelectedFile(null);
    setPage("home");
  };

  if (page === "canvas" && auth && selectedFile) {
    return (
      <Suspense fallback={<div style={{ height: "100%", display: "grid", placeItems: "center" }}>Loading canvas...</div>}>
        <CanvasPage auth={auth} onLogout={handleLogout} onBack={handleBackToDashboard} selectedFile={selectedFile} />
      </Suspense>
    );
  }
  if (page === "dashboard" && auth) {
    return <DashboardPage auth={auth} onLogout={handleLogout} onOpenFile={handleOpenFile} />;
  }
  if (page === "login") return <LoginPage onLogin={handleLogin} onBack={() => setPage("home")} />;
  return <HomePage onGetStarted={() => setPage("login")} onLogin={() => setPage("login")} />;
}
