// AboutSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AboutSection.css";

gsap.registerPlugin(ScrollTrigger);

/* ─── Custom SVG Icons (outline only) ──────────────────────── */

const STROKE = "currentColor";
const SW = { strokeWidth: "1.8" };
const SW2 = { strokeWidth: "2" };

const IconFlour = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52"
       stroke={STROKE} strokeLinecap="round" strokeLinejoin="round">
    {/* Sun rays */}
    <g opacity="0.5" strokeWidth="1.5">
      <line x1="32" y1="8"  x2="32" y2="4"  />
      <line x1="32" y1="52" x2="32" y2="56" />
      <line x1="10" y1="30" x2="6"  y2="30" />
      <line x1="54" y1="30" x2="58" y2="30" />
      <line x1="16" y1="16" x2="13" y2="13" strokeWidth="1.2"/>
      <line x1="48" y1="44" x2="51" y2="47" strokeWidth="1.2"/>
      <line x1="48" y1="16" x2="51" y2="13" strokeWidth="1.2"/>
      <line x1="16" y1="44" x2="13" y2="47" strokeWidth="1.2"/>
    </g>

    {/* Left wheat stalk */}
    <path d="M27 47 Q24 37 26 27 Q23 18 27 10" {...SW} fill="none"/>
    <ellipse cx="23.5" cy="41" rx="3.5" ry="5.5" fill="none" {...SW} transform="rotate(-18 23.5 41)"/>
    <ellipse cx="26"   cy="32" rx="3.5" ry="5.5" fill="none" {...SW} transform="rotate(15 26 32)"/>
    <ellipse cx="23"   cy="23" rx="3"   ry="5"   fill="none" {...SW} transform="rotate(-20 23 23)"/>
    <ellipse cx="27"   cy="15" rx="2.8" ry="4.5" fill="none" {...SW} transform="rotate(12 27 15)"/>

    {/* Right wheat stalk */}
    <path d="M37 47 Q40 37 38 27 Q41 18 37 10" {...SW} fill="none"/>
    <ellipse cx="40.5" cy="41" rx="3.5" ry="5.5" fill="none" {...SW} transform="rotate(18 40.5 41)"/>
    <ellipse cx="38"   cy="32" rx="3.5" ry="5.5" fill="none" {...SW} transform="rotate(-15 38 32)"/>
    <ellipse cx="41"   cy="23" rx="3"   ry="5"   fill="none" {...SW} transform="rotate(20 41 23)"/>
    <ellipse cx="37"   cy="15" rx="2.8" ry="4.5" fill="none" {...SW} transform="rotate(-12 37 15)"/>

    {/* Cupped hands */}
    <path d="M10 52 Q9 46 13 42 Q19 38 25 41 L29 44 Q31 46 34 44 L38 41 Q44 38 51 42 Q55 46 54 52 Q44 60 32 58 Q20 60 10 52Z"
          fill="none" {...SW2}/>
    {/* Finger hints left */}
    <path d="M16 42 Q15 38 18 36" strokeWidth="1.2" fill="none" opacity="0.55"/>
    <path d="M23 40 Q22 36 25 34" strokeWidth="1.2" fill="none" opacity="0.55"/>
    {/* Finger hints right */}
    <path d="M48 42 Q49 38 46 36" strokeWidth="1.2" fill="none" opacity="0.55"/>
    <path d="M41 40 Q42 36 39 34" strokeWidth="1.2" fill="none" opacity="0.55"/>
  </svg>
);

const IconFinancial = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52"
       stroke={STROKE} strokeLinecap="round" strokeLinejoin="round">
    {/* Rising bars */}
    <rect x="8"  y="42" width="10" height="14" rx="2.5" strokeWidth="1.6"/>
    <rect x="21" y="32" width="10" height="24" rx="2.5" strokeWidth="1.6"/>
    <rect x="34" y="20" width="10" height="36" rx="2.5" strokeWidth="1.6"/>
    <rect x="47" y="28" width="10" height="28" rx="2.5" strokeWidth="1.6"/>
    {/* Baseline */}
    <line x1="4" y1="56" x2="60" y2="56" strokeWidth="1.4" opacity="0.4"/>

    {/* Up arrow */}
    <line x1="39" y1="18" x2="39" y2="6"  strokeWidth="2"/>
    <path d="M33 12 L39 6 L45 12" fill="none" strokeWidth="2"/>

    {/* Coin circles */}
    <circle cx="8"  cy="22" r="8"  strokeWidth="1.5"/>
    <text x="8" y="26" textAnchor="middle" fontSize="9" fontWeight="500"
          fill="currentColor" stroke="none" fontFamily="sans-serif">$</text>
    <circle cx="56" cy="14" r="6.5" strokeWidth="1.5"/>
    <text x="56" y="18" textAnchor="middle" fontSize="8" fontWeight="500"
          fill="currentColor" stroke="none" fontFamily="sans-serif">$</text>
  </svg>
);

