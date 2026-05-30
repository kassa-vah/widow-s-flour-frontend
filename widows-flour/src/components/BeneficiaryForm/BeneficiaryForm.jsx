// src/components/BeneficiaryForm/BeneficiaryForm.jsx
import { useState, useEffect, useCallback } from "react";
import "./BeneficiaryForm.css";
import StepPersonal        from "./steps/StepPersonal";
import StepLocation        from "./steps/StepLocation";
import StepHousehold       from "./steps/StepHousehold";
import StepEconomic        from "./steps/StepEconomic";
import StepVulnerability   from "./steps/StepVulnerability";
import StepDocuments       from "./steps/StepDocuments";
import StepReview          from "./steps/StepReview";

const STEPS = [
  { id: "personal",       label: "Personal Info",    icon: "bi-person",                shortLabel: "Personal"       },
  { id: "location",       label: "Location",         icon: "bi-geo-alt",               shortLabel: "Location"       },
  { id: "household",      label: "Household",        icon: "bi-house",                 shortLabel: "Household"      },
  { id: "economic",       label: "Economic",         icon: "bi-cash",                  shortLabel: "Economic"       },
  { id: "vulnerability",  label: "Vulnerability",    icon: "bi-heart-pulse",           shortLabel: "Vulnerability"  },
  { id: "documents",      label: "Documents",        icon: "bi-file-earmark-text",     shortLabel: "Documents"      },
  { id: "review",         label: "Review & Submit",  icon: "bi-patch-check",           shortLabel: "Review"         },
];

const AUTOSAVE_KEY = "wf_beneficiary_draft";

const EMPTY_FORM = {
  // Personal
  full_name: "", gender: "", date_of_birth: "", phone_number: "",
  alternate_contact: "", profile_image: "", short_story: "", beneficiary_status: "pending",
  // Location
  country: "Kenya", county: "", sub_county: "", ward: "", village: "",
  physical_address: "", gps_coordinates: "",
  // Household
  marital_status: "", number_of_children: "", number_of_dependents: "",
  household_size: "", caregiver_name: "",
  // Economic
  employment_status: "", monthly_income_range: "", income_source: "",
  housing_type: "", owns_land: "",
  // Vulnerability
  disability_status: "", chronic_illness: "", widow_status: "", refugee_or_displaced: "",
  domestic_violence_survivor: "", food_insecurity_level: "", vulnerability_notes: "",
  // Documents
  documents: [], consent_given: false,
};

function calcCompletion(form) {
  const sections = {
    personal:      ["full_name", "gender", "date_of_birth", "phone_number", "profile_image"],
    location:      ["county", "sub_county", "ward", "village"],
    household:     ["marital_status", "number_of_children", "number_of_dependents", "household_size"],
    economic:      ["employment_status", "monthly_income_range", "income_source", "housing_type"],
    vulnerability: ["disability_status", "widow_status", "food_insecurity_level"],
    documents:     [],
  };

  let filled = 0, total = 0;
  Object.values(sections).forEach((fields) => {
    fields.forEach((f) => {
      total++;
      if (form[f] && String(form[f]).trim() !== "") filled++;
    });
  });
  // documents bonus
  total++;
  if (form.documents?.length > 0) filled++;

  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

function calcVulnerabilityScore(form) {
  let score = 0;
  if (form.widow_status === "yes")                   score += 25;
  if (form.disability_status === "yes")              score += 20;
  if (form.food_insecurity_level === "severe")       score += 20;
  else if (form.food_insecurity_level === "moderate") score += 10;
  if (form.refugee_or_displaced === "yes")           score += 15;
  if (form.domestic_violence_survivor === "yes")     score += 10;
  if (form.chronic_illness === "yes")                score += 10;
  const deps = parseInt(form.number_of_dependents) || 0;
  if (deps >= 5)      score += 10;
  else if (deps >= 3) score += 5;
  const income = form.monthly_income_range;
  if (income === "0-999")       score += 10;
  else if (income === "1000-4999") score += 5;

  if (score >= 60) return { level: "High Priority",   color: "#c0394b", bg: "#fde8ec", icon: "bi-exclamation-triangle-fill" };
  if (score >= 30) return { level: "Medium Priority", color: "#d4860a", bg: "#fef4e8", icon: "bi-dash-circle"               };
  return              { level: "Low Priority",    color: "#5a9e3a", bg: "#eaf3df", icon: "bi-check-circle"              };
}

/** Build the nested payload the backend expects. */
function buildPayload(form, completion) {
  return {
    // ── Core fields
    full_name:            form.full_name,
    gender:               form.gender             || null,
    date_of_birth:        form.date_of_birth       || null,
    phone_number:         form.phone_number        || null,
    alternate_contact:    form.alternate_contact   || null,
    profile_image:        form.profile_image       || null,
    short_story:          form.short_story         || null,
    beneficiary_status:   form.beneficiary_status  || "pending",
    completion_percentage: completion,

    // ── Location
    location: {
      country:          form.country          || "Kenya",
      county:           form.county           || null,
      sub_county:       form.sub_county       || null,
      ward:             form.ward             || null,
      village:          form.village          || null,
      physical_address: form.physical_address || null,
      gps_coordinates:  form.gps_coordinates  || null,
    },

    // ── Household
    household: {
      marital_status:       form.marital_status                          || null,
      number_of_children:   form.number_of_children   !== "" ? Number(form.number_of_children)   : null,
      number_of_dependents: form.number_of_dependents !== "" ? Number(form.number_of_dependents) : null,
      household_size:       form.household_size        !== "" ? Number(form.household_size)        : null,
      caregiver_name:       form.caregiver_name        || null,
    },

    // ── Economic profile
    economic_profile: {
      employment_status:    form.employment_status    || null,
      monthly_income_range: form.monthly_income_range || null,
      income_source:        form.income_source        || null,
      housing_type:         form.housing_type         || null,
      owns_land:            form.owns_land            || null,
    },

    // ── Vulnerability
    vulnerability: {
      disability_status:          form.disability_status          || null,
      chronic_illness:            form.chronic_illness            || null,
      widow_status:               form.widow_status               || null,
      refugee_or_displaced:       form.refugee_or_displaced       || null,
      domestic_violence_survivor: form.domestic_violence_survivor || null,
      food_insecurity_level:      form.food_insecurity_level      || null,
      vulnerability_notes:        form.vulnerability_notes        || null,
    },

    // ── Documents
    documents: form.documents ?? [],
  };
}

export default function BeneficiaryForm({ token, editData = null, onSaved, onCancel }) {
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState(() => {
    if (editData) return { ...EMPTY_FORM, ...flattenEditData(editData) };
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return { ...EMPTY_FORM };
  });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const completion = calcCompletion(form);
  const vulnScore  = calcVulnerabilityScore(form);

  // Autosave draft (skip in edit mode to avoid clobbering)
  useEffect(() => {
    if (!editData) localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(form));
  }, [form, editData]);

  const update = useCallback((fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(fields).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (!form.consent_given) {
      setSaveErr("Please confirm the consent checkbox before submitting.");
      return;
    }

    setSaving(true);
    setSaveErr("");

    const API    = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
    const url    = editData
      ? `${API}/beneficiaries/${editData.id}`
      : `${API}/beneficiaries/add-beneficiary`;
    const method = editData ? "PUT" : "POST";
    const payload = buildPayload(form, completion);

    try {
      const res  = await fetch(url, {
        method,
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("Server response:", JSON.stringify(json, null, 2));
      console.log("Payload sent:", JSON.stringify(payload, null, 2));

      if (!res.ok) {
        // Surface the most useful error message from the response
        const msg =
          json?.error   ||
          json?.message ||
          json?.detail  ||
          `Save failed (HTTP ${res.status}).`;
        setSaveErr(msg);
        setSaving(false);
        return;
      }

      localStorage.removeItem(AUTOSAVE_KEY);
      if (onSaved) onSaved(json.data);
    } catch (err) {
      setSaveErr("Network error. Please try again.");
    }

    setSaving(false);
  };

  const stepProps = { form, update, errors };

  const renderStep = () => {
    switch (STEPS[step].id) {
      case "personal":      return <StepPersonal      {...stepProps} />;
      case "location":      return <StepLocation      {...stepProps} />;
      case "household":     return <StepHousehold     {...stepProps} />;
      case "economic":      return <StepEconomic      {...stepProps} />;
      case "vulnerability": return <StepVulnerability {...stepProps} vulnScore={vulnScore} />;
      case "documents":     return <StepDocuments     {...stepProps} token={token} />;
      case "review":        return (
        <StepReview
          form={form}
          completion={completion}
          vulnScore={vulnScore}
          saveErr={saveErr}
          saving={saving}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="bf__shell">
      {/* ── Top stepper ── */}
      <div className="bf__stepper">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`bf__step ${i === step ? "bf__step--active" : ""} ${i < step ? "bf__step--done" : ""}`}
            onClick={() => { if (i < step) setStep(i); }}
            disabled={i > step}
          >
            <span className="bf__step-dot">
              {i < step
                ? <i className="bi bi-check-lg" />
                : <i className={`bi ${s.icon}`} />}
            </span>
            <span className="bf__step-label">{s.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* ── Completion bar ── */}
      <div className="bf__completion-bar">
        <span style={{ fontSize: 12, color: "#8a8a8a" }}>Profile completion</span>
        <div className="bf__comp-track">
          <div className="bf__comp-fill" style={{ width: `${completion}%` }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#5a9e3a", minWidth: 36, textAlign: "right" }}>
          {completion}%
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
          background: vulnScore.bg, color: vulnScore.color,
        }}>
          {vulnScore.level}
        </span>
      </div>

      {/* ── Step content ── */}
      <div className="bf__body">
        <div
          className="bf__body-inner"
          key={step}
          style={{ animation: "ob-fadeIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div className="bf__step-header">
            <div className="bf__step-icon">
              <i className={`bi ${STEPS[step].icon}`} />
            </div>
            <div>
              <div className="bf__step-name">{STEPS[step].label}</div>
              <div className="bf__step-count">Step {step + 1} of {STEPS.length}</div>
            </div>
          </div>
          {renderStep()}
        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div className="bf__footer">
        <div className="bf__footer-left">
          {onCancel && (
            <button className="bf__btn-cancel" onClick={onCancel}>
              <i className="bi bi-x" /> Cancel
            </button>
          )}
        </div>
        <div className="bf__footer-right">
          {step > 0 && (
            <button className="bf__btn-prev" onClick={goPrev}>
              <i className="bi bi-arrow-left" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="bf__btn-next" onClick={goNext}>
              Next <i className="bi bi-arrow-right" />
            </button>
          ) : (
            <button className="bf__btn-submit" onClick={handleSubmit} disabled={saving}>
              <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check-lg"}`} />
              {saving ? " Saving…" : editData ? " Update Beneficiary" : " Submit Beneficiary"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * When editing an existing beneficiary the API returns a nested object.
 * Flatten it back to the same shape as EMPTY_FORM so the form fields bind correctly.
 */
function flattenEditData(data) {
  if (!data) return {};
  const loc  = data.location         || {};
  const hh   = data.household        || {};
  const ep   = data.economic_profile || {};
  const vuln = data.vulnerability    || {};

  return {
    full_name:          data.full_name          ?? "",
    gender:             data.gender             ?? "",
    date_of_birth:      data.date_of_birth      ?? "",
    phone_number:       data.phone_number       ?? "",
    alternate_contact:  data.alternate_contact  ?? "",
    profile_image:      data.profile_image      ?? "",
    short_story:        data.short_story        ?? "",
    beneficiary_status: data.beneficiary_status ?? "pending",

    country:          loc.country          ?? "Kenya",
    county:           loc.county           ?? "",
    sub_county:       loc.sub_county       ?? "",
    ward:             loc.ward             ?? "",
    village:          loc.village          ?? "",
    physical_address: loc.physical_address ?? "",
    gps_coordinates:  loc.gps_coordinates  ?? "",

    marital_status:       hh.marital_status       ?? "",
    number_of_children:   hh.number_of_children   ?? "",
    number_of_dependents: hh.number_of_dependents ?? "",
    household_size:       hh.household_size        ?? "",
    caregiver_name:       hh.caregiver_name        ?? "",

    employment_status:    ep.employment_status    ?? "",
    monthly_income_range: ep.monthly_income_range ?? "",
    income_source:        ep.income_source        ?? "",
    housing_type:         ep.housing_type         ?? "",
    owns_land:            ep.owns_land            ?? "",

    disability_status:          vuln.disability_status          ?? "",
    chronic_illness:            vuln.chronic_illness            ?? "",
    widow_status:               vuln.widow_status               ?? "",
    refugee_or_displaced:       vuln.refugee_or_displaced       ?? "",
    domestic_violence_survivor: vuln.domestic_violence_survivor ?? "",
    food_insecurity_level:      vuln.food_insecurity_level      ?? "",
    vulnerability_notes:        vuln.notes                      ?? "",

    documents:     data.documents    ?? [],
    consent_given: false, // always re-confirm consent on edit
  };
}

// ── Step validation ───────────────────────────────────────────────────────────

function validateStep(stepIndex, form) {
  const errs = {};
  switch (stepIndex) {
    case 0:
      if (!form.full_name?.trim())    errs.full_name     = "Full name is required.";
      if (!form.gender)               errs.gender        = "Gender is required.";
      if (!form.date_of_birth)        errs.date_of_birth = "Date of birth is required.";
      if (!form.phone_number?.trim()) errs.phone_number  = "Phone number is required.";
      break;
    case 1:
      if (!form.county?.trim())       errs.county     = "County is required.";
      if (!form.sub_county?.trim())   errs.sub_county = "Sub-county is required.";
      break;
    case 2:
      if (!form.marital_status)       errs.marital_status = "Marital status is required.";
      break;
    case 3:
      if (!form.employment_status)    errs.employment_status = "Employment status is required.";
      break;
    case 4:
      if (!form.widow_status)         errs.widow_status = "Please indicate widow status.";
      break;
    default:
      break;
  }
  return errs;
}