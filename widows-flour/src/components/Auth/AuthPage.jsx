// src/components/Auth/AuthPage.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import "./Auth.css";
import imgLogo from "../../assets/logo.png";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export default function AuthPage({ onLogin, onBack }) {
  const [mode, setMode]         = useState("login");
  const [loading, setLoading]   = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // ── Register ──────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("All fields are required."); return; }
    if (password.length < 6)          { toast.error("Password must be at least 6 characters."); return; }

    setLoading(true);
    const toastId = toast.loading("Creating your account…");
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed.", { id: toastId });
        return;
      }
      toast.success("Account created! You can now sign in.", { id: toastId });
      setMode("login");
      setName("");
      setPassword("");
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required."); return; }

    setLoading(true);
    const toastId = toast.loading("Signing you in…");
    try {
      // Step 1 — Firebase client auth → get ID token
      const auth       = getAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbToken    = await credential.user.getIdToken();

      // Step 2 — Verify against Flask backend
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed.", { id: toastId });
        return;
      }

      toast.success(`Welcome back, ${data.data?.name ?? "Admin"}!`, { id: toastId });

      // ← App.handleLogin handles localStorage + navigate, don't duplicate here
      onLogin(data.data, fbToken);

    } catch (err) {
      const code = err?.code ?? "";
      const msg =
        code === "auth/user-not-found"     ||
        code === "auth/wrong-password"     ||
        code === "auth/invalid-credential"  ? "Incorrect email or password."
        : code === "auth/too-many-requests" ? "Too many attempts. Try again later."
        : code === "auth/invalid-email"     ? "Please enter a valid email address."
        : code === "auth/network-request-failed" ||
          err.message === "Failed to fetch"  ? "Cannot reach the server. Please try again."
        : "Login failed. Please check your credentials.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left decorative panel ── */}
      <div className="auth-panel">
        <div className="auth-panel__bg" />
        <div className="auth-panel__grain" />
        <div className="auth-panel__shape auth-panel__shape--1" />
        <div className="auth-panel__shape auth-panel__shape--2" />
        <div className="auth-panel__shape auth-panel__shape--3" />

        <img src={imgLogo} alt="Widows Flour" className="auth-panel__logo" />

        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: "absolute", top: 48, right: 60,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)", borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-body)", fontSize: 12, padding: "8px 16px",
              cursor: "pointer", zIndex: 1, transition: "background 0.2s, color 0.2s",
            }}
          >
            ← Back to site
          </button>
        )}

        <div className="auth-panel__content">
          <span className="auth-panel__eyebrow">Admin Portal</span>
          <h1 className="auth-panel__title">
            Manage with<br /><em>purpose &amp;</em><br />precision.
          </h1>
          <p className="auth-panel__sub">
            Control beneficiaries, campaigns, donations, and blog
            content — all from one secure dashboard.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">

          <p className="auth-form__eyebrow">
            {mode === "login" ? "Welcome back" : "Get started"}
          </p>
          <h2 className="auth-form__title">
            {mode === "login" ? "Sign in to your account" : "Create an admin account"}
          </h2>
          <p className="auth-form__sub">
            {mode === "login"
              ? "Enter your email and password to access the dashboard."
              : "Register with your name, email, and a secure password."}
          </p>

          {/* ── Register form ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} noValidate>
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          )}

          {/* ── Login form ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          <div className="auth-toggle">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); setEmail(""); setPassword(""); }}>
                  Register
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setName(""); setPassword(""); }}>
                  Sign in
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}