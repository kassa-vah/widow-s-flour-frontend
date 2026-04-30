import { useState, useEffect, useRef, useCallback } from "react";
import DonationMethods from "../components/DonationMethods";
import "./CampaignsPage.css";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

/* ── Helpers ── */
function fmtKES(n) {
  return `KES ${Number(n ?? 0).toLocaleString()}`;
}

const CATEGORY_ICONS = {
  "Food Relief": "🌾",
  "Education":   "📚",
  "Livelihood":  "🌱",
  "Health":      "🏥",
  "default":     "💛",
};

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;
}

/* ── Progress Ring ── */
function ProgressRing({ pct }) {
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct, 100) / 100;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="cp-ring">
      <circle cx="36" cy="36" r={r} stroke="rgba(90,158,58,0.13)" strokeWidth="5" fill="none" />
      <circle
        cx="36" cy="36" r={r}
        stroke="var(--green)"
        strokeWidth="5"
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        className="cp-ring__fill"
      />
      <text x="36" y="40" textAnchor="middle" className="cp-ring__label">{pct}%</text>
    </svg>
  );
}

/* ── Campaign Card ── */
function CampaignCard({ campaign, onDonate, featured }) {
  const pct      = campaign.progress_percent ?? Math.round((campaign.raised_amount / campaign.goal_amount) * 100);
  const ben      = campaign.beneficiary ?? {};
  const imgSrc   = campaign.image_url || ben.profile_image || null;
  const category = campaign.category || ben.category || "Cause";

  return (
    <article className={`cp-card${featured ? " cp-card--featured" : ""}`} id={`campaign-${campaign.id}`}>
      <div className="cp-card__img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={campaign.title} className="cp-card__img" />
          : <div className="cp-card__img-placeholder">
              <span>{categoryIcon(category)}</span>
            </div>
        }
        <span className="cp-card__category-pill">{category}</span>
        {featured && <span className="cp-card__featured-badge">Featured</span>}
      </div>

      <div className="cp-card__body">
        <h2 className="cp-card__title">{campaign.title}</h2>

        {ben.name && (
          <div className="cp-card__beneficiary">
            {ben.profile_image && (
              <img src={ben.profile_image} alt={ben.name} className="cp-card__ben-avatar" />
            )}
            <div>
              <span className="cp-card__ben-label">Beneficiary</span>
              <span className="cp-card__ben-name">{ben.name}</span>
              {ben.location && <span className="cp-card__ben-loc">📍 {ben.location}</span>}
            </div>
          </div>
        )}

        <ExpandableText text={campaign.description || "Your support makes a real difference."} />

        <div className="cp-card__stats">
          <ProgressRing pct={pct} />
          <div className="cp-card__stats-detail">
            <div className="cp-card__stat">
              <span className="cp-card__stat-label">Raised</span>
              <span className="cp-card__stat-value">{fmtKES(campaign.raised_amount)}</span>
            </div>
            <div className="cp-card__stat">
              <span className="cp-card__stat-label">Goal</span>
              <span className="cp-card__stat-value cp-card__stat-value--goal">{fmtKES(campaign.goal_amount)}</span>
            </div>
          </div>
        </div>

        <div className="cp-card__bar-wrap" aria-label={`${pct}% funded`}>
          <div className="cp-card__bar">
            <div className="cp-card__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        <button className="cp-card__donate-btn" onClick={() => onDonate(campaign)}>
          Donate to This Cause
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/* ── Expandable description ── */
function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const SHORT = 160;
  if (text.length <= SHORT) return <p className="cp-card__desc">{text}</p>;
  return (
    <p className="cp-card__desc">
      {expanded ? text : text.slice(0, SHORT) + "…"}
      {" "}
      <button className="cp-card__read-more" onClick={() => setExpanded(e => !e)}>
        {expanded ? "Show less" : "Read more"}
      </button>
    </p>
  );
}

/* ── Donation Modal ── */
function DonationModal({ campaign, onClose }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="cp-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="cp-modal">
        <button className="cp-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="cp-modal__header">
          <span className="cp-modal__pill">Donating to</span>
          <h3 className="cp-modal__campaign-title">{campaign.title}</h3>
          <p className="cp-modal__campaign-goal">
            {fmtKES(campaign.raised_amount)} raised of {fmtKES(campaign.goal_amount)} goal
          </p>
        </div>
        <DonationMethods
          campaignId={campaign.id}
          campaignName={campaign.title}
          onSuccess={() => { setTimeout(onClose, 3500); }}
        />
      </div>
    </div>
  );
}

/* ── Skeleton loader ── */
function SkeletonCard() {
  return (
    <div className="cp-skeleton">
      <div className="cp-skeleton__img" />
      <div className="cp-skeleton__body">
        <div className="cp-skeleton__line cp-skeleton__line--title" />
        <div className="cp-skeleton__line" />
        <div className="cp-skeleton__line cp-skeleton__line--short" />
        <div className="cp-skeleton__stats" />
        <div className="cp-skeleton__btn" />
      </div>
    </div>
  );
}

/* ── Progress dots ── */
function ProgressDots({ total, current, onDotClick }) {
  return (
    <div className="cp-dots">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`cp-dot${i === current ? " cp-dot--active" : ""}`}
          onClick={() => onDotClick(i)}
          aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ── Auto-progress bar ── */
function AutoProgressBar({ duration, running, onComplete }) {
  const barRef  = useRef(null);
  const startTs = useRef(null);
  const rafId   = useRef(null);

  useEffect(() => {
    if (!running) {
      if (barRef.current) barRef.current.style.width = "0%";
      cancelAnimationFrame(rafId.current);
      return;
    }

    startTs.current = null;

    const tick = (ts) => {
      if (!startTs.current) startTs.current = ts;
      const elapsed = ts - startTs.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (pct < 100) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [running, duration, onComplete]);

  return (
    <div className="cp-auto-bar">
      <div className="cp-auto-bar__fill" ref={barRef} />
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
const PAGE_SIZE      = 5;   // 1 featured large + 2×2 right grid
const AUTO_INTERVAL  = 30000; // 30 s

export default function CampaignsPage() {
  const [campaigns, setCampaigns]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeCampaign, setActive] = useState(null);
  const [filter, setFilter]         = useState("all");
  const [page, setPage]             = useState(0);
  const [autoKey, setAutoKey]       = useState(0); // resets progress bar

  /* ── fetch ── */
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/campaigns/public`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((d) => {
        const items = d.data?.items ?? d.data ?? [];
        setCampaigns(items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = campaigns.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const safePage   = Math.min(page, Math.max(totalPages - 1, 0));
  const pageItems  = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  /* ── navigation ── */
  const goTo = useCallback((p) => {
    setPage(p);
    setAutoKey(k => k + 1); // reset timer
  }, []);

  const prev = () => goTo(safePage === 0 ? totalPages - 1 : safePage - 1);
  const next = useCallback(() => {
    goTo(safePage === totalPages - 1 ? 0 : safePage + 1);
  }, [safePage, totalPages, goTo]);

  /* ── auto-advance ── */
  const handleAutoComplete = useCallback(() => {
    next();
  }, [next]);

  /* Reset page when filter changes */
  useEffect(() => { setPage(0); setAutoKey(k => k + 1); }, [filter]);

  return (
    <main className="cp-page">
      {/* ── Page hero ── */}
      <section className="cp-hero">
        <div className="cp-hero__inner">
          <span className="cp-hero__pill">Our Causes</span>
          <h1 className="cp-hero__headline">
            Every Gift Writes<br />
            <em>Someone's Story</em>
          </h1>
          <p className="cp-hero__sub">
            Browse our active campaigns. Choose a cause close to your heart and donate directly — 
            every shilling goes straight to the family in need.
          </p>
        </div>
        <div className="cp-hero__pattern" aria-hidden />
      </section>

      {/* ── Filters ── */}
      <div className="cp-filters-wrap">
        <div className="cp-filters">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              className={`cp-filter-btn${filter === f ? " is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Causes" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {!loading && (
            <span className="cp-filter-count">{visible.length} cause{visible.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="cp-content">
        {loading && (
          <div className="cp-grid">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="cp-error">
            <span className="cp-error__icon">⚠️</span>
            <p>Could not load campaigns: {error}</p>
            <button onClick={() => window.location.reload()} className="cp-retry-btn">Try Again</button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="cp-empty">
            <span className="cp-empty__icon">🌿</span>
            <p>No {filter !== "all" ? filter : ""} campaigns found right now.</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            {/* ── Carousel header: label + arrows ── */}
            <div className="cp-carousel-header">
              <div className="cp-carousel-header__left">
                <h2 className="cp-carousel-title">Fundraisers inspired by what you care about</h2>
                {totalPages > 1 && (
                  <AutoProgressBar
                    key={autoKey}
                    duration={AUTO_INTERVAL}
                    running={totalPages > 1}
                    onComplete={handleAutoComplete}
                  />
                )}
              </div>

              {totalPages > 1 && (
                <div className="cp-carousel-nav">
                  <button className="cp-nav-btn" onClick={prev} aria-label="Previous">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="cp-nav-btn" onClick={next} aria-label="Next">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* ── Grid ── */}
            <div className="cp-grid cp-grid--animated" key={`${safePage}-${filter}`}>
              {pageItems.map((c, i) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onDonate={(campaign) => setActive(campaign)}
                />
              ))}
            </div>

            {/* ── Dots ── */}
            {totalPages > 1 && (
              <ProgressDots total={totalPages} current={safePage} onDotClick={goTo} />
            )}
          </>
        )}
      </div>

      {/* ── General donation CTA ── */}
      {!loading && !error && (
        <section className="cp-general-donate">
          <div className="cp-general-donate__inner">
            <h2>Not sure which cause to support?</h2>
            <p>Make a general donation and we'll direct your gift where it's needed most.</p>
            <button
              className="cp-general-donate__btn"
              onClick={() => {
                const general = campaigns.find(c => c.status === "active") ?? campaigns[0];
                if (general) setActive(general);
              }}
            >
              Give Now ♥
            </button>
          </div>
        </section>
      )}

      {/* ── Donation modal ── */}
      {activeCampaign && (
        <DonationModal
          campaign={activeCampaign}
          onClose={() => setActive(null)}
        />
      )}
    </main>
  );
}