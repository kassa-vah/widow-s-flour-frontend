// src/components/Onboarding/steps/AdminGuidanceStep.jsx
import { useState } from "react";

const GUIDES = [
  {
    id: "add",
    label: "Add a Beneficiary",
    icon: "bi-person-plus",
    color: "#5a9e3a",
    steps: [
      { title: "Navigate to Beneficiaries", desc: "Click the 'Beneficiaries' section in the sidebar. Then click the '+ Add Beneficiary' button in the top-right of the table toolbar." },
      { title: "Complete the multi-step form", desc: "Fill in all seven sections: Personal Information, Location, Household, Economic Profile, Vulnerability Assessment, Documents, and Review. Do not skip required fields." },
      { title: "Upload a profile photo", desc: "Use the image uploader to attach a clear, respectful photo of the beneficiary. Ensure you have consent before uploading any image." },
      { title: "Set initial status to Pending", desc: "All new beneficiaries should be set to 'Pending' until their information has been verified by a senior administrator." },
      { title: "Review and Save", desc: "On the final Review step, check all entered data carefully. Correct any errors before clicking 'Submit Beneficiary'." },
    ],
  },
  {
    id: "edit",
    label: "Edit a Record",
    icon: "bi-pencil-square",
    color: "#3b7de8",
    steps: [
      { title: "Locate the beneficiary", desc: "Use the search bar or status filter to find the correct beneficiary record in the table." },
      { title: "Click Edit", desc: "Click the pencil (Edit) icon on the right side of the beneficiary row. The edit modal will open pre-filled with current data." },
      { title: "Change only what is necessary", desc: "Update only the fields that require correction. Do not change fields you are unsure about — consult your supervisor first." },
      { title: "Document the reason", desc: "If your system requires an audit note, enter a brief reason for the change in the notes field before saving." },
      { title: "Save and Verify", desc: "Click 'Save Beneficiary'. The record will be updated immediately and the change will appear in the audit log." },
    ],
  },
  {
    id: "media",
    label: "Upload Media",
    icon: "bi-cloud-arrow-up",
    color: "#d4860a",
    steps: [
      { title: "Go to Media Uploads or the Beneficiary form", desc: "Media can be uploaded within the beneficiary form (Documents section) or via the standalone Media Uploads module." },
      { title: "Select a file", desc: "Only upload images in JPG, PNG, or WEBP format under 5MB. Documents must be PDF only and under 10MB." },
      { title: "Choose the correct category", desc: "Tag the media with the correct type: Profile Photo, National ID, Birth Certificate, Land Document, Medical Record, etc." },
      { title: "Confirm consent", desc: "Check the consent checkbox before uploading any photo of a person. Uploading images without consent is a serious policy violation." },
      { title: "Verify upload success", desc: "Ensure the file appears correctly in the preview. Broken links or placeholder thumbnails indicate a failed upload — retry before saving." },
    ],
  },
  {
    id: "delete",
    label: "Delete Records Safely",
    icon: "bi-trash",
    color: "#c0394b",
    steps: [
      { title: "Confirm you have authorisation", desc: "Deletion is permanent and irreversible. Only delete a record if you have explicit written authorisation from a senior administrator." },
      { title: "Consider archiving instead", desc: "In most cases, use 'Archive' status rather than deletion. Archived records are hidden from active views but preserved for audit purposes." },
      { title: "Click the Delete button", desc: "Find the record and click the red trash icon. A confirmation modal will appear asking you to confirm the action." },
      { title: "Read the confirmation carefully", desc: "The modal will display the beneficiary's name. Verify it is the correct record before confirming. Deleting the wrong record cannot be undone." },
      { title: "Confirm deletion", desc: "Click 'Delete' in the modal to permanently remove the record. The action is logged in the audit trail with your admin ID and timestamp." },
    ],
  },
  {
    id: "review",
    label: "Review Before Publishing",
    icon: "bi-patch-check",
    color: "#0e8a6e",
    steps: [
      { title: "Check pending submissions", desc: "Filter beneficiaries by 'Pending' status to see all records awaiting review. Review each one systematically." },
      { title: "Verify all required fields", desc: "Ensure all mandatory fields are complete. Incomplete profiles should not be approved — return them for completion." },
      { title: "Cross-check location and household data", desc: "Confirm the beneficiary's location, household size, and economic information are internally consistent and realistic." },
      { title: "Review uploaded documents", desc: "Open each uploaded document. Verify they are legible, correctly categorised, and match the beneficiary's personal information." },
      { title: "Approve or escalate", desc: "If the record is complete and accurate, change the status to 'Approved'. If issues remain, add a note and return it for correction." },
    ],
  },
];

export default function AdminGuidanceStep({ next, prev }) {
  const [activeGuide, setActiveGuide] = useState("add");
  const guide = GUIDES.find((g) => g.id === activeGuide);

  return (
    <div>
      <span className="ob__step-tag">
        <i className="bi bi-journal-text" /> Step 3 of 7
      </span>

      <h1 className="ob__step-title">
        <em>How-To</em> Admin Guide
      </h1>
      <p className="ob__step-lead">
        Step-by-step instructions for the most important administrative actions on the platform. 
        Select a task below to view the full walkthrough.
      </p>
      <div className="ob__divider" />

      {/* Tab selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGuide(g.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500,
              border: activeGuide === g.id ? `1.5px solid ${g.color}` : "1px solid rgba(0,0,0,0.1)",
              background: activeGuide === g.id ? `${g.color}18` : "white",
              color: activeGuide === g.id ? g.color : "#4a4a4a",
              cursor: "pointer",
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
              transition: "all 0.18s",
            }}
          >
            <i className={`bi ${g.icon}`} /> {g.label}
          </button>
        ))}
      </div>

      {/* Guide content */}
      {guide && (
        <div style={{
          background: "white", borderRadius: 18, padding: "28px 32px",
          border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          animation: "ob-fadeIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 12, background: `${guide.color}18`,
              color: guide.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              <i className={`bi ${guide.icon}`} />
            </span>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)" }}>
              {guide.label}
            </span>
          </div>

          <div className="ob__steps-list">
            {guide.steps.map((s, i) => (
              <div className="ob__guide-step" key={i}>
                <div className="ob__guide-step-num" style={{ background: `${guide.color}22`, color: guide.color }}>
                  {i + 1}
                </div>
                <div className="ob__guide-step-content">
                  <div className="ob__guide-step-title">{s.title}</div>
                  <div className="ob__guide-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGuide === "delete" && (
        <div className="ob__danger" style={{ marginTop: 16 }}>
          <i className="bi bi-exclamation-octagon-fill" />
          <div className="ob__danger-text">
            <strong>Irreversible Action:</strong> Deletion cannot be undone. When in doubt, 
            archive the record instead. If you accidentally delete a record, contact your 
            system administrator immediately.
          </div>
        </div>
      )}

      <div className="ob__nav-btns">
        <button className="ob__btn-prev" onClick={prev}><i className="bi bi-arrow-left" /> Back</button>
        <button className="ob__btn-next" onClick={next}>Continue <i className="bi bi-arrow-right" /></button>
      </div>
    </div>
  );
}