const IconCommunity = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52"
       stroke={STROKE} strokeLinecap="round" strokeLinejoin="round">
    {/* Person left */}
    <circle cx="16" cy="22" r="8"  strokeWidth="1.6"/>
    <path d="M2 54 Q4 36 16 34 Q28 36 30 54" strokeWidth="1.6" fill="none"/>

    {/* Person right */}
    <circle cx="48" cy="22" r="8"  strokeWidth="1.6"/>
    <path d="M34 54 Q36 36 48 34 Q60 36 62 54" strokeWidth="1.6" fill="none"/>

    {/* Mentor center (larger) */}
    <circle cx="32" cy="18" r="11" strokeWidth="2"/>
    <path d="M18 56 Q20 30 32 28 Q44 30 46 56" strokeWidth="2" fill="none"/>

    {/* Heart above mentor */}
    <path d="M32 10 Q29 6 25 8 Q21 12 25 17 L32 24 L39 17 Q43 12 39 8 Q35 6 32 10Z"
          strokeWidth="1.6" fill="none"/>

    {/* Dashed connection lines */}
    <path d="M22 34 Q18 28 24 22" strokeWidth="1.2" strokeDasharray="2 3" fill="none" opacity="0.6"/>
    <path d="M42 34 Q46 28 40 22" strokeWidth="1.2" strokeDasharray="2 3" fill="none" opacity="0.6"/>
  </svg>
);

/* ─── Feature data (icons replaced) ───────────────────────────── */

const features = [
  {
    icon: <IconFlour />,
    title: "Flour & Food Provision",
    desc: "Monthly flour baskets and staple food parcels delivered to widows across communities.",
  },
  {
    icon: <IconFinancial />,
    title: "Financial Contributions",
    desc: "Organizations and individuals partnering to fund ongoing relief programs.",
  },
  {
    icon: <IconCommunity />,
    title: "Community & Mentorship",
    desc: "Circles of care connecting widows with mentors, counselors, and each other.",
  },
];

const IMG = {
  main:   "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80",
  accent: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80",
  av1:    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  av2:    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
  av3:    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80",
};

export default function AboutSection() {
  const sectionRef   = useRef(null);
  const leftRef      = useRef(null);
  const mainImgRef   = useRef(null);
  const accentImgRef = useRef(null);
  const badgeRef     = useRef(null);
  const cardsRef     = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo(leftRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
      );

      gsap.fromTo(mainImgRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
      );

      gsap.fromTo(accentImgRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
      );

      gsap.fromTo(badgeRef.current,
        { scale: 0.7, opacity: 0, rotate: -6 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.7, ease: "back.out(1.6)", delay: 0.5,
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: i * 0.12,
            scrollTrigger: { trigger: card, start: "top 85%" } }
        );
      });

      gsap.to(mainImgRef.current, {
        y: -50, ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", end: "bottom top", scrub: 1,
        }
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="about-container">
        <div className="about__inner">

          {/* Left — text */}
          <div className="about__left" ref={leftRef}>
            <span className="tag-pill">About Us</span>
            <h2 className="about__headline">
              Who We Are &amp;<br />What Drives Us
            </h2>
            <p className="about__body">
              Widows Flour was born from a simple conviction — that no widow should
              face an empty table alone. We mobilize communities, donors, and
              volunteers to deliver flour, food, and fellowship to women who've lost
              their provider. Every sack of flour is a message: you are seen,
              you are loved, you are not forgotten.
            </p>

            <div className="about__features">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="about__feature-card"
                  ref={(el) => (cardsRef.current[i] = el)}
                >
                  {/* SVG icon replaces emoji */}
                  <div className="about__feature-icon">
                    {f.icon}
                  </div>
                  <div className="about__feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image stack */}
          <div className="about__right">
            <div className="about__img-main" ref={mainImgRef}>
              <img src={IMG.main} alt="Widows flour community" />
            </div>

            <div className="about__img-accent" ref={accentImgRef}>
              <img src={IMG.accent} alt="Community support" />
            </div>

            <div className="about__badge" ref={badgeRef}>
              <span className="about__badge-num">6+</span>
              <span className="about__badge-label">Years of Service</span>
            </div>

            <div className="about__green-pill">
              <div className="about__avatars">
                <img src={IMG.av1} alt="" />
                <img src={IMG.av2} alt="" />
                <img src={IMG.av3} alt="" />
              </div>
              <span>120+ Active Volunteers</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}