// src/components/NewsPage/StoryDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiCalendar, FiClock, FiShare2,
  FiTwitter, FiFacebook, FiLink, FiTag,
} from "react-icons/fi";
import "./StoryDetail.css";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const CATEGORY_COLORS = {
  Stories:   { bg: "var(--green-pale)",    color: "var(--green-deep)" },
  Updates:   { bg: "rgba(90,158,58,0.12)", color: "var(--green-deep)" },
  Education: { bg: "var(--cream)",          color: "#7a5c2e"           },
  Events:    { bg: "#fef3e2",              color: "#c27c1a"           },
};

function SimpleContent({ text }) {
  if (!text) return null;
  return (
    <div className="sd-content">
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>
          {para.split(/\n/).map((line, j) => (
            <span key={j}>
              {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((chunk, k) => {
                if (/^\*\*[^*]+\*\*$/.test(chunk))
                  return <strong key={k}>{chunk.slice(2, -2)}</strong>;
                if (/^\*[^*]+\*$/.test(chunk))
                  return <em key={k}>{chunk.slice(1, -1)}</em>;
                return chunk;
              })}
              {j < para.split(/\n/).length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function StoryDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [story,   setStory]   = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    fetch(`${API}/stories/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`Story not found (${r.status})`);
        return r.json();
      })
      .then(data => {
        const s = data.story ?? data.data ?? data;
        setStory(s);
        setLoading(false);
        const params = new URLSearchParams({ published: "true", per_page: "4", category: s.category });
        return fetch(`${API}/stories?${params}`);
      })
      .then(r => r.json())
      .then(data => {
        const all = data.stories ?? [];
        setRelated(all.filter(s => String(s.id) !== String(id)).slice(0, 3));
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  const pageUrl   = window.location.href;
  const pageTitle = story?.title ?? "";

  const shareTwitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="sd-state-wrap">
        <div className="sd-spinner" />
        <p>Loading story…</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="sd-state-wrap sd-state-wrap--error">
        <p className="sd-error-msg">{error ?? "Story not found."}</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const catStyle = CATEGORY_COLORS[story.category] ?? {};

  return (
    <div className="sd-root">

      {/* ── Page wrapper ── */}
      <div className="sd-page-wrap container">

        {/* ── Breadcrumb ── */}
        <div className="sd-breadcrumb">
          <Link to="/news" className="sd-back-link">
            <FiArrowLeft size={14} /> Back to News
          </Link>
        </div>

        {/* ── Two-column layout: article + sidebar ── */}
        <div className="sd-layout">

          {/* ── Main article card ── */}
          <article className="sd-card">

            {/* Cover image — contained inside the card */}
            {story.cover_image && (
              <div className="sd-card__img-wrap">
                <img src={story.cover_image} alt={story.title} className="sd-card__img" />
                <span className="sd-card__cat-badge" style={catStyle}>
                  <FiTag size={10} /> {story.category}
                </span>
              </div>
            )}

            <div className="sd-card__body">

              {/* Meta */}
              <div className="sd-meta">
                {!story.cover_image && (
                  <span className="sd-cat-pill" style={catStyle}>
                    <FiTag size={10} /> {story.category}
                  </span>
                )}
                <span className="sd-meta-item">
                  <FiCalendar size={12} />
                  {story.date_display ?? story.date ?? "—"}
                </span>
                <span className="sd-meta-item">
                  <FiClock size={12} />
                  {story.read_time ?? "—"}
                </span>
              </div>

              {/* Title */}
              <h1 className="sd-title">{story.title}</h1>

              {/* Lead */}
              {story.excerpt && <p className="sd-lead">{story.excerpt}</p>}

              <div className="sd-divider" />

              {/* Content */}
              {story.content
                ? <SimpleContent text={story.content} />
                : <p className="sd-no-content">Full article content is not available yet.</p>
              }

              {/* Share bar */}
              <div className="sd-share">
                <span className="sd-share__label">
                  <FiShare2 size={13} /> Share
                </span>
                <div className="sd-share__buttons">
                  <button className="sd-share-btn sd-share-btn--twitter"  onClick={shareTwitter}  title="Share on Twitter">
                    <FiTwitter size={14} /> Twitter
                  </button>
                  <button className="sd-share-btn sd-share-btn--facebook" onClick={shareFacebook} title="Share on Facebook">
                    <FiFacebook size={14} /> Facebook
                  </button>
                  <button className="sd-share-btn sd-share-btn--copy"     onClick={copyLink}      title="Copy link">
                    <FiLink size={14} /> {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

            </div>
          </article>

          {/* ── Sidebar ── */}
          {related.length > 0 && (
            <aside className="sd-sidebar">
              <h3 className="sd-sidebar__heading">More in {story.category}</h3>
              <div className="sd-sidebar__list">
                {related.map(r => (
                  <Link to={`/stories/${r.id}`} key={r.id} className="sd-sidebar-card">
                    {r.cover_image ? (
                      <img src={r.cover_image} alt={r.title} className="sd-sidebar-card__img" />
                    ) : (
                      <div className="sd-sidebar-card__img sd-sidebar-card__img--placeholder">
                        <span>{r.title[0]}</span>
                      </div>
                    )}
                    <div className="sd-sidebar-card__body">
                      <span className="sd-sidebar-card__cat" style={CATEGORY_COLORS[r.category]}>
                        {r.category}
                      </span>
                      <h4 className="sd-sidebar-card__title">{r.title}</h4>
                      <span className="sd-sidebar-card__meta">
                        <FiClock size={11} /> {r.read_time}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}