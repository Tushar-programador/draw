import { useState } from "react";
import type { AuthState } from "../App.js";

interface Props {
  onLogin: (state: NonNullable<AuthState>) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, name };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      token?: string;
      user?: { id: string; name: string };
      error?: unknown;
    };

    if (!res.ok || !data.token || !data.user) {
      setError(typeof data.error === "string" ? data.error : "Authentication failed");
      return;
    }

    onLogin({ token: data.token, userId: data.user.id, name: data.user.name });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>Zenith Canvas</h1>

        {mode === "register" && (
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}

        <button type="submit" style={btnStyle}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ ...btnStyle, background: "transparent", color: "#94a3b8", border: "1px solid #334155" }}
        >
          {mode === "login" ? "Create a new account" : "Sign in instead"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#f0f0f0",
  fontSize: 14,
};

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "#6366f1",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 14,
  cursor: "pointer",
};
