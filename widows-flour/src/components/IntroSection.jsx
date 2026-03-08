// IntroSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./IntroSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function IntroSection() {
  const wrapperRef = useRef(null);
  const curtainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Scroll exit — curtain wipes up, content slides out
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        }
      });

      exitTl
        .to(".intro__tag",        { y: -50, opacity: 0, ease: "none", duration: 0.3 }, 0)
        .to(".intro__sub",        { y: -30, opacity: 0, ease: "none", duration: 0.3 }, 0.05)
        .to(".intro__scroll-cue", { opacity: 0,         ease: "none", duration: 0.2 }, 0)
        .to(".intro__line",       { y: "-25vh", opacity: 0, stagger: 0.05, ease: "none", duration: 0.6 }, 0.05)
        .to(curtainRef.current,   { scaleY: 1,          ease: "none", duration: 0.5 }, 0.4);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="intro-wrapper" ref={wrapperRef}>
      <div className="intro">

        <div className="intro__grain" />
        <div className="intro__curtain" ref={curtainRef} />

        <div className="intro__content">
          <div className="intro__tag">
            <span className="intro__tag-dot" />
            Widows Flour — Est. 2019
          </div>

          <h1 className="intro__headline">
            <span className="intro__line">Every widow</span>
            <span className="intro__line">deserves a</span>
            <span className="intro__line intro__line--italic">full table.</span>
          </h1>

          <p className="intro__sub">
            A platform of grace, flour, and community — feeding widows
            and their families one gift at a time.
          </p>
        </div>

        <div className="intro__bottom">
          <div className="intro__scroll-cue">
            <div className="intro__scroll-line" />
            <span>Scroll to explore</span>
          </div>
          <div className="intro__year">© 2025</div>
        </div>

      </div>
    </section>
  );
}