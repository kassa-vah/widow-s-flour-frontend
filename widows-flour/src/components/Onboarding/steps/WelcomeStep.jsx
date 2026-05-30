// src/components/Onboarding/steps/WelcomeStep.jsx
export default function WelcomeStep({ next, adminName }) {
  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-house-heart" /> Step 1 of 7
      </span>

      <div className="ob__welcome-hero">
        <div className="ob__welcome-greeting">
          Welcome,<br /><em>{adminName}</em>
        </div>
        <p className="ob__welcome-sub">
          You have been entrusted with one of the most important roles in our organisation — 
          managing the data of real people whose lives depend on accurate, respectful, 
          and compassionate record-keeping.
        </p>
      </div>

      <div className="ob__divider" />

      <div className="ob__quote">
        <p>"You have been trusted by the organisation to maintain clean, truthful, 
        and respectful data. Authenticity and accuracy are critical because this data 
        impacts real lives."</p>
      </div>

      <div className="ob__quote">
        <p>"Every record you create or update represents a widow, an orphan, a displaced 
        person — a human being with dignity. Handle their information with the same care 
        you would want for your own family."</p>
      </div>

      <div className="ob__success-notice">
        <i className="bi bi-heart-fill" />
        <div className="ob__success-notice-text">
          <strong>Your role matters.</strong> The data you maintain directly influences 
          who receives support, how quickly they receive it, and whether their stories 
          are told with accuracy and dignity. Thank you for taking this responsibility seriously.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "24px 0 32px" }}>
        {[
          { icon: "bi-shield-check", label: "Integrity", desc: "Always enter truthful, verified information." },
          { icon: "bi-eye-slash",    label: "Privacy",   desc: "Protect sensitive beneficiary data at all times." },
          { icon: "bi-heart",        label: "Compassion", desc: "Every record is a person — treat it that way." },
          { icon: "bi-transparency", label: "Transparency", desc: "Document accurately; avoid assumptions or guesses." },
        ].map((v) => (
          <div key={v.label} style={{
            display: "flex", gap: 14, alignItems: "flex-start",
            padding: "14px 18px", background: "white", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.06)"
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#eaf3df", color: "#5a9e3a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0
            }}>
              <i className={`bi ${v.icon}`} />
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{v.label}</div>
              <div style={{ fontSize: 13, color: "#6a6a6a" }}>{v.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ob__nav-btns">
        <button className="ob__btn-next" onClick={next}>
          Begin Onboarding <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}