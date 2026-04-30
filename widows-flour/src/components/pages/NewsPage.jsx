import { useState } from "react";
import "./NewsPage.css";

const POSTS = [
  {
    id: 1,
    category: "Stories",
    date: "April 18, 2025",
    title: "How One Widow's Resilience Sparked a Community Movement",
    excerpt:
      "After losing her husband, Wanjiru Kamau refused to let grief define her. With support from Widows Flour, she started a small bakery that now employs six other widows in Eldoret.",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    category: "Updates",
    date: "April 10, 2025",
    title: "Q1 2025 Impact Report: 340 Families Reached",
    excerpt:
      "Our first quarter saw record-breaking support. Here's a transparent breakdown of every shilling donated and exactly how it was spent across our four programme areas.",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 3,
    category: "Education",
    date: "March 28, 2025",
    title: "Twelve Bursaries Awarded This Term — Meet the Students",
    excerpt:
      "Education is the most powerful tool we can give a child. This term we funded twelve secondary school bursaries for children of widowed mothers across Uasin Gishu County.",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: 4,
    category: "Events",
    date: "March 14, 2025",
    title: "Annual Fundraising Walk Raises Over KES 800,000",
    excerpt:
      "Hundreds of supporters walked 10km through Eldoret's hills to raise funds for our Food Relief programme. The energy and generosity were nothing short of extraordinary.",
    readTime: "3 min read",
    featured: false,
  },
  {
    id: 5,
    category: "Stories",
    date: "February 22, 2025",
    title: "From Flour to Flourishing: Grace's Journey",
    excerpt:
      "Grace received her first food parcel three years ago. Today she runs a small tailoring business and mentors other widows. This is her story, in her own words.",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 6,
    category: "Updates",
    date: "February 5, 2025",
    title: "New Partnership with Moi Teaching & Referral Hospital",
    excerpt:
      "We're proud to announce a health partnership that will provide free medical check-ups to over 200 widowed mothers and their children every quarter.",
    readTime: "3 min read",
    featured: false,
  },
];

const CATEGORIES = ["All", "Stories", "Updates", "Education", "Events"];

const CATEGORY_COLORS = {
  Stories:   { bg: "var(--green-pale)",  color: "var(--green-deep)" },
  Updates:   { bg: "rgba(90,158,58,0.12)", color: "var(--green-deep)" },
  Education: { bg: "var(--cream)",       color: "#7a5c2e" },
  Events:    { bg: "#fef3e2",            color: "#c27c1a" },
};

export default function NewsPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? POSTS : POSTS.filter(p => p.category === active);
  const featured = filtered.find(p => p.featured) ?? filtered[0];
  const rest     = filtered.filter(p => p.id !== featured?.id);

  return (
    <main className="news-page">
      {/* Hero */}
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

      {/* Filters */}
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

      <div className="news-content container">
        {/* Featured post */}
        {featured && (
          <article className="news-featured">
            <div className="news-featured__img-wrap">
              <div className="news-featured__img-placeholder">
                <span className="news-featured__big-letter">{featured.title[0]}</span>
              </div>
            </div>
            <div className="news-featured__body">
              <div className="news-featured__meta">
                <span
                  className="news-cat-pill"
                  style={CATEGORY_COLORS[featured.category]}
                >
                  {featured.category}
                </span>
                <span className="news-date">{featured.date}</span>
                <span className="news-read-time">{featured.readTime}</span>
              </div>
              <h2 className="news-featured__title">{featured.title}</h2>
              <p className="news-featured__excerpt">{featured.excerpt}</p>
              <a href="#" className="btn-primary news-read-btn">
                Read Full Story
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </article>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="news-grid">
            {rest.map(post => (
              <article key={post.id} className="news-card">
                <div className="news-card__img-placeholder">
                  <span className="news-card__big-letter">{post.title[0]}</span>
                </div>
                <div className="news-card__body">
                  <div className="news-card__meta">
                    <span
                      className="news-cat-pill"
                      style={CATEGORY_COLORS[post.category]}
                    >
                      {post.category}
                    </span>
                    <span className="news-read-time">{post.readTime}</span>
                  </div>
                  <h3 className="news-card__title">{post.title}</h3>
                  <p className="news-card__excerpt">{post.excerpt}</p>
                  <div className="news-card__footer">
                    <span className="news-date">{post.date}</span>
                    <a href="#" className="news-card__link">
                      Read more →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="news-empty">
            <p>No posts in this category yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}