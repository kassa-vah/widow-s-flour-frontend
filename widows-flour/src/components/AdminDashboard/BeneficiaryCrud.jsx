// src/components/AdminDashboard/BeneficiaryCrud.jsx
import { useState, useEffect, useCallback } from "react";
import "./Crud.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const BASE     = `${API}/beneficiaries`;
const PER_PAGE = 10;

const EMPTY_FORM = { name: "", age: "", location: "", story: "", profile_image: "", status: "pending" };

const STATUS_ICONS = { approved: "bi-check-circle", pending: "bi-clock", archived: "bi-archive" };

function statusBadge(s) {
  const map = { approved: "green", pending: "yellow", archived: "grey" };
  return (
    <span className={`crud__badge crud__badge--${map[s] || "grey"}`}>
      <i className={`bi ${STATUS_ICONS[s] || "bi-circle"}`} /> {s}
    </span>
  );
}

export default function BeneficiaryCrud({ token }) {
  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("");
  const [loading, setLoading]   = useState(false);

  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [modalErr, setModalErr] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // GET /beneficiaries?page=&per_page=&search=&status=
  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (filter) params.set("status", filter);
    try {
      const res  = await fetch(`${BASE}?${params}`, { headers });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? data.pagination?.total ?? (data.data?.length ?? 0));
    } catch { setRows([]); }
    setLoading(false);
  }, [page, search, filter, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setModalErr(""); setModal("create"); };
  const openEdit   = (r) => {
    setSelected(r);
    setForm({
      name:          r.name,
      age:           r.age ?? "",
      location:      r.location ?? "",
      story:         r.story ?? "",
      profile_image: r.profile_image ?? "",
      status:        r.status,
    });
    setModalErr(""); setModal("edit");
  };
  const openDelete = (r) => { setSelected(r); setModal("delete"); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  // POST /beneficiaries/add-beneficiary  |  PUT /beneficiaries/<id>
  const handleSave = async () => {
    if (!form.name.trim()) { setModalErr("Name is required."); return; }
    setSaving(true); setModalErr("");
    const body = { ...form, age: form.age ? parseInt(form.age) : null };
    try {
      const url    = modal === "edit"
        ? `${BASE}/${selected.id}`
        : `${BASE}/add-beneficiary`;
      const method = modal === "edit" ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) { setModalErr(data.error || "Save failed."); setSaving(false); return; }
      closeModal(); load();
    } catch { setModalErr("Network error."); }
    setSaving(false);
  };

  // DELETE /beneficiaries/<id>
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/${selected.id}`, { method: "DELETE", headers });
      if (res.ok) { closeModal(); load(); }
    } catch {}
    setSaving(false);
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="crud__toolbar">
        <div className="crud__toolbar-left">
          <div className="crud__search-wrap">
            <i className="bi bi-search crud__search-icon" />
            <input
              className="crud__search"
              placeholder="Search beneficiaries…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="crud__filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button className="crud__btn-add" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> Add Beneficiary
        </button>
      </div>

      <div className="crud__card">
        {loading ? (
          <div className="crud__loading">
            <i className="bi bi-arrow-repeat" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="crud__empty">
            <i className="bi bi-people crud__empty-icon" />
            <p>No beneficiaries found.</p>
          </div>
        ) : (
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.age ?? "—"}</td>
                    <td>
                      {r.location
                        ? <><i className="bi bi-geo-alt" style={{ marginRight: 4, opacity: 0.5 }} />{r.location}</>
                        : "—"
                      }
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      <i className="bi bi-calendar3" style={{ marginRight: 4, opacity: 0.5 }} />
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="crud__actions">
                        <button className="crud__btn-edit"   onClick={() => openEdit(r)}>
                          <i className="bi bi-pencil" /> Edit
                        </button>
                        <button className="crud__btn-delete" onClick={() => openDelete(r)}>
                          <i className="bi bi-trash" /> Delete
                        </button>
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
            <span>Showing page {page} of {totalPages} ({total} total)</span>
            <div className="crud__pagination-btns">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <i className="bi bi-chevron-left" /> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                Next <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit modal ── */}
      {(modal === "create" || modal === "edit") && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal" onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className={`bi ${modal === "edit" ? "bi-pencil-square" : "bi-person-plus"}`} />
                {" "}{modal === "edit" ? "Edit Beneficiary" : "New Beneficiary"}
              </h2>
              <button className="crud__modal-close" onClick={closeModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="crud__modal-body">
              {modalErr && <div className="crud__modal-error">{modalErr}</div>}
              <div className="crud__fields-row">
                <div className="crud__field">
                  <label>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="crud__field">
                  <label>Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
              </div>
              <div className="crud__field">
                <label>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Town, County"
                />
              </div>
              <div className="crud__field">
                <label>Story</label>
                <textarea
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  placeholder="Brief background…"
                />
              </div>
              <div className="crud__field">
                <label>Profile Image URL</label>
                <input
                  value={form.profile_image}
                  onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="crud__field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="crud__btn-save" onClick={handleSave} disabled={saving}>
                <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check-lg"}`} />
                {" "}{saving ? "Saving…" : "Save Beneficiary"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {modal === "delete" && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className="bi bi-person-x" /> Delete Beneficiary
              </h2>
              <button className="crud__modal-close" onClick={closeModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="crud__modal-body">
              <div className="crud__delete-confirm">
                <p>Are you sure you want to delete <strong>{selected?.name}</strong>? This cannot be undone.</p>
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