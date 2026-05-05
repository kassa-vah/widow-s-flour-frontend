// src/components/Auth/AuthPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export default function AuthPage({ onLogin, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === "/register" ? "register" : "login";

  // mode: "login" | "register" | "otp"
  const [mode, setMode]         = useState(initialMode);
  const [loading, setLoading]   = useState(false);

  // Login / Register fields
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // OTP step
  const [otpAdminId, setOtpAdminId] = useState(null);
  const [otpEmail, setOtpEmail]     = useState("");
  const [otpFbToken, setOtpFbToken] = useState("");   // ← preserve FB token across steps
  const [otp, setOtp]               = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  const switchTo = (nextMode) => {
    setName(""); setEmail(""); setPassword(""); setOtp("");
    setOtpFbToken("");
    setMode(nextMode);
    if (nextMode !== "otp") {
      navigate(nextMode === "register" ? "/register" : "/login", { replace: true });
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────

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

      toast.success(
        (t) => (
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              Registration successful! 🎉
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
              Your account is awaiting superadmin approval.
              You'll receive an email once approved.
            </p>
          </div>
        ),
        { id: toastId, duration: 7000, style: { maxWidth: 360 } }
      );

      switchTo("login");
      setEmail("");
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Login (Step 1 — Firebase + backend approval check) ────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required."); return; }

    setLoading(true);
    const toastId = toast.loading("Signing you in…");

    try {
      // Step 1a — Firebase client auth
      const auth       = getAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbToken    = await credential.user.getIdToken();

      // Step 1b — Backend: verify token + approval gate + send OTP
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();

      // 403 = unapproved account
      if (res.status === 403) {
        toast(
          (t) => (
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                ⏳ Account pending approval
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                {data.error ||
                  "Your account hasn't been approved yet. You'll receive an email once the superadmin approves your request."}
              </p>
            </div>
          ),
          { id: toastId, duration: 8000, icon: "🔒", style: { maxWidth: 380 } }
        );
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Login failed.", { id: toastId });
        return;
      }

      // 202 = approved, OTP sent — preserve fbToken and move to OTP step
      if (res.status === 202) {
        toast.success(
          (t) => (
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                Verification code sent! 📧
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                A 6-digit code has been sent to{" "}
                <strong>{email}</strong>. It expires in 10 minutes.
              </p>
            </div>
          ),
          { id: toastId, duration: 6000, style: { maxWidth: 360 } }
        );

        setOtpAdminId(data.data?.admin_id);
        setOtpEmail(email);
        setOtpFbToken(fbToken);   // ← store token for use after OTP verify
        setPassword("");
        setMode("otp");
        return;
      }

      // Fallback: unexpected 200
      toast.success(`Welcome back!`, { id: toastId });
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

  // ── OTP Verify (Step 2) ────────────────────────────────────────────────────

  const handleVerify = async (e) => {
    e.preventDefault();
    const trimmed = otp.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      toast.error("Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying code…");

    try {
      const res  = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: otpAdminId, code: trimmed }),
      });
      const data = await res.json();

      if (res.status === 429) {
        toast.error(
          "Too many incorrect attempts. Please sign in again.",
          { id: toastId, duration: 6000 }
        );
        switchTo("login");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Invalid or expired code.", { id: toastId });
        setOtp("");
        return;
      }

      toast.success(
        `Welcome back, ${data.data?.data?.name ?? data.data?.name ?? "Admin"}! ✅`,
        { id: toastId, duration: 4000 }
      );

      // ← pass the preserved Firebase token so all dashboard requests are authenticated
      onLogin(data.data?.data ?? data.data, otpFbToken);

    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Sending a new code…");
    try {
      toast(
        "For security, please sign in again to receive a new code.",
        { id: toastId, icon: "🔒", duration: 5000 }
      );
      const savedEmail = otpEmail;
      switchTo("login");
      setEmail(savedEmail);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="auth-page">

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

      {onBack && (
        <button className="auth-back-btn" onClick={onBack}>
          ← Back to site
        </button>
      )}

      <div className="auth-tagline">
        <h2>
          Manage with<br /><em>purpose &amp;</em><br />precision.
        </h2>
        <p>
          Control beneficiaries, campaigns, donations, and blog
          content from one secure dashboard.
        </p>
      </div>

      <div className="auth-card">

        {mode === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <span className="auth-form__eyebrow">Welcome back</span>
            <h2 className="auth-form__title">Sign in to your<br />account</h2>
            <p className="auth-form__sub">
              Enter your credentials. A verification code will be sent
              to your email after sign-in.
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

        {mode === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <span className="auth-form__eyebrow">Get started</span>
            <h2 className="auth-form__title">Create an admin<br />account</h2>
            <p className="auth-form__sub">
              Your account will need superadmin approval before you
              can access the dashboard.
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
              {loading ? "Submitting request…" : "Request Account"}
            </button>

            <div className="auth-toggle">
              Already have an account?
              <button type="button" onClick={() => switchTo("login")}>
                Sign in
              </button>
            </div>
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={handleVerify} noValidate>
            <span className="auth-form__eyebrow">Two-step verification</span>
            <h2 className="auth-form__title">Check your<br />email</h2>
            <p className="auth-form__sub">
              We sent a 6-digit code to{" "}
              <strong>{otpEmail}</strong>. Enter it below —
              it expires in 10 minutes.
            </p>

            <div className="auth-field">
              <label>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="one-time-code"
                disabled={loading}
                style={{ letterSpacing: "0.35em", fontSize: "1.25rem", textAlign: "center" }}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>

            <div className="auth-toggle">
              Didn't receive the code?{" "}
              <button type="button" onClick={handleResend} disabled={loading}>
                Try again
              </button>
            </div>

            <div className="auth-toggle" style={{ marginTop: "6px" }}>
              <button type="button" onClick={() => switchTo("login")} disabled={loading}>
                ← Back to sign in
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}