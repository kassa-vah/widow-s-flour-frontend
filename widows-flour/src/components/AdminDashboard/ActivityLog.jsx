// src/components/AdminDashboard/ActivityLog.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import "./Crud.css";
import "./ActivityLog.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const PER_PAGE = 20;

// ── Action metadata — covers every action emitted by all blueprints ──────────
const ACTION_META = {
  // auth.py
  LOGIN:                { color: "green",  icon: "bi-box-arrow-in-right", label: "Login"               },
  LOGOUT:               { color: "grey",   icon: "bi-box-arrow-right",    label: "Logout"              },
  REGISTER:             { color: "teal",   icon: "bi-person-plus",        label: "Register"            },
  PROVISION_ADMIN:      { color: "yellow", icon: "bi-shield-plus",        label: "Provision Admin"     },
  // beneficiaries.py
  CREATE_BENEFICIARY:   { color: "green",  icon: "bi-person-heart",       label: "Add Beneficiary"     },
  UPDATE_BENEFICIARY:   { color: "blue",   icon: "bi-person-gear",        label: "Edit Beneficiary"    },
  DELETE_BENEFICIARY:   { color: "red",    icon: "bi-person-x",           label: "Delete Beneficiary"  },
  APPROVE_BENEFICIARY:  { color: "teal",   icon: "bi-person-check",       label: "Approve Beneficiary" },
  ARCHIVE_BENEFICIARY:  { color: "grey",   icon: "bi-archive",            label: "Archive Beneficiary" },
  // campaigns.py
  CREATE_CAMPAIGN:      { color: "green",  icon: "bi-megaphone",          label: "New Campaign"        },
  UPDATE_CAMPAIGN:      { color: "blue",   icon: "bi-pencil-square",      label: "Edit Campaign"       },
  DELETE_CAMPAIGN:      { color: "red",    icon: "bi-trash",              label: "Delete Campaign"     },
  ACTIVATE_CAMPAIGN:    { color: "green",  icon: "bi-play-circle",        label: "Activate Campaign"   },
  PAUSE_CAMPAIGN:       { color: "yellow", icon: "bi-pause-circle",       label: "Pause Campaign"      },
  COMPLETE_CAMPAIGN:    { color: "teal",   icon: "bi-check-circle",       label: "Complete Campaign"   },
  // donations.py
  DONATION_RECEIVED:    { color: "green",  icon: "bi-heart-pulse",        label: "Donation Received"   },
  // blogs.py
  CREATE_BLOG:          { color: "green",  icon: "bi-journal-plus",       label: "New Blog"            },
  UPDATE_BLOG:          { color: "blue",   icon: "bi-journal-text",       label: "Edit Blog"           },
  DELETE_BLOG:          { color: "red",    icon: "bi-journal-x",          label: "Delete Blog"         },
  PUBLISH_BLOG:         { color: "teal",   icon: "bi-journal-check",      label: "Publish Blog"        },
  UNPUBLISH_BLOG:       { color: "yellow", icon: "bi-journal-minus",      label: "Unpublish Blog"      },
};

const COLOR_MAP = {
  green:  { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
  teal:   { bg: "#ccfbf1", text: "#0f766e", dot: "#14b8a6" },
  blue:   { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  yellow: { bg: "#fef9c3", text: "#a16207", dot: "#eab308" },
  red:    { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  grey:   { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
};

const CHART_PALETTE = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#14b8a6", "#a855f7"];

function ActionBadge({ action }) {
  const meta  = ACTION_META[action] ?? { color: "grey", icon: "bi-circle", label: action };
  const color = COLOR_MAP[meta.color] ?? COLOR_MAP.grey;
  return (
    <span className="al__badge" style={{ background: color.bg, color: color.text }}>
      <i className={`bi ${meta.icon}`} />
      <span>{meta.label || action}</span>
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "#22c55e", delay = 0 }) {
  return (
    <div className="al__stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="al__stat-icon" style={{ background: `${color}18`, color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="al__stat-body">
        <div className="al__stat-value">{value}</div>
        <div className="al__stat-label">{label}</div>
        {sub && <div className="al__stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Custom tooltip for recharts ──────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="al__tooltip">
      <div className="al__tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="al__tooltip-row" style={{ color: p.color }}>
          <span className="al__tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: </span>
          <strong>{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ActivityLog({ token }) {
  const [tab, setTab]         = useState("analytics"); // "analytics" | "feed"
  const [logs, setLogs]       = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [page, setPage]       = useState(1);
  const [logLoading, setLogLoading] = useState(false);

  // Raw data for charts
  const [campaigns, setCampaigns]   = useState([]);
  const [donations, setDonations]   = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [blogs, setBlogs]           = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  // ── Fetch all entity data for analytics ──────────────────────────────────
  useEffect(() => {
    setDataLoading(true);
    Promise.allSettled([
      fetch(`${API}/campaigns?per_page=200`,       { headers: headers() }).then(r => r.json()),
      fetch(`${API}/admin/donations?per_page=500`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/beneficiaries?per_page=200`,   { headers: headers() }).then(r => r.json()),
      fetch(`${API}/blogs?per_page=200`,           { headers: headers() }).then(r => r.json()),
    ]).then(([c, d, b, bl]) => {
      if (c.status === "fulfilled") setCampaigns(c.value.data?.items ?? c.value.data ?? []);
      if (d.status === "fulfilled") setDonations(d.value.data?.items ?? d.value.data ?? []);
      if (b.status === "fulfilled") setBeneficiaries(b.value.data?.items ?? b.value.data ?? []);
      if (bl.status === "fulfilled") setBlogs(bl.value.data?.items ?? bl.value.data ?? []);
    }).finally(() => setDataLoading(false));
  }, [token]);

  // ── Fetch activity log (paginated) ───────────────────────────────────────
  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    try {
      const res  = await fetch(`${API}/activity-logs?${params}`, { headers: headers() });
      const data = await res.json();
      setLogs(data.data?.items ?? data.data ?? []);
      setLogTotal(data.data?.total ?? data.pagination?.total ?? 0);
    } catch { setLogs([]); }
    setLogLoading(false);
  }, [page, token]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // ── Analytics derived data ────────────────────────────────────────────────

  // KES raised per month (last 8 months)
  const donationsByMonth = useMemo(() => {
    const map = {};
    donations.forEach(d => {
      if (!d.created_at) return;
      const dt    = new Date(d.created_at);
      const key   = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const label = dt.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { key, label, amount: 0, count: 0 };
      map[key].amount += Number(d.amount) || 0;
      map[key].count  += 1;
    });
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-8)
      .map(m => ({ ...m, amount: Math.round(m.amount) }));
  }, [donations]);

  // Campaign status donut
  const campaignStatusData = useMemo(() => {
    const counts = { active: 0, draft: 0, completed: 0, paused: 0 };
    campaigns.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  // Top 6 campaigns by raised amount
  const topCampaigns = useMemo(() =>
    [...campaigns]
      .filter(c => c.raised_amount > 0)
      .sort((a, b) => b.raised_amount - a.raised_amount)
      .slice(0, 6)
      .map(c => ({
        name: c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title,
        raised:  Math.round(c.raised_amount),
        goal:    Math.round(c.goal_amount),
      }))
  , [campaigns]);

  // Donations per day (last 14 days)
  const donationsDaily = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d   = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key]  = { key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), amount: 0, count: 0 };
    }
    donations.forEach(d => {
      const key = (d.created_at || "").slice(0, 10);
      if (map[key]) { map[key].amount += Number(d.amount) || 0; map[key].count++; }
    });
    return Object.values(map).map(m => ({ ...m, amount: Math.round(m.amount) }));
  }, [donations]);

  // Summary stats
  const totalRaised    = useMemo(() => donations.reduce((s, d) => s + (Number(d.amount) || 0), 0), [donations]);
  const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === "active").length, [campaigns]);
  const completedCampaigns = useMemo(() => campaigns.filter(c => c.status === "completed").length, [campaigns]);
  const approvedBeneficiaries = useMemo(() => beneficiaries.filter(b => b.status === "approved").length, [beneficiaries]);
  const publishedBlogs = useMemo(() => blogs.filter(b => b.published).length, [blogs]);

  const totalPages = Math.ceil(logTotal / PER_PAGE);

  return (
    <div className="al__root">
      {/* ── Tab bar ── */}
      <div className="al__tabs">
        <button
          className={`al__tab ${tab === "analytics" ? "al__tab--active" : ""}`}
          onClick={() => setTab("analytics")}
        >
          <i className="bi bi-graph-up-arrow" /> Analytics
        </button>
        <button
          className={`al__tab ${tab === "feed" ? "al__tab--active" : ""}`}
          onClick={() => setTab("feed")}
        >
          <i className="bi bi-journal-text" /> Activity Feed
          {logTotal > 0 && <span className="al__tab-count">{logTotal}</span>}
        </button>
        <div className="al__tab-spacer" />
        <button className="al__refresh-btn" onClick={() => { loadLogs(); }}>
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ANALYTICS TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "analytics" && (
        <div className="al__analytics">
          {dataLoading ? (
            <div className="al__data-loading">
              <i className="bi bi-arrow-repeat al__spin" />
              <span>Loading analytics…</span>
            </div>
          ) : (
            <>
              {/* ── Stat cards row ── */}
              <div className="al__stats-grid">
                <StatCard icon="bi-cash-stack"     label="Total Raised"          value={`KES ${Math.round(totalRaised).toLocaleString()}`}  color="#22c55e" delay={0}   />
                <StatCard icon="bi-megaphone-fill" label="Active Campaigns"      value={activeCampaigns}    sub={`${completedCampaigns} completed`}  color="#3b82f6" delay={60}  />
                <StatCard icon="bi-heart-pulse"    label="Total Donations"       value={donations.length}   sub={`${donationsDaily.filter(d=>d.count>0).length} active days`} color="#f59e0b" delay={120} />
                <StatCard icon="bi-people-fill"    label="Approved Beneficiaries" value={approvedBeneficiaries} sub={`${beneficiaries.length} total`} color="#14b8a6" delay={180} />
                <StatCard icon="bi-journal-richtext" label="Published Posts"    value={publishedBlogs}     sub={`${blogs.length} total`}           color="#a855f7" delay={240} />
                <StatCard icon="bi-trophy-fill"    label="Campaigns Completed"   value={completedCampaigns} sub={`${campaigns.length} total`}        color="#ef4444" delay={300} />
              </div>

              {/* ── Charts row 1: Area (monthly raised) + Donut (campaign status) ── */}
              <div className="al__charts-row">
                <div className="al__chart-card al__chart-card--wide">
                  <div className="al__chart-header">
                    <span className="al__chart-title">
                      <i className="bi bi-graph-up" /> Monthly Funds Raised (KES)
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={donationsByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                        tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<ChartTooltip prefix="KES " />} />
                      <Area type="monotone" dataKey="amount" name="Raised" stroke="#22c55e" strokeWidth={2.5}
                        fill="url(#areaGreen)" dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="al__chart-card">
                  <div className="al__chart-header">
                    <span className="al__chart-title">
                      <i className="bi bi-pie-chart" /> Campaign Status
                    </span>
                  </div>
                  {campaignStatusData.length === 0 ? (
                    <div className="al__chart-empty">No campaigns yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={campaignStatusData}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {campaignStatusData.map((_, i) => (
                            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── Charts row 2: Daily line + Top campaigns bar ── */}
              <div className="al__charts-row">
                <div className="al__chart-card">
                  <div className="al__chart-header">
                    <span className="al__chart-title">
                      <i className="bi bi-activity" /> Daily Donations — last 14 days
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={donationsDaily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={1} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                        tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<ChartTooltip prefix="KES " />} />
                      <Line type="monotone" dataKey="amount" name="Amount" stroke="#3b82f6"
                        strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="count" name="Count" stroke="#f59e0b"
                        strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="al__chart-card al__chart-card--wide">
                  <div className="al__chart-header">
                    <span className="al__chart-title">
                      <i className="bi bi-bar-chart-steps" /> Top Campaigns by Amount Raised
                    </span>
                  </div>
                  {topCampaigns.length === 0 ? (
                    <div className="al__chart-empty">No donation data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topCampaigns} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}
                          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip prefix="KES " />} />
                        <Bar dataKey="goal"   name="Goal"   fill="#e5e7eb" radius={[0, 3, 3, 0]} />
                        <Bar dataKey="raised" name="Raised" fill="#22c55e" radius={[0, 3, 3, 0]} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ACTIVITY FEED TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "feed" && (
        <div className="al__feed">
          {logLoading ? (
            <div className="al__data-loading">
              <i className="bi bi-arrow-repeat al__spin" />
              <span>Loading activity…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="al__empty">
              <i className="bi bi-clipboard-data" />
              <p>No activity logged yet.</p>
            </div>
          ) : (
            <>
              <div className="al__feed-list">
                {logs.map((r, idx) => {
                  const meta  = ACTION_META[r.action] ?? { color: "grey", icon: "bi-circle" };
                  const color = COLOR_MAP[meta.color] ?? COLOR_MAP.grey;
                  return (
                    <div key={r.id} className="al__feed-row" style={{ animationDelay: `${idx * 18}ms` }}>
                      {/* Timeline dot */}
                      <div className="al__feed-dot" style={{ background: color.dot }} />
                      <div className="al__feed-dot-line" />

                      {/* Content */}
                      <div className="al__feed-content">
                        <div className="al__feed-top">
                          <ActionBadge action={r.action} />

                          {/* Entity chip */}
                          {r.entity && (
                            <span className="al__entity-chip">
                              <i className="bi bi-tag" />
                              {r.entity}
                              {r.entity_id ? <strong>#{r.entity_id}</strong> : null}
                            </span>
                          )}

                          {/* Time */}
                          <span className="al__feed-time">
                            <i className="bi bi-clock" />
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                              : "—"}
                          </span>
                        </div>

                        {/* Description */}
                        {r.description && (
                          <div className="al__feed-desc">{r.description}</div>
                        )}

                        {/* User footer */}
                        <div className="al__feed-footer">
                          <i className="bi bi-person-badge" />
                          {r.user_id ? `Admin #${r.user_id}` : "system"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="crud__pagination" style={{ marginTop: 16 }}>
                  <span>Page {page} of {totalPages} ({logTotal} total events)</span>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}