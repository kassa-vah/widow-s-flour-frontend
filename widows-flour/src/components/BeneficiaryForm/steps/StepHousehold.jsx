// src/components/BeneficiaryForm/steps/StepHousehold.jsx

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

export default function StepHousehold({ form, update, errors }) {
  return (
    <div>
      <Field label="Marital Status" required error={errors.marital_status}>
        <div className="bf__radio-group">
          {["Widowed","Single","Married","Divorced","Separated","Other"].map((s) => (
            <label key={s} className={`bf__radio-label ${form.marital_status === s ? "bf__radio-label--selected" : ""}`}>
              <input type="radio" name="marital_status" value={s}
                checked={form.marital_status === s}
                onChange={() => update({ marital_status: s })}
              />
              {s}
            </label>
          ))}
        </div>
        {errors.marital_status && <span className="bf__err-msg"><i className="bi bi-exclamation-circle" /> {errors.marital_status}</span>}
      </Field>

      <div className="bf__row-3">
        <Field label="Number of Children" hint="Under 18">
          <input
            type="number"
            min="0"
            value={form.number_of_children}
            onChange={(e) => update({ number_of_children: e.target.value })}
            placeholder="0"
          />
        </Field>
        <Field label="Total Dependents" hint="All ages">
          <input
            type="number"
            min="0"
            value={form.number_of_dependents}
            onChange={(e) => update({ number_of_dependents: e.target.value })}
            placeholder="0"
          />
        </Field>
        <Field label="Household Size" hint="Including beneficiary">
          <input
            type="number"
            min="1"
            value={form.household_size}
            onChange={(e) => update({ household_size: e.target.value })}
            placeholder="1"
          />
        </Field>
      </div>

      <Field label="Primary Caregiver Name" hint="If the beneficiary has a caregiver">
        <input
          value={form.caregiver_name}
          onChange={(e) => update({ caregiver_name: e.target.value })}
          placeholder="Full name of caregiver (if applicable)"
        />
      </Field>

      <div style={{
        background: "#f0e8fe", border: "1px solid #c4a8f5", borderRadius: 10,
        padding: "12px 16px", fontSize: 13, color: "#3d1a88", marginTop: 12,
      }}>
        <i className="bi bi-house-heart" style={{ marginRight: 8, color: "#7c3aed" }} />
        <strong>Household data</strong> directly affects programme eligibility and support amounts. 
        A household with 5 dependents has significantly different needs than one with no dependents. 
        Verify all numbers before saving.
      </div>
    </div>
  );
}