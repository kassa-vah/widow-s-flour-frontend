// src/components/BeneficiaryForm/steps/StepEconomic.jsx

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

export default function StepEconomic({ form, update, errors }) {
  return (
    <div>
      <Field label="Employment Status" required error={errors.employment_status}>
        <div className="bf__radio-group">
          {["Unemployed","Self-employed","Casual Labour","Formally Employed","Retired","Unable to Work"].map((s) => (
            <label key={s} className={`bf__radio-label ${form.employment_status === s ? "bf__radio-label--selected" : ""}`}>
              <input type="radio" name="employment_status" value={s}
                checked={form.employment_status === s}
                onChange={() => update({ employment_status: s })}
              />
              {s}
            </label>
          ))}
        </div>
        {errors.employment_status && <span className="bf__err-msg"><i className="bi bi-exclamation-circle" /> {errors.employment_status}</span>}
      </Field>

      <div className="bf__row">
        <Field label="Monthly Income Range" hint="KES per month">
          <select value={form.monthly_income_range} onChange={(e) => update({ monthly_income_range: e.target.value })}>
            <option value="">Select range</option>
            <option value="0-999">Below KES 1,000</option>
            <option value="1000-4999">KES 1,000 – 4,999</option>
            <option value="5000-9999">KES 5,000 – 9,999</option>
            <option value="10000-19999">KES 10,000 – 19,999</option>
            <option value="20000+">KES 20,000+</option>
            <option value="none">No income</option>
          </select>
        </Field>
        <Field label="Primary Income Source">
          <input
            value={form.income_source}
            onChange={(e) => update({ income_source: e.target.value })}
            placeholder="e.g. Small trade, farming, remittances"
          />
        </Field>
      </div>

      <div className="bf__row">
        <Field label="Housing Type">
          <select value={form.housing_type} onChange={(e) => update({ housing_type: e.target.value })}>
            <option value="">Select type</option>
            <option>Owns permanent house</option>
            <option>Owns semi-permanent house</option>
            <option>Renting</option>
            <option>Informal / Squatter</option>
            <option>Living with relatives</option>
            <option>Homeless / No shelter</option>
          </select>
        </Field>
        <Field label="Owns Land?">
          <div className="bf__radio-group" style={{ paddingTop: 4 }}>
            {["yes","no","disputed"].map((v) => (
              <label key={v} className={`bf__radio-label ${form.owns_land === v ? "bf__radio-label--selected" : ""}`}>
                <input type="radio" name="owns_land" value={v}
                  checked={form.owns_land === v}
                  onChange={() => update({ owns_land: v })}
                />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div style={{
        background: "#fef9e7", border: "1px solid #f5c87a", borderRadius: 10,
        padding: "12px 16px", fontSize: 13, color: "#6b4c12", marginTop: 12,
      }}>
        <i className="bi bi-cash-coin" style={{ marginRight: 8, color: "#d4860a" }} />
        <strong>Economic data</strong> is used to calculate the vulnerability score. Underreporting 
        or overreporting income affects resource allocation fairness across all beneficiaries.
      </div>
    </div>
  );
}