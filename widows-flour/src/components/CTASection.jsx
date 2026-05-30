// CTASection.jsx  — final CTA banner + Footer
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CTASection.css";
import { Link } from "react-router-dom";

// ── Image imports (Vite-compatible ES module imports) ──────────
import imgElderly1 from "../assets/smilingelderly1.jpg";
import imgChild1   from "../assets/smilingchild1.jpg";
import imgElderly2 from "../assets/smilingelderly2.jpg";
import imgLogo     from "../assets/blacklogo.jpeg";

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
            Stand with underprivileged seniors and their children today.
          </p>

          <div className="cta-banner__actions">
            <Link to="/donate" className="btn-primary btn-primary--light">
              Donate Now ♥
            </Link>
            <Link to="/our-story" className="btn-ghost btn-ghost--light">
              Learn Our Story →
            </Link>
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
      links: [
        { label: "About Us",        to: "/our-story"          },
        { label: "Our Causes",      to: "/causes"         },
        { label: "Impact Reports",  to: "/impact"         },
        { label: "News & Blog",     to: "/news"           },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "How to Donate",   to: "/how-to-donate"         },
        { label: "Volunteer FAQ",   to: "/volunteer"  },
        { label: "Contact Us",      to: "/contact"        },
        { label: "Privacy Policy",  to: "/privacy" },
      ],
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
              A movement of grace, provision, and community — nourishing elderly
              and their families one sack of flour at a time.
            </p>

            {/* Socials — left for you to wire up */}
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
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect col — left for you to wire up */}
          <div>
            <p className="footer__col-title">Connect</p>
            <ul className="footer__links">
              {["Instagram", "Twitter / X", "Facebook", "YouTube"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2025 Widows Flour. All rights reserved.</span>
          <span>Registered Non-Profit | Charity No. WF-2019-047</span>
        </div>
      </div>
    </footer>
  );
}