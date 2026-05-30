// src/components/BeneficiaryForm/steps/StepPersonal.jsx

function Field({ label, required, hint, error, children }) {
  return (
    <div className="bf__field">
      <label>
        {label}
        {required && <span className="bf__required">*</span>}
        {hint && <span className="bf__hint">{hint}</span>}
      </label>
      {children}
      {error && <span className="bf__err-msg"><i className="bi bi-exclamation-circle" /> {error}</span>}
    </div>
  );
}

export default function StepPersonal({ form, update, errors }) {
  return (
    <div>
      <div className="bf__row">
        <Field label="Full Legal Name" required error={errors.full_name}>
          <input
            className={errors.full_name ? "bf__error" : ""}
            value={form.full_name}
            onChange={(e) => update({ full_name: e.target.value })}
            placeholder="As it appears on ID"
          />
        </Field>
        <Field label="Gender" required error={errors.gender}>
          <select
            className={errors.gender ? "bf__error" : ""}
            value={form.gender}
            onChange={(e) => update({ gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </Field>
      </div>

      <div className="bf__row">
        <Field label="Date of Birth" required error={errors.date_of_birth}>
          <input
            type="date"
            className={errors.date_of_birth ? "bf__error" : ""}
            value={form.date_of_birth}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => update({ date_of_birth: e.target.value })}
          />
        </Field>
        <Field label="Phone Number" required hint="e.g. +254 700 000 000" error={errors.phone_number}>
          <input
            className={errors.phone_number ? "bf__error" : ""}
            value={form.phone_number}
            onChange={(e) => update({ phone_number: e.target.value })}
            placeholder="+254 700 000 000"
          />
        </Field>
      </div>

      <Field label="Alternate Contact" hint="Next of kin or emergency contact">
        <input
          value={form.alternate_contact}
          onChange={(e) => update({ alternate_contact: e.target.value })}
          placeholder="Name and phone number"
        />
      </Field>

      <Field label="Short Story / Background" hint="Brief description of the beneficiary's situation">
        <textarea
          value={form.short_story}
          onChange={(e) => update({ short_story: e.target.value })}
          placeholder="Describe the beneficiary's background, challenges, and circumstances in 2–4 sentences…"
        />
      </Field>

      <Field label="Initial Status">
        <div className="bf__radio-group">
          {["pending", "approved", "archived"].map((s) => (
            <label key={s} className={`bf__radio-label ${form.beneficiary_status === s ? "bf__radio-label--selected" : ""}`}>
              <input
                type="radio"
                name="beneficiary_status"
                value={s}
                checked={form.beneficiary_status === s}
                onChange={() => update({ beneficiary_status: s })}
              />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>
      </Field>

      <div style={{ background: "#fef4e8", border: "1px solid #f5c87a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#6b4c12", marginTop: 8 }}>
        <i className="bi bi-camera" style={{ marginRight: 8, color: "#d4860a" }} />
        <strong>Profile photo</strong> can be uploaded in the Documents step using the image uploader. 
        Ensure you have the beneficiary's consent before uploading any photograph.
      </div>
    </div>
  );
}