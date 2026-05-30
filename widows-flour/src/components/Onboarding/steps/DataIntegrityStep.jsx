// src/components/Onboarding/steps/DataIntegrityStep.jsx

const RULES = [
  {
    icon: "bi-x-circle-fill",
    color: "#c0394b",
    bg: "#fde8ec",
    title: "Never enter false information",
    desc: "Fabricating or exaggerating beneficiary details — including income, household size, or vulnerability indicators — is a serious ethical and legal violation. All data must reflect verified reality.",
  },
  {
    icon: "bi-copy",
    color: "#c0394b",
    bg: "#fde8ec",
    title: "Avoid duplicate records",
    desc: "Before creating a new beneficiary, search by name, phone number, and location to confirm they do not already exist in the system. Duplicate records cause confusion and misallocated resources.",
  },
  {
    icon: "bi-patch-check-fill",
    color: "#5a9e3a",
    bg: "#eaf3df",
    title: "Verify before saving",
    desc: "Cross-check information against supporting documents (ID, birth certificate, community letters) before saving. If you cannot verify a field, leave it blank rather than guessing.",
  },
  {
    icon: "bi-person-heart",
    color: "#3b7de8",
    bg: "#e8f0fe",
    title: "Respect beneficiary dignity",
    desc: "Beneficiaries have entrusted us with their most sensitive personal information. Never share, discuss, or expose beneficiary data outside of authorised channels. Handle every record with the utmost respect.",
  },
  {
    icon: "bi-image",
    color: "#d4860a",
    bg: "#fef4e8",
    title: "Upload appropriate media only",
    desc: "Only upload images and documents that are relevant, consented, and appropriate. Do not upload blurry, misleading, or embarrassing images. Profile photos must clearly show the beneficiary's face.",
  },
  {
    icon: "bi-clock-history",
    color: "#7c3aed",
    bg: "#f0e8fe",
    title: "Keep records up to date",
    desc: "Beneficiary circumstances change over time. Update records when a beneficiary's status, household, or vulnerability level changes. Outdated data leads to incorrect programme decisions.",
  },
  {
    icon: "bi-file-earmark-lock",
    color: "#0e8a6e",
    bg: "#e8faf6",
    title: "Never share login credentials",
    desc: "Your admin account is personal and non-transferable. Never share your password or allow another person to act under your account. All actions are logged against your admin ID.",
  },
];

export default function DataIntegrityStep({ next, prev }) {
  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-shield-check" /> Step 4 of 7
      </span>

      <h1 className="ob__step-title">
        Data <em>Integrity</em> Guidelines
      </h1>
      <p className="ob__step-lead">
        The accuracy and integrity of every record you manage is a direct reflection of the 
        organisation's commitment to the people we serve. These guidelines are not optional — 
        they are the foundation of everything we do.
      </p>
      <div className="ob__divider" />

      <div className="ob__quote">
        <p>"Inaccurate data does not just cause administrative problems — it can mean 
        a vulnerable widow is overlooked while someone ineligible receives support. 
        The stakes are real."</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "28px 0" }}>
        {RULES.map((r) => (
          <div key={r.title} style={{
            display: "flex", gap: 16, alignItems: "flex-start",
            background: "white", borderRadius: 14, padding: "18px 20px",
            border: "1px solid rgba(0,0,0,0.06)",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
          >
            <span style={{
              width: 40, height: 40, borderRadius: 10,
              background: r.bg, color: r.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              <i className={`bi ${r.icon}`} />
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "#5a5a5a", lineHeight: 1.65 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ob__warning">
        <i className="bi bi-exclamation-triangle-fill" />
        <div className="ob__warning-text">
          <strong>Consequences of data misconduct:</strong> Deliberately falsifying beneficiary 
          records, sharing confidential data without authorisation, or misusing admin access may 
          result in immediate suspension of your admin account and referral to appropriate authorities.
        </div>
      </div>

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev}><i className="bi bi-arrow-left" /> Back</button>
        <button className="ob__btn-next" onClick={next}>Continue <i className="bi bi-arrow-right" /></button>
      </div>
    </div>
  );
}