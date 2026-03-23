

import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./HeroSection.css";

const PILL_IMG = "./src/assets/smilingchildren1.jpg";
const CARDS = [
  "./src/assets/elderly1.jpg",
  "./src/assets/elderly2.jpg",
  "./src/assets/elderly3.jpg",
  "./src/assets/elderly4.jpg",
  "./src/assets/elderly5.jpg",
  "./src/assets/smilingchild1.jpg",
];
const STATS = [
  { num: "100+",  label: "Widows Supported" },
  { num: "500+", label: "Meals Distributed" },
  { num: "38",      label: "Communities Reached" },
  { num: "KSH 820K",   label: "Raised in Aid" },
];

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = (t) => t; // linear — immediate response

export default function HeroSection() {
  const wrapperRef = useRef(null);
  const pillRef    = useRef(null);
  const line1Ref   = useRef(null);
  const line2Ref   = useRef(null);
  const line3Ref   = useRef(null);
  const everyRef   = useRef(null);
  const withRef    = useRef(null);
  const eyebrowRef = useRef(null);
  const subRef     = useRef(null);
  const actionsRef = useRef(null);
  const statsRef   = useRef(null);
  const cardsRef   = useRef([]);
  const overlayRef = useRef(null);
  const rafRef     = useRef(null);

  const pillMeasure = useRef(null);
  const revealFired = useRef(false);
  const hasMeasured = useRef(false); 

  useEffect(() => {
    // ── Entrance animations ──
    gsap.set(
      [line1Ref.current, line2Ref.current, line3Ref.current,
       eyebrowRef.current, subRef.current, actionsRef.current, statsRef.current],
      { opacity: 0, y: 20 }
    );
    cardsRef.current.forEach((c) => c && gsap.set(c, { opacity: 0, scale: 0.9 }));

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to([line1Ref.current, line2Ref.current, line3Ref.current],
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }, "-=0.2")
      .to([subRef.current, actionsRef.current],
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 }, "-=0.3")
      .to(statsRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");

    cardsRef.current.forEach((c, i) => {
      if (!c) return;
      gsap.to(c, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.3 + i * 0.07 });
    });

    const wrapper = wrapperRef.current;
    const pill    = pillRef.current;

    const measurePill = () => {
      const r  = pill.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      pillMeasure.current = {
        cx: r.left + r.width  / 2,
        cy: r.top  + r.height / 2,
        w:  r.width,
        h:  r.height,
        vw, vh,
      };
      hasMeasured.current = true;
    };

    const tick = () => {
      const wr = wrapper.getBoundingClientRect();
      const wH = wrapper.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // FIX 4: guard against zero division
      const maxScroll = wH - vh;
      if (maxScroll <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const scrolled = clamp(-wr.top, 0, maxScroll);
      const raw = scrolled / maxScroll;
      const p   = ease(raw); // FIX 1: linear — starts immediately

      if (!hasMeasured.current) {
        measurePill();
      }
      // Re-measure on viewport resize
      if (pillMeasure.current &&
          (pillMeasure.current.vw !== vw || pillMeasure.current.vh !== vh)) {
        measurePill();
      }

      if (pillMeasure.current) {
        const { cx, cy, w, h } = pillMeasure.current;

        // ── PILL: expand to viewport minus MARGIN ──
        const MARGIN   = 16;
        const targetSX = (vw - MARGIN * 2) / w;
        const targetSY = (vh - MARGIN * 2) / h;

        const sx = lerp(1, targetSX, p);
        const sy = lerp(1, targetSY, p);
        const tx = lerp(0, vw / 2 - cx, p);
        const ty = lerp(0, vh / 2 - cy, p);
        const br = lerp(999, 0, p);

        pill.style.transform       = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
        pill.style.borderRadius    = `${br}px`;
        pill.style.transformOrigin = "center center";

        const lbl = pill.querySelector(".hero__pill-label");
        if (lbl) lbl.style.opacity = `${1 - clamp(p * 4)}`;

        // ── WORDS exit — start immediately, finish by p=0.5 ──
        const wp = clamp(p * 2); // reaches 1 at p=0.5

        line1Ref.current.style.transform = `translateY(${lerp(0, -vh * 0.55, wp)}px)`;
        line1Ref.current.style.opacity   = `${1 - wp}`;

        everyRef.current.style.transform = `translateX(${lerp(0, -vw * 0.45, wp)}px)`;
        everyRef.current.style.opacity   = `${1 - wp}`;

        withRef.current.style.transform  = `translateX(${lerp(0, vw * 0.45, wp)}px)`;
        withRef.current.style.opacity    = `${1 - wp}`;

        line3Ref.current.style.transform = `translateY(${lerp(0, vh * 0.55, wp)}px)`;
        line3Ref.current.style.opacity   = `${1 - wp}`;

        // ── Support elements fade fast ──
        const fp = clamp(p * 4);
        eyebrowRef.current.style.opacity  = `${1 - fp}`;
        subRef.current.style.opacity      = `${1 - fp}`;
        actionsRef.current.style.opacity  = `${1 - fp}`;
        statsRef.current.style.opacity    = `${1 - fp}`;

        // ── CARDS drift away ──
        cardsRef.current.forEach((c, i) => {
          if (!c) return;
          const dir = i % 2 === 0 ? -1 : 1;
          c.style.transform = `translate(${dir * lerp(0, vw * 0.15, wp)}px, ${lerp(0, -vh * 0.2, wp)}px)`;
          c.style.opacity   = `${1 - clamp(p * 3)}`;
        });

        // ── OVERLAY fades in at p > 0.75 ──
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
            gsap.set(overlayRef.current.querySelectorAll(".hs-reveal"), { y: 50, opacity: 0 });
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

        <div className="hero__overlay" ref={overlayRef}>
          <p className="hero__overlay-eyebrow hs-reveal">It's not just about smiles</p>
          <h2 className="hero__overlay-headline">
            <span className="hs-reveal">Behind every smile</span>
            <span className="hs-reveal">is a mother who <em>fought</em></span>
            <span className="hs-reveal">to provide  for their families.</span>
          </h2>
          <p className="hero__overlay-sub hs-reveal">
            Widows Flour exists because flour is love made tangible.
          </p>
        </div>

        <div className="hero__cards">
          {CARDS.map((src, i) => (
            <div key={i} className={`hero__card hero__card--${i + 1}`}
                 ref={(el) => (cardsRef.current[i] = el)}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        <div className="hero__content">
          <span className="hero__eyebrow" ref={eyebrowRef}>
            A Movement of Grace &amp; Provision
          </span>

          <div className="hero__headline">
            <p className="hero__line hero__line--top" ref={line1Ref}>
              Nourishing
            </p>
            <p className="hero__line hero__line--middle" ref={line2Ref}>
              <span ref={everyRef} className="hero__word">Tables</span>
              <span className="hero__pill" ref={pillRef}>
                <img src={PILL_IMG} alt="widow's table" />
                
              </span>
              <span ref={withRef} className="hero__word">with</span>
            </p>
            <p className="hero__line hero__line--bottom" ref={line3Ref}>
              <em>love &amp; flour</em>
            </p>
          </div>

          <p className="hero__sub" ref={subRef}>
            We believe every widow deserves dignity, warmth, and provision.
            Join us as we fill homes with meals, Hope, and Love.
          </p>

          <div className="hero__actions" ref={actionsRef}>
            <a href="#donate" className="btn-primary">
              Donate Now <span style={{ color: "#e85050" }}>♥</span>
            </a>
            <a href="#about" className="btn-ghost">Learn More →</a>
          </div>
        </div>

        <div className="hero__stats" ref={statsRef}>
          {STATS.map((s, i) => (
            <div key={i} className="hero__stat">
              <span className="hero__stat-num">{s.num}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="hero__scroll-cue">
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>

      </div>
    </section>
  );
}