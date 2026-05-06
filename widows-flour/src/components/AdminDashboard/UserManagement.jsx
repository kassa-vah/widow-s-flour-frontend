// src/components/AdminDashboard/UserManagement.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiUsers, FiClock, FiRefreshCw, FiShield, FiUser,
  FiEdit2, FiTrash2, FiCheck, FiX, FiSlash, FiUnlock,
  FiArrowUp, FiArrowDown, FiCalendar, FiMail, FiLoader,
  FiAlertTriangle, FiCheckCircle, FiSearch, FiUserPlus,
} from "react-icons/fi";

import "./UserManagement.css";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" });
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ admin }) {
  if (admin.is_suspended)
    return <span className="um2-badge um2-badge--suspended"><FiSlash size={11} /> Suspended</span>;
  if (!admin.is_approved)
    return <span className="um2-badge um2-badge--pending"><FiClock size={11} /> Pending</span>;
  if (admin.is_superadmin || admin.role === "superadmin")
    return <span className="um2-badge um2-badge--super"><FiShield size={11} /> Superadmin</span>;
  return <span className="um2-badge um2-badge--admin"><FiUser size={11} /> Admin</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ admin }) {
  const isSuperadmin = admin.is_superadmin || admin.role === "superadmin";
  const color = isSuperadmin
    ? { bg: "#fef3c7", fg: "#92400e" }
    : admin.is_suspended
    ? { bg: "#fee2e2", fg: "#b91c1c" }
    : { bg: "#eff6ff", fg: "#1e40af" };

  return (
    <div className="um2-avatar" style={{ background: color.bg, color: color.fg }}>
      {isSuperadmin ? <FiShield size={18} /> : <FiUser size={18} />}
      <span>{initials(admin.name)}</span>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ open, danger, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="um2-overlay" onClick={onCancel}>
      <div className="um2-modal" onClick={e => e.stopPropagation()}>
        <div className="um2-modal__head">
          {danger
            ? <FiAlertTriangle size={22} color="#ef4444" />
            : <FiCheckCircle   size={22} color="#f59e0b" />}
          <h3>{title}</h3>
        </div>
        <p className="um2-modal__body">{message}</p>
        <div className="um2-modal__foot">
          <button className="um2-btn um2-btn--ghost" onClick={onCancel}>Cancel</button>
          <button
            className={`um2-btn ${danger ? "um2-btn--danger" : "um2-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ open, admin, token, onClose, onSaved }) {
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  useEffect(() => {
    if (admin) { setName(admin.name); setEmail(admin.email); setErr(""); }
  }, [admin]);

  if (!open || !admin) return null;

  const save = async () => {
    if (!name.trim() || !email.trim()) { setErr("Name and email are required."); return; }
    setSaving(true); setErr("");
    try {
      const res  = await fetch(`${API}/auth/admin/${admin.id}`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Update failed."); return; }
      onSaved(data.data?.admin ?? data.admin ?? { ...admin, name, email });
    } catch { setErr("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div className="um2-overlay" onClick={onClose}>
      <div className="um2-modal um2-modal--edit" onClick={e => e.stopPropagation()}>
        <div className="um2-modal__head">
          <FiEdit2 size={20} color="#3b82f6" />
          <h3>Edit Admin</h3>
        </div>
        <div className="um2-modal__form">
          <label>Full Name</label>
          <div className="um2-input-wrap">
            <FiUser className="um2-input-icon" size={14} />
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" disabled={saving}
            />
          </div>
          <label>Email Address</label>
          <div className="um2-input-wrap">
            <FiMail className="um2-input-icon" size={14} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" disabled={saving}
            />
          </div>
          {err && <p className="um2-form-err"><FiAlertTriangle size={13} /> {err}</p>}
        </div>
        <div className="um2-modal__foot">
          <button className="um2-btn um2-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="um2-btn um2-btn--primary" onClick={save} disabled={saving}>
            {saving ? <><FiLoader className="um2-spin" size={14} /> Saving…</> : <><FiCheck size={14} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main UserManagement component
// ══════════════════════════════════════════════════════════════════════════════

export default function UserManagement({ token, currentAdmin }) {
  // ── FIX: check both is_superadmin (boolean) and role (string) ──────────────
  const isSA = currentAdmin?.is_superadmin === true || currentAdmin?.role === "superadmin";

  const [section,  setSection]  = useState("all");   // "all" | "pending"
  const [admins,   setAdmins]   = useState([]);
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState(null);     // admin id currently being acted on
  const [confirm,  setConfirm]  = useState(null);     // { type, admin }
  const [editItem, setEditItem] = useState(null);
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);     // { msg, ok }

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  // ── Data loading ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const reqs = [fetch(`${API}/auth/admins`, { headers: headers() })];
      if (isSA) reqs.push(fetch(`${API}/auth/pending`, { headers: headers() }));

      const [aRes, pRes] = await Promise.all(reqs);
      if (aRes.ok) {
        const d = await aRes.json();
        setAdmins(d.data?.admins ?? d.admins ?? []);
      }
      if (pRes?.ok) {
        const d = await pRes.json();
        setPending(d.data?.pending ?? d.pending ?? []);
      }
    } catch { /* silent */ }
    finally  { setLoading(false); }
  }, [token, isSA, headers]);

  useEffect(() => { load(); }, [load]);

  // ── Toast helper ────────────────────────────────────────────────────────────

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Generic action dispatcher ───────────────────────────────────────────────

  const doAction = async (url, method, adminId, body = null) => {
    setBusy(adminId);
    try {
      const opts = { method, headers: headers() };
      if (body) opts.body = JSON.stringify(body);
      const res  = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Action failed.", false); return; }
      showToast(data.message || "Done.");
      await load();
    } catch { showToast("Network error.", false); }
    finally { setBusy(null); setConfirm(null); }
  };

  const approve   = a => doAction(`${API}/auth/approve/${a.id}`,   "POST",   a.id);
  const reject    = a => doAction(`${API}/auth/reject/${a.id}`,    "POST",   a.id);
  const suspend   = a => doAction(`${API}/auth/suspend/${a.id}`,   "POST",   a.id);
  const reinstate = a => doAction(`${API}/auth/reinstate/${a.id}`, "POST",   a.id);
  const dismiss   = a => doAction(`${API}/auth/dismiss/${a.id}`,   "DELETE", a.id);
  const promote   = a => doAction(`${API}/auth/set-role/${a.id}`,  "PATCH",  a.id, { role: "superadmin" });
  const demote    = a => doAction(`${API}/auth/set-role/${a.id}`,  "PATCH",  a.id, { role: "admin" });

  const handleEdited = updated => {
    setAdmins(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
    setEditItem(null);
    showToast("Admin updated.");
  };

  // ── Filtered list ───────────────────────────────────────────────────────────

  const display = (section === "pending" ? pending : admins).filter(a => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  // ── Confirm configs ─────────────────────────────────────────────────────────

  const CONFIRM_CFG = {
    approve:   { danger: false, title: "Approve Account",       label: "Approve",        msg: a => `Approve ${a.name}? They'll receive an email and can log in immediately.` },
    reject:    { danger: true,  title: "Reject & Delete",       label: "Delete Account", msg: a => `Permanently delete ${a.name}'s account? This cannot be undone.` },
    suspend:   { danger: true,  title: "Suspend Account",       label: "Suspend",        msg: a => `Suspend ${a.name}? They will be locked out immediately.` },
    reinstate: { danger: false, title: "Reinstate Account",     label: "Reinstate",      msg: a => `Reinstate ${a.name}? They will be able to log in again.` },
    promote:   { danger: false, title: "Promote to Superadmin", label: "Promote",        msg: a => `Give ${a.name} superadmin powers? They can manage all other admins.` },
    demote:    { danger: true,  title: "Demote to Admin",       label: "Demote",         msg: a => `Remove superadmin powers from ${a.name}?` },
    dismiss:   { danger: true,  title: "Dismiss Admin",         label: "Dismiss",        msg: a => `Permanently remove ${a.name} from the system? Their Firebase account will also be deleted.` },
  };

  const openConfirm = (type, admin) => setConfirm({ type, admin });

  const execConfirm = () => {
    const { type, admin } = confirm;
    const fn = { approve, reject, suspend, reinstate, promote, demote, dismiss }[type];
    if (fn) fn(admin);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="um2">

      {/* Toast */}
      {toast && (
        <div className={`um2-toast ${toast.ok ? "um2-toast--ok" : "um2-toast--err"}`}>
          {toast.ok ? <FiCheckCircle size={15} /> : <FiAlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Section bar */}
      <div className="um2-bar">
        <div className="um2-bar__tabs">
          <button
            className={`um2-tab ${section === "all" ? "um2-tab--active" : ""}`}
            onClick={() => setSection("all")}
          >
            <FiUsers size={15} /> All Admins
            <span className="um2-count">{admins.length}</span>
          </button>

          {isSA && (
            <button
              className={`um2-tab ${section === "pending" ? "um2-tab--active" : ""}`}
              onClick={() => setSection("pending")}
            >
              <FiClock size={15} /> Pending Approval
              {pending.length > 0 && (
                <span className="um2-count um2-count--alert">{pending.length}</span>
              )}
            </button>
          )}
        </div>

        <div className="um2-bar__right">
          {/* Search */}
          <div className="um2-search">
            <FiSearch size={14} className="um2-search__icon" />
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="um2-search__clear" onClick={() => setSearch("")}>
                <FiX size={13} />
              </button>
            )}
          </div>

          <button className="um2-icon-btn" title="Refresh" onClick={load}>
            <FiRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Pending banner */}
      {section === "pending" && pending.length > 0 && (
        <div className="um2-banner">
          <FiAlertTriangle size={15} />
          {pending.length} account{pending.length !== 1 ? "s" : ""} awaiting your approval
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="um2-loading">
          <FiLoader className="um2-spin" size={22} />
          <span>Loading admins…</span>
        </div>
      ) : display.length === 0 ? (
        <div className="um2-empty">
          {section === "pending" ? <FiClock size={36} /> : <FiUsers size={36} />}
          <p>{search ? "No results match your search." : section === "pending" ? "No pending accounts." : "No admins found."}</p>
        </div>
      ) : (
        <div className="um2-list">
          {display.map(admin => {
            const isMe    = admin.id === currentAdmin?.id;
            const isBusy  = busy === admin.id;
            // ── FIX: same dual-check for each row's superadmin status ──
            const isSARow = admin.is_superadmin === true || admin.role === "superadmin";

            return (
              <div
                key={admin.id}
                className={[
                  "um2-row",
                  admin.is_suspended    ? "um2-row--suspended" : "",
                  section === "pending" ? "um2-row--pending"   : "",
                ].join(" ").trim()}
              >
                {/* Left: avatar + info */}
                <div className="um2-row__left">
                  <Avatar admin={admin} />
                  <div className="um2-row__info">
                    <div className="um2-row__name">
                      {admin.name}
                      {isMe && <span className="um2-you">you</span>}
                    </div>
                    <div className="um2-row__email">
                      <FiMail size={12} /> {admin.email}
                    </div>
                    <div className="um2-row__meta">
                      <StatusBadge admin={admin} />
                      <span className="um2-meta-item">
                        <FiCalendar size={11} /> Joined {fmtDate(admin.created_at)}
                      </span>
                      {admin.last_login && (
                        <span className="um2-meta-item">
                          <FiClock size={11} /> Login {fmtDate(admin.last_login)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: action buttons — superadmins only, not on own row */}
                {isSA && !isMe && (
                  <div className="um2-row__actions">
                    {isBusy ? (
                      <span className="um2-row__busy">
                        <FiLoader className="um2-spin" size={16} />
                      </span>
                    ) : section === "pending" ? (
                      /* ── Pending row actions ── */
                      <>
                        <button
                          className="um2-action-btn um2-action-btn--approve"
                          title="Approve registration"
                          onClick={() => openConfirm("approve", admin)}
                        >
                          <FiCheck size={14} /> Approve
                        </button>
                        <button
                          className="um2-action-btn um2-action-btn--danger"
                          title="Reject & delete"
                          onClick={() => openConfirm("reject", admin)}
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      /* ── Approved row actions ── */
                      <>
                        {/* Edit */}
                        <button
                          className="um2-action-btn um2-action-btn--ghost"
                          title="Edit name / email"
                          onClick={() => setEditItem(admin)}
                        >
                          <FiEdit2 size={14} />
                        </button>

                        {/* Promote / Demote */}
                        {isSARow ? (
                          <button
                            className="um2-action-btn um2-action-btn--warn"
                            title="Demote to admin"
                            onClick={() => openConfirm("demote", admin)}
                          >
                            <FiArrowDown size={14} /> Demote
                          </button>
                        ) : (
                          <button
                            className="um2-action-btn um2-action-btn--promote"
                            title="Promote to superadmin"
                            onClick={() => openConfirm("promote", admin)}
                          >
                            <FiArrowUp size={14} /> Promote
                          </button>
                        )}

                        {/* Suspend / Reinstate — only for non-superadmins */}
                        {!isSARow && (
                          admin.is_suspended ? (
                            <button
                              className="um2-action-btn um2-action-btn--reinstate"
                              title="Reinstate account"
                              onClick={() => openConfirm("reinstate", admin)}
                            >
                              <FiUnlock size={14} /> Reinstate
                            </button>
                          ) : (
                            <button
                              className="um2-action-btn um2-action-btn--warn"
                              title="Suspend account"
                              onClick={() => openConfirm("suspend", admin)}
                            >
                              <FiSlash size={14} /> Suspend
                            </button>
                          )
                        )}

                        {/* Dismiss — only for non-superadmins */}
                        {!isSARow && (
                          <button
                            className="um2-action-btn um2-action-btn--danger"
                            title="Permanently remove admin"
                            onClick={() => openConfirm("dismiss", admin)}
                          >
                            <FiTrash2 size={14} /> Dismiss
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (() => {
        const cfg = CONFIRM_CFG[confirm.type];
        return (
          <ConfirmModal
            open
            danger={cfg.danger}
            title={cfg.title}
            message={cfg.msg(confirm.admin)}
            confirmLabel={cfg.label}
            onConfirm={execConfirm}
            onCancel={() => setConfirm(null)}
          />
        );
      })()}

      {/* Edit modal */}
      <EditModal
        open={!!editItem}
        admin={editItem}
        token={token}
        onClose={() => setEditItem(null)}
        onSaved={handleEdited}
      />
    </div>
  );
}