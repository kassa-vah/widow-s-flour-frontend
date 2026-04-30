// src/components/CausesSection/CausesSection.jsx
// Home-page teaser section — shows up to 3 active campaigns fetched from the DB.
// "See All Causes" navigates to /causes (CampaignsPage).
//
// Uses react-router-dom <Link> — swap for <a href="/causes"> if not using router.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";   // ← remove if not using react-router
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CausesSection.css";

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

/* ── Fallback placeholder data (shown while loading or on error) ── */
const FALLBACK_CAUSES = [
  {
    id: null,
    category: "Food Relief",
    title: "Monthly Flour Basket Program",
    desc: "Delivering 10kg flour parcels and staple goods to widows and their children every month — ensuring no family faces an empty kitchen.",
    goal: "KSH 60,000",
    raised: 72,
    cta: "Give a Meal",
    emoji: "🌾",
  },
  {
    id: null,
    category: "Education",
    title: "Education Fund for Children of Widows",
    desc: "Funding school fees, uniforms, books, and learning materials so that children raised by single widowed mothers can access quality education.",
    goal: "KSH 183,000",
    raised: 54,
    cta: "Build Schools",
    emoji: "📚",
  },
  {
    id: null,
    category: "Livelihood",
    title: "Skills & Small Business Training",
    desc: "Empowering widows with vocational skills — baking, sewing, agribusiness — so they can build income and independence for their families.",
    goal: "KSH 45,000",
    raised: 38,
    cta: "Empower Now",
    emoji: "🌱",
  },
];

/* ── Map a campaign from the API into the shape the section expects ── */
function normalise(c) {
  const raised = c.raised_amount ?? 0;
  const goal   = c.goal_amount   ?? 1;
  const pct    = c.progress_percent ?? Math.round((raised / goal) * 100);
  return {
    id:       c.id,
    category: c.category ?? c.beneficiary?.category ?? "Cause",
    title:    c.title,
    desc:     c.description ?? "Your support changes lives.",
    goal:     `KES ${Number(goal).toLocaleString()}`,
    raised:   pct,
    cta:      c.cta_label ?? "Donate Now",
    emoji:    null,
    img:      c.image_url ?? c.beneficiary?.profile_image ?? null,
  };
}

export default function CausesSection() {
  const sectionRef = useRef(null);
  const itemsRef   = useRef([]);
  const fillsRef   = useRef([]);

  const [causes, setCauses] = useState(FALLBACK_CAUSES);

  /* Fetch first 3 active campaigns */
  useEffect(() => {
    fetch(`${API}/campaigns/public?per_page=3&status=active`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const items = d?.data?.items ?? d?.data ?? null;
        if (items && items.length > 0) {
          setCauses(items.slice(0, 3).map(normalise));
        }
        // else keep fallback
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  /* GSAP animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        if (!item) return;
        gsap.fromTo(item,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%" } }
        );
      });

      fillsRef.current.forEach((fill, i) => {
        if (!fill) return;
        const pct = causes[i]?.raised || 50;
        gsap.fromTo(fill,
          { scaleX: 0 },
          { scaleX: pct / 100, duration: 1.4, ease: "power3.out",
            scrollTrigger: { trigger: fill, start: "top 85%" } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [causes]);

  return (
    <section id="causes" className="causes-section" ref={sectionRef}>
      <div className="causes-container">

        <div className="causes__header">
          <div>
            <span className="tag-pill">Our Causes</span>
            <h2 className="causes__headline" style={{ marginTop: 16 }}>
              Where Your Gift<br />Goes to Work
            </h2>
          </div>
          <div className="causes__header-right">
            <p>Every donation is directed toward verified, transparent causes that change real lives.</p>
            {/* ── Swap <Link> for <a href="/causes"> if not using react-router ── */}
            <Link to="/causes" className="btn-primary">
              See All Causes →
            </Link>
          </div>
        </div>

        <div className="causes__list">
          {causes.map((cause, i) => (
            <div
              key={cause.id ?? i}
              className="cause-item"
              ref={(el) => (itemsRef.current[i] = el)}
            >
              {/* Image or emoji placeholder */}
              <div className="cause-item__image">
                {cause.img
                  ? <img src={cause.img} alt={cause.title} />
                  : <div className="cause-item__image-placeholder">
                      <span>{cause.emoji || "💛"}</span>
                    </div>
                }
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
                {/* Link to the full causes page, anchored to this campaign if it has an id */}
                <Link
                  to={cause.id ? `/causes#campaign-${cause.id}` : "/causes"}
                  className="cause-item__cta"
                >
                  {cause.cta} <span className="heart">♥</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View all link below the list on mobile */}
        <div className="causes__view-all">
          <Link to="/causes" className="btn-primary">
            View All Causes →
          </Link>
        </div>

      </div>
    </section>
  );
}