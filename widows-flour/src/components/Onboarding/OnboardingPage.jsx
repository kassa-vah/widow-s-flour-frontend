// src/components/Onboarding/OnboardingPage.jsx
import { useState, useEffect } from "react";
import "./Onboarding.css";
import WelcomeStep from "./steps/WelcomeStep";
import DashboardOverviewStep from "./steps/DashboardOverviewStep";
import AdminGuidanceStep from "./steps/AdminGuidanceStep";
import DataIntegrityStep from "./steps/DataIntegrityStep";
import BioDataGuideStep from "./steps/BioDataGuideStep";
import ProfileSystemStep from "./steps/ProfileSystemStep";
import ResponsibilityStep from "./steps/ResponsibilityStep";
import OnboardingSuccess from "./OnboardingSuccess";

const STEPS = [
  { id: "welcome",    label: "Welcome",          icon: "bi-house-heart" },
  { id: "overview",   label: "Dashboard Guide",  icon: "bi-grid-1x2" },
  { id: "guidance",   label: "How-To Guide",     icon: "bi-journal-text" },
  { id: "integrity",  label: "Data Integrity",   icon: "bi-shield-check" },
  { id: "biodata",    label: "Biodata Collection", icon: "bi-person-lines-fill" },
  { id: "profile",    label: "Profile System",   icon: "bi-bar-chart-steps" },
  { id: "pledge",     label: "My Pledge",        icon: "bi-patch-check" },
];

const STORAGE_KEY = "wf_onboarding_state";

export default function OnboardingPage({ adminName = "Administrator", onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed,   setCompleted]   = useState(false);
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));

  // Restore progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step, visited } = JSON.parse(saved);
        setCurrentStep(step ?? 0);
        setVisitedSteps(new Set(visited ?? [0]));
      } catch {}
    }
  }, []);

  // Persist progress
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: currentStep, visited: [...visitedSteps] })
    );
  }, [currentStep, visitedSteps]);

  const goTo = (idx) => {
    setCurrentStep(idx);
    setVisitedSteps(prev => new Set([...prev, idx]));
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
  };

  const prev = () => {
    if (currentStep > 0) goTo(currentStep - 1);
  };

  const skipToEnd = () => goTo(STEPS.length - 1);

  const handleFinish = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted(true);
    if (onComplete) onComplete();
  };

  if (completed) return <OnboardingSuccess adminName={adminName} />;

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const stepProps = { next, prev, skipToEnd, adminName, currentStep, totalSteps: STEPS.length };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":   return <WelcomeStep     {...stepProps} />;
      case "overview":  return <DashboardOverviewStep {...stepProps} />;
      case "guidance":  return <AdminGuidanceStep     {...stepProps} />;
      case "integrity": return <DataIntegrityStep     {...stepProps} />;
      case "biodata":   return <BioDataGuideStep      {...stepProps} />;
      case "profile":   return <ProfileSystemStep     {...stepProps} />;
      case "pledge":    return <ResponsibilityStep    {...stepProps} onFinish={handleFinish} />;
      default:          return null;
    }
  };

  return (
    <div className="ob__shell">
      {/* ── Sidebar ── */}
      <aside className="ob__sidebar">
        <div className="ob__sidebar-brand">
          <div className="ob__brand-icon">🌾</div>
          <div>
            <div className="ob__brand-name">Widows Flour</div>
            <div className="ob__brand-sub">Admin Onboarding</div>
          </div>
        </div>

        <div className="ob__sidebar-progress-label">
          Your progress <span className="ob__progress-pct">{Math.round(progress)}%</span>
        </div>
        <div className="ob__progress-track">
          <div className="ob__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <nav className="ob__sidebar-nav">
          {STEPS.map((s, i) => {
            const isActive   = i === currentStep;
            const isVisited  = visitedSteps.has(i) && i !== currentStep;
            const isDone     = i < currentStep;
            return (
              <button
                key={s.id}
                className={`ob__nav-item ${isActive ? "ob__nav-item--active" : ""} ${isDone || isVisited ? "ob__nav-item--visited" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="ob__nav-dot">
                  {isDone
                    ? <i className="bi bi-check-lg" />
                    : <span className="ob__nav-num">{i + 1}</span>
                  }
                </span>
                <span className="ob__nav-label">{s.label}</span>
                {isActive && <span className="ob__nav-arrow">›</span>}
              </button>
            );
          })}
        </nav>

        <div className="ob__sidebar-footer">
          <button className="ob__skip-btn" onClick={skipToEnd}>
            <i className="bi bi-skip-end" /> Skip to pledge
          </button>
        </div>
      </aside>

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