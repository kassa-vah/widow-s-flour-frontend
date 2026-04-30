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
import imgLogo from "../assets/logo.png";

const PAGES_LINKS = [
  { to: "/news",          label: "News & Blog",    icon: <FaNewspaper size={14} />,        desc: "Stories & updates" },
  { to: "/how-to-donate", label: "How to Donate",  icon: <FaHandHoldingHeart size={14} />, desc: "Give in minutes" },
  { to: "/volunteer",     label: "Volunteer FAQ",   icon: <FaHandsHelping size={14} />,     desc: "Lend your time" },
  { to: "/contact",       label: "Contact Us",      icon: <FaEnvelope size={14} />,         desc: "Get in touch" },
  { to: "/privacy",       label: "Privacy Policy",  icon: <FaShieldAlt size={14} />,        desc: "Your data rights" },
];

// Section IDs that exist on the home page
const HOME_SECTIONS = ["home", "about", "causes", "impact", "contact"];

export default function Navbar() {
  const navRef                              = useRef(null);
  const dropdownRef                         = useRef(null);
  const navigate                            = useNavigate();
  const location                            = useLocation();
  const [scrolled, setScrolled]             = useState(false);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [pagesOpen, setPagesOpen]           = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);

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
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

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
      // Wait a tick for the page to mount, then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      // Clear state so refreshing doesn't re-scroll
      window.history.replaceState({}, "", "/");
    }
  }, [location]);

  /**
   * Smart anchor navigation:
   * - If already on "/", scroll directly to the section.
   * - If on any other page, navigate home and carry the section id in state.
   */
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
        {/* Logo — clicking it always goes home */}
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
          {/* ✅ Use React Router Link instead of bare <a href="/donate"> */}
          <Link to="/donate" className="navbar__cta navbar__cta-desktop">
            Donate Now <span className="navbar__heart">♥</span>
          </Link>
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
                transform: mobilePagesOpen ? "rotate(180deg)" : "none",
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
            border: "none",
            textAlign: "left",
            font: "inherit",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          Login
        </button>

        
        <Link
          to="/donate"
          onClick={() => setDrawerOpen(false)}
          style={{ color: "var(--green-deep)" }}
        >
          Donate Now ♥
        </Link>
      </div>
    </>
  );
}