// src/components/Onboarding/OnboardingPage.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./Onboarding.css";
import imgLogo from "../../assets/whitelogo.jpeg";
import WelcomeStep from "./steps/WelcomeStep";
import DashboardOverviewStep from "./steps/DashboardOverviewStep";
import AdminGuidanceStep from "./steps/AdminGuidanceStep";
import DataIntegrityStep from "./steps/DataIntegrityStep";
import BioDataGuideStep from "./steps/BioDataGuideStep";
import ProfileSystemStep from "./steps/ProfileSystemStep";
import MFAStep from "./steps/MFAStep";
import ResponsibilityStep from "./steps/ResponsibilityStep";
import OnboardingSuccess from "./OnboardingSuccess";

const STEPS = [
  { id: "welcome",    label: "Welcome",            icon: "bi-house-heart" },
  { id: "overview",   label: "Dashboard Guide",    icon: "bi-grid-1x2" },
  { id: "guidance",   label: "How-To Guide",       icon: "bi-journal-text" },
  { id: "integrity",  label: "Data Integrity",     icon: "bi-shield-check" },
  { id: "biodata",    label: "Biodata Collection", icon: "bi-person-lines-fill" },
  { id: "profile",    label: "Profile System",     icon: "bi-bar-chart-steps" },
  { id: "mfa",        label: "Secure Account",     icon: "bi-shield-lock" },
  { id: "pledge",     label: "My Pledge",          icon: "bi-patch-check" },
];

const MFA_STEP_INDEX = STEPS.findIndex((s) => s.id === "mfa");

const STORAGE_KEY = "wf_onboarding_state";

export default function OnboardingPage({
  adminName = "Administrator",
  adminData,      // full admin object — used to seed totpEnabled
  fbToken,        // current Firebase ID token — required by MFAStep's API calls
  onComplete,
}) {
  const [currentStep, setCurrentStep]   = useState(0);
  const [completed,   setCompleted]     = useState(false);
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));

  // Single source of truth for whether MFA has been completed. Seeded from
  // adminData so a returning admin who already has TOTP doesn't get blocked,
  // then flipped true the instant MFAStep confirms a fresh setup.
  const [totpEnabled, setTotpEnabled] = useState(!!adminData?.totp_enabled);

  useEffect(() => {
    if (adminData?.totp_enabled) setTotpEnabled(true);
  }, [adminData?.totp_enabled]);

  // Restore progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step, visited } = JSON.parse(saved);
        // Never restore onto or past a step beyond MFA if MFA wasn't done —
        // a stale localStorage entry shouldn't be a bypass.
        const safeStep = (!totpEnabled && (step ?? 0) > MFA_STEP_INDEX) ? MFA_STEP_INDEX : (step ?? 0);
        setCurrentStep(safeStep);
        setVisitedSteps(new Set(visited ?? [0]));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist progress
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: currentStep, visited: [...visitedSteps] })
    );
  }, [currentStep, visitedSteps]);

  // Scroll to top on every step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // The only gate that matters: you cannot land on any step AFTER mfa
  // unless totpEnabled is true. You can always go TO the mfa step itself,
  // and you can always go backward to earlier informational steps.
  const isLocked = (idx) => idx > MFA_STEP_INDEX && !totpEnabled;

  const goTo = (idx) => {
    if (isLocked(idx)) {
      toast.error("Finish setting up your authenticator first.");
      setCurrentStep(MFA_STEP_INDEX);
      setVisitedSteps((prev) => new Set([...prev, MFA_STEP_INDEX]));
      return;
    }
    setCurrentStep(idx);
    setVisitedSteps((prev) => new Set([...prev, idx]));
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
  };
  const prev = () => { if (currentStep > 0) goTo(currentStep - 1); };

  // "Skip to end" now means "skip to MFA" if it isn't done yet — there is no
  // way to skip past it to Pledge.
  const skipToEnd = () => goTo(totpEnabled ? STEPS.length - 1 : MFA_STEP_INDEX);

  const handleFinish = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted(true);
    if (onComplete) onComplete();
  };

  if (completed) return <OnboardingSuccess adminName={adminName} />;

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const stepProps = {
    next, prev, skipToEnd, adminName,
    currentStep, totalSteps: STEPS.length,
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":   return <WelcomeStep           {...stepProps} />;
      case "overview":  return <DashboardOverviewStep {...stepProps} />;
      case "guidance":  return <AdminGuidanceStep     {...stepProps} />;
      case "integrity": return <DataIntegrityStep     {...stepProps} />;
      case "biodata":   return <BioDataGuideStep      {...stepProps} />;
      case "profile":   return <ProfileSystemStep     {...stepProps} />;
      case "mfa":
        return (
          <MFAStep
            {...stepProps}
            fbToken={fbToken}
            alreadyEnabled={totpEnabled}
            onConfirmed={() => setTotpEnabled(true)}
          />
        );
      case "pledge":    return <ResponsibilityStep    {...stepProps} onFinish={handleFinish} />;
      default:          return null;
    }
  };

  return (
    <div className="ob__shell">

      {/* ── Top header bar (replaces sidebar) ── */}
      <header className="ob__topbar">
        {/* Brand */}
        <div className="ob__topbar-brand">
          <img
            src={imgLogo}
            alt="Widows Flour logo"
            className="ob__brand-logo"
          />
          <div>
            <div className="ob__brand-name">Widows Flour</div>
            <div className="ob__brand-sub">Admin Onboarding</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="ob__topbar-progress">
          <span className="ob__topbar-progress-label">
            Progress <span className="ob__topbar-progress-pct">{Math.round(progress)}%</span>
          </span>
          <div className="ob__progress-track">
            <div className="ob__progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Skip button — skips to MFA, never past it */}
        <button className="ob__topbar-skip" onClick={skipToEnd}>
          <i className="bi bi-skip-end" /> {totpEnabled ? "Skip to pledge" : "Skip to security setup"}
        </button>
      </header>

      {/* ── Step indicator dots ── */}
      <div className="ob__step-dots">
        {STEPS.map((_, i) => (
          <button
            key={i}
            className={`ob__dot ${
              i === currentStep
                ? "ob__dot--active"
                : i < currentStep
                ? "ob__dot--done"
                : ""
            } ${isLocked(i) ? "ob__dot--locked" : ""}`}
            onClick={() => goTo(i)}
            aria-label={
              isLocked(i)
                ? `Step ${i + 1} locked until authenticator setup is complete`
                : `Go to step ${i + 1}`
            }
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="ob__main">
        <div className="ob__main-inner">
          {renderStep()}
        </div>

        {/* Bottom step counter */}
        <div className="ob__step-counter">
          Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
        </div>
      </main>

    </div>
  );
}