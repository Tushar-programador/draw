import { useState } from "react";
import { CanvasPage } from "./pages/CanvasPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { HomePage } from "./pages/HomePage.js";

export type AuthState = { token: string; userId: string; name: string } | null;
type Page = "home" | "login" | "app";

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const raw = localStorage.getItem("zenith_auth");
    return raw ? (JSON.parse(raw) as AuthState) : null;
  });
  const [page, setPage] = useState<Page>(() => (localStorage.getItem("zenith_auth") ? "app" : "home"));

  const handleLogin = (state: NonNullable<AuthState>) => {
    localStorage.setItem("zenith_auth", JSON.stringify(state));
    setAuth(state);
    setPage("app");
  };

  const handleLogout = () => {
    localStorage.removeItem("zenith_auth");
    setAuth(null);
    setPage("home");
  };

  if (page === "app" && auth) return <CanvasPage auth={auth} onLogout={handleLogout} />;
  if (page === "login") return <LoginPage onLogin={handleLogin} onBack={() => setPage("home")} />;
  return <HomePage onGetStarted={() => setPage("login")} onLogin={() => setPage("login")} />;
}
