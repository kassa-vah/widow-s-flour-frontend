 // Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./Navbar.css";
import imgLogo from "../assets/logo.png";

export default function Navbar() {
  const navRef      = useRef(null);
  const navigate    = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
    );
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const links = ["Home", "About", "Causes", "Impact", "Contact"];

  const goToLogin = () => {
    setDrawerOpen(false);
    navigate("/login");
  };

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <img src={imgLogo} alt="Widows Flour" className="navbar__logo" />

        {/* Desktop nav */}
        <ul className="navbar__links">
          {links.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`}>{l}</a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="navbar__cta-group">
          <button
            className="navbar__cta navbar__cta-login navbar__cta-desktop"
            onClick={goToLogin}
          >
            Login
          </button>
          <a href="#donate" className="navbar__cta navbar__cta-desktop">
            Donate Now <span className="navbar__heart">♥</span>
          </a>
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

      {/* Mobile drawer */}
      <div
        className={`navbar__overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`navbar__drawer ${drawerOpen ? "open" : ""}`}>
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setDrawerOpen(false)}>
            {l}
          </a>
        ))}
        <button
          onClick={goToLogin}
          style={{ background: "none", border: "none", textAlign: "left",
                   font: "inherit", cursor: "pointer", color: "inherit" }}
        >
          Login
        </button>
        <a href="/donate" onClick={() => setDrawerOpen(false)} style={{ color: "var(--green-deep)" }}>
          Donate Now ♥
        </a>
      </div>
    </>
  );
}