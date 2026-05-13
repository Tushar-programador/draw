import { useEffect, useRef, useState } from "react";
import type { AuthState } from "../App.js";
import { getGoogleDriveAccessToken } from "../lib/googleDrive.js";

type AuthResponse = {
  token?: string;
  user?: { id: string; name: string; email: string; emailVerified?: boolean; googleDriveConnected?: boolean };
  error?: unknown;
  devOtp?: string;
  message?: string;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google sign-in"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

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
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const connectDrive = async (authToken: string): Promise<boolean> => {
    const token = await getGoogleDriveAccessToken("consent");
    const res = await fetch("/api/auth/google-drive/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ accessToken: token.accessToken, expiresIn: token.expiresIn }),
    });

    if (!res.ok) {
      throw new Error("Google Drive permission was not saved");
    }

    return true;
  };

  const applyAuthState = (data: AuthResponse) => {
    if (!data.token || !data.user) {
      throw new Error("Authentication failed");
    }

    onLogin({
      token: data.token,
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      googleDriveConnected: Boolean(data.user.googleDriveConnected),
    });
  };

  useEffect(() => {
    if (!googleClientId || (mode !== "login" && mode !== "register") || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setError("Google sign-in did not return a credential");
              return;
            }

            setError("");
            setNotice("");
            setLoading(true);

            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: credential }),
              });
              const data = (await res.json()) as AuthResponse;

              if (!res.ok) {
                setError(typeof data.error === "string" ? data.error : "Google authentication failed");
                return;
              }

              if (mode === "register" && data.token) {
                try {
                  await connectDrive(data.token);
                  if (data.user) data.user.googleDriveConnected = true;
                } catch (driveError) {
                  const driveMsg = driveError instanceof Error ? driveError.message : "Drive permission skipped";
                  setNotice(driveMsg);
                }
              }

              applyAuthState(data);
            } catch {
              setError("Google authentication failed");
            } finally {
              setLoading(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "register" ? "signup_with" : "signin_with",
          shape: "pill",
          width: 320,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("Google sign-in is unavailable right now");
        }
      });

    return () => {
      cancelled = true;
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
  }, [mode, onLogin]);

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

      const data = (await res.json()) as AuthResponse;

      if (!res.ok || !data.token || !data.user) {
        setError(typeof data.error === "string" ? data.error : "Authentication failed");
        return;
      }

      if (mode === "register") {
        if (data.token) {
          try {
            await connectDrive(data.token);
            if (data.user) data.user.googleDriveConnected = true;
            setNotice((data.devOtp ? `Email OTP (dev): ${data.devOtp}. ` : "") + "Drive connected. Verify your email with OTP.");
          } catch (driveError) {
            const driveMsg = driveError instanceof Error ? driveError.message : "Drive permission skipped";
            setNotice((data.devOtp ? `Email OTP (dev): ${data.devOtp}. ` : "") + `Verify your email with OTP. ${driveMsg}`);
          }
        } else {
          setNotice(data.devOtp ? `Email OTP (dev): ${data.devOtp}` : data.message ?? "Verify your email with OTP.");
        }
        setMode("verify");
        return;
      }

      applyAuthState(data);
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
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>OUTDRAW</h1>

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

        {googleClientId && (mode === "login" || mode === "register") && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: "#334155" }} />
              <span>or continue with</span>
              <span style={{ flex: 1, height: 1, background: "#334155" }} />
            </div>
            <div ref={googleButtonRef} style={{ minHeight: 44, display: "flex", justifyContent: "center" }} />
          </>
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
