// src/components/AdminDashboard/ActivityLog.jsx
import { useState, useEffect, useCallback } from "react";
import "./Crud.css";
import "./ActivityLog.css";

const API = import.meta.env.VITE_API_URL ?? "";
const PER_PAGE = 15;

const ACTION_META = {
  LOGIN:          { color: "green",  icon: "bi-box-arrow-in-right" },
  LOGOUT:         { color: "grey",   icon: "bi-box-arrow-right"    },
  REGISTER:       { color: "blue",   icon: "bi-person-plus"        },
  PROVISION_ADMIN:{ color: "yellow", icon: "bi-shield-plus"        },
  CREATE:         { color: "green",  icon: "bi-plus-circle"        },
  UPDATE:         { color: "blue",   icon: "bi-pencil"             },
  DELETE:         { color: "red",    icon: "bi-trash"              },
};

function actionBadge(action) {
  const { color, icon } = ACTION_META[action] ?? { color: "grey", icon: "bi-circle" };
  return (
    <span className={`crud__badge crud__badge--${color}`}>
      <i className={`bi ${icon}`} /> {action}
    </span>
  );
}

export default function ActivityLog({ token }) {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    try {
      const res  = await fetch(`${API}/activity-logs?${params}`, { headers });
      const data = await res.json();
      setRows(data.data?.items ?? data.data ?? []);
      setTotal(data.data?.total ?? (data.data?.length ?? 0));
    } catch { setRows([]); }
    setLoading(false);
  }, [page, token]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="crud__toolbar">
        <div className="crud__toolbar-left">
          <span style={{ fontSize: 13, color: "var(--text-light)" }}>
            <i className="bi bi-journal-text" style={{ marginRight: 6 }} />
            {total} total events — read only
          </span>
        </div>
        <button
          className="crud__btn-add"
          style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-mid)" }}
          onClick={load}
        >
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      <div className="crud__card">
        {loading ? (
          <div className="crud__loading">
            <i className="bi bi-arrow-repeat" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="crud__empty">
            <i className="bi bi-clipboard-data crud__empty-icon" />
            <p>No activity logged yet.</p>
          </div>
        ) : (
          <div className="crud__table-wrap">
            <table className="crud__table">
              <thead>
                <tr>
                  <th><i className="bi bi-clock" /> Time</th>
                  <th><i className="bi bi-lightning" /> Action</th>
                  <th><i className="bi bi-box" /> Entity</th>
                  <th><i className="bi bi-chat-left-text" /> Description</th>
                  <th><i className="bi bi-person" /> User ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="log__time">
                      <i className="bi bi-calendar3" style={{ marginRight: 4, opacity: 0.4 }} />
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                        : "—"}
                    </td>
                    <td>{actionBadge(r.action)}</td>
                    <td>
                      {r.entity && (
                        <span className="log__entity">
                          <i className="bi bi-tag" style={{ marginRight: 4, opacity: 0.5 }} />
                          {r.entity}
                          {r.entity_id
                            ? <span className="log__entity-id">#{r.entity_id}</span>
                            : null
                          }
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: 300, color: "var(--text-mid)", fontSize: 13 }}>
                      {r.description ?? "—"}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-light)" }}>
                      <i className="bi bi-person-badge" style={{ marginRight: 4, opacity: 0.5 }} />
                      {r.user_id ?? "system"}
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
    </div>
  );
}