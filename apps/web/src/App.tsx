import { useState } from "react";
import { CanvasPage } from "./pages/CanvasPage.js";
import { LoginPage } from "./pages/LoginPage.js";

export type AuthState = { token: string; userId: string; name: string } | null;

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const raw = localStorage.getItem("zenith_auth");
    return raw ? (JSON.parse(raw) as AuthState) : null;
  });

  const handleLogin = (state: NonNullable<AuthState>) => {
    localStorage.setItem("zenith_auth", JSON.stringify(state));
    setAuth(state);
  };

  const handleLogout = () => {
    localStorage.removeItem("zenith_auth");
    setAuth(null);
  };

  if (!auth) return <LoginPage onLogin={handleLogin} />;
  return <CanvasPage auth={auth} onLogout={handleLogout} />;
}
