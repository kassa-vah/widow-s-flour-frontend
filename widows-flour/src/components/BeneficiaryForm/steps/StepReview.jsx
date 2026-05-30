// src/components/BeneficiaryForm/steps/StepReview.jsx

function Section({ title, children }) {
  return (
    <div className="bf__review-section">
      <div className="bf__review-section-title">{title}</div>
      <div className="bf__review-grid">{children}</div>
    </div>
  );
}

function Pair({ label, value }) {
  return (
    <div className="bf__review-pair">
      <div className="bf__review-key">{label}</div>
      <div className="bf__review-val">{value || <span style={{ color: "#c0c0c0", fontStyle: "italic" }}>Not provided</span>}</div>
    </div>
  );
}

export default function StepReview({ form, completion, vulnScore, saveErr, saving }) {
  return (
    <div>
      {/* Summary header */}
      <div style={{
        display: "flex", gap: 16, alignItems: "center",
        background: "white", borderRadius: 16, padding: "20px 24px",
        border: "1px solid rgba(0,0,0,0.07)", marginBottom: 20,
        flexWrap: "wrap",
      }}>
        {form.profile_image ? (
          <img src={form.profile_image} alt={form.full_name}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,0,0,0.08)", flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "#eaf3df",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
          }}>👤</div>
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)", fontWeight: 500, color: "#1a1a1a" }}>
            {form.full_name || "—"}
          </div>
          <div style={{ fontSize: 13, color: "#6a6a6a", marginTop: 3 }}>
            {[form.county, form.country].filter(Boolean).join(", ")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#5a9e3a" }}>{completion}%</div>
            <div style={{ fontSize: 11, color: "#8a8a8a" }}>Complete</div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: vulnScore.bg, color: vulnScore.color,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <i className={`bi ${vulnScore.icon}`} /> {vulnScore.level}
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: form.beneficiary_status === "approved" ? "#eaf3df" : form.beneficiary_status === "archived" ? "#f0f0f0" : "#fef4e8",
            color: form.beneficiary_status === "approved" ? "#5a9e3a" : form.beneficiary_status === "archived" ? "#6a6a6a" : "#d4860a",
          }}>
            {form.beneficiary_status}
          </div>
        </div>
      </div>

      {saveErr && (
        <div style={{ background: "#fde8ec", border: "1px solid #f5a3b0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#c0394b", marginBottom: 16 }}>
          <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} />
          {saveErr}
        </div>
      )}

      <Section title="Personal Information">
        <Pair label="Full Name"     value={form.full_name} />
        <Pair label="Gender"        value={form.gender} />
        <Pair label="Date of Birth" value={form.date_of_birth} />
        <Pair label="Phone"         value={form.phone_number} />
        <Pair label="Alt Contact"   value={form.alternate_contact} />
      </Section>

      <Section title="Location">
        <Pair label="Country"    value={form.country} />
        <Pair label="County"     value={form.county} />
        <Pair label="Sub-County" value={form.sub_county} />
        <Pair label="Ward"       value={form.ward} />
        <Pair label="Village"    value={form.village} />
        <Pair label="Address"    value={form.physical_address} />
      </Section>

      <Section title="Household">
        <Pair label="Marital Status"   value={form.marital_status} />
        <Pair label="Children"         value={form.number_of_children} />
        <Pair label="Dependents"       value={form.number_of_dependents} />
        <Pair label="Household Size"   value={form.household_size} />
        <Pair label="Caregiver"        value={form.caregiver_name} />
      </Section>

      <Section title="Economic Profile">
        <Pair label="Employment"    value={form.employment_status} />
        <Pair label="Income Range"  value={form.monthly_income_range} />
        <Pair label="Income Source" value={form.income_source} />
        <Pair label="Housing"       value={form.housing_type} />
        <Pair label="Owns Land"     value={form.owns_land} />
      </Section>

      <Section title="Vulnerability">
        <Pair label="Widow Status"        value={form.widow_status} />
        <Pair label="Disability"          value={form.disability_status} />
        <Pair label="Chronic Illness"     value={form.chronic_illness} />
        <Pair label="Refugee/Displaced"   value={form.refugee_or_displaced} />
        <Pair label="DV Survivor"         value={form.domestic_violence_survivor} />
        <Pair label="Food Insecurity"     value={form.food_insecurity_level} />
      </Section>

      {/* Documents */}
      {form.documents?.length > 0 && (
        <div className="bf__review-section">
          <div className="bf__review-section-title">Documents ({form.documents.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {form.documents.map((d) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#eaf3df", borderRadius: 99, padding: "5px 12px",
                fontSize: 12, color: "#3d7a25",
              }}>
                <i className="bi bi-file-earmark-check" />
                {d.document_type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story */}
      {form.short_story && (
        <div className="bf__review-section">
          <div className="bf__review-section-title">Story / Background</div>
          <p style={{ fontSize: 14, color: "#4a4a4a", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
            "{form.short_story}"
          </p>
        </div>
      )}

      {!form.consent_given && (
        <div style={{ background: "#fde8ec", border: "1px solid #f5a3b0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#c0394b" }}>
          <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} />
          <strong>Consent not confirmed.</strong> Please go back to the Documents step and tick the consent checkbox before submitting.
        </div>
      )}
    </div>
  );
}