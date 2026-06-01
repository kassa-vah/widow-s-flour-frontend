// src/components/CausesSection/CausesSection.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaSeedling, FaBookOpen, FaHandsHelping } from "react-icons/fa";
import "./CausesSection.css";

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

/* Optional: category → icon mapping */
const CATEGORY_ICONS = {
  "Food Relief": <FaSeedling />,
  "Education": <FaBookOpen />,
  "Livelihood": <FaHandsHelping />,
};

const FALLBACK_CAUSES = [
  {
    id: null,
    category: "Food Relief",
    title: "Monthly Flour Basket Program",
    desc: "Delivering 10kg flour parcels and staple goods to widows and their children every month — ensuring no family faces an empty kitchen.",
    goal: "KSH 60,000",
    raised: 72,
    cta: "Give a Meal",
    icon: <FaSeedling />,
  },
  {
    id: null,
    category: "Education",
    title: "Education Fund for Children of Widows",
    desc: "Funding school fees, uniforms, books, and learning materials so that children raised by single widowed mothers can access quality education.",
    goal: "KSH 183,000",
    raised: 54,
    cta: "Build Schools",
    icon: <FaBookOpen />,
  },
  {
    id: null,
    category: "Livelihood",
    title: "Skills & Small Business Training",
    desc: "Empowering widows with vocational skills — baking, sewing, agribusiness — so they can build income and independence for their families.",
    goal: "KSH 45,000",
    raised: 38,
    cta: "Empower Now",
    icon: <FaHandsHelping />,
  },
];

function normalise(c) {
  const raised = c.raised_amount ?? 0;
  const goal = c.goal_amount ?? 1;
  const pct = c.progress_percent ?? Math.round((raised / goal) * 100);

  const category = c.category ?? c.beneficiary?.category ?? "Cause";

  return {
    id: c.id,
    category,
    title: c.title,
    desc: c.description ?? "Your support changes lives.",
    goal: `KES ${Number(goal).toLocaleString()}`,
    raised: pct,
    cta: c.cta_label ?? "Donate Now",
    icon: CATEGORY_ICONS[category] ?? <FaHandsHelping />,
    img: c.image_url ?? c.beneficiary?.profile_image ?? null,
  };
}

/* Scroll to top helper */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function CausesSection() {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);
  const fillsRef = useRef([]);
  const counterRefs = useRef([]);
  const navigate = useNavigate();

  const [causes, setCauses] = useState(FALLBACK_CAUSES);

  /* Fetch first 3 active campaigns */
  useEffect(() => {
    fetch(`${API}/campaigns/public?per_page=3&status=active`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const items = d?.data?.items ?? d?.data ?? null;
        if (items && items.length > 0) {
          setCauses(items.slice(0, 3).map(normalise));
        }
      })
      .catch(() => {});
  }, []);

  /* GSAP animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%" },
          }
        );
      });

      fillsRef.current.forEach((fill, i) => {
        if (!fill) return;
        const targetPct = causes[i]?.raised ?? 0;
        const counterEl = counterRefs.current[i];
        const obj = { value: 0 };

        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: targetPct / 100,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: fill,
              start: "top 88%",
              once: true,
            },
            onStart() {
              gsap.to(obj, {
                value: targetPct,
                duration: 1.6,
                ease: "power3.out",
                onUpdate() {
                  if (counterEl) {
                    counterEl.textContent = `${Math.round(obj.value)}%`;
                  }
                },
              });
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [causes]);

  /* Navigate to /causes and scroll to top */
  const handleViewAll = (e) => {
    e.preventDefault();
    scrollToTop();
    // Small delay so the scroll fires before navigation
    setTimeout(() => navigate("/causes"), 100);
  };

  /* Navigate to specific campaign and scroll to top */
  const handleCauseCta = (e, cause) => {
    e.preventDefault();
    scrollToTop();
    const target = cause.id ? `/causes#campaign-${cause.id}` : "/causes";
    setTimeout(() => navigate(target), 100);
  };

  return (
    <section id="causes" className="causes-section" ref={sectionRef}>
      <div className="causes-container">
        <div className="causes__header">
          <div>
            <span className="tag-pill">Our Causes</span>
            <h2 className="causes__headline" style={{ marginTop: 16 }}>
              Where Your Gift
              <br />
              Goes to Work
            </h2>
          </div>
          <div className="causes__header-right">
            <p>
              Every donation is directed toward verified, transparent causes
              that change real lives.
            </p>
            <a href="/causes" className="btn-primary" onClick={handleViewAll}>
              See All Causes →
            </a>
          </div>
        </div>

        <div className="causes__list">
          {causes.map((cause, i) => (
            <div
              key={cause.id ?? i}
              className="cause-item"
              ref={(el) => (itemsRef.current[i] = el)}
            >
              {/* Image / Icon */}
              <div className="cause-item__image">
                {cause.img ? (
                  <img src={cause.img} alt={cause.title} />
                ) : (
                  <div className="cause-item__image-placeholder">
                    <span className="cause-icon">{cause.icon}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="cause-item__body">
                <span className="cause-item__category">
                  {cause.category}
                </span>
                <h3 className="cause-item__title">{cause.title}</h3>
                <p className="cause-item__desc">{cause.desc}</p>

                <div className="cause-item__progress">
                  <div className="cause-item__progress-bar">
                    <div
                      className="cause-item__progress-fill"
                      ref={(el) => (fillsRef.current[i] = el)}
                    />
                  </div>

                  <div className="cause-item__progress-label">
                    <span>
                      <span
                        className="pct-counter"
                        ref={(el) => (counterRefs.current[i] = el)}
                      >
                        0%
                      </span>{" "}
                      raised
                    </span>
                    <span>Goal: {cause.goal}</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="cause-item__meta">
                <div className="cause-item__goal">
                  Goal: <span>{cause.goal}</span>
                </div>
                <a
                  href={cause.id ? `/causes#campaign-${cause.id}` : "/causes"}
                  className="cause-item__cta"
                  onClick={(e) => handleCauseCta(e, cause)}
                >
                  {cause.cta} <span className="heart">♥</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="causes__view-all">
          <a href="/causes" className="btn-primary" onClick={handleViewAll}>
            View All Causes →
          </a>
        </div>
      </div>
    </section>
  );
}