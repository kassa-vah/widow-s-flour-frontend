/**
 * HeroSection.jsx
 * 
 * SCROLL SEQUENCE:
 * Phase 1 (p: 0→1): Pill grows from inline size → fullscreen.
 *   - "Nourishing" slides UP
 *   - "every" slides LEFT, "with" slides RIGHT  
 *   - "love & flour" slides DOWN
 *   - floating cards drift and fade
 *   - pill border-radius goes 999px → 0px
 * 
 * Phase 2 (triggered once p ≥ 0.95): GSAP reveals text overlay on image
 *   - "It's not just about smiles" fades in
 *   - Sub-headline lines stagger up from below
 * 
 * KEY INSIGHT: We measure pill position lazily on first RAF tick where
 * wrapperRect.top ≤ 0 (i.e. sticky panel is pinned at viewport top).
 * This ensures we always measure from the correct sticky position.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./HeroSection.css";

const PILL_IMG = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=90";
const CARDS = [
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80",
  "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=400&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
];
const STATS = [
  { num: "4,200+",  label: "Widows Supported" },
  { num: "12,000+", label: "Meals Distributed" },
  { num: "38",      label: "Communities Reached" },
  { num: "$820K",   label: "Raised in Aid" },
];

const clamp  = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));
const lerp   = (a, b, t) => a + (b - a) * t;
// Smooth ease — slow at start and end
const smooth = t => t * t * (3 - 2 * t);

export default function HeroSection() {
  const wrapperRef  = useRef(null);
  const pillRef     = useRef(null);
  const line1Ref    = useRef(null);
  const line2Ref    = useRef(null);
  const line3Ref    = useRef(null);
  const everyRef    = useRef(null);
  const withRef     = useRef(null);
  const eyebrowRef  = useRef(null);
  const subRef      = useRef(null);
  const actionsRef  = useRef(null);
  const statsRef    = useRef(null);
  const cardsRef    = useRef([]);
  const overlayRef  = useRef(null);
  const rafRef      = useRef(null);

  // Pill natural measurements — captured lazily when hero is pinned
  const pillMeasure = useRef(null);
  const revealFired = useRef(false);

  useEffect(() => {
    // Entrance animation
    gsap.set([line1Ref.current, line2Ref.current, line3Ref.current,
               eyebrowRef.current, subRef.current, actionsRef.current,
               statsRef.current], { opacity: 0, y: 20 });
    cardsRef.current.forEach(c => c && gsap.set(c, { opacity: 0, scale: 0.9 }));

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to([line1Ref.current, line2Ref.current, line3Ref.current],
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }, "-=0.2")
      .to([subRef.current, actionsRef.current],
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 }, "-=0.3")
      .to(statsRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");

    cardsRef.current.forEach((c, i) => {
      if (!c) return;
      gsap.to(c, { opacity: 1, scale: 1, duration: 0.8,
        ease: "power2.out", delay: 0.3 + i * 0.07 });
    });

    const wrapper = wrapperRef.current;
    const pill    = pillRef.current;

    // Lazily measure pill when the sticky panel is actually pinned at top:0
    const measurePill = () => {
      // Only valid when hero is stuck (wrapperRect.top <= 0)
      const r  = pill.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      pillMeasure.current = {
        // Center of pill in VIEWPORT coordinates (correct since hero is at top:0)
        cx: r.left + r.width  / 2,
        cy: r.top  + r.height / 2,
        w:  r.width,
        h:  r.height,
        vw, vh,
      };
    };

    const tick = () => {
      const wr     = wrapper.getBoundingClientRect();
      const wH     = wrapper.offsetHeight;
      const vw     = window.innerWidth;
      const vh     = window.innerHeight;

      // scrolled: how many px we've scrolled INTO the wrapper
      // wr.top goes from 0 → -(wH - vh) as we scroll through
      const scrolled  = clamp(-wr.top, 0, wH - vh);
      const maxScroll = wH - vh;
      const raw = scrolled / maxScroll;
      const p   = smooth(raw);   // 0 = top of wrapper, 1 = bottom

      // Measure pill position the FIRST FRAME the panel is pinned (wr.top ≈ 0)
      // We re-measure if viewport size changes too
      if (!pillMeasure.current && wr.top <= 1 && wr.top >= -10) {
        measurePill();
      }
      if (pillMeasure.current &&
          (pillMeasure.current.vw !== vw || pillMeasure.current.vh !== vh)) {
        measurePill();
      }

      if (pillMeasure.current) {
        const { cx, cy, w, h } = pillMeasure.current;

        // ── PILL: scale grows from 1×1 → (vw/w) × (vh/h) ──
        // Translate so pill center moves to viewport center simultaneously
        const targetSX = vw / w;
        const targetSY = vh / h;
        const sx = lerp(1, targetSX, p);
        const sy = lerp(1, targetSY, p);
        const tx = lerp(0, vw / 2 - cx, p);
        const ty = lerp(0, vh / 2 - cy, p);
        const br = lerp(999, 0, p);

        pill.style.transform       = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
        pill.style.borderRadius    = `${br}px`;
        pill.style.transformOrigin = "center center";

        // Fade the "widow's table" label as pill grows
        const lbl = pill.querySelector(".hero__pill-label");
        if (lbl) lbl.style.opacity = `${1 - clamp(p * 4)}`;

        // ── WORDS: pushed away by the expanding pill ──
        const wp = clamp(p * 2);  // words exit faster than pill reaches edges

        // "Nourishing" → UP
        line1Ref.current.style.transform = `translateY(${lerp(0, -vh * 0.55, wp)}px)`;
        line1Ref.current.style.opacity   = `${1 - wp}`;

        // "every" → LEFT
        everyRef.current.style.transform = `translateX(${lerp(0, -vw * 0.45, wp)}px)`;
        everyRef.current.style.opacity   = `${1 - wp}`;

        // "with" → RIGHT
        withRef.current.style.transform  = `translateX(${lerp(0, vw * 0.45, wp)}px)`;
        withRef.current.style.opacity    = `${1 - wp}`;

        // "love & flour" → DOWN
        line3Ref.current.style.transform = `translateY(${lerp(0, vh * 0.55, wp)}px)`;
        line3Ref.current.style.opacity   = `${1 - wp}`;

        // ── REST: fade out fast ──
        const fp = clamp(p * 5);
        eyebrowRef.current.style.opacity  = `${1 - fp}`;
        subRef.current.style.opacity      = `${1 - fp}`;
        actionsRef.current.style.opacity  = `${1 - fp}`;
        statsRef.current.style.opacity    = `${1 - fp}`;

        // ── CARDS: drift away ──
        cardsRef.current.forEach((c, i) => {
          if (!c) return;
          const dir = i % 2 === 0 ? -1 : 1;
          c.style.transform = `translate(${dir * lerp(0, vw * 0.15, wp)}px, ${lerp(0, -vh * 0.2, wp)}px)`;
          c.style.opacity   = `${1 - clamp(p * 3)}`;
        });

        // ── OVERLAY: fades in near end ──
        if (overlayRef.current) {
          const op = clamp((p - 0.75) / 0.25);
          overlayRef.current.style.opacity = `${op}`;

          if (p >= 0.9 && !revealFired.current) {
            revealFired.current = true;
            gsap.fromTo(
              overlayRef.current.querySelectorAll(".hs-reveal"),
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 }
            );
          }
          if (p < 0.7 && revealFired.current) {
            revealFired.current = false;
            gsap.set(overlayRef.current.querySelectorAll(".hs-reveal"),
              { y: 50, opacity: 0 });
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section id="hero" className="hero-wrapper" ref={wrapperRef}>
      <div className="hero">

        {/* Fullscreen text overlay — shown when pill covers screen */}
        <div className="hero__overlay" ref={overlayRef}>
          <p className="hero__overlay-eyebrow hs-reveal">It's not just about smiles</p>
          <h2 className="hero__overlay-headline">
            <span className="hs-reveal">Behind every smile</span>
            <span className="hs-reveal">is a mother who <em>fought</em></span>
            <span className="hs-reveal">to put bread on the table.</span>
          </h2>
          <p className="hero__overlay-sub hs-reveal">
            Widows Flour exists because flour is love made tangible.
          </p>
        </div>

        {/* Floating cards */}
        <div className="hero__cards">
          {CARDS.map((src, i) => (
            <div key={i}
                 className={`hero__card hero__card--${i + 1}`}
                 ref={el => cardsRef.current[i] = el}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        {/* Main content — centered */}
        <div className="hero__content">

          <span className="hero__eyebrow" ref={eyebrowRef}>
            A Movement of Grace &amp; Provision
          </span>

          <div className="hero__headline">

            {/* "Nourishing" — exits UP */}
            <p className="hero__line hero__line--top" ref={line1Ref}>
              Nourishing
            </p>

            {/* "every [PILL] with" — every exits LEFT, with exits RIGHT */}
            <p className="hero__line hero__line--middle" ref={line2Ref}>
              <span ref={everyRef} className="hero__word">every</span>

              {/* THE PILL — transform scales this to fullscreen */}
              <span className="hero__pill" ref={pillRef}>
                <img src={PILL_IMG} alt="widow's table" />
                <span className="hero__pill-label">widow's table</span>
              </span>

              <span ref={withRef} className="hero__word">with</span>
            </p>

            {/* "love & flour" — exits DOWN */}
            <p className="hero__line hero__line--bottom" ref={line3Ref}>
              <em>love &amp; flour</em>
            </p>

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

        {/* Stats */}
        <div className="hero__stats" ref={statsRef}>
          {STATS.map((s, i) => (
            <div key={i} className="hero__stat">
              <span className="hero__stat-num">{s.num}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="hero__scroll-cue">
          <div className="hero__scroll-line" /><span>Scroll</span>
        </div>

      </div>
    </section>
  );
}