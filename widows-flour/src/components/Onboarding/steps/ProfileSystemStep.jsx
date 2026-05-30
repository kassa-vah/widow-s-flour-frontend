// src/components/Onboarding/steps/ProfileSystemStep.jsx
import { useEffect, useState } from "react";

const SECTIONS = [
  { label: "Personal Information", pct: 85,  color: "#5a9e3a", desc: "Name, gender, DOB, phone, photo" },
  { label: "Location Details",     pct: 70,  color: "#3b7de8", desc: "County, sub-county, ward, village" },
  { label: "Household Data",       pct: 60,  color: "#d4860a", desc: "Marital status, children, dependents" },
  { label: "Economic Profile",     pct: 45,  color: "#7c3aed", desc: "Employment, income, housing type" },
  { label: "Vulnerability Info",   pct: 30,  color: "#c0394b", desc: "Disability, illness, food security" },
  { label: "Documents Uploaded",   pct: 20,  color: "#0e8a6e", desc: "ID, certificates, verification letters" },
];

const THRESHOLDS = [
  { min: 0,  max: 29,  label: "Incomplete",          color: "#c0394b", bg: "#fde8ec" },
  { min: 30, max: 59,  label: "Partially Complete",  color: "#d4860a", bg: "#fef4e8" },
  { min: 60, max: 79,  label: "Mostly Complete",     color: "#3b7de8", bg: "#e8f0fe" },
  { min: 80, max: 100, label: "Complete",             color: "#5a9e3a", bg: "#eaf3df" },
];

function getStatus(pct) {
  return THRESHOLDS.find((t) => pct >= t.min && pct <= t.max) || THRESHOLDS[0];
}

export default function ProfileSystemStep({ next, prev }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const totalPct = Math.round(
    SECTIONS.reduce((acc, s) => acc + s.pct, 0) / SECTIONS.length
  );
  const totalStatus = getStatus(totalPct);

  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-bar-chart-steps" /> Step 6 of 7
      </span>

      <h1 className="ob__step-title">
        Profile <em>Completion</em> System
      </h1>
      <p className="ob__step-lead">
        The platform automatically calculates how complete each beneficiary profile is. 
        This helps administrators identify gaps and prioritise follow-up data collection. 
        Here's how the system works.
      </p>
      <div className="ob__divider" />

      {/* Main tracker card */}
      <div className="ob__profile-tracker">
        <div className="ob__tracker-header">
          <div className="ob__tracker-title">Sample Profile — Completion Overview</div>
          <div>
            <div className="ob__total-pct">
              {animated ? totalPct : 0}%<span> complete</span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
              fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99,
              background: totalStatus.bg, color: totalStatus.color,
            }}>
              {totalStatus.label}
            </div>
          </div>
        </div>

        {/* Overall bar */}
        <div className="ob__bar-row" style={{ marginBottom: 24 }}>
          <div className="ob__bar-track" style={{ height: 10 }}>
            <div
              className="ob__bar-fill"
              style={{
                width: animated ? `${totalPct}%` : "0%",
                background: `linear-gradient(90deg, ${totalStatus.color}88, ${totalStatus.color})`,
                transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        </div>

        <div className="ob__section-bars">
          {SECTIONS.map((s, i) => (
            <div className="ob__bar-row" key={s.label}>
              <div className="ob__bar-label">
                <span className="ob__bar-name">{s.label}</span>
                <span className="ob__bar-pct">{s.desc}</span>
                <span className="ob__bar-pct" style={{ color: s.color, fontWeight: 600 }}>{s.pct}%</span>
              </div>
              <div className="ob__bar-track">
                <div
                  className="ob__bar-fill"
                  style={{
                    width: animated ? `${s.pct}%` : "0%",
                    background: `linear-gradient(90deg, ${s.color}70, ${s.color})`,
                    transitionDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion thresholds */}
      <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>
          Completion Status Thresholds
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {THRESHOLDS.map((t) => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10, background: t.bg,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "#8a8a8a" }}>{t.min}% – {t.max}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ob__success-notice">
        <i className="bi bi-lightbulb-fill" />
        <div className="ob__success-notice-text">
          <strong>Tip:</strong> The dashboard highlights beneficiaries with less than 60% profile 
          completion with an amber indicator. Prioritise these records during data collection 
          field visits. Set a goal of 80%+ for every active beneficiary.
        </div>
      </div>

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev}><i className="bi bi-arrow-left" /> Back</button>
        <button className="ob__btn-next" onClick={next}>Continue <i className="bi bi-arrow-right" /></button>
      </div>
    </div>
  );
}