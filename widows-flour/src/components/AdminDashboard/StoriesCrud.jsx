// src/components/AdminDashboard/StoriesCrud.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX,
  FiEye, FiEyeOff, FiStar, FiLoader,
} from "react-icons/fi";
import "./Crud.css";
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

// Maps category to a crud__badge colour modifier
function categoryBadgeClass(category) {
  const map = {
    stories:   "green",
    updates:   "green",
    education: "yellow",
    events:    "blue",
  };
  return map[category?.toLowerCase()] ?? "grey";
}

function CategoryBadge({ category }) {
  return (
    <span className={`crud__badge crud__badge--${categoryBadgeClass(category)}`}>
      {category}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="crud__modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="crud__modal">
        <div className="crud__modal-header">
          <h2 className="crud__modal-title">{title}</h2>
          <button className="crud__modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>
        <div className="crud__modal-body">{children}</div>
      </div>
    </div>
  );
}

function StoryForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Title */}
      <div className="crud__field">
        <label>
          Title <span style={{ color: "#e74c3c" }}>*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder="Enter story title…"
        />
      </div>

      {/* Category + Read Time */}
      <div className="crud__fields-row">
        <div className="crud__field">
          <label>
            Category <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <select
            value={form.category}
            onChange={e => set("category", e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="crud__field">
          <label>Read Time</label>
          <input
            type="text"
            value={form.read_time}
            onChange={e => set("read_time", e.target.value)}
            placeholder="e.g. 4 min read"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div className="crud__field">
        <label>
          Excerpt <span style={{ color: "#e74c3c" }}>*</span>{" "}
          <span style={{ fontWeight: 400, textTransform: "none", color: "#9aab8a" }}>
            — shown on the news card
          </span>
        </label>
        <textarea
          rows={3}
          value={form.excerpt}
          onChange={e => set("excerpt", e.target.value)}
          placeholder="A short summary visible on the news listing…"
        />
      </div>

      {/* Full Content */}
      <div className="crud__field">
        <label>
          Full Content{" "}
          <span style={{ fontWeight: 400, textTransform: "none", color: "#9aab8a" }}>
            — optional, for a detail page
          </span>
        </label>
        <textarea
          rows={7}
          style={{ minHeight: 140 }}
          value={form.content}
          onChange={e => set("content", e.target.value)}
          placeholder="Full story body. Markdown is supported…"
        />
      </div>

      {/* Cover Image */}
      <div className="crud__field">
        <ImageUploader
          label="Cover Image"
          value={form.cover_image}
          onChange={(url) => set("cover_image", url)}
          folder="stories"
        />
      </div>

      {/* Featured / Published toggles */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          ["featured",  FiStar, "Featured",  "Shown as the hero card on the news page"],
          ["published", FiEye,  "Published", "Visible to the public"],
        ].map(([key, Icon, label, hint]) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1.5px solid ${form[key] ? "var(--green-deep, #5a9e3a)" : "#dde8d4"}`,
              background: form[key] ? "rgba(90,158,58,0.06)" : "#f9fdf5",
              cursor: "pointer",
              flex: 1,
              minWidth: 180,
              transition: "border-color 0.18s, background 0.18s",
            }}
          >
            <input
              type="checkbox"
              checked={form[key]}
              onChange={e => set(key, e.target.checked)}
              style={{ display: "none" }}
            />
            <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
              <Icon size={16} />
            </span>
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a10" }}>{label}</span>
              <span style={{ fontSize: 11, color: "#9aab8a", marginTop: 1 }}>{hint}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="crud__modal-footer" style={{ padding: "20px 0 0", margin: 0 }}>
        <button className="crud__btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button
          className="crud__btn-save"
          onClick={() => onSave(form)}
          disabled={loading}
        >
          {loading && (
            <FiLoader
              size={14}
              style={{
                marginRight: 6,
                animation: "spin 0.65s linear infinite",
                display: "inline-block",
              }}
            />
          )}
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
    <div>
      {/* ── Header ── */}
      <div className="crud__toolbar">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a3a10", letterSpacing: "-0.3px" }}>
            Stories &amp; News
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="crud__badge crud__badge--grey">{stories.length} total</span>
            <span className="crud__badge crud__badge--green">{totalPublished} published</span>
            <span className="crud__badge crud__badge--yellow">{totalFeatured} featured</span>
          </div>
        </div>
        <button className="crud__btn-add" onClick={() => setModal("create")}>
          <FiPlus size={16} /> New Story
        </button>
      </div>

      {/* ── Filters + Search toolbar ── */}
      <div className="crud__toolbar" style={{ marginBottom: 20 }}>
        <div className="crud__toolbar-left" style={{ flexWrap: "wrap" }}>
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: `1.5px solid ${filter === cat ? "var(--green-deep, #5a9e3a)" : "#dde8d4"}`,
                fontSize: 13,
                fontWeight: filter === cat ? 700 : 500,
                cursor: "pointer",
                background: filter === cat ? "var(--green-deep, #5a9e3a)" : "#fff",
                color: filter === cat ? "#fff" : "#555",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                fontFamily: "inherit",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <FiSearch
            size={14}
            style={{ position: "absolute", left: 12, color: "#9aab8a", pointerEvents: "none" }}
          />
          <input
            className="crud__search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stories…"
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* ── Feedback states ── */}
      {loading && (
        <div className="crud__loading">Loading stories…</div>
      )}
      {error && !loading && (
        <div className="crud__modal-error">⚠ {error}</div>
      )}

      {/* ── Table ── */}
      {!loading && !error && (
        <div className="crud__card">
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Featured</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="crud__empty">
                        <div className="crud__empty-icon">📭</div>
                        <p>No stories match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map(s => (
                    <tr key={s.id}>
                      {/* Title + excerpt */}
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          <span style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#1a3a10",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}>
                            {s.featured && (
                              <FiStar size={13} style={{ color: "#f0a500", flexShrink: 0 }} />
                            )}
                            {s.title}
                          </span>
                          <span style={{
                            fontSize: 11.5,
                            color: "#9aab8a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {s.excerpt}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <CategoryBadge category={s.category} />
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: 12, color: "#8a9e7a", whiteSpace: "nowrap" }}>
                        {s.date_display ?? fmtDate(s.date)}
                      </td>

                      {/* Featured toggle */}
                      <td>
                        <button
                          onClick={() => toggleField(s, "feature")}
                          title={s.featured ? "Remove featured" : "Set as featured"}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: "2px 4px",
                            borderRadius: 6,
                            opacity: s.featured ? 1 : 0.25,
                            color: s.featured ? "#f0a500" : "inherit",
                            transition: "opacity 0.18s, transform 0.15s",
                            lineHeight: 1,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "scale(1.15)"; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = s.featured ? "1" : "0.25"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <FiStar size={15} />
                        </button>
                      </td>

                      {/* Published toggle */}
                      <td>
                        <button
                          onClick={() => toggleField(s, "publish")}
                          title={s.published ? "Unpublish" : "Publish"}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: "2px 4px",
                            borderRadius: 6,
                            opacity: s.published ? 1 : 0.25,
                            color: s.published ? "#27ae60" : "inherit",
                            transition: "opacity 0.18s, transform 0.15s",
                            lineHeight: 1,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "scale(1.15)"; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = s.published ? "1" : "0.25"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          {s.published ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="crud__actions">
                          <button
                            className="crud__btn-edit"
                            onClick={() => { setEditing(s); setModal("edit"); }}
                          >
                            <FiEdit2 size={12} style={{ marginRight: 4 }} /> Edit
                          </button>
                          <button
                            className="crud__btn-delete"
                            onClick={() => setConfirm(s)}
                          >
                            <FiTrash2 size={12} style={{ marginRight: 4 }} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create modal ── */}
      {modal === "create" && (
        <Modal title="New Story" onClose={closeModal}>
          <StoryForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={closeModal}
            loading={saving}
          />
        </Modal>
      )}

      {/* ── Edit modal ── */}
      {modal === "edit" && editing && (
        <Modal title="Edit Story" onClose={closeModal}>
          <StoryForm
            initial={editing}
            onSave={handleUpdate}
            onCancel={closeModal}
            loading={saving}
          />
        </Modal>
      )}

      {/* ── Delete confirm modal ── */}
      {confirm && (
        <Modal title="Delete Story" onClose={() => setConfirm(null)}>
          <div className="crud__delete-confirm">
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>"{confirm.title}"</strong>? This cannot be undone.
            </p>
            <div className="crud__modal-footer" style={{ justifyContent: "flex-end", padding: "16px 0 0", border: "none" }}>
              <button className="crud__btn-cancel" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className="crud__btn-delete-confirm"
                onClick={() => handleDelete(confirm)}
                disabled={saving}
              >
                {saving ? (
                  <FiLoader
                    size={14}
                    style={{
                      marginRight: 6,
                      animation: "spin 0.65s linear infinite",
                      display: "inline-block",
                    }}
                  />
                ) : (
                  <FiTrash2 size={14} style={{ marginRight: 6 }} />
                )}
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}