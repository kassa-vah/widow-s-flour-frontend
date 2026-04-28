// src/components/AdminDashboard/BlogCrud.jsx
import { useState, useEffect, useCallback } from "react";
import "./Crud.css";
import "./BlogCrud.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const PER_PAGE = 10;

const EMPTY_FORM = { title: "", content: "", cover_image: "", published: false };

export default function BlogCrud({ token }) {
  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filter, setFilter]     = useState("");
  const [loading, setLoading]   = useState(false);

  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [modalErr, setModalErr] = useState("");

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (filter !== "") params.set("published", filter);
    try {
      const res  = await fetch(`${API}/blogs?${params}`, { headers: headers() });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? data.pagination?.total ?? (data.data?.length ?? 0));
    } catch { setRows([]); }
    setLoading(false);
  }, [page, filter, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setModalErr(""); setModal("create"); };
  const openEdit   = (r) => {
    setSelected(r);
    setForm({
      title:       r.title,
      content:     r.content,
      cover_image: r.cover_image ?? "",
      published:   r.published,
    });
    setModalErr(""); setModal("edit");
  };
  const openDelete = (r) => { setSelected(r); setModal("delete"); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.title.trim())   { setModalErr("Title is required.");   return; }
    if (!form.content.trim()) { setModalErr("Content is required."); return; }

    setSaving(true); setModalErr("");
    try {
      const url    = modal === "edit" ? `${API}/blogs/${selected.id}` : `${API}/blogs`;
      const method = modal === "edit" ? "PUT" : "POST";

      // PUT only sends the fields the backend accepts: title, content, cover_image
      // published is handled separately via /publish and /unpublish
      const body = modal === "edit"
        ? { title: form.title, content: form.content, cover_image: form.cover_image || null }
        : { title: form.title, content: form.content, cover_image: form.cover_image || null };

      const res  = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setModalErr(data.error || "Save failed."); setSaving(false); return; }

      // If published state changed on an existing post, fire the correct PATCH endpoint
      if (modal === "edit" && form.published !== selected.published) {
        const action = form.published ? "publish" : "unpublish";
        await fetch(`${API}/blogs/${selected.id}/${action}`, {
          method: "PATCH", headers: headers(),
        });
      }

      closeModal(); load();
    } catch { setModalErr("Network error."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/blogs/${selected.id}`, { method: "DELETE", headers: headers() });
      closeModal(); load();
    } catch {}
    setSaving(false);
  };

  // FIX: use the dedicated /publish and /unpublish PATCH endpoints
  // PUT /blogs/:id does NOT handle the published field — it only updates title/content/cover_image
  const togglePublish = async (r) => {
    const action = r.published ? "unpublish" : "publish";
    try {
      await fetch(`${API}/blogs/${r.id}/${action}`, {
        method: "PATCH",
        headers: headers(),
      });
      load();
    } catch {}
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const excerpt    = (text, n = 80) => text?.length > n ? text.slice(0, n) + "…" : (text ?? "");

  return (
    <div>
      <div className="crud__toolbar">
        <div className="crud__toolbar-left">
          <select className="crud__filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="">All posts</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
        <button className="crud__btn-add" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Post
        </button>
      </div>

      <div className="crud__card">
        {loading ? (
          <div className="crud__loading"><i className="bi bi-arrow-repeat" /> Loading…</div>
        ) : rows.length === 0 ? (
          <div className="crud__empty">
            <i className="bi bi-file-earmark-text crud__empty-icon" />
            <p>No blog posts yet.</p>
          </div>
        ) : (
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Excerpt</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.cover_image
                        ? <img src={r.cover_image} alt="" className="blog__thumb" />
                        : <div className="blog__thumb-placeholder"><i className="bi bi-image" /></div>
                      }
                    </td>
                    <td style={{ maxWidth: 200, fontWeight: 600 }}>{r.title}</td>
                    <td style={{ color: "var(--text-light)", maxWidth: 240 }}>{excerpt(r.content)}</td>
                    <td>
                      {/* Clicking the badge calls the correct PATCH /publish or /unpublish */}
                      <button
                        className={`crud__badge crud__badge--${r.published ? "green" : "grey"}`}
                        style={{ cursor: "pointer", border: "none", background: "none", padding: 0 }}
                        onClick={() => togglePublish(r)}
                        title={r.published ? "Click to unpublish" : "Click to publish"}
                      >
                        <i className={`bi ${r.published ? "bi-eye" : "bi-eye-slash"}`} />
                        {" "}{r.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="crud__actions">
                        <button className="crud__btn-edit"   onClick={() => openEdit(r)}><i className="bi bi-pencil" /> Edit</button>
                        <button className="crud__btn-delete" onClick={() => openDelete(r)}><i className="bi bi-trash" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="crud__pagination">
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div className="crud__pagination-btns">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}><i className="bi bi-chevron-left" /> Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next <i className="bi bi-chevron-right" /></button>
            </div>
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal blog__modal" onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className={`bi ${modal === "edit" ? "bi-pencil-square" : "bi-file-earmark-plus"}`} />
                {" "}{modal === "edit" ? "Edit Post" : "New Blog Post"}
              </h2>
              <button className="crud__modal-close" onClick={closeModal}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="crud__modal-body">
              {modalErr && <div className="crud__modal-error">{modalErr}</div>}
              <div className="crud__field">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Post title…"
                />
              </div>
              <div className="crud__field">
                <label>Cover Image URL</label>
                <input
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="crud__field">
                <label>Content *</label>
                <textarea
                  className="blog__content-area"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content here…"
                />
              </div>
              <div className="blog__publish-row">
                <label className="blog__toggle-label">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="blog__toggle-input"
                  />
                  <span className="blog__toggle-switch" />
                  <span>{form.published ? "Publish immediately" : "Save as draft"}</span>
                </label>
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="crud__btn-save" onClick={handleSave} disabled={saving}>
                <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check-lg"}`} />
                {" "}{saving ? "Saving…" : modal === "edit" ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title"><i className="bi bi-trash" /> Delete Post</h2>
              <button className="crud__modal-close" onClick={closeModal}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="crud__modal-body">
              <div className="crud__delete-confirm">
                <p>Permanently delete <strong>"{selected?.title}"</strong>?</p>
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="crud__btn-delete-confirm" onClick={handleDelete} disabled={saving}>
                <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-trash"}`} />
                {" "}{saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}