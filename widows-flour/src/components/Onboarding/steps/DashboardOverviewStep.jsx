// src/components/Onboarding/steps/DashboardOverviewStep.jsx
const SECTIONS = [
  {
    icon: "bi-people-fill",
    color: "green",
    title: "Beneficiaries",
    desc: "The core of the platform. Add, edit, review, and manage all beneficiary records. Each profile captures personal, household, economic, and vulnerability data to ensure holistic support.",
  },
  {
    icon: "bi-journal-richtext",
    color: "blue",
    title: "Stories",
    desc: "Upload and manage beneficiary stories. Stories humanise the data and help donors and partners understand the real impact of the programme. Accuracy and sensitivity are essential.",
  },
  {
    icon: "bi-credit-card-2-front",
    color: "amber",
    title: "Donations",
    desc: "Track incoming donations, assign them to beneficiaries or programmes, and generate receipts. All financial records must be accurate and reconciled regularly.",
  },
  {
    icon: "bi-bar-chart-line",
    color: "purple",
    title: "Reports",
    desc: "Generate beneficiary reports, programme summaries, and impact statistics. Reports are used for donor accountability, government compliance, and strategic planning.",
  },
  {
    icon: "bi-cloud-upload",
    color: "teal",
    title: "Media Uploads",
    desc: "Upload photos, documents, and verification files for beneficiaries. All media must be appropriate, consented, and correctly categorised before publishing.",
  },
  {
    icon: "bi-graph-up-arrow",
    color: "rose",
    title: "Analytics",
    desc: "View dashboards showing beneficiary demographics, vulnerability distributions, programme reach, and data completeness metrics. Use analytics to prioritise and plan interventions.",
  },
];

export default function DashboardOverviewStep({ next, prev }) {
  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-grid-1x2" /> Step 2 of 7
      </span>

      <h1 className="ob__step-title">
        Your <em>Dashboard</em> at a Glance
      </h1>
      <p className="ob__step-lead">
        The Widows Flour admin dashboard is divided into focused modules. Each section 
        has a specific purpose — understanding them helps you work efficiently and responsibly.
      </p>
      <div className="ob__divider" />

      <div className="ob__cards-grid">
        {SECTIONS.map((s) => (
          <div className="ob__card" key={s.title}>
            <div className={`ob__card-icon ob__card-icon--${s.color}`}>
              <i className={`bi ${s.icon}`} />
            </div>
            <div className="ob__card-title">{s.title}</div>
            <div className="ob__card-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="ob__warning">
        <i className="bi bi-exclamation-triangle-fill" />
        <div className="ob__warning-text">
          <strong>Important:</strong> Each module is interconnected. Inaccurate data in 
          one section — such as a wrong beneficiary status — can affect donation allocations, 
          reports, and programme eligibility. Always review before saving.
        </div>
      </div>

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <button className="ob__btn-next" onClick={next}>
          Continue <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}