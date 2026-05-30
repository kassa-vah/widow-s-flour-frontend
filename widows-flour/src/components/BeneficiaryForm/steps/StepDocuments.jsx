// src/components/BeneficiaryForm/steps/StepDocuments.jsx
import { useState } from "react";
import ImageUploader from "../../AdminDashboard/ImageUploader";

const DOC_TYPES = [
  "National ID",
  "Passport",
  "Birth Certificate",
  "Death Certificate (Spouse)",
  "Medical Records",
  "Land / Property Document",
  "Community Verification Letter",
  "School Enrollment Proof",
  "Other",
];

export default function StepDocuments({ form, update }) {
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0]);
  const [pendingUrl, setPendingUrl]     = useState("");

  const handleAddDoc = () => {
    if (!pendingUrl) return;
    const newDoc = {
      id:                  Date.now(),
      document_type:       selectedType,
      file_url:            pendingUrl,
      verification_status: "pending",
      uploaded_at:         new Date().toISOString(),
    };
    update({ documents: [...(form.documents || []), newDoc] });
    setPendingUrl("");
  };

  const removeDoc = (id) => {
    update({ documents: (form.documents || []).filter((d) => d.id !== id) });
  };

  const isImage = (url) => url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Profile Photo ── */}
      <div style={{
        background: "white", borderRadius: 14, padding: 24,
        border: "1.5px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
          Profile Photo
        </div>
        <div style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 16 }}>
          Upload a clear photo of the beneficiary.
        </div>
        <ImageUploader
          label="Profile Photo"
          value={form.profile_image || ""}
          onChange={(url) => update({ profile_image: url })}
          folder="beneficiary-profiles"
        />
      </div>

      {/* ── Supporting Documents ── */}
      <div style={{
        background: "white", borderRadius: 14, padding: 24,
        border: "1.5px dashed rgba(90,158,58,0.3)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
          Supporting Documents
        </div>
        <div style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 16 }}>
          Upload ID, certificates, or any verification documents.
        </div>

        {/* Type selector + uploader */}
        <div className="bf__field" style={{ marginBottom: 12 }}>
          <label>Document Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <ImageUploader
          label="Upload Document"
          value={pendingUrl}
          onChange={(url) => setPendingUrl(url)}
          folder="beneficiary-documents"
        />

        {pendingUrl && (
          <button
            onClick={handleAddDoc}
            style={{
              marginTop: 12,
              display: "flex", alignItems: "center", gap: 8,
              background: "#5a9e3a", color: "white",
              border: "none", borderRadius: 99,
              padding: "10px 20px", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <i className="bi bi-plus-lg" /> Add Document
          </button>
        )}
      </div>

      {/* ── Uploaded document list ── */}
      {form.documents?.length > 0 && (
        <div className="bf__doc-list">
          {form.documents.map((d) => (
            <div className="bf__doc-item" key={d.id}>
              {isImage(d.file_url) ? (
                <img
                  src={d.file_url}
                  alt={d.document_type}
                  style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }}
                />
              ) : (
                <div className="bf__doc-icon"><i className="bi bi-file-earmark-pdf" /></div>
              )}
              <div style={{ flex: 1 }}>
                <div className="bf__doc-name" style={{ fontSize: 13, fontWeight: 500 }}>{d.document_type}</div>
                <div style={{ fontSize: 11, color: "#8a8a8a" }}>
                  <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: "#5a9e3a" }}>
                    View file <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10 }} />
                  </a>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                background: "#fef4e8", color: "#d4860a", textTransform: "uppercase",
              }}>
                Pending
              </span>
              <button className="bf__doc-remove" onClick={() => removeDoc(d.id)} title="Remove">
                <i className="bi bi-x" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Consent ── */}
      <div
        style={{
          background: form.consent_given ? "#eaf3df" : "white",
          border: `1.5px solid ${form.consent_given ? "#5a9e3a" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 12, padding: "16px 20px",
          transition: "all 0.2s", cursor: "pointer",
        }}
        onClick={() => update({ consent_given: !form.consent_given })}
      >
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.consent_given}
            onChange={() => update({ consent_given: !form.consent_given })}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 18, height: 18, accentColor: "#5a9e3a", marginTop: 2, cursor: "pointer" }}
          />
          <span style={{ fontSize: 13, lineHeight: 1.65, color: "#1a1a1a" }}>
            <strong>I confirm</strong> that I have obtained the beneficiary's informed consent for
            the collection, storage, and use of their personal data and any uploaded photographs
            or documents, in accordance with the organisation's data protection policy.
          </span>
        </label>
      </div>
    </div>
  );
}