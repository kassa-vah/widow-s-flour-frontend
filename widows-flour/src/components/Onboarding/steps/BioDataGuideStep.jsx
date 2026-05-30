// src/components/Onboarding/steps/BioDataGuideStep.jsx

const CATEGORIES = [
  {
    icon: "bi-person-vcard",
    title: "Personal Information",
    fields: [
      "Full legal name (as on ID)",
      "Gender",
      "Date of birth",
      "Primary phone number",
      "Alternate contact (next of kin)",
      "Profile photograph",
      "Short personal story / background",
    ],
    why: "Ensures the record uniquely identifies the beneficiary and enables contact and follow-up.",
  },
  {
    icon: "bi-geo-alt",
    title: "Location Information",
    fields: [
      "Country",
      "County / Province",
      "Sub-county / District",
      "Ward",
      "Village / Estate",
      "Physical address / landmark",
      "GPS coordinates (if available)",
    ],
    why: "Enables field visits, programme targeting by region, and geographic impact reporting.",
  },
  {
    icon: "bi-house",
    title: "Household Information",
    fields: [
      "Marital status",
      "Number of children",
      "Number of dependents",
      "Total household size",
      "Caregiver name (if beneficiary has one)",
    ],
    why: "Determines support scale, eligibility for family programmes, and vulnerability weighting.",
  },
  {
    icon: "bi-cash-stack",
    title: "Economic Information",
    fields: [
      "Employment status",
      "Monthly income range",
      "Primary income source",
      "Housing type (owned / rented / informal)",
      "Land ownership",
    ],
    why: "Used to calculate economic vulnerability score and prioritise aid allocation.",
  },
  {
    icon: "bi-heart-pulse",
    title: "Vulnerability Indicators",
    fields: [
      "Disability status",
      "Chronic illness / medical condition",
      "Widow / widower status",
      "Refugee or internally displaced",
      "Domestic violence survivor",
      "Food insecurity level (none / moderate / severe)",
      "Additional vulnerability notes",
    ],
    why: "Critical for calculating priority scores and ensuring the most vulnerable receive support first.",
  },
  {
    icon: "bi-file-earmark-text",
    title: "Documents",
    fields: [
      "National ID / Passport",
      "Birth certificate",
      "Death certificate (of spouse)",
      "Medical records",
      "Land / property documents",
      "Community verification letter",
    ],
    why: "Provides verification of identity and eligibility. All documents must be legible and current.",
  },
];

export default function BioDataGuideStep({ next, prev }) {
  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-person-lines-fill" /> Step 5 of 7
      </span>

      <h1 className="ob__step-title">
        Beneficiary <em>Biodata</em> Collection
      </h1>
      <p className="ob__step-lead">
        Complete, accurate biodata is the cornerstone of effective humanitarian programming. 
        Each data category serves a specific operational purpose. Understanding why we collect 
        each type of information helps you appreciate the importance of completeness.
      </p>
      <div className="ob__divider" />

      <div className="ob__success-notice">
        <i className="bi bi-info-circle-fill" />
        <div className="ob__success-notice-text">
          <strong>Why completeness matters:</strong> A beneficiary with only 30% of their profile 
          completed may be overlooked for specialised programmes, incorrectly scored for vulnerability, 
          or unable to receive targeted support. Always aim for 100% profile completion.
        </div>
      </div>

      <div className="ob__biodata-grid" style={{ marginTop: 24 }}>
        {CATEGORIES.map((cat) => (
          <div className="ob__biodata-card" key={cat.title}>
            <div className="ob__biodata-card-header">
              <div className="ob__biodata-card-icon">
                <i className={`bi ${cat.icon}`} />
              </div>
              <div className="ob__biodata-card-title">{cat.title}</div>
            </div>
            <ul className="ob__biodata-items">
              {cat.fields.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: 12, color: "#7a9e6a", lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              {cat.why}
            </div>
          </div>
        ))}
      </div>

      <div className="ob__warning">
        <i className="bi bi-exclamation-triangle-fill" />
        <div className="ob__warning-text">
          <strong>Data minimisation principle:</strong> Only collect information that is necessary 
          for programme delivery. Do not ask for or record information that is not listed in the 
          official beneficiary form. Excess data collection without purpose is a privacy risk.
        </div>
      </div>

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev}><i className="bi bi-arrow-left" /> Back</button>
        <button className="ob__btn-next" onClick={next}>Continue <i className="bi bi-arrow-right" /></button>
      </div>
    </div>
  );
}