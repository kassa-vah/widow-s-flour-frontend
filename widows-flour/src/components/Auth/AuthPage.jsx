// src/components/Auth/AuthPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import imgLogo from "../../assets/logo.png";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export default function AuthPage({ onLogin, onBack }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive mode from the URL: /register → "register", anything else → "login"
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode]         = useState(initialMode);
  const [loading, setLoading]   = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // Switch mode AND update the URL at the same time
  const switchTo = (nextMode) => {
    setName("");
    setPassword("");
    setMode(nextMode);
    navigate(nextMode === "register" ? "/register" : "/login", { replace: true });
  };

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
      switchTo("login");
      setEmail("");
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

      // App.handleLogin sets localStorage + session state, then pendingNav
      // fires navigate("/admin-dashboard") after state commits
      onLogin(data.data, fbToken);

    } catch (err) {
      const code = err?.code ?? "";
      const msg =
        code === "auth/user-not-found"          ||
        code === "auth/wrong-password"          ||
        code === "auth/invalid-credential"       ? "Incorrect email or password."
        : code === "auth/too-many-requests"      ? "Too many attempts. Try again later."
        : code === "auth/invalid-email"          ? "Please enter a valid email address."
        : code === "auth/network-request-failed" ||
          err.message === "Failed to fetch"      ? "Cannot reach the server. Please try again."
        : "Login failed. Please check your credentials.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Full-screen animated dual wave SVG ── */}
      <svg
        className="auth-wave-bg"
        viewBox="0 0 1400 1100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wg-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c4a20" />
            <stop offset="100%" stopColor="#1a2d14" />
          </linearGradient>
          <linearGradient id="wg-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a7032" />
            <stop offset="100%" stopColor="#2d4a1e" />
          </linearGradient>
        </defs>
        <path
          className="wave-path-dark"
          d="M 0 320 Q 280 480 620 380 Q 900 280 1100 520 Q 1250 680 1400 820 L 1400 1100 L 0 1100 Z"
          fill="url(#wg-dark)"
        />
        <path
          className="wave-path-light"
          d="M 0 220 Q 270 390 610 290 Q 890 190 1090 430 Q 1240 590 1400 720 L 1400 1100 L 0 1100 Z"
          fill="url(#wg-light)"
        />
        <circle cx="80"  cy="700" r="2"   fill="rgba(168,208,128,0.22)" />
        <circle cx="200" cy="800" r="1.5" fill="rgba(168,208,128,0.18)" />
        <circle cx="360" cy="750" r="2.2" fill="rgba(168,208,128,0.15)" />
        <circle cx="120" cy="900" r="1.8" fill="rgba(168,208,128,0.2)"  />
        <circle cx="500" cy="820" r="1.5" fill="rgba(168,208,128,0.12)" />
      </svg>

      {/* ── Logo top-left ── */}
      <div className="auth-logo-area">
        <img src={imgLogo} alt="Widows Flour" className="auth-logo-img" />
      </div>

      {/* ── Back to site button ── */}
      {onBack && (
        <button className="auth-back-btn" onClick={onBack}>
          ← Back to site
        </button>
      )}

      {/* ── Tagline ── */}
      <div className="auth-tagline">
        <h2>
          Manage with<br /><em>purpose &amp;</em><br />precision.
        </h2>
        <p>
          Control beneficiaries, campaigns, donations, and blog
          content from one secure dashboard.
        </p>
      </div>

      {/* ── Auth card ── */}
      <div className="auth-card">

        {/* ── Login form ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <span className="auth-form__eyebrow">Welcome back</span>
            <h2 className="auth-form__title">Sign in to your<br />account</h2>
            <p className="auth-form__sub">
              Enter your email and password to access the dashboard.
            </p>

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

            <div className="auth-toggle">
              Don't have an account?
              <button type="button" onClick={() => switchTo("register")}>
                Register
              </button>
            </div>
          </form>
        )}

        {/* ── Register form ── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <span className="auth-form__eyebrow">Get started</span>
            <h2 className="auth-form__title">Create an admin<br />account</h2>
            <p className="auth-form__sub">
              Register with your name, email, and a secure password.
            </p>

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

            <div className="auth-toggle">
              Already have an account?
              <button type="button" onClick={() => switchTo("login")}>
                Sign in
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}