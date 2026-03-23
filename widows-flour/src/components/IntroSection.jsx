// IntroSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./IntroSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function IntroSection() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".intro__tag",        { y: 40, opacity: 0 });
      gsap.set(".intro__line",       { y: 60, opacity: 0 });
      gsap.set(".intro__sub",        { y: 30, opacity: 0 });
      gsap.set(".intro__scroll-cue", { opacity: 0 });
      gsap.set(".intro__logo",       { opacity: 0, x: 20 });

      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1.2,
        }
      });

      enterTl
        .to(".intro__logo",       { opacity: 1, x: 0,      ease: "none", duration: 0.3  }, 0)
        .to(".intro__tag",        { y: 0, opacity: 1,       ease: "none", duration: 0.35 }, 0.05)
        .to(".intro__line",       { y: 0, opacity: 1, stagger: 0.08, ease: "none", duration: 0.5 }, 0.15)
        .to(".intro__sub",        { y: 0, opacity: 1,       ease: "none", duration: 0.35 }, 0.45)
        .to(".intro__scroll-cue", { opacity: 1,             ease: "none", duration: 0.25 }, 0.6);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="intro-wrapper" ref={wrapperRef}>
      <div className="intro">

        <div className="intro__grain" />

        <div className="intro__body">
          <div className="intro__left">
            <div className="intro__tag">
              <span className="intro__tag-dot" />
              Widows Flour — Est. 2019
            </div>

            <div className="intro__content">
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
          </div>
        </div>

        <div className="intro__bottom">
          <div className="intro__scroll-cue">
            <div className="intro__scroll-line" />
            <span>Scroll to explore</span>
          </div>
          <div className="intro__year">© 2025</div>
        </div>

        <div className="intro__worldbg" aria-hidden="true" />

      </div>
    </section>
  );
}