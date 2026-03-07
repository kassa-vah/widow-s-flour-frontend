// HeroSection.jsx — sticky pill expansion
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HeroSection.css";

gsap.registerPlugin(ScrollTrigger);

const IMG = {
  card1: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
  card2: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
  card3: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80",
  card4: "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=400&q=80",
  card5: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  card6: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
  pill:  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=90",
};

const stats = [
  { num: "4,200+", label: "Widows Supported" },
  { num: "12,000+", label: "Meals Distributed" },
  { num: "38",      label: "Communities Reached" },
  { num: "$820K",   label: "Raised in Aid" },
];

export default function HeroSection() {
  const wrapperRef    = useRef(null);
  const pillRef       = useRef(null);
  const wordLeftRef   = useRef(null);
  const wordRightRef  = useRef(null);
  const wordMiddleRef = useRef(null);
  const cardsRef      = useRef([]);
  const subRef        = useRef(null);
  const actionsRef    = useRef(null);
  const eyebrowRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Get pill's natural size to animate FROM
      const pillEl = pillRef.current;

      // ── Scroll-driven expansion ──────────────────────────────
      // The wrapper is 500vh. The .hero inside is sticky top:0.
      // ScrollTrigger scrubs across the full wrapper height.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,           // smooth, tied to scroll speed
          pin: false,         // the CSS sticky handles pinning
        }
      });

      // 1. Pill grows from natural size → covers full viewport
      tl.to(pillEl, {
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        top: "0px",
        left: "0px",
        xPercent: 0,
        yPercent: 0,
        ease: "none",
        duration: 1,
      }, 0);

      // 2. Left word pushed out left
      tl.to(wordLeftRef.current, {
        x: "-50vw",
        opacity: 0,
        ease: "none",
        duration: 0.7,
      }, 0);

      // 3. Right word pushed out right
      tl.to(wordRightRef.current, {
        x: "50vw",
        opacity: 0,
        ease: "none",
        duration: 0.7,
      }, 0);

      // 4. Middle line fades up
      tl.to(wordMiddleRef.current, {
        y: "-15vh",
        opacity: 0,
        ease: "none",
        duration: 0.5,
      }, 0);

      // 5. Everything else fades out
      tl.to([subRef.current, actionsRef.current, eyebrowRef.current], {
        opacity: 0,
        y: -24,
        ease: "none",
        duration: 0.3,
      }, 0);

      tl.to(cardsRef.current, {
        opacity: 0,
        ease: "none",
        duration: 0.3,
        stagger: 0.02,
      }, 0);

      tl.to(".hero__stats-bar", {
        opacity: 0,
        ease: "none",
        duration: 0.2,
      }, 0);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    // Outer wrapper — tall so scroll has room to play
    <section id="hero" className="hero-wrapper" ref={wrapperRef}>

      {/* Sticky panel — stays locked to top while wrapper scrolls */}
      <div className="hero">

        {/* Floating image cards */}
        <div className="hero__images">
          {[1,2,3,4,5,6].map((n) => (
            <div
              key={n}
              className={`hero__img-card hero__img-card--${n}`}
              ref={(el) => (cardsRef.current[n-1] = el)}
            >
              <img src={IMG[`card${n}`]} alt="" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="hero__content">

          <span className="hero__eyebrow" ref={eyebrowRef}>
            A Movement of Grace &amp; Provision
          </span>

          <div className="hero__headline">

            {/* Line 1 — exits left */}
            <div className="hero__word-row hero__word-row--left" ref={wordLeftRef}>
              Nourishing
            </div>

            {/* Line 2 — middle with pill */}
            <div className="hero__word-row hero__word-row--middle" ref={wordMiddleRef}>
              <span className="hero__word-side">every</span>

              {/* THE PILL — expands to fullscreen on scroll */}
              <div className="hero__inline-pill" ref={pillRef}>
                <img src={IMG.pill} alt="widow's table" />
                <span className="hero__pill-label">widow's table</span>
              </div>

              <span className="hero__word-side">with</span>
            </div>

            {/* Line 3 — exits right */}
            <div className="hero__word-row hero__word-row--right" ref={wordRightRef}>
              <em>love &amp; flour</em>
            </div>

          </div>

          <p className="hero__sub" ref={subRef}>
            We believe every widow deserves dignity, warmth, and provision.
            Join us as we fill homes with bread, hope, and community.
          </p>

          <div className="hero__actions" ref={actionsRef}>
            <a href="#donate" className="btn-primary">
              Donate Now <span style={{ color: "#e85050" }}>♥</span>
            </a>
            <a href="#about" className="btn-ghost">Learn More →</a>
          </div>

        </div>

        {/* Stats bar */}
        <div className="hero__stats-bar container">
          {stats.map((s, i) => (
            <div key={i} className="hero__stat">
              <span className="hero__stat-num">{s.num}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll-hint">
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>

      </div>
    </section>
  );
}