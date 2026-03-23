// CTASection.jsx  — final CTA banner + Footer
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CTASection.css";

// ── Image imports (Vite-compatible ES module imports) ──────────
import imgElderly1 from "../assets/smilingelderly1.jpg";
import imgChild1   from "../assets/smilingchild1.jpg";
import imgElderly2 from "../assets/smilingelderly2.jpg";
import imgLogo     from "../assets/logo.png";

gsap.registerPlugin(ScrollTrigger);

const AVATARS = [imgElderly1, imgChild1, imgElderly2];

export function CTASection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current.children,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: contentRef.current, start: "top 80%" }
        }
      );

      // Scroll-linked subtle rotation on bg text
      gsap.to(sectionRef.current.querySelector(".cta-banner__bg-text span"), {
        x: "-10%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="donate" className="cta-banner" ref={sectionRef}>
      {/* Ghost background text */}
      <div className="cta-banner__bg-text">
        <span>Widows Flour</span>
      </div>

      <div className="cta-container">
        <div className="cta-banner__content" ref={contentRef}>
          <span className="cta-banner__eyebrow">Join the Movement</span>

          <h2 className="cta-banner__headline">
            Help Us
            <span className="cta-banner__avatars-inline">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </span>
            Build Stronger Communities
            <br />Through the Power of Giving
          </h2>

          <p className="cta-banner__sub">
            Every sack of flour is a promise. Every donation is an act of love.
            Stand with widows and their children today.
          </p>

          <div className="cta-banner__actions">
            <a href="#causes" className="btn-primary btn-primary--light">
              Donate Now ♥
            </a>
            <a href="#about" className="btn-ghost btn-ghost--light">
              Learn Our Story →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    {
      title: "Platform",
      links: ["About Us", "Our Causes", "Impact Reports", "News & Blog"],
    },
    {
      title: "Help",
      links: ["How to Donate", "Volunteer FAQ", "Contact Us", "Privacy Policy"],
    },
    {
      title: "Connect",
      links: ["Instagram", "Twitter / X", "Facebook", "YouTube"],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer__inner">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <img src={imgLogo} alt="Widows Flour" className="footer__logo-img" />
            </div>

            <p>
              <strong className="hs-reveal">Widows Flour</strong><br />
              A movement of grace, provision, and community — nourishing widows
              and their families one sack of flour at a time.
            </p>

            <div className="footer__socials" style={{ marginTop: 24 }}>
              {["𝕏", "f", "▶", "in"].map((s, i) => (
                <a key={i} href="#" className="footer__social">{s}</a>
              ))}
            </div>
          </div>

          {/* Nav cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="footer__col-title">{col.title}</p>
              <ul className="footer__links">
                {col.links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <span>© 2025 Widows Flour. All rights reserved.</span>
          <span>Registered Non-Profit | Charity No. WF-2019-047</span>
        </div>
      </div>
    </footer>
  );
}