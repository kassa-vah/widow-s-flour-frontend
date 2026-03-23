// ImpactSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ImpactSection.css";

// ── Image imports (Vite-compatible ES module imports) ──────────
import handsImg      from "../assets/hands1.jpeg";
import imgVolunteers from "../assets/offloading.jpg";

gsap.registerPlugin(ScrollTrigger);

const IMG = {
  volunteers: imgVolunteers,
};

/* ─── Stats data ──────────────────────────────────────────────── */
const stats = [
  {
    variant: "dark",
    number: "10,000+",
    label: "Meals Distributed",
    desc: "Hot meals and flour parcels delivered across all regions.",
  },
  { variant: "image" },
  {
    variant: "green",
    number: "120+",
    label: "Volunteers Engaged",
    desc: "Dedicated individuals giving their time and energy.",
  },
  {
    variant: "yellow",
    number: "38",
    label: "Communities Reached",
    desc: "From rural outposts to urban centers — no widow left behind.",
  },
  {
    variant: "white",
    number: "KSH820K",
    label: "Total Aid Raised",
    desc: "Funds mobilized through donations, grants, and generous partnerships.",
    span2: true,
  },
];

export default function ImpactSection() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo(headerRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 80%" }
        }
      );

      // Cards stagger
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.75,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: { trigger: card, start: "top 88%" }
          }
        );
      });

      // Number counter animation
      sectionRef.current.querySelectorAll(".impact__number[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";

        gsap.fromTo({ val: 0 }, { val: target },
          {
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
              const v = Math.round(this.targets()[0].val);
              el.textContent = prefix + v.toLocaleString() + suffix;
            },
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          }
        );
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="impact" className="impact" ref={sectionRef}>
      <div className="impact-container">

        {/* Header */}
        <div className="impact__header" ref={headerRef}>
          <div>
            <span className="tag-pill">Results</span>
            <h2 className="impact__headline" style={{ marginTop: 16 }}>
              The Power Of<br />Giving In Numbers
            </h2>
          </div>
          <p className="impact__intro">
            From meals served to families, our impact is reflected in the lives
            we've touched and the communities we continue to uplift together.
          </p>
        </div>

        {/* Grid */}
        <div className="impact__grid">

          {/* Dark — meals + hands-heart illustration */}
          <div
            className="impact__card impact__card--dark"
            ref={(el) => (cardsRef.current[0] = el)}
          >
            <img
              src={handsImg}
              alt=""
              className="impact__hands-heart"
              aria-hidden="true"
            />

            <div className="impact__dot" />
            <span className="impact__number" data-count="10000" data-suffix="+">
              500+
            </span>
            <span className="impact__card-label">Meals Distributed</span>
            <span className="impact__card-desc">
              Hot meals and flour parcels delivered across all regions.
            </span>
          </div>

          {/* Image */}
          <div
            className="impact__card impact__card--image"
            ref={(el) => (cardsRef.current[1] = el)}
          >
            <img src={IMG.volunteers} alt="Volunteers packing food" />
          </div>

          {/* Green — volunteers */}
          <div
            className="impact__card impact__card--green"
            ref={(el) => (cardsRef.current[2] = el)}
          >
            <div className="impact__dot" />
            <span className="impact__number" data-count="120" data-suffix="+">
              60+
            </span>
            <span className="impact__card-label">Volunteers Engaged</span>
            <span className="impact__card-desc">
              Dedicated individuals giving their time and energy.
            </span>
          </div>

          {/* Yellow — communities */}
          <div
            className="impact__card impact__card--yellow"
            ref={(el) => (cardsRef.current[3] = el)}
          >
            <div className="impact__dot" />
            <span className="impact__number" data-count="38">38</span>
            <span className="impact__card-label">Communities Reached</span>
            <span className="impact__card-desc">
              From rural outposts to urban centers — no widow left behind.
            </span>
          </div>

          {/* White span2 — total aid */}
          <div
            className="impact__card impact__card--white impact__card--span2"
            ref={(el) => (cardsRef.current[4] = el)}
          >
            <div className="impact__dot" />
            <span className="impact__number" data-count="820" data-prefix="$" data-suffix="K">
              KSH 820K
            </span>
            <span className="impact__card-label">Total Aid Raised</span>
            <span className="impact__card-desc">
              Funds mobilized through donations, grants, and generous partnerships.
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}