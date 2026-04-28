// src/components/AdminDashboard/DonationCrud.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import "./Crud.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const PER_PAGE = 10;

const EMPTY_FORM = {
  campaign_id: "", donor_name: "Anonymous", donor_email: "",
  amount: "", payment_method: "", transaction_reference: "",
};

const METHOD_ICONS = {
  mpesa: "bi-phone",
  bank_transfer: "bi-bank",
  card: "bi-credit-card",
  cash: "bi-cash-coin",
};

const STATUS_COLORS = { draft: "grey", active: "green", completed: "blue", paused: "yellow" };

// ── Campaign Picker ───────────────────────────────────────────────────────────
function CampaignPicker({ campaigns, value, onChange, loading }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef(null);
  const searchRef           = useRef(null);

  const selected = campaigns.find(c => String(c.id) === String(value));

  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
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

  const handleSelect = (c) => {
    onChange(String(c.id));
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="ben-picker" ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={`ben-picker__trigger ${open ? "ben-picker__trigger--open" : ""} ${selected ? "ben-picker__trigger--selected" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <i className="bi bi-megaphone ben-picker__trigger-icon" />
        <span className="ben-picker__trigger-label">
          {loading
            ? "Loading campaigns…"
            : selected
              ? selected.title
              : "Select a campaign…"}
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

      {/* Popover */}
      {open && (
        <div className="ben-picker__popover">
          {/* Search bar */}
          <div className="ben-picker__search-wrap">
            <i className="bi bi-search ben-picker__search-icon" />
            <input
              ref={searchRef}
              className="ben-picker__search"
              placeholder="Search campaigns…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="ben-picker__search-clear" onClick={() => setSearch("")}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="ben-picker__list">
            {loading ? (
              <div className="ben-picker__empty">
                <i className="bi bi-arrow-repeat" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="ben-picker__empty">
                <i className="bi bi-megaphone" />
                <span>{search ? `No results for "${search}"` : "No active campaigns available."}</span>
              </div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`ben-picker__item ${String(c.id) === String(value) ? "ben-picker__item--active" : ""}`}
                  onClick={() => handleSelect(c)}
                >
                  {/* Status dot */}
                  <div className="ben-picker__item-avatar campaign-avatar">
                    <i className="bi bi-megaphone-fill" />
                  </div>
                  <div className="ben-picker__item-info">
                    <span className="ben-picker__item-name">{c.title}</span>
                    <span className="ben-picker__item-meta">
                      <span className={`picker-status picker-status--${STATUS_COLORS[c.status] || "grey"}`}>
                        {c.status}
                      </span>
                      {c.goal_amount != null && (
                        <>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span>KES {Number(c.goal_amount).toLocaleString()} goal</span>
                        </>
                      )}
                    </span>
                  </div>
                  {String(c.id) === String(value) && (
                    <i className="bi bi-check-lg ben-picker__item-check" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="ben-picker__footer">
            {filtered.length} of {campaigns.length} campaigns
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DonationCrud({ token }) {
  const [rows, setRows]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campLoading, setCampLoading] = useState(false);

  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [modalErr, setModalErr] = useState("");

  // Stable headers factory — fixes stale-closure / infinite-loop bug
  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  // Load active campaigns for the picker (uses admin endpoint so auth works)
  useEffect(() => {
    setCampLoading(true);
    fetch(`${API}/campaigns?per_page=200&status=active`, { headers: headers() })
      .then(r => r.json())
      .then(d => setCampaigns(d.data?.items ?? d.data ?? []))
      .catch(() => {})
      .finally(() => setCampLoading(false));
  }, [token]);

  // GET /admin/donations (admin endpoint — full details including donor email)
  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    try {
      const res  = await fetch(`${API}/admin/donations?${params}`, { headers: headers() });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? data.pagination?.total ?? (data.data?.length ?? 0));
    } catch { setRows([]); }
    setLoading(false);
  }, [page, search, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setModalErr(""); setModal("create"); };
  const closeModal = ()  => { setModal(null); };

  const handleSave = async () => {
    if (!form.campaign_id) { setModalErr("Campaign is required.");             return; }
    if (!form.amount)      { setModalErr("Amount is required.");               return; }

    setSaving(true); setModalErr("");
    const body = {
      ...form,
      amount:      parseFloat(form.amount),
      campaign_id: parseInt(form.campaign_id),
    };
    try {
      // POST /donations (public endpoint — matches your backend blueprint)
      const res  = await fetch(`${API}/donations`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setModalErr(data.error || "Save failed."); setSaving(false); return; }
      closeModal(); load();
    } catch { setModalErr("Network error."); }
    setSaving(false);
  };

  const campaignName = (id) => campaigns.find(c => c.id === id)?.title ?? `Campaign #${id}`;
  const totalPages   = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="crud__toolbar">
        <div className="crud__toolbar-left">
          <div className="crud__search-wrap">
            <i className="bi bi-search crud__search-icon" />
            <input
              className="crud__search"
              placeholder="Search donor, ref…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <button className="crud__btn-add" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> Record Donation
        </button>
      </div>

      <div className="crud__card">
        {loading ? (
          <div className="crud__loading"><i className="bi bi-arrow-repeat" /> Loading…</div>
        ) : rows.length === 0 ? (
          <div className="crud__empty">
            <i className="bi bi-heart crud__empty-icon" />
            <p>No donations recorded yet.</p>
          </div>
        ) : (
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th>Donor</th><th>Campaign</th><th>Amount</th>
                  <th>Method</th><th>Reference</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <strong>{r.donor_name || "Anonymous"}</strong>
                        {r.donor_email && (
                          <div style={{ fontSize: 11, color: "var(--text-light)" }}>
                            <i className="bi bi-envelope" style={{ marginRight: 3 }} />
                            {r.donor_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {campaignName(r.campaign_id)}
                    </td>
                    <td>
                      <strong style={{ color: "var(--green-deep)" }}>
                        KES {Number(r.amount).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      {r.payment_method ? (
                        <span className="crud__badge crud__badge--blue">
                          <i className={`bi ${METHOD_ICONS[r.payment_method] ?? "bi-credit-card"}`} />
                          {" "}{r.payment_method}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.transaction_reference ?? "—"}</td>
                    <td>
                      <i className="bi bi-calendar3" style={{ marginRight: 4, opacity: 0.5 }} />
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
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

      {modal === "create" && (
        <div className="crud__modal-backdrop" onClick={closeModal}>
          <div className="crud__modal" onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className="bi bi-heart-pulse" /> Record Donation
              </h2>
              <button className="crud__modal-close" onClick={closeModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="crud__modal-body">
              {modalErr && <div className="crud__modal-error">{modalErr}</div>}

              {/* ── Campaign Picker ── */}
              <div className="crud__field">
                <label>Campaign *</label>
                <CampaignPicker
                  campaigns={campaigns}
                  value={form.campaign_id}
                  onChange={(id) => setForm({ ...form, campaign_id: id })}
                  loading={campLoading}
                />
              </div>

              <div className="crud__fields-row">
                <div className="crud__field">
                  <label>Donor Name</label>
                  <input
                    value={form.donor_name}
                    onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    placeholder="Anonymous"
                  />
                </div>
                <div className="crud__field">
                  <label>Donor Email</label>
                  <input
                    type="email"
                    value={form.donor_email}
                    onChange={(e) => setForm({ ...form, donor_email: e.target.value })}
                    placeholder="donor@example.com"
                  />
                </div>
              </div>

              <div className="crud__fields-row">
                <div className="crud__field">
                  <label>Amount (KES) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div className="crud__field">
                  <label>Payment Method</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="crud__field">
                <label>Transaction Reference</label>
                <input
                  value={form.transaction_reference}
                  onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })}
                  placeholder="QJE4X9Z…"
                />
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="crud__btn-save" onClick={handleSave} disabled={saving}>
                <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check-lg"}`} />
                {" "}{saving ? "Saving…" : "Record Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}