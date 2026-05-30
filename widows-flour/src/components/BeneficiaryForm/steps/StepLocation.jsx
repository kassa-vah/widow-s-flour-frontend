// src/components/BeneficiaryForm/steps/StepLocation.jsx

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

const KENYA_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay",
  "Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii",
  "Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera",
  "Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi",
  "Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River",
  "Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot",
];

export default function StepLocation({ form, update, errors }) {
  return (
    <div>
      <div className="bf__row">
        <Field label="Country">
          <select value={form.country} onChange={(e) => update({ country: e.target.value })}>
            <option>Kenya</option>
            <option>Uganda</option>
            <option>Tanzania</option>
            <option>Rwanda</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="County / Province" required error={errors.county}>
          <select
            className={errors.county ? "bf__error" : ""}
            value={form.county}
            onChange={(e) => update({ county: e.target.value })}
          >
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="bf__row">
        <Field label="Sub-County / District" required error={errors.sub_county}>
          <input
            className={errors.sub_county ? "bf__error" : ""}
            value={form.sub_county}
            onChange={(e) => update({ sub_county: e.target.value })}
            placeholder="e.g. Eldoret East"
          />
        </Field>
        <Field label="Ward">
          <input
            value={form.ward}
            onChange={(e) => update({ ward: e.target.value })}
            placeholder="e.g. Langas Ward"
          />
        </Field>
      </div>

      <div className="bf__row">
        <Field label="Village / Estate / Location">
          <input
            value={form.village}
            onChange={(e) => update({ village: e.target.value })}
            placeholder="e.g. Kapseret Village"
          />
        </Field>
        <Field label="Physical Address / Landmark">
          <input
            value={form.physical_address}
            onChange={(e) => update({ physical_address: e.target.value })}
            placeholder="Near the market / behind the school"
          />
        </Field>
      </div>

      <Field label="GPS Coordinates" hint="Optional — latitude, longitude">
        <input
          value={form.gps_coordinates}
          onChange={(e) => update({ gps_coordinates: e.target.value })}
          placeholder="e.g. 0.5143° N, 35.2698° E"
        />
      </Field>

      <div style={{
        background: "#e8f0fe", border: "1px solid #b3c8f5", borderRadius: 10,
        padding: "12px 16px", fontSize: 13, color: "#1a3c88", marginTop: 8,
      }}>
        <i className="bi bi-geo-alt-fill" style={{ marginRight: 8, color: "#3b7de8" }} />
        <strong>Accurate location data</strong> enables field workers to conduct follow-up visits 
        and allows the organisation to map programme coverage by region.
      </div>
    </div>
  );
}