// src/components/NewsPage/NewsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiCalendar } from "react-icons/fi";
import "./NewsPage.css";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const CATEGORIES = ["All", "Stories", "Updates", "Education", "Events"];

const CATEGORY_COLORS = {
  Stories:   { bg: "var(--green-pale)",      color: "var(--green-deep)" },
  Updates:   { bg: "rgba(90,158,58,0.12)",   color: "var(--green-deep)" },
  Education: { bg: "var(--cream)",            color: "#7a5c2e"           },
  Events:    { bg: "#fef3e2",                color: "#c27c1a"           },
};

export default function NewsPage() {
  const [active,  setActive]  = useState("All");
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ published: "true", per_page: "50" });
    if (active !== "All") params.set("category", active);

    fetch(`${API}/stories?${params}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setPosts(data.stories ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load stories. Please try again later.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [active]);

  const featured = posts.find(p => p.featured) ?? posts[0];
  const rest     = posts.filter(p => p.id !== featured?.id);

  return (
    <main className="news-page">

      {/* ── Hero ── */}
      <section className="news-hero">
        <div className="news-hero__inner">
          <span className="tag-pill">News &amp; Blog</span>
          <h1 className="news-hero__headline">
            Stories That<br /><em>Matter</em>
          </h1>
          <p className="news-hero__sub">
            Real lives. Real change. Read the latest from our community,
            campaigns, and the families we serve together.
          </p>
        </div>
        <div className="news-hero__stripe" aria-hidden />
      </section>

      {/* ── Filters ── */}
      <div className="news-filters-wrap">
        <div className="news-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`news-filter-btn${active === cat ? " is-active" : ""}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="news-content container">

        {loading && (
          <div className="news-empty"><p>Loading stories…</p></div>
        )}

        {error && !loading && (
          <div className="news-empty">
            <p style={{ color: "#c0392b" }}>{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="news-empty">
            <p>No posts in this category yet.</p>
          </div>
        )}

        {/* ── Featured post ── */}
        {!loading && !error && featured && (
          <article className="news-featured">
            <div className="news-featured__img-wrap">
              {featured.cover_image ? (
                <img
                  src={featured.cover_image}
                  alt={featured.title}
                  className="news-featured__img"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="news-featured__img-placeholder">
                  <span className="news-featured__big-letter">{featured.title[0]}</span>
                </div>
              )}
            </div>

            <div className="news-featured__body">
              <div className="news-featured__meta">
                <span className="news-cat-pill" style={CATEGORY_COLORS[featured.category]}>
                  {featured.category}
                </span>
                <span className="news-date">
                  <FiCalendar size={12} style={{ marginRight: 4 }} />
                  {featured.date_display ?? featured.date}
                </span>
                <span className="news-read-time">
                  <FiClock size={12} style={{ marginRight: 4 }} />
                  {featured.read_time}
                </span>
              </div>
              <h2 className="news-featured__title">{featured.title}</h2>
              <p className="news-featured__excerpt">{featured.excerpt}</p>
              {/* ✅ Use Link — no page reload */}
              <Link to={`/stories/${featured.id}`} className="btn-primary news-read-btn">
                Read Full Story
                <FiArrowRight size={16} />
              </Link>
            </div>
          </article>
        )}

        {/* ── Grid ── */}
        {!loading && !error && rest.length > 0 && (
          <div className="news-grid">
            {rest.map(post => (
              <article key={post.id} className="news-card">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="news-card__img-placeholder"
                    style={{ objectFit: "cover", width: "100%" }}
                  />
                ) : (
                  <div className="news-card__img-placeholder">
                    <span className="news-card__big-letter">{post.title[0]}</span>
                  </div>
                )}

                <div className="news-card__body">
                  <div className="news-card__meta">
                    <span className="news-cat-pill" style={CATEGORY_COLORS[post.category]}>
                      {post.category}
                    </span>
                    <span className="news-read-time">
                      <FiClock size={12} style={{ marginRight: 4 }} />
                      {post.read_time}
                    </span>
                  </div>
                  <h3 className="news-card__title">{post.title}</h3>
                  <p className="news-card__excerpt">{post.excerpt}</p>
                  <div className="news-card__footer">
                    <span className="news-date">
                      <FiCalendar size={12} style={{ marginRight: 4 }} />
                      {post.date_display ?? post.date}
                    </span>
                    <Link to={`/stories/${post.id}`} className="news-card__link">
                      Read more <FiArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}