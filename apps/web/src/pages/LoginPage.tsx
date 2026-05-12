import { useState } from "react";
import type { AuthState } from "../App.js";

interface Props {
  onLogin: (state: NonNullable<AuthState>) => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onBack }: Props) {
  const [mode, setMode] = useState<"login" | "register" | "verify" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "verify") {
        const res = await fetch("/api/auth/verify-email-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const data = (await res.json()) as { error?: unknown; message?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "OTP verification failed");
          return;
        }
        setNotice(data.message ?? "Email verified. Please sign in.");
        setMode("login");
        return;
      }

      if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = (await res.json()) as { error?: unknown; message?: string; devOtp?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not send reset OTP");
          return;
        }
        setMode("reset");
        setNotice(data.devOtp ? `Reset OTP (dev): ${data.devOtp}` : data.message ?? "Reset OTP sent.");
        return;
      }

      if (mode === "reset") {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        });
        const data = (await res.json()) as { error?: unknown; message?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Password reset failed");
          return;
        }
        setMode("login");
        setPassword("");
        setNewPassword("");
        setOtp("");
        setNotice(data.message ?? "Password reset. Sign in with the new password.");
        return;
      }

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        token?: string;
        user?: { id: string; name: string; email: string; emailVerified?: boolean };
        error?: unknown;
        devOtp?: string;
        message?: string;
      };

      if (!res.ok || !data.token || !data.user) {
        setError(typeof data.error === "string" ? data.error : "Authentication failed");
        return;
      }

      if (mode === "register") {
        setMode("verify");
        setNotice(data.devOtp ? `Email OTP (dev): ${data.devOtp}` : data.message ?? "Verify your email with OTP.");
        return;
      }

      onLogin({
        token: data.token,
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        emailVerified: Boolean(data.user.emailVerified),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", alignSelf: "flex-start", padding: "0 0 4px", fontFamily: "inherit" }}
          >
            ← Back to home
          </button>
        )}
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

        {(mode === "login" || mode === "register") && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        )}

        {(mode === "verify" || mode === "reset") && (
          <input
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            style={inputStyle}
          />
        )}

        {mode === "reset" && (
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={inputStyle}
          />
        )}

        {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}
        {notice && <p style={{ color: "#4ade80", fontSize: 13 }}>{notice}</p>}

        <button type="submit" style={btnStyle}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : mode === "register"
                ? "Create account"
                : mode === "verify"
                  ? "Verify email"
                  : mode === "forgot"
                    ? "Send reset OTP"
                    : "Reset password"}
        </button>

        <div style={{ display: "grid", gap: 8 }}>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{ ...btnStyle, background: "transparent", color: "#94a3b8", border: "1px solid #334155" }}
          >
            {mode === "login" ? "Create a new account" : "Sign in instead"}
          </button>
          <button
            type="button"
            onClick={() => setMode("forgot")}
            style={{ ...btnStyle, background: "transparent", color: "#94a3b8", border: "1px solid #334155" }}
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={async () => {
              setError("");
              const res = await fetch("/api/auth/request-email-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const data = (await res.json()) as { devOtp?: string; message?: string; error?: unknown };
              if (!res.ok) {
                setError(typeof data.error === "string" ? data.error : "Could not send OTP");
                return;
              }
              setMode("verify");
              setNotice(data.devOtp ? `Email OTP (dev): ${data.devOtp}` : data.message ?? "OTP sent.");
            }}
            style={{ ...btnStyle, background: "transparent", color: "#94a3b8", border: "1px solid #334155" }}
          >
            Resend email verification OTP
          </button>
        </div>
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
