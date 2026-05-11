// src/components/Auth/ResetPasswordPage.jsx
//
// Mounted at /reset-password in your router.
// Firebase redirects here after the user clicks the email link, appending:
//   ?mode=resetPassword&oobCode=<code>&apiKey=...&lang=en
//
// Flow:
//   1. Read `oobCode` from the URL.
//   2. Verify it and resolve the email via Firebase.
//   3. Show a "new password" form.
//   4. Call Firebase confirmPasswordReset(oobCode, newPassword).
//   5. Sign the user in with the new password to get a fresh ID token.
//   6. POST that token to /auth/password-reset-complete so the backend
//      kills sessions and locks the account pending re-approval.
//
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAuth,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  verifyPasswordResetCode,
} from "firebase/auth";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "./Auth.css";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

// ── Shared decorative wave background (mirrors AuthPage exactly) ──────────────
function ResetWaveBg() {
  return (
    <svg
      className="auth-wave-bg"
      viewBox="0 0 1400 1100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rwg-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c4a20" />
          <stop offset="100%" stopColor="#1a2d14" />
        </linearGradient>
        <linearGradient id="rwg-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a7032" />
          <stop offset="100%" stopColor="#2d4a1e" />
        </linearGradient>
      </defs>
      <path
        className="wave-path-dark"
        d="M 0 320 Q 280 480 620 380 Q 900 280 1100 520 Q 1250 680 1400 820 L 1400 1100 L 0 1100 Z"
        fill="url(#rwg-dark)"
      />
      <path
        className="wave-path-light"
        d="M 0 220 Q 270 390 610 290 Q 890 190 1090 430 Q 1240 590 1400 720 L 1400 1100 L 0 1100 Z"
        fill="url(#rwg-light)"
      />
      <circle cx="80"  cy="700" r="2"   fill="rgba(168,208,128,0.22)" />
      <circle cx="200" cy="800" r="1.5" fill="rgba(168,208,128,0.18)" />
      <circle cx="360" cy="750" r="2.2" fill="rgba(168,208,128,0.15)" />
      <circle cx="120" cy="900" r="1.8" fill="rgba(168,208,128,0.2)"  />
      <circle cx="500" cy="820" r="1.5" fill="rgba(168,208,128,0.12)" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get("oobCode") ?? "";
  const mode    = searchParams.get("mode")    ?? "";

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [codeValid,   setCodeValid]   = useState(null); // null=checking | true | false
  const [done,        setDone]        = useState(false);

  // ── Verify the oobCode on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setCodeValid(false);
      return;
    }
    verifyPasswordResetCode(getAuth(), oobCode)
      .then((resolvedEmail) => { setEmail(resolvedEmail); setCodeValid(true); })
      .catch(() => setCodeValid(false));
  }, [oobCode, mode]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6)  { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { toast.error("Passwords do not match."); return; }

    setLoading(true);
    const toastId = toast.loading("Updating your password…");

    try {
      const auth = getAuth();

      // 1 — confirm the reset with Firebase
      await confirmPasswordReset(auth, oobCode, password);

      // 2 — sign in immediately to obtain a fresh ID token
      let fbToken = null;
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        fbToken = await credential.user.getIdToken();
      } catch { /* non-fatal */ }

      // 3 — notify backend: kills sessions + locks account pending re-approval
      if (fbToken) {
        try {
          await fetch(`${API}/auth/password-reset-complete`, {
            method:  "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:  `Bearer ${fbToken}`,
            },
          });
        } catch { /* non-fatal — password already reset in Firebase */ }
      }

      toast.success("Password updated successfully!", { id: toastId, duration: 4000 });
      setDone(true);
    } catch (err) {
      const code = err?.code ?? "";
      const msg =
        code === "auth/expired-action-code"   ? "This reset link has expired. Please request a new one."
        : code === "auth/invalid-action-code" ? "This reset link is invalid or has already been used."
        : code === "auth/weak-password"       ? "Password is too weak. Choose at least 6 characters."
        : "Something went wrong. Please try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── State: checking code ───────────────────────────────────────────────────
  if (codeValid === null) {
    return (
      <div className="auth-page">
        <ResetWaveBg />
        <div className="auth-card">
          <span className="auth-form__eyebrow">Please wait</span>
          <h2 className="auth-form__title">Verifying<br />your link…</h2>
          <p className="auth-form__sub">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  // ── State: invalid / expired code ─────────────────────────────────────────
  if (codeValid === false) {
    return (
      <div className="auth-page">
        <ResetWaveBg />
        <div className="auth-card">
          <div className="auth-sent-state__icon auth-sent-state__icon--error">
            <FiAlertCircle size={28} />
          </div>
          <span className="auth-form__eyebrow">Link invalid</span>
          <h2 className="auth-form__title">Reset link<br />expired</h2>
          <p className="auth-form__sub">
            This password reset link has expired or has already been used.
            Please request a new one from the login page.
          </p>
          <button
            className="auth-submit"
            type="button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── State: success ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="auth-page">
        <ResetWaveBg />
        <div className="auth-card">
          <div className="auth-sent-state">
            <div className="auth-sent-state__icon">
              <FiCheckCircle size={28} />
            </div>
            <span className="auth-form__eyebrow">All done</span>
            <h2 className="auth-form__title">Password<br />updated</h2>
            <p className="auth-form__sub">
              Your password has been changed. Your account has been temporarily
              locked — a superadmin must re-approve it before you can sign in again.
              You'll receive an email once you're cleared.
            </p>
            <div className="auth-notice">
              <FiLock className="auth-notice__icon" />
              <span>
                This extra step keeps your account secure after any credential change.
              </span>
            </div>
            <button
              className="auth-submit"
              type="button"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── State: new-password form ───────────────────────────────────────────────
  const passwordsMatch    = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className="auth-page">
      <ResetWaveBg />

      {/* Left tagline — same pattern as AuthPage */}
      <div className="auth-tagline">
        <h2>
          Secure your<br /><em>account with</em><br />a new password.
        </h2>
        <p>
          Choose a strong password you haven't used before.
          You'll need superadmin re-approval after this step.
        </p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <span className="auth-form__eyebrow">Account recovery</span>
          <h2 className="auth-form__title">Choose a new<br />password</h2>
          <p className="auth-form__sub">
            Resetting password for <strong>{email}</strong>.
            Choose something strong.
          </p>

          {/* ── New password ── */}
          <div className="auth-field">
            <label>New Password</label>
            <div className="auth-field__input-wrap">
              <input
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-field__eye"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* ── Confirm password ── */}
          <div className="auth-field">
            <label>Confirm Password</label>
            <div className="auth-field__input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-field__eye"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Inline match feedback */}
            {passwordsMatch && (
              <p className="auth-field__hint auth-field__hint--ok">Passwords match</p>
            )}
            {passwordsMismatch && (
              <p className="auth-field__hint auth-field__hint--err">Passwords do not match</p>
            )}
          </div>

          {/* ── Security notice ── */}
          <div className="auth-notice">
            <FiLock className="auth-notice__icon" />
            <span>
              After resetting, your account will be locked and a superadmin must
              re-approve it before you can sign in again.
            </span>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading || !password || !confirm}
          >
            {loading ? "Updating…" : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}