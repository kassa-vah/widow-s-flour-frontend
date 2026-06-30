// src/components/Onboarding/steps/MFAStep.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiShield, FiInfo, FiCheckCircle, FiSmartphone } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export default function MFAStep({
  next,
  prev,
  adminName,
  currentStep,
  totalSteps,
  fbToken,
  alreadyEnabled,
  onConfirmed,   // ← called the moment TOTP is confirmed, unlocks the parent's gate
}) {
  const [phase, setPhase]       = useState("intro");    // "intro" | "scan" | "confirm" | "done"
  const [loading, setLoading]   = useState(false);
  const [qrCode, setQrCode]     = useState("");
  const [secret, setSecret]     = useState("");
  const [code, setCode]         = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // If TOTP already active (e.g. revisited this step after confirming), skip to done
  useEffect(() => {
    if (alreadyEnabled) setPhase("done");
  }, [alreadyEnabled]);

  // ── Step 1: Fetch QR from backend ─────────────────────────────────────────
  // This is now the ONLY place in the entire app that calls /auth/totp/setup.

  const handleSetupStart = async () => {
    setLoading(true);
    const toastId = toast.loading("Generating your authenticator code…");

    try {
      const res  = await fetch(`${API}/auth/totp/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not generate QR code. Please try again.", { id: toastId });
        return;
      }

      setQrCode(data.data?.qr_code ?? "");
      setSecret(data.data?.secret  ?? "");
      setPhase("scan");
      toast.success("QR code ready — scan it with your authenticator app.", { id: toastId });
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Confirm the code ───────────────────────────────────────────────
  // This is now the ONLY place in the entire app that calls /auth/totp/confirm.

  const handleConfirm = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Activating authenticator…");

    try {
      const res  = await fetch(`${API}/auth/totp/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Incorrect code. Please try again.", { id: toastId });
        setCode("");
        return;
      }

      toast.success("Authenticator linked! Your account is now protected.", {
        id: toastId,
        duration: 4000,
      });
      setPhase("done");
      // Unlock the parent gate immediately — this is the only thing that
      // allows progression past this step to Pledge.
      if (onConfirmed) onConfirmed();
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="ob__step">

      {/* ── INTRO phase ── */}
      {phase === "intro" && (
        <div className="ob__step-content ob__mfa-intro">
          <div className="ob__step-icon ob__step-icon--shield">
            <FiShield size={32} />
          </div>
          <span className="ob__step-eyebrow">Security Setup — Required</span>
          <h1 className="ob__step-title">Secure your account<br />with an authenticator</h1>
          <p className="ob__step-lead">
            Before you can finish onboarding, you'll need to link an authenticator app.
            This adds a second layer of protection — even if your password is ever compromised,
            your account stays locked. This step cannot be skipped.
          </p>

          <div className="ob__mfa-why-cards">
            <div className="ob__mfa-why-card">
              <FiShield size={20} />
              <div>
                <strong>Protects beneficiary data</strong>
                <span>You have access to sensitive records. MFA keeps them safe.</span>
              </div>
            </div>
            <div className="ob__mfa-why-card">
              <FiSmartphone size={20} />
              <div>
                <strong>Required for Google sign-in</strong>
                <span>You'll need this set up to use "Continue with Google" later.</span>
              </div>
            </div>
            <div className="ob__mfa-why-card">
              <FiCheckCircle size={20} />
              <div>
                <strong>Takes under two minutes</strong>
                <span>Download Google Authenticator or Authy, scan once, done.</span>
              </div>
            </div>
          </div>

          <div className="ob__mfa-apps-hint">
            <FiInfo size={15} />
            <span>
              Recommended apps:{" "}
              <strong>Google Authenticator</strong>, <strong>Authy</strong>, or{" "}
              <strong>Microsoft Authenticator</strong>
            </span>
          </div>

          <div className="ob__step-actions">
            <button className="ob__btn ob__btn--primary" onClick={handleSetupStart} disabled={loading}>
              {loading ? "Generating…" : "Set Up Authenticator →"}
            </button>
            <button className="ob__btn ob__btn--ghost" onClick={prev} disabled={loading}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── SCAN phase ── */}
      {phase === "scan" && (
        <div className="ob__step-content ob__mfa-scan">
          <span className="ob__step-eyebrow">Step 1 of 2 — Scan</span>
          <h1 className="ob__step-title">Scan this QR code</h1>
          <p className="ob__step-lead">
            Open your authenticator app, tap <strong>+</strong> or <strong>Add account</strong>,
            then point your camera at the code below.
          </p>

          {qrCode && (
            <div className="ob__mfa-qr-wrap">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="TOTP QR code — scan with your authenticator app"
                className="ob__mfa-qr"
              />
            </div>
          )}

          {/* Manual key toggle */}
          <button
            type="button"
            className="ob__mfa-secret-toggle"
            onClick={() => setShowSecret((v) => !v)}
          >
            <FiSmartphone size={14} />
            {showSecret ? "Hide manual key" : "Can't scan? Use manual key instead"}
          </button>

          {showSecret && secret && (
            <div className="ob__mfa-secret-box">
              <div className="ob__mfa-secret-label">
                <FiInfo size={13} /> Enter this key manually in your authenticator app
              </div>
              <div className="ob__mfa-secret-key">{secret}</div>
              <button
                type="button"
                className="ob__mfa-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(secret);
                  toast.success("Key copied to clipboard!");
                }}
              >
                Copy key
              </button>
            </div>
          )}

          <div className="ob__step-actions" style={{ marginTop: "28px" }}>
            <button
              className="ob__btn ob__btn--primary"
              onClick={() => setPhase("confirm")}
            >
              I've scanned it →
            </button>
            <button className="ob__btn ob__btn--ghost" onClick={() => setPhase("intro")}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIRM phase ── */}
      {phase === "confirm" && (
        <div className="ob__step-content ob__mfa-confirm">
          <span className="ob__step-eyebrow">Step 2 of 2 — Verify</span>
          <h1 className="ob__step-title">Enter the code<br />from your app</h1>
          <p className="ob__step-lead">
            Your authenticator app is now showing a 6-digit code for{" "}
            <strong>Widows Flour</strong>. Enter it below to confirm the link.
          </p>

          <form onSubmit={handleConfirm} noValidate className="ob__mfa-code-form">
            <label className="ob__mfa-code-label">Authenticator Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
              autoFocus
              disabled={loading}
              className="ob__mfa-code-input"
            />

            <div className="ob__step-actions" style={{ marginTop: "24px" }}>
              <button
                className="ob__btn ob__btn--primary"
                type="submit"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Activating…" : "Activate & Continue"}
              </button>
              <button
                type="button"
                className="ob__btn ob__btn--ghost"
                onClick={() => { setCode(""); setPhase("scan"); }}
                disabled={loading}
              >
                ← Re-scan QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── DONE phase ── */}
      {phase === "done" && (
        <div className="ob__step-content ob__mfa-done">
          <div className="ob__mfa-done-icon">
            <FiCheckCircle size={44} />
          </div>
          <span className="ob__step-eyebrow">All set!</span>
          <h1 className="ob__step-title">
            {alreadyEnabled ? "Authenticator already active" : "Authenticator linked!"}
          </h1>
          <p className="ob__step-lead">
            {alreadyEnabled
              ? "Your account already has two-factor authentication enabled. You're good to go."
              : `Great work, ${adminName}. Your account is now protected with two-factor authentication. From now on, Google sign-in will ask for your authenticator code.`}
          </p>

          <div className="ob__mfa-done-tip">
            <FiInfo size={14} />
            <span>
              Keep your authenticator app installed — you'll need it every time you sign in
              with Google. If you lose access, contact your superadmin.
            </span>
          </div>

          <div className="ob__step-actions">
            <button className="ob__btn ob__btn--primary" onClick={next}>
              Continue to Pledge →
            </button>
          </div>
        </div>
      )}

      {/* Step counter */}
      <div className="ob__step-meta">
        Step {currentStep + 1} of {totalSteps}
      </div>

    </div>
  );
}