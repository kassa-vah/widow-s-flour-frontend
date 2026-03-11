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
      // Set initial hidden states
      gsap.set(".intro__tag",        { y: 40, opacity: 0 });
      gsap.set(".intro__line",       { y: 60, opacity: 0 });
      gsap.set(".intro__sub",        { y: 30, opacity: 0 });
      gsap.set(".intro__scroll-cue", { opacity: 0 });
      gsap.set(".intro__logo",       { opacity: 0, x: 20 });

      // Scroll-triggered ENTER animation — words appear as you scroll in
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 80%",   // start when section enters viewport
          end: "top 20%",     // finish by the time it's centred
          scrub: 1.2,
        }
      });

      enterTl
        .to(".intro__logo",       { opacity: 1, x: 0,      ease: "none", duration: 0.3 }, 0)
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

        {/* Two-column body */}
        <div className="intro__body">

          {/* LEFT — tag + headline + sub */}
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

          {/* RIGHT — large logo
          <div className="intro__right">
            <img
              src="./src/assets/logo.png"
              alt="Widows Flour"
              className="intro__logo"
            />
          </div> */}

        </div>

        {/* Bottom bar */}
        <div className="intro__bottom">
          <div className="intro__scroll-cue">
            <div className="intro__scroll-line" />
            <span>Scroll to explore</span>
          </div>
          <div className="intro__year">© 2025</div>
        </div>

        {/* World map background */}
        <div className="intro__worldbg" aria-hidden="true" />

      </div>
    </section>
  );
}