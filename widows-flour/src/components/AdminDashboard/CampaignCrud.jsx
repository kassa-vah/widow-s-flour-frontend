// src/components/AdminDashboard/CampaignCrud.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import "./Crud.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const BASE     = `${API}/campaigns`;
const BEN_BASE = `${API}/beneficiaries`;
const PER_PAGE = 10;

const EMPTY_FORM = {
  title: "", description: "", goal_amount: "", beneficiary_id: "",
  status: "draft", start_date: "", end_date: "",
};

const STATUS_COLORS = { draft: "grey", active: "green", completed: "blue", paused: "yellow" };
const STATUS_ICONS  = { draft: "bi-pencil", active: "bi-play-circle", completed: "bi-check-circle", paused: "bi-pause-circle" };

function statusBadge(s) {
  return (
    <span className={`crud__badge crud__badge--${STATUS_COLORS[s] || "grey"}`}>
      <i className={`bi ${STATUS_ICONS[s] || "bi-circle"}`} /> {s}
    </span>
  );
}

function fmtCurrency(n) {
  return n != null ? `KES ${Number(n).toLocaleString()}` : "—";
}

// ── Beneficiary Picker ────────────────────────────────────────────────────────
function BeneficiaryPicker({ beneficiaries, value, onChange, loading }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef(null);
  const searchRef           = useRef(null);

  const selected = beneficiaries.find(b => String(b.id) === String(value));

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.location || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (b) => {
    onChange(String(b.id));
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="ben-picker" ref={containerRef}>
      <button
        type="button"
        className={`ben-picker__trigger ${open ? "ben-picker__trigger--open" : ""} ${selected ? "ben-picker__trigger--selected" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <i className="bi bi-person-heart ben-picker__trigger-icon" />
        <span className="ben-picker__trigger-label">
          {loading
            ? "Loading beneficiaries…"
            : selected
              ? selected.name
              : "Select a beneficiary…"}
        </span>
        <div className="ben-picker__trigger-right">
          {selected && (
            <span className="ben-picker__clear" onClick={handleClear} title="Clear selection">
              <i className="bi bi-x" />
            </span>
          )}
          <i className={`bi bi-chevron-${open ? "up" : "down"} ben-picker__chevron`} />
        </div>
      </button>

      {open && (
        <div className="ben-picker__popover">
          <div className="ben-picker__search-wrap">
            <i className="bi bi-search ben-picker__search-icon" />
            <input
              ref={searchRef}
              className="ben-picker__search"
              placeholder="Search by name or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="ben-picker__search-clear" onClick={() => setSearch("")}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="ben-picker__list">
            {loading ? (
              <div className="ben-picker__empty"><i className="bi bi-arrow-repeat" /> Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="ben-picker__empty">
                <i className="bi bi-person-x" />
                <span>{search ? `No results for "${search}"` : "No beneficiaries available."}</span>
              </div>
            ) : (
              filtered.map(b => (
                <button
                  key={b.id}
                  type="button"
                  className={`ben-picker__item ${String(b.id) === String(value) ? "ben-picker__item--active" : ""}`}
                  onClick={() => handleSelect(b)}
                >
                  <div className="ben-picker__item-avatar">
                    {b.profile_image
                      ? <img src={b.profile_image} alt={b.name} />
                      : <i className="bi bi-person-fill" />}
                  </div>
                  <div className="ben-picker__item-info">
                    <span className="ben-picker__item-name">{b.name}</span>
                    {b.location && (
                      <span className="ben-picker__item-meta">
                        <i className="bi bi-geo-alt" /> {b.location}
                      </span>
                    )}
                  </div>
                  {String(b.id) === String(value) && (
                    <i className="bi bi-check-lg ben-picker__item-check" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="ben-picker__footer">
            {filtered.length} of {beneficiaries.length} beneficiaries
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CampaignCrud({ token }) {
  const [rows, setRows]                   = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [filter, setFilter]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [benLoading, setBenLoading]       = useState(false);

  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [modalErr, setModalErr] = useState("");

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  // Load beneficiaries
  useEffect(() => {
    setBenLoading(true);
    fetch(`${BEN_BASE}?per_page=200`, { headers: headers() })
      .then(r => r.json())
      .then(d => setBeneficiaries(d.data?.items ?? d.data ?? []))
      .catch(() => {})
      .finally(() => setBenLoading(false));
  }, [token]);

  // GET /campaigns
  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (filter) params.set("status", filter);
    try {
      const res  = await fetch(`${BASE}?${params}`, { headers: headers() });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? data.pagination?.total ?? (data.data?.length ?? 0));
    } catch { setRows([]); }
    setLoading(false);
  }, [page, filter, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setModalErr(""); setModal("create"); };

  // ── FIX: Explicitly map every field from the row, including status ──────────
  const openEdit = (r) => {
    setSelected(r);
    setForm({
      title:          r.title          ?? "",
      description:    r.description    ?? "",
      goal_amount:    r.goal_amount    ?? "",
      // FIX: beneficiary_id may be nested under r.beneficiary.id — handle both
      beneficiary_id: String(r.beneficiary_id ?? r.beneficiary?.id ?? ""),
      // FIX: explicitly cast status — never fall back silently to "draft"
      status:         r.status         ?? "draft",
      start_date:     r.start_date     ? r.start_date.slice(0, 10) : "",
      end_date:       r.end_date       ? r.end_date.slice(0, 10)   : "",
    });
    setModalErr("");
    setModal("edit");
  };

  const openDelete = (r) => { setSelected(r); setModal("delete"); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.title.trim())       { setModalErr("Title is required.");       return; }
    if (!form.goal_amount)        { setModalErr("Goal amount is required."); return; }
    if (!form.beneficiary_id)     { setModalErr("Beneficiary is required."); return; }

    setSaving(true); setModalErr("");

    const body = {
      title:          form.title.trim(),
      description:    form.description.trim() || null,
      goal_amount:    parseFloat(form.goal_amount),
      beneficiary_id: parseInt(form.beneficiary_id, 10),
      // FIX: explicitly include status — never omit it
      status:         form.status,
      start_date:     form.start_date || null,
      end_date:       form.end_date   || null,
    };

    // Debug log — remove after confirming fix
    console.log("[CampaignCrud] Saving body:", JSON.stringify(body));

    try {
      const url    = modal === "edit" ? `${BASE}/${selected.id}` : BASE;
      const method = modal === "edit" ? "PUT" : "POST";

      const res  = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();

      // Debug log — remove after confirming fix
      console.log("[CampaignCrud] Response:", res.status, JSON.stringify(data));

      if (!res.ok) {
        setModalErr(data.error || data.message || "Save failed.");
        setSaving(false);
        return;
      }

      closeModal();
      load();
    } catch (err) {
      console.error("[CampaignCrud] Network error:", err);
      setModalErr("Network error. Please try again.");
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/${selected.id}`, { method: "DELETE", headers: headers() });
      if (res.ok) { closeModal(); load(); }
      else {
        const data = await res.json();
        console.error("[CampaignCrud] Delete failed:", data);
      }
    } catch (err) {
      console.error("[CampaignCrud] Delete network error:", err);
    }
    setSaving(false);
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="crud__toolbar">
        <div className="crud__toolbar-left">
          <select
            className="crud__filter"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <button className="crud__btn-add" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Campaign
        </button>
      </div>

      <div className="crud__card">
        {loading ? (
          <div className="crud__loading"><i className="bi bi-arrow-repeat" /> Loading…</div>
        ) : rows.length === 0 ? (
          <div className="crud__empty">
            <i className="bi bi-megaphone crud__empty-icon" />
            <p>No campaigns found.</p>
          </div>
        ) : (
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th>Title</th><th>Goal</th><th>Raised</th>
                  <th>Progress</th><th>Status</th><th>End Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.title}</strong></td>
                    <td>{fmtCurrency(r.goal_amount)}</td>
                    <td>{fmtCurrency(r.raised_amount)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(r.progress_percent ?? 0, 100)}%`, height: "100%", background: "var(--green-deep)" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-light)" }}>{r.progress_percent ?? 0}%</span>
                      </div>
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      <i className="bi bi-calendar3" style={{ marginRight: 4, opacity: 0.5 }} />
                      {r.end_date ? new Date(r.end_date).toLocaleDateString() : "—"}
                    </td>
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

      {/* ── Create / Edit modal ── */}
      {(modal === "create" || modal === "edit") && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal" onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className={`bi ${modal === "edit" ? "bi-pencil-square" : "bi-megaphone"}`} />
                {" "}{modal === "edit" ? "Edit Campaign" : "New Campaign"}
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
                  placeholder="Campaign title"
                />
              </div>

              <div className="crud__field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this campaign for?"
                />
              </div>

              <div className="crud__fields-row">
                <div className="crud__field">
                  <label>Goal Amount (KES) *</label>
                  <input
                    type="number"
                    value={form.goal_amount}
                    onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div className="crud__field">
                  <label>Status</label>
                  {/* FIX: confirm value is bound and onChange fires correctly */}
                  <select
                    value={form.status}
                    onChange={(e) => {
                      console.log("[CampaignCrud] Status changed to:", e.target.value);
                      setForm({ ...form, status: e.target.value });
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="crud__field">
                <label>Beneficiary *</label>
                <BeneficiaryPicker
                  beneficiaries={beneficiaries}
                  value={form.beneficiary_id}
                  onChange={(id) => setForm({ ...form, beneficiary_id: id })}
                  loading={benLoading}
                />
              </div>

              <div className="crud__fields-row">
                <div className="crud__field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="crud__field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="crud__btn-save" onClick={handleSave} disabled={saving}>
                <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check-lg"}`} />
                {" "}{saving ? "Saving…" : "Save Campaign"}
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
              <h2 className="crud__modal-title"><i className="bi bi-trash" /> Delete Campaign</h2>
              <button className="crud__modal-close" onClick={closeModal}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="crud__modal-body">
              <div className="crud__delete-confirm">
                <p>Delete campaign <strong>"{selected?.title}"</strong>? All associated donations will be orphaned.</p>
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