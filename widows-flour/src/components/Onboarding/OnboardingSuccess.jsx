// src/components/Onboarding/OnboardingSuccess.jsx
export default function OnboardingSuccess({ adminName, onGoToDashboard }) {
  return (
    <div className="ob__success">
      <div className="ob__success-card">
        <span className="ob__success-emoji">🌾</span>

        <h2 className="ob__success-title">You're all set, {adminName?.split(" ")[0] || "Admin"}!</h2>

        <p className="ob__success-sub">
          You have completed the Widows Flour administrator onboarding. Your pledge has been 
          recorded and you now have full access to the dashboard. Thank you for committing 
          to serve with integrity and compassion.
        </p>

        <div className="ob__success-badge">
          <i className="bi bi-patch-check-fill" />
          Onboarding Complete
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {[
            "Dashboard Overview",
            "Admin How-To Guide",
            "Data Integrity Guidelines",
            "Biodata Collection Guide",
            "Profile Completion System",
            "Administrator's Pledge",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#4a4a4a" }}>
              <i className="bi bi-check2" style={{ color: "#5a9e3a", fontWeight: 700 }} />
              {item}
            </div>
          ))}
        </div>

        <button
          className="ob__btn-finish"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={onGoToDashboard}
        >
          <i className="bi bi-house-door" /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}