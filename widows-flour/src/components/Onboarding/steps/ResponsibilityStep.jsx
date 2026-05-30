// src/components/Onboarding/steps/ResponsibilityStep.jsx
import { useState } from "react";

const PLEDGES = [
  "I will only enter verified, truthful information into the system.",
  "I will treat every beneficiary record with respect, compassion, and confidentiality.",
  "I will never share my login credentials or allow others to act under my account.",
  "I will report any data errors, duplicates, or suspicious entries to my supervisor immediately.",
  "I will obtain proper consent before uploading any photograph or document.",
  "I will follow the organisation's data protection and privacy policies at all times.",
  "I understand that deliberate misuse of this system is a serious violation with consequences.",
];

export default function ResponsibilityStep({ prev, onFinish, adminName }) {
  const [checked, setChecked] = useState(false);
  const [signed, setSigned]   = useState(false);

  const handleFinish = () => {
    if (!checked) return;
    setSigned(true);
    setTimeout(onFinish, 1200);
  };

  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-patch-check" /> Step 7 of 7 — Final Step
      </span>

      <h1 className="ob__step-title">
        The <em>Administrator's</em> Pledge
      </h1>
      <p className="ob__step-lead">
        You have completed the onboarding guide. Before accessing the full dashboard, 
        please read and acknowledge your responsibilities as a data steward for Widows Flour.
      </p>
      <div className="ob__divider" />

      <div className="ob__pledge-box">
        <div className="ob__pledge-quote">
          "Behind every row in this database is a widow, an orphan, or a family in crisis. 
          The integrity of what you record today shapes the support they receive tomorrow."
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          As an administrator, I pledge to:
        </div>

        <div className="ob__pledge-points">
          {PLEDGES.map((p, i) => (
            <div className="ob__pledge-point" key={i}>
              <i className="bi bi-check-circle-fill" />
              <span>{p}</span>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label
          className={`ob__checkbox-row ${checked ? "ob__checkbox-row--checked" : ""}`}
          onClick={() => setChecked((c) => !c)}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((c) => !c)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="ob__checkbox-label">
            I, <strong>{adminName}</strong>, understand and accept my responsibility to maintain 
            accurate, respectful, and confidential beneficiary records. I have read and agree 
            to all data integrity guidelines presented during this onboarding.
          </span>
        </label>
      </div>

      {!checked && (
        <div className="ob__warning">
          <i className="bi bi-info-circle-fill" />
          <div className="ob__warning-text">
            Please read the pledge above and tick the checkbox to confirm your understanding 
            before proceeding to the dashboard.
          </div>
        </div>
      )}

      {checked && (
        <div className="ob__success-notice">
          <i className="bi bi-check-circle-fill" />
          <div className="ob__success-notice-text">
            <strong>Thank you.</strong> Your acknowledgement has been recorded. You are now 
            ready to access the Widows Flour admin dashboard.
          </div>
        </div>
      )}

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev} disabled={signed}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <button
          className="ob__btn-finish"
          onClick={handleFinish}
          disabled={!checked || signed}
        >
          {signed
            ? <><i className="bi bi-check2-all" /> Saved!</>
            : <><i className="bi bi-door-open" /> Enter Dashboard</>
          }
        </button>
      </div>
    </div>
  );
}