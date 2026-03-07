// CausesSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CausesSection.css";

gsap.registerPlugin(ScrollTrigger);

const causes = [
  {
    category: "Food Relief",
    title: "Monthly Flour Basket Program",
    desc: "Delivering 10kg flour parcels and staple goods to widows and their children every month — ensuring no family faces an empty kitchen.",
    goal: "$60,000",
    raised: 72,
    cta: "Give a Meal",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&q=80",
  },
  {
    category: "Education",
    title: "Education Fund for Children of Widows",
    desc: "Funding school fees, uniforms, books, and learning materials so that children raised by single widowed mothers can access quality education.",
    goal: "$183,000",
    raised: 54,
    cta: "Build Schools",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80",
  },
  {
    category: "Livelihood",
    title: "Skills & Small Business Training",
    desc: "Empowering widows with vocational skills — baking, sewing, agribusiness — so they can build income and independence for their families.",
    goal: "$45,000",
    raised: 38,
    cta: "Empower Now",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80",
  },
];

export default function CausesSection() {
  const sectionRef = useRef(null);
  const itemsRef   = useRef([]);
  const fillsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Each row slides in from bottom
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(item,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%" }
          }
        );
      });

      // Progress bar fills
      fillsRef.current.forEach((fill, i) => {
        if (!fill) return;
        const pct = causes[i]?.raised || 50;
        gsap.fromTo(fill,
          { scaleX: 0 },
          {
            scaleX: pct / 100,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: fill, start: "top 85%" }
          }
        );
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="causes" className="causes" ref={sectionRef}>
      <div className="container">

        <div className="causes__header">
          <div>
            <span className="tag-pill">Our Causes</span>
            <h2 className="causes__headline" style={{ marginTop: 16 }}>
              Where Your Gift<br />Goes to Work
            </h2>
          </div>
          <div className="causes__header-right">
            <p>Every donation is directed toward verified, transparent causes that change real lives.</p>
            <a href="#donate" className="btn-primary">
              See All Causes →
            </a>
          </div>
        </div>

        <div className="causes__list">
          {causes.map((cause, i) => (
            <div
              key={i}
              className="cause-item"
              ref={(el) => (itemsRef.current[i] = el)}
            >
              {/* Image */}
              <div className="cause-item__image">
                <img src={cause.img} alt={cause.title} />
              </div>

              {/* Body */}
              <div className="cause-item__body">
                <span className="cause-item__category">{cause.category}</span>
                <h3 className="cause-item__title">{cause.title}</h3>
                <p className="cause-item__desc">{cause.desc}</p>

                <div className="cause-item__progress">
                  <div className="cause-item__progress-bar">
                    <div
                      className="cause-item__progress-fill"
                      ref={(el) => (fillsRef.current[i] = el)}
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>
                  <div className="cause-item__progress-label">
                    <span>{cause.raised}% raised</span>
                    <span>Goal: {cause.goal}</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="cause-item__meta">
                <div className="cause-item__goal">
                  Goal: <span>{cause.goal}</span>
                </div>
                <a href="#donate" className="cause-item__cta">
                  {cause.cta} <span className="heart">♥</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}