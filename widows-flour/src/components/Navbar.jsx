// Navbar.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  FaNewspaper,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaEnvelope,
  FaShieldAlt,
  FaChevronDown,
} from "react-icons/fa";
import "./Navbar.css";
import imgLogo from "../assets/whitelogo.jpeg";
import DonationMethods from "./DonationMethods";

const PAGES_LINKS = [
  { to: "/news",          label: "News & Blog",    icon: <FaNewspaper size={14} />,        desc: "Stories & updates" },
  { to: "/how-to-donate", label: "How to Donate",  icon: <FaHandHoldingHeart size={14} />, desc: "Give in minutes" },
  { to: "/volunteer",     label: "Volunteer FAQ",   icon: <FaHandsHelping size={14} />,     desc: "Lend your time" },
  { to: "/contact",       label: "Contact Us",      icon: <FaEnvelope size={14} />,         desc: "Get in touch" },
  { to: "/privacy",       label: "Privacy Policy",  icon: <FaShieldAlt size={14} />,        desc: "Your data rights" },
];

/* ── General Donation Modal ── */
function GeneralDonationModal({ onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        background:      "rgba(0,0,0,0.55)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "16px",
        backdropFilter:  "blur(3px)",
      }}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        style={{
          background:   "#fff",
          borderRadius: "16px",
          width:        "100%",
          maxWidth:     "480px",
          maxHeight:    "90vh",
          overflowY:    "auto",
          position:     "relative",
          boxShadow:    "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   "absolute",
            top:        12,
            right:      12,
            zIndex:     1,
            background: "rgba(0,0,0,0.06)",
            border:     "none",
            borderRadius: "50%",
            width:      32,
            height:     32,
            cursor:     "pointer",
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ padding: "28px 28px 0" }}>
          <span
            style={{
              display:      "inline-block",
              background:   "rgba(90,158,58,0.1)",
              color:        "var(--green, #5a9e3a)",
              borderRadius: "99px",
              fontSize:     12,
              fontWeight:   600,
              padding:      "3px 12px",
              marginBottom: 10,
              letterSpacing: "0.04em",
            }}
          >
            General Donation
          </span>
          <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>
            Support Our Work
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#666", lineHeight: 1.5 }}>
            Your gift goes where it's needed most — site upkeep, urgent needs,
            and underfunded causes.
          </p>
        </div>

        {/* Donation form */}
        <DonationMethods
          campaignId={null}
          campaignName="General Fund"
          onSuccess={() => { setTimeout(onClose, 3500); }}
        />
      </div>
    </div>
  );
}

export default function Navbar() {
  const navRef                                = useRef(null);
  const dropdownRef                           = useRef(null);
  const navigate                              = useNavigate();
  const location                              = useLocation();
  const [scrolled, setScrolled]               = useState(false);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [pagesOpen, setPagesOpen]             = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);
  const [donateOpen, setDonateOpen]           = useState(false);

  // ── Entrance animation ──
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
    );
  }, []);

  // ── Scroll shadow ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Lock body scroll when drawer is open ──
  useEffect(() => {
    if (!donateOpen) {
      document.body.style.overflow = drawerOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, donateOpen]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── If we navigated home with a pending hash, scroll to it ──
  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      window.history.replaceState({}, "", "/");
    }
  }, [location]);

  const handleAnchorClick = useCallback(
    (sectionId) => {
      setDrawerOpen(false);
      if (location.pathname === "/") {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/", { state: { scrollTo: sectionId } });
      }
    },
    [location.pathname, navigate]
  );

  const goToLogin = () => {
    setDrawerOpen(false);
    navigate("/login");
  };

  const openDonate = () => {
    setDrawerOpen(false);
    setDonateOpen(true);
  };

  const NAV_LINKS = [
    { label: "Home",    section: "home" },
    { label: "About",   section: "about" },
    { label: "Causes",  section: "causes" },
    { label: "Impact",  section: "impact" },
    { label: "Contact", section: "contact" },
  ];

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <img
          src={imgLogo}
          alt="Widows Flour"
          className="navbar__logo"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        />

        {/* Desktop nav */}
        <ul className="navbar__links">
          {NAV_LINKS.map(({ label, section }) => (
            <li key={label}>
              <button
                className="navbar__anchor-btn"
                onClick={() => handleAnchorClick(section)}
              >
                {label}
              </button>
            </li>
          ))}

          {/* Pages dropdown */}
          <li className="navbar__pages-item" ref={dropdownRef}>
            <button
              className={`navbar__pages-btn${pagesOpen ? " is-open" : ""}`}
              onClick={() => setPagesOpen((o) => !o)}
              aria-expanded={pagesOpen}
              aria-haspopup="true"
            >
              Pages
              <FaChevronDown
                size={11}
                className="navbar__pages-chevron"
                style={{ transform: pagesOpen ? "rotate(180deg)" : "none" }}
              />
            </button>

            {pagesOpen && (
              <div className="navbar__dropdown" role="menu">
                <div className="navbar__dropdown-inner">
                  {PAGES_LINKS.map((p) => (
                    <Link
                      key={p.to}
                      to={p.to}
                      className="navbar__dropdown-item"
                      onClick={() => setPagesOpen(false)}
                      role="menuitem"
                    >
                      <span className="navbar__dropdown-icon">{p.icon}</span>
                      <span className="navbar__dropdown-text">
                        <span className="navbar__dropdown-label">{p.label}</span>
                        <span className="navbar__dropdown-desc">{p.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>

        {/* Desktop CTAs */}
        <div className="navbar__cta-group">
          <button
            className="navbar__cta navbar__cta-login navbar__cta-desktop"
            onClick={goToLogin}
          >
            Login
          </button>
          {/* Opens general donation modal instead of navigating to /donate */}
          <button
            className="navbar__cta navbar__cta-desktop"
            onClick={openDonate}
          >
            Donate Now <span className="navbar__heart">♥</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__menu-btn"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Menu"
        >
          <span style={{ transform: drawerOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
          <span style={{ opacity: drawerOpen ? 0 : 1 }} />
          <span style={{ transform: drawerOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`navbar__overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${drawerOpen ? "open" : ""}`}>
        {NAV_LINKS.map(({ label, section }) => (
          <button
            key={label}
            className="navbar__drawer-anchor-btn"
            onClick={() => handleAnchorClick(section)}
          >
            {label}
          </button>
        ))}

        {/* Pages accordion in mobile drawer */}
        <div className="navbar__drawer-pages">
          <button
            className="navbar__drawer-pages-btn"
            onClick={() => setMobilePagesOpen((o) => !o)}
          >
            <span>Pages</span>
            <FaChevronDown
              size={11}
              style={{
                transform:  mobilePagesOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.25s",
              }}
            />
          </button>
          {mobilePagesOpen && (
            <div className="navbar__drawer-pages-list">
              {PAGES_LINKS.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="navbar__drawer-pages-link"
                  onClick={() => {
                    setDrawerOpen(false);
                    setMobilePagesOpen(false);
                  }}
                >
                  <span className="navbar__drawer-pages-icon">{p.icon}</span>
                  {p.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={goToLogin}
          style={{
            background: "none",
            border:     "none",
            textAlign:  "left",
            font:       "inherit",
            cursor:     "pointer",
            color:      "inherit",
          }}
        >
          Login
        </button>

        {/* General donation — opens modal, closes drawer */}
        <button
          onClick={openDonate}
          style={{
            background: "none",
            border:     "none",
            textAlign:  "left",
            font:       "inherit",
            cursor:     "pointer",
            color:      "var(--green-deep, #3a7a1e)",
            fontWeight: 600,
          }}
        >
          Donate Now ♥
        </button>
      </div>

      {/* General donation modal */}
      {donateOpen && (
        <GeneralDonationModal onClose={() => setDonateOpen(false)} />
      )}
    </>
  );
}