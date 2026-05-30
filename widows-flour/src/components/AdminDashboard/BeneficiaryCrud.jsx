// src/components/AdminDashboard/BeneficiaryCrud.jsx
import { useState, useEffect, useCallback } from "react";
import "./Crud.css";
import BeneficiaryForm from "../BeneficiaryForm/BeneficiaryForm";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const BASE     = `${API}/beneficiaries`;
const PER_PAGE = 10;

const STATUS_ICONS = {
  approved: "bi-check-circle-fill",
  pending:  "bi-clock-fill",
  archived: "bi-archive-fill",
};

const VULN_COLORS = {
  "High Priority":   { color: "#c0394b", bg: "#fde8ec" },
  "Medium Priority": { color: "#d4860a", bg: "#fef4e8" },
  "Low Priority":    { color: "#5a9e3a", bg: "#eaf3df" },
};

function StatusBadge({ status }) {
  const map = { approved: "green", pending: "yellow", archived: "grey" };
  return (
    <span className={`crud__badge crud__badge--${map[status] || "grey"}`}>
      <i className={`bi ${STATUS_ICONS[status] || "bi-circle"}`} /> {status}
    </span>
  );
}

function VulnBadge({ level }) {
  if (!level) return null;
  const style = VULN_COLORS[level] || VULN_COLORS["Low Priority"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      background: style.bg, color: style.color,
    }}>
      {level}
    </span>
  );
}

function CompletionBar({ pct }) {
  const color = pct >= 80 ? "#5a9e3a" : pct >= 50 ? "#d4860a" : "#c0394b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 100 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 28 }}>{pct}%</span>
    </div>
  );
}

export default function BeneficiaryCrud({ token }) {
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("");
  const [loading, setLoading] = useState(false);

  // Form modal state
  const [formMode,     setFormMode]     = useState(null);  // "create" | "edit"
  const [selectedRow,  setSelectedRow]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (filter) params.set("status", filter);
    try {
      const res  = await fetch(`${BASE}?${params}`, { headers });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? data.pagination?.total ?? 0);
    } catch { setRows([]); }
    setLoading(false);
  }, [page, search, filter, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setSelectedRow(null); setFormMode("create"); };
  const openEdit   = async (r) => {
    // Fetch full detail with related data
    try {
      const res  = await fetch(`${BASE}/${r.id}`, { headers });
      const data = await res.json();
      setSelectedRow(data.data || r);
    } catch { setSelectedRow(r); }
    setFormMode("edit");
  };

  const handleSaved = () => {
    setFormMode(null);
    setSelectedRow(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) { setDeleteTarget(null); load(); }
    } catch {}
    setDeleting(false);
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  // ── Full-screen form modal ────────────────────────────────────────────────
  if (formMode) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{
          width: "100%", maxWidth: 780, maxHeight: "92vh",
          display: "flex", flexDirection: "column",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        }}>
          <BeneficiaryForm
            token={token}
            editData={formMode === "edit" ? selectedRow : null}
            onSaved={handleSaved}
            onCancel={() => { setFormMode(null); setSelectedRow(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ── */}
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
          <select
            className="crud__filter"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
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

      {/* ── Table card ── */}
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
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Vulnerability</th>
                  <th>Completion</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.profile_image
                        ? <img src={r.profile_image} alt={r.full_name || r.name}
                            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,0,0,0.08)" }} />
                        : <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(0,0,0,0.07)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <i className="bi bi-person" style={{ opacity: 0.4 }} />
                          </div>
                      }
                    </td>
                    <td>
                      <div><strong>{r.full_name || r.name}</strong></div>
                      {r.phone_number && (
                        <div style={{ fontSize: 11, color: "#8a8a8a", marginTop: 2 }}>
                          <i className="bi bi-telephone" style={{ marginRight: 3 }} />
                          {r.phone_number}
                        </div>
                      )}
                    </td>
                    <td>
                      {r.location?.county || r.location
                        ? <><i className="bi bi-geo-alt" style={{ marginRight: 4, opacity: 0.5 }} />
                            {r.location?.county || r.location}</>
                        : "—"
                      }
                    </td>
                    <td>
                      <VulnBadge level={r.vulnerability_level} />
                    </td>
                    <td>
                      <CompletionBar pct={r.completion_percentage ?? 0} />
                    </td>
                    <td><StatusBadge status={r.beneficiary_status || r.status} /></td>
                    <td>
                      <i className="bi bi-calendar3" style={{ marginRight: 4, opacity: 0.5 }} />
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="crud__actions">
                        <button className="crud__btn-edit" onClick={() => openEdit(r)}>
                          <i className="bi bi-pencil" /> Edit
                        </button>
                        <button className="crud__btn-delete" onClick={() => setDeleteTarget(r)}>
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
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                <i className="bi bi-chevron-left" /> Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                Next <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="crud__modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="crud__modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="crud__modal-header">
              <h2 className="crud__modal-title">
                <i className="bi bi-person-x" /> Delete Beneficiary
              </h2>
              <button className="crud__modal-close" onClick={() => setDeleteTarget(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="crud__modal-body">
              <div className="crud__delete-confirm">
                <p>
                  Are you sure you want to permanently delete{" "}
                  <strong>{deleteTarget.full_name || deleteTarget.name}</strong>?
                </p>
                <p style={{ marginTop: 10, fontSize: 13, color: "#8a8a8a" }}>
                  Consider <strong>archiving</strong> instead to preserve the record for audit purposes.
                  Deletion cannot be undone.
                </p>
              </div>
            </div>
            <div className="crud__modal-footer">
              <button className="crud__btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="crud__btn-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <i className={`bi ${deleting ? "bi-arrow-repeat" : "bi-trash"}`} />
                {" "}{deleting ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}