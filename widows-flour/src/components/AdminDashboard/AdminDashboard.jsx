// src/components/AdminDashboard/AdminDashboard.jsx
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminDashboard.css";
import imgLogo from "../../assets/logo.png";

import BeneficiaryCrud from "./BeneficiaryCrud";
import CampaignCrud    from "./CampaignCrud";
import DonationCrud    from "./DonationCrud";
import BlogCrud        from "./BlogCrud";
import ActivityLog     from "./ActivityLog";

const API = import.meta.env.VITE_API_URL ?? "";

const NAV = [
  { id: "beneficiaries", label: "Beneficiaries", icon: "bi-people",        section: "People"     },
  { id: "campaigns",     label: "Campaigns",     icon: "bi-megaphone",     section: "Operations" },
  { id: "donations",     label: "Donations",     icon: "bi-heart",         section: "Operations" },
  { id: "blogs",         label: "Blog Posts",    icon: "bi-file-earmark-text", section: "Content"},
  { id: "activity",      label: "Activity Log",  icon: "bi-clipboard-data",section: "System"     },
];

export default function AdminDashboard({ admin, token, onLogout }) {
  const [active, setActive]       = useState("beneficiaries");
  const [sidebarOpen, setSidebar] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* swallow */ }
    onLogout();
  };

  const navigate = (id) => {
    setActive(id);
    setSidebar(false);
  };

  const sections     = [...new Set(NAV.map((n) => n.section))];
  const activeLabel  = NAV.find((n) => n.id === active)?.label ?? "";
  const activeIcon   = NAV.find((n) => n.id === active)?.icon  ?? "";
  const avatarLetter = (admin?.name ?? "A").charAt(0).toUpperCase();

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="dash__mobile-header">
        <img src={imgLogo} alt="Widows Flour" className="dash__mobile-logo" />
        <button
          className="dash__hamburger"
          onClick={() => setSidebar(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`} />
        </button>
      </div>

      <div
        className={`dash__overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebar(false)}
      />

      <div className="dash">
        {/* ── Sidebar ── */}
        <aside className={`dash__sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="dash__sidebar-bg" />

          <div className="dash__sidebar-logo">
            <img src={imgLogo} alt="Widows Flour" />
            <span>Admin Dashboard</span>
          </div>

          <nav className="dash__nav">
            {sections.map((section) => (
              <div className="dash__nav-section" key={section}>
                <div className="dash__nav-label">{section}</div>
                {NAV.filter((n) => n.section === section).map((item) => (
                  <button
                    key={item.id}
                    className={`dash__nav-item ${active === item.id ? "active" : ""}`}
                    onClick={() => navigate(item.id)}
                  >
                    <i className={`bi ${item.icon} dash__nav-icon`} />
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="dash__sidebar-footer">
            <div className="dash__user">
              <div className="dash__avatar">{avatarLetter}</div>
              <div className="dash__user-info">
                <div className="dash__user-name">{admin?.name ?? "Admin"}</div>
                <div className="dash__user-role">{admin?.role ?? "admin"}</div>
              </div>
            </div>
            <button className="dash__logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="dash__main">
          <div className="dash__topbar">
            <h1 className="dash__topbar-title">
              <i className={`bi ${activeIcon}`} />
              {activeLabel}
            </h1>
            <div className="dash__topbar-meta">
              <span>
                <i className="bi bi-calendar3" />
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="dash__topbar-badge">
                <i className="bi bi-shield-check" />
                {admin?.role}
              </span>
            </div>
          </div>

          <div className="dash__content">
            {active === "beneficiaries" && <BeneficiaryCrud token={token} />}
            {active === "campaigns"     && <CampaignCrud    token={token} />}
            {active === "donations"     && <DonationCrud    token={token} />}
            {active === "blogs"         && <BlogCrud        token={token} />}
            {active === "activity"      && <ActivityLog     token={token} />}
          </div>
        </main>
      </div>
    </>
  );
}