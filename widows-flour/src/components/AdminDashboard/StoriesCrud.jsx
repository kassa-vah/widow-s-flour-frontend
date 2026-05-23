// src/components/AdminDashboard/StoriesCrud.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX,
  FiEye, FiEyeOff, FiStar, FiLoader,
} from "react-icons/fi";
import "./StoriesCrud.css";
import ImageUploader from "./ImageUploader";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

const CATEGORIES = ["Stories", "Updates", "Education", "Events"];

const EMPTY_FORM = {
  title: "", category: "Stories", excerpt: "", content: "",
  cover_image: "", read_time: "3 min read", featured: false, published: false,
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function CategoryPill({ category }) {
  return (
    <span className={`sc-cat-pill sc-cat-pill--${category?.toLowerCase()}`}>
      {category}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="sc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sc-modal">
        <div className="sc-modal__header">
          <h2 className="sc-modal__title">{title}</h2>
          <button className="sc-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>
        <div className="sc-modal__body">{children}</div>
      </div>
    </div>
  );
}

function StoryForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="sc-form">
      <div className="sc-form__field">
        <label className="sc-form__label">Title <span className="sc-form__required">*</span></label>
        <input
          className="sc-form__input"
          type="text"
          value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder="Enter story title…"
        />
      </div>

      <div className="sc-form__row">
        <div className="sc-form__field">
          <label className="sc-form__label">Category <span className="sc-form__required">*</span></label>
          <select
            className="sc-form__input sc-form__select"
            value={form.category}
            onChange={e => set("category", e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="sc-form__field">
          <label className="sc-form__label">Read Time</label>
          <input
            className="sc-form__input"
            type="text"
            value={form.read_time}
            onChange={e => set("read_time", e.target.value)}
            placeholder="e.g. 4 min read"
          />
        </div>
      </div>

      <div className="sc-form__field">
        <label className="sc-form__label">
          Excerpt <span className="sc-form__required">*</span>
          <span className="sc-form__hint"> — shown on the news card</span>
        </label>
        <textarea
          className="sc-form__input sc-form__textarea"
          rows={3}
          value={form.excerpt}
          onChange={e => set("excerpt", e.target.value)}
          placeholder="A short summary visible on the news listing…"
        />
      </div>

      <div className="sc-form__field">
        <label className="sc-form__label">
          Full Content
          <span className="sc-form__hint"> — optional, for a detail page</span>
        </label>
        <textarea
          className="sc-form__input sc-form__textarea sc-form__textarea--tall"
          rows={7}
          value={form.content}
          onChange={e => set("content", e.target.value)}
          placeholder="Full story body. Markdown is supported…"
        />
      </div>

      {/* ── Cloudinary image uploader ── */}
      <div className="sc-form__field">
        <ImageUploader
          label="Cover Image"
          value={form.cover_image}
          onChange={(url) => set("cover_image", url)}
          folder="stories"
        />
      </div>

      <div className="sc-form__toggles">
        {[
          ["featured", FiStar, "Featured",  "Shown as the hero card on the news page"],
          ["published", FiEye, "Published", "Visible to the public"],
        ].map(([key, Icon, label, hint]) => (
          <label key={key} className={`sc-toggle ${form[key] ? "sc-toggle--on" : ""}`}>
            <input
              type="checkbox"
              checked={form[key]}
              onChange={e => set(key, e.target.checked)}
              className="sc-toggle__input"
            />
            <span className="sc-toggle__icon"><Icon size={16} /></span>
            <span className="sc-toggle__text">
              <span className="sc-toggle__label">{label}</span>
              <span className="sc-toggle__hint">{hint}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="sc-form__actions">
        <button className="sc-btn sc-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button
          className="sc-btn sc-btn--primary"
          onClick={() => onSave(form)}
          disabled={loading}
        >
          {loading ? <FiLoader size={14} className="sc-spin" /> : null}
          {loading ? "Saving…" : "Save Story"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function StoriesCrud({ token }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filter,  setFilter]  = useState("All");
  const [search,  setSearch]  = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchStories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/admin/stories?per_page=50`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to load stories.");
      setStories(data.stories ?? data.data ?? []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const visible = stories.filter(s => {
    const catOk  = filter === "All" || s.category === filter;
    const termLc = search.toLowerCase();
    const srchOk = !search
      || s.title.toLowerCase().includes(termLc)
      || (s.excerpt ?? "").toLowerCase().includes(termLc);
    return catOk && srchOk;
  });

  const closeModal   = () => { setModal(null); setEditing(null); };
  const extractStory = (data) => data.story ?? data.data ?? data;

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/stories`, { method: "POST", headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Create failed.");
      setStories(prev => [extractStory(data), ...prev]);
      closeModal();
    } catch (e) { alert(e.message); }
    finally     { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/stories/${editing.id}`, { method: "PUT", headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Update failed.");
      const updated = extractStory(data);
      setStories(prev => prev.map(s => s.id === updated.id ? updated : s));
      closeModal();
    } catch (e) { alert(e.message); }
    finally     { setSaving(false); }
  };

  const handleDelete = async (story) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/stories/${story.id}`, { method: "DELETE", headers });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? "Delete failed."); }
      setStories(prev => prev.filter(s => s.id !== story.id));
      setConfirm(null);
    } catch (e) { alert(e.message); }
    finally     { setSaving(false); }
  };

  const toggleField = async (story, endpoint) => {
    try {
      const res  = await fetch(`${API}/stories/${story.id}/${endpoint}`, { method: "PATCH", headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Toggle failed.");
      const patch = data.data ?? data;
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, ...patch } : s));
    } catch (e) { alert(e.message); }
  };

  const totalPublished = stories.filter(s => s.published).length;
  const totalFeatured  = stories.filter(s => s.featured).length;

  return (
    <div className="sc-root">
      <div className="sc-header">
        <div className="sc-header__left">
          <h2 className="sc-header__title">Stories &amp; News</h2>
          <div className="sc-header__stats">
            <span className="sc-stat">{stories.length} total</span>
            <span className="sc-stat sc-stat--green">{totalPublished} published</span>
            <span className="sc-stat sc-stat--gold">{totalFeatured} featured</span>
          </div>
        </div>
        <button className="sc-btn sc-btn--primary" onClick={() => setModal("create")}>
          <FiPlus size={16} /> New Story
        </button>
      </div>

      <div className="sc-toolbar">
        <div className="sc-filters">
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`sc-filter-btn ${filter === cat ? "sc-filter-btn--active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="sc-search-wrap">
          <FiSearch size={14} className="sc-search-icon" />
          <input
            className="sc-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stories…"
          />
        </div>
      </div>

      {loading && <div className="sc-empty">Loading stories…</div>}
      {error && !loading && <div className="sc-error">⚠ {error}</div>}

      {!loading && !error && (
        <div className="sc-table-wrap">
          <div className="sc-table">
            <div className="sc-table__head">
              <span>Title</span>
              <span>Category</span>
              <span>Date</span>
              <span>Featured</span>
              <span>Published</span>
              <span>Actions</span>
            </div>

            {visible.length === 0 && (
              <div className="sc-empty sc-empty--inline">No stories match your filters.</div>
            )}

            {visible.map(s => (
              <div key={s.id} className="sc-table__row">
                <div className="sc-table__title-cell">
                  <span className="sc-table__title">
                    {s.featured && <FiStar size={13} className="sc-star-icon" />}
                    {s.title}
                  </span>
                  <span className="sc-table__excerpt">{s.excerpt}</span>
                </div>
                <div><CategoryPill category={s.category} /></div>
                <span className="sc-table__date">{s.date_display ?? fmtDate(s.date)}</span>
                <button
                  className={`sc-icon-btn ${s.featured ? "sc-icon-btn--active" : ""}`}
                  title={s.featured ? "Remove featured" : "Set as featured"}
                  onClick={() => toggleField(s, "feature")}
                >
                  <FiStar size={15} />
                </button>
                <button
                  className={`sc-icon-btn ${s.published ? "sc-icon-btn--green" : "sc-icon-btn--muted"}`}
                  title={s.published ? "Unpublish" : "Publish"}
                  onClick={() => toggleField(s, "publish")}
                >
                  {s.published ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                </button>
                <div className="sc-table__actions">
                  <button className="sc-btn sc-btn--sm sc-btn--ghost" onClick={() => { setEditing(s); setModal("edit"); }}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button className="sc-btn sc-btn--sm sc-btn--danger" onClick={() => setConfirm(s)}>
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal === "create" && (
        <Modal title="New Story" onClose={closeModal}>
          <StoryForm initial={EMPTY_FORM} onSave={handleCreate} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {modal === "edit" && editing && (
        <Modal title="Edit Story" onClose={closeModal}>
          <StoryForm initial={editing} onSave={handleUpdate} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {confirm && (
        <Modal title="Delete Story" onClose={() => setConfirm(null)}>
          <p className="sc-confirm__msg">
            Are you sure you want to permanently delete <strong>"{confirm.title}"</strong>? This cannot be undone.
          </p>
          <div className="sc-confirm__actions">
            <button className="sc-btn sc-btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="sc-btn sc-btn--delete" onClick={() => handleDelete(confirm)} disabled={saving}>
              {saving ? <FiLoader size={14} className="sc-spin" /> : <FiTrash2 size={14} />}
              {saving ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}