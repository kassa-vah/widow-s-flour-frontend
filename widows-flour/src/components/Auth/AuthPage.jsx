// src/components/Auth/AuthPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { FiLock, FiMail, FiInfo, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

function maskEmail(addr) {
  const atIdx = addr.indexOf("@");
  if (atIdx === -1) return addr;
  const local  = addr.slice(0, atIdx);
  const domain = addr.slice(atIdx + 1);
  const star   = (s) =>
    s.length <= 2 ? s[0] + "*".repeat(s.length - 1) : s.slice(0, 2) + "*".repeat(s.length - 2);
  const dotPos  = domain.lastIndexOf(".");
  const domName = dotPos !== -1 ? domain.slice(0, dotPos) : domain;
  const domTld  = dotPos !== -1 ? domain.slice(dotPos)    : "";
  return `${star(local)}@${star(domName)}${domTld}`;
}

// ── Small reusable password field with eye toggle ─────────────────────────────
function PasswordField({ label, value, onChange, placeholder, autoComplete, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label>{label}</label>
      <div className="auth-field__password-wrap">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        <button
          type="button"
          className="auth-field__eye"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage({ onLogin, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === "/register" ? "register" : "login";

  // mode: "login" | "register" | "otp" | "totp" | "totp-setup" | "forgot" | "forgot-sent"
  const [mode, setMode]       = useState(initialMode);
  const [loading, setLoading] = useState(false);

  // Login / Register fields
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // Email OTP step (email+password flow)
  const [otpAdminId, setOtpAdminId] = useState(null);
  const [otpEmail, setOtpEmail]     = useState("");
  const [otpFbToken, setOtpFbToken] = useState("");
  const [otp, setOtp]               = useState("");

  // TOTP step (Google flow) — shares otpAdminId / otpFbToken
  const [totpCode, setTotpCode] = useState("");

  // TOTP setup (QR screen shown after first successful email login)
  const [totpQr, setTotpQr]           = useState("");   // base64 PNG
  const [totpSecret, setTotpSecret]   = useState("");   // backup key
  const [totpConfirm, setTotpConfirm] = useState("");   // code typed to confirm scan
  // FIX: store the fb token specifically for the totp/confirm call
  const [totpSetupToken, setTotpSetupToken] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail]             = useState("");
  const [maskedForgotEmail, setMaskedForgotEmail] = useState("");

  // ── Helpers ───────────────────────────────────────────────────────────────

  const resetAllFields = () => {
    setName(""); setEmail(""); setPassword("");
    setOtp(""); setTotpCode(""); setTotpConfirm("");
    setOtpFbToken(""); setTotpSetupToken(""); setForgotEmail(""); setMaskedForgotEmail("");
    setTotpQr(""); setTotpSecret("");
  };

  const switchTo = (nextMode) => {
    resetAllFields();
    setMode(nextMode);
    if (!["otp", "totp", "totp-setup", "forgot", "forgot-sent"].includes(nextMode)) {
      navigate(nextMode === "register" ? "/register" : "/login", { replace: true });
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────

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
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Registration successful!</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
              Your account is awaiting superadmin approval. You'll receive an email once approved.
            </p>
          </div>
        ),
        { id: toastId, duration: 7000, style: { maxWidth: 360 } }
      );

      switchTo("login");
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Login — email + password (step 1 of 2) ────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required."); return; }

    setLoading(true);
    const toastId = toast.loading("Signing you in…");

    try {
      const auth       = getAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbToken    = await credential.user.getIdToken();

      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();

      if (res.status === 403) {
        toast(
          (t) => (
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Account pending approval</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                {data.error ||
                  "Your account hasn't been approved yet. You'll receive an email once the superadmin approves your request."}
              </p>
            </div>
          ),
          { id: toastId, duration: 8000, icon: null, style: { maxWidth: 380 } }
        );
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Login failed.", { id: toastId });
        return;
      }

      if (res.status === 202) {
        toast.success(
          (t) => (
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Verification code sent!</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                A 6-digit code has been sent to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
            </div>
          ),
          { id: toastId, duration: 6000, style: { maxWidth: 360 } }
        );

        setOtpAdminId(data.data?.admin_id);
        setOtpEmail(email);
        setOtpFbToken(fbToken);
        setPassword("");
        setMode("otp");
        return;
      }

      // 200 — login complete; check if TOTP setup is still needed
      toast.success("Welcome back!", { id: toastId });
      const adminData  = data.data?.data ?? data.data;
      const needsSetup = data.data?.needs_totp_setup ?? !adminData?.totp_enabled;

      if (needsSetup) {
        onLogin(adminData, fbToken);
        await _loadTotpSetup(fbToken);
      } else {
        onLogin(adminData, fbToken);
      }
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

  // ── OTP Verify — email+password (step 2 of 2) ─────────────────────────────

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
        toast.error("Too many incorrect attempts. Please sign in again.", {
          id: toastId, duration: 6000,
        });
        switchTo("login");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Invalid or expired code.", { id: toastId });
        setOtp("");
        return;
      }

      const adminData  = data.data?.data ?? data.data;
      const needsSetup = data.data?.needs_totp_setup ?? !adminData?.totp_enabled;

      toast.success(
        `Welcome back, ${adminData?.name ?? "Admin"}!`,
        { id: toastId, duration: 4000 }
      );

      onLogin(adminData, otpFbToken);

      if (needsSetup) {
        await _loadTotpSetup(otpFbToken);
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Sending a new code…");
    try {
      toast("For security, please sign in again to receive a new code.", {
        id: toastId, duration: 5000,
      });
      const savedEmail = otpEmail;
      switchTo("login");
      setEmail(savedEmail);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In (step 1 of 2) ─────────────────────────────────────────

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Opening Google sign-in…");

    try {
      const auth     = getAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result  = await signInWithPopup(auth, provider);
      const fbToken = await result.user.getIdToken();

      toast.loading("Verifying your account…", { id: toastId });

      const res  = await fetch(`${API}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.totp_not_configured) {
          toast(
            (t) => (
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Authenticator not set up</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                  Sign in with email &amp; password first to set up your Google Authenticator,
                  then you can use Google sign-in.
                </p>
              </div>
            ),
            { id: toastId, duration: 8000, icon: "🔐", style: { maxWidth: 380 } }
          );
        } else {
          toast.error(data.error || "Google sign-in failed.", { id: toastId });
        }
        return;
      }

      // 202 — backend wants TOTP code
      toast.success("Google account verified! Enter your authenticator code.", {
        id: toastId, duration: 4000,
      });

      setOtpAdminId(data.data?.admin_id);
      setOtpFbToken(fbToken);
      setTotpCode("");
      setMode("totp");
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        toast.dismiss(toastId);
      } else {
        toast.error("Google sign-in failed. Please try again.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── TOTP Verify — Google flow (step 2 of 2) ───────────────────────────────

  const handleTotpVerify = async (e) => {
    e.preventDefault();
    const trimmed = totpCode.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying authenticator code…");

    try {
      const res  = await fetch(`${API}/auth/verify-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: otpAdminId, code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Incorrect code. Please try again.", { id: toastId });
        setTotpCode("");
        return;
      }

      const adminData = data.data?.data ?? data.data;
      toast.success(`Welcome back, ${adminData?.name ?? "Admin"}!`, {
        id: toastId, duration: 4000,
      });
      onLogin(adminData, otpFbToken);
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── TOTP Setup — fetch QR from backend ───────────────────────────────────

  const _loadTotpSetup = async (fbToken) => {
    try {
      const res  = await fetch(`${API}/auth/totp/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTotpQr(data.data?.qr_code ?? "");
        setTotpSecret(data.data?.secret ?? "");
        setTotpSetupToken(fbToken); // FIX: stash token for the confirm call
        setMode("totp-setup");
      }
    } catch {
      // Non-fatal — user can set up TOTP later from their profile
    }
  };

  // ── TOTP Setup — confirm scan ─────────────────────────────────────────────

  const handleTotpConfirm = async (e) => {
    e.preventDefault();
    const trimmed = totpConfirm.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      toast.error("Enter the 6-digit code shown in your authenticator app.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Activating authenticator…");

    try {
      // FIX: /auth/totp/confirm is @admin_required — must send the Firebase token
      const res  = await fetch(`${API}/auth/totp/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${totpSetupToken}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Code incorrect. Try again.", { id: toastId });
        setTotpConfirm("");
        return;
      }

      toast.success("Authenticator app linked! You can now use Google sign-in.", {
        id: toastId, duration: 5000,
      });
      setMode("login");
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ───────────────────────────────────────────────────────

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const trimmedEmail = forgotEmail.trim().toLowerCase();
    if (!trimmedEmail) { toast.error("Please enter your email address."); return; }

    setLoading(true);
    const toastId = toast.loading("Sending reset link…");

    try {
      const res  = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.", { id: toastId });
        return;
      }

      setMaskedForgotEmail(maskEmail(trimmedEmail));
      toast.success("Reset link sent!", { id: toastId });
      setMode("forgot-sent");
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
          Control beneficiaries, campaigns, donations, and blog content from one secure dashboard.
        </p>
      </div>

      <div className="auth-card">

        {/* ── Login ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <span className="auth-form__eyebrow">Welcome back</span>
            <h2 className="auth-form__title">Sign in to your<br />account</h2>
            <p className="auth-form__sub">
              Enter your credentials. A verification code will be sent to your email after sign-in.
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

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              disabled={loading}
            />

            <div className="auth-forgot-row">
              <button
                type="button"
                className="auth-toggle__link"
                onClick={() => { setForgotEmail(email); setMode("forgot"); }}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <div className="auth-toggle">
              Don't have an account?
              <button type="button" onClick={() => switchTo("register")}>Register</button>
            </div>
          </form>
        )}

        {/* ── Register ── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <span className="auth-form__eyebrow">Get started</span>
            <h2 className="auth-form__title">Create an admin<br />account</h2>
            <p className="auth-form__sub">
              Your account will need superadmin approval before you can access the dashboard.
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

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              disabled={loading}
            />

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Submitting request…" : "Request Account"}
            </button>

            <div className="auth-toggle">
              Already have an account?
              <button type="button" onClick={() => switchTo("login")}>Sign in</button>
            </div>
          </form>
        )}

        {/* ── Email OTP ── */}
        {mode === "otp" && (
          <form onSubmit={handleVerify} noValidate>
            <span className="auth-form__eyebrow">Two-step verification</span>
            <h2 className="auth-form__title">Check your<br />email</h2>
            <p className="auth-form__sub">
              We sent a 6-digit code to <strong>{otpEmail}</strong>. Enter it below — it expires in
              10 minutes.
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

        {/* ── Google TOTP verify ── */}
        {mode === "totp" && (
          <form onSubmit={handleTotpVerify} noValidate>
            <span className="auth-form__eyebrow">Two-step verification</span>
            <h2 className="auth-form__title">Authenticator<br />code</h2>
            <p className="auth-form__sub">
              Open <strong>Google Authenticator</strong> (or any TOTP app) and enter the
              6-digit code for <strong>Widows Flour</strong>.
            </p>

            <div className="auth-field">
              <label>Authenticator Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="one-time-code"
                disabled={loading}
                autoFocus
                style={{ letterSpacing: "0.35em", fontSize: "1.25rem", textAlign: "center" }}
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading || totpCode.length !== 6}>
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>

            <div className="auth-toggle" style={{ marginTop: "6px" }}>
              <button type="button" onClick={() => switchTo("login")} disabled={loading}>
                ← Back to sign in
              </button>
            </div>
          </form>
        )}

        {/* ── TOTP Setup (QR code) ── */}
        {mode === "totp-setup" && (
          <form onSubmit={handleTotpConfirm} noValidate>
            <span className="auth-form__eyebrow">Secure your account</span>
            <h2 className="auth-form__title">Set up<br />authenticator</h2>
            <p className="auth-form__sub">
              Scan this QR code with <strong>Google Authenticator</strong> or any TOTP app,
              then enter the 6-digit code it shows to confirm.
            </p>

            {totpQr && (
              <div className="auth-qr-wrap">
                <img
                  src={`data:image/png;base64,${totpQr}`}
                  alt="TOTP QR code"
                  className="auth-qr-img"
                />
              </div>
            )}

            {totpSecret && (
              <div className="auth-notice auth-notice--info" style={{ marginBottom: "16px" }}>
                <FiInfo className="auth-notice__icon" />
                <span>
                  Can't scan? Enter this key manually:{" "}
                  <strong style={{ letterSpacing: "0.1em", wordBreak: "break-all" }}>
                    {totpSecret}
                  </strong>
                </span>
              </div>
            )}

            <div className="auth-field">
              <label>Confirm Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={totpConfirm}
                onChange={(e) => setTotpConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="one-time-code"
                disabled={loading}
                style={{ letterSpacing: "0.35em", fontSize: "1.25rem", textAlign: "center" }}
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading || totpConfirm.length !== 6}
            >
              {loading ? "Activating…" : "Activate Authenticator"}
            </button>

            <div className="auth-toggle" style={{ marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setMode("login")}
                disabled={loading}
              >
                Skip for now
              </button>
            </div>
          </form>
        )}

        {/* ── Forgot Password — input ── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} noValidate>
            <span className="auth-form__eyebrow">Account recovery</span>
            <h2 className="auth-form__title">Reset your<br />password</h2>
            <p className="auth-form__sub">
              Enter your registered email and we'll send you a secure reset link.
            </p>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="auth-notice">
              <FiLock className="auth-notice__icon" />
              <span>
                After resetting your password, your account will be locked until a
                superadmin re-approves it. You'll receive an email once cleared.
              </span>
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading || !forgotEmail.trim()}
            >
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>

            <div className="auth-toggle">
              <button type="button" onClick={() => switchTo("login")} disabled={loading}>
                ← Back to sign in
              </button>
            </div>
          </form>
        )}

        {/* ── Forgot Password — sent ── */}
        {mode === "forgot-sent" && (
          <div className="auth-sent-state">
            <div className="auth-sent-state__icon">
              <FiMail size={28} />
            </div>
            <span className="auth-form__eyebrow">Check your inbox</span>
            <h2 className="auth-form__title">Reset link sent</h2>
            <p className="auth-form__sub">
              If <strong>{maskedForgotEmail}</strong> is registered, a password reset
              link has been sent. It expires in <strong>1 hour</strong>.
            </p>

            <div className="auth-notice auth-notice--info">
              <FiInfo className="auth-notice__icon" />
              <span>
                After resetting your password, your account will be locked and a superadmin
                must re-approve it before you can sign in again.
              </span>
            </div>

            <button
              className="auth-submit auth-submit--outline"
              type="button"
              onClick={() => switchTo("login")}
            >
              <FiArrowLeft style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Back to sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
}