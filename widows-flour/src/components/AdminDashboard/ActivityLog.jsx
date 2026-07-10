// src/components/AdminDashboard/ActivityLog.jsx
//
// Premium analytics dashboard for Widows Flour admin portal.
// Same backend endpoints as before (/campaigns, /admin/donations, /beneficiaries,
// /blogs, /activity-logs) — this file is a full front-end redesign only.
//
// NEW DEPENDENCY: framer-motion
//   npm install framer-motion
//
// Things intentionally NOT built here because the backend doesn't send the data
// yet (rather than fake it):
//   - Payment method / success-failure breakdown (needs donation.payment_method,
//     donation.status on failed attempts)
//   - Device / browser / country breakdown (needs session/log fields we don't
//     currently store)
//   - True real-time push (Socket.IO) — this polls every 30s instead and
//     animates the delta, which gets you 90% of the "alive" feeling without a
//     new backend service
//   - Excel / PDF export — CSV export is wired up client-side; Excel/PDF need
//     xlsx / jspdf added as deps, happy to wire those up once you confirm you
//     want the extra bundle weight
//
// Every chart below is fed only by fields already present in the four fetches.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import "./Crud.css";
import "./ActivityLog.css";

const API      = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const PER_PAGE = 20;
const POLL_MS  = 30000;

// ── Palette — green + warm amber only, per brand rules. Red is reserved for
// destructive/failure states only, grey for neutral/system. No blue, no purple.
const COLOR = {
  green:  { bg: "#dcfce7", text: "#15803d", dot: "#22c55e", line: "#16a34a" },
  mint:   { bg: "#d1fae5", text: "#047857", dot: "#10b981", line: "#059669" },
  amber:  { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b", line: "#d97706" },
  clay:   { bg: "#ffedd5", text: "#9a3412", dot: "#fb923c", line: "#ea580c" },
  red:    { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444", line: "#dc2626" },
  grey:   { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af", line: "#9ca3af" },
};

const ACTION_META = {
  LOGIN:                { color: "green", icon: "bi-box-arrow-in-right", label: "Login",               group: "Logins"     },
  LOGOUT:                { color: "grey",  icon: "bi-box-arrow-right",   label: "Logout",               group: "Logins"     },
  REGISTER:              { color: "mint",  icon: "bi-person-plus",       label: "Register",             group: "Logins"     },
  PROVISION_ADMIN:       { color: "amber", icon: "bi-shield-plus",       label: "Provision Admin",      group: "Admins"     },
  APPROVE_ADMIN:         { color: "green", icon: "bi-person-check",      label: "Approved Admin",       group: "Admins"     },
  REJECT_ADMIN:          { color: "red",   icon: "bi-person-x",          label: "Rejected Admin",       group: "Admins"     },
  CREATE_BENEFICIARY:    { color: "green", icon: "bi-person-heart",      label: "Add Beneficiary",      group: "Approvals"  },
  UPDATE_BENEFICIARY:    { color: "mint",  icon: "bi-person-gear",       label: "Edit Beneficiary",     group: "Approvals"  },
  DELETE_BENEFICIARY:    { color: "red",   icon: "bi-person-x",          label: "Delete Beneficiary",   group: "Approvals"  },
  APPROVE_BENEFICIARY:   { color: "mint",  icon: "bi-person-check",      label: "Approve Beneficiary",  group: "Approvals"  },
  ARCHIVE_BENEFICIARY:   { color: "grey",  icon: "bi-archive",           label: "Archive Beneficiary",  group: "Approvals"  },
  CREATE_CAMPAIGN:       { color: "green", icon: "bi-megaphone",         label: "New Campaign",         group: "Campaigns"  },
  UPDATE_CAMPAIGN:       { color: "mint",  icon: "bi-pencil-square",     label: "Edit Campaign",        group: "Campaigns"  },
  DELETE_CAMPAIGN:       { color: "red",   icon: "bi-trash",             label: "Delete Campaign",      group: "Campaigns"  },
  ACTIVATE_CAMPAIGN:     { color: "green", icon: "bi-play-circle",       label: "Activate Campaign",    group: "Campaigns"  },
  PAUSE_CAMPAIGN:        { color: "amber", icon: "bi-pause-circle",      label: "Pause Campaign",       group: "Campaigns"  },
  COMPLETE_CAMPAIGN:     { color: "mint",  icon: "bi-check-circle",      label: "Complete Campaign",    group: "Campaigns"  },
  DONATION_RECEIVED:     { color: "green", icon: "bi-heart-pulse",       label: "Donation Received",    group: "Donations"  },
  CREATE_BLOG:           { color: "green", icon: "bi-journal-plus",      label: "New Blog",             group: "Posts"      },
  UPDATE_BLOG:           { color: "mint",  icon: "bi-journal-text",      label: "Edit Blog",            group: "Posts"      },
  DELETE_BLOG:           { color: "red",   icon: "bi-journal-x",         label: "Delete Blog",          group: "Posts"      },
  PUBLISH_BLOG:          { color: "green", icon: "bi-journal-check",     label: "Publish Blog",         group: "Posts"      },
  UNPUBLISH_BLOG:        { color: "amber", icon: "bi-journal-minus",     label: "Unpublish Blog",       group: "Posts"      },
};

const FEED_FILTERS = ["All", "Logins", "Donations", "Campaigns", "Posts", "Approvals", "Admins", "System"];
const RANGE_OPTIONS = [
  { key: "7d",  label: "7D",  days: 7   },
  { key: "30d", label: "30D", days: 30  },
  { key: "90d", label: "90D", days: 90  },
  { key: "1y",  label: "1Y",  days: 365 },
];

// ─────────────────────────────────────────────────────────────────────────
// Small primitives
// ─────────────────────────────────────────────────────────────────────────

/** Animated number — springs from its previous value to the new one. */
function CountUp({ value, prefix = "", suffix = "", decimals = 0 }) {
  const spring   = useSpring(0, { stiffness: 120, damping: 22, mass: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => spring.on("change", v => setDisplay(v)), [spring]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

function Sparkline({ data, dataKey, color }) {
  if (!data?.length) return <div className="al__spark-empty" />;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}-${color.dot.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color.dot} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color.dot} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey={dataKey} stroke={color.line} strokeWidth={1.75}
          fill={`url(#spark-${dataKey}-${color.dot.slice(1)})`} isAnimationActive
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="al__tooltip">
      <div className="al__tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="al__tooltip-row" style={{ color: p.color }}>
          <span className="al__tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: </span>
          <strong>{prefix}{typeof p.value === "number" ? Math.round(p.value).toLocaleString() : p.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
}

function DeltaBadge({ pct }) {
  if (pct === null || pct === undefined || !isFinite(pct)) return null;
  const up = pct >= 0;
  return (
    <span className={`al__delta ${up ? "al__delta--up" : "al__delta--down"}`}>
      <i className={`bi ${up ? "bi-arrow-up-short" : "bi-arrow-down-short"}`} />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function StatCard({ icon, label, value, prefix = "", isCurrency, deltaPct, spark, sparkKey, color, index }) {
  return (
    <motion.div
      className="al__stat-card"
      style={{ "--card-accent": color.dot }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="al__stat-card-glow" style={{ background: color.dot }} />
      <div className="al__stat-top">
        <div className="al__stat-icon" style={{ background: color.bg, color: color.text }}>
          <i className={`bi ${icon}`} />
        </div>
        <DeltaBadge pct={deltaPct} />
      </div>
      <div className="al__stat-value">
        <CountUp value={value} prefix={isCurrency ? "KES " : prefix} />
      </div>
      <div className="al__stat-label">{label}</div>
      <div className="al__stat-spark"><Sparkline data={spark} dataKey={sparkKey} color={color} /></div>
    </motion.div>
  );
}

function SkeletonCard() {
  return <div className="al__skeleton al__skeleton--card" />;
}
function SkeletonChart({ h = 220 }) {
  return <div className="al__skeleton al__skeleton--chart" style={{ height: h }} />;
}

function EmptyState({ icon = "bi-inboxes", title, cta, onCta }) {
  return (
    <div className="al__empty-state">
      <div className="al__empty-icon"><i className={`bi ${icon}`} /></div>
      <p>{title}</p>
      {cta && <button className="al__empty-cta" onClick={onCta}>{cta}</button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────

export default function ActivityLog({ token, currentAdmin }) {
  const [tab, setTab] = useState("analytics");
  const [range, setRange] = useState("30d");

  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState("All");
  const [feedSearch, setFeedSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);

  const [hoverIdx, setHoverIdx] = useState(null); // shared crosshair between synced charts

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token],
  );

  // ── Fetch analytics data (initial + poll every 30s) ──
  const loadAnalytics = useCallback(async ({ silent } = {}) => {
    if (!token) return;
    if (!silent) setDataLoading(true);
    const results = await Promise.allSettled([
      fetch(`${API}/campaigns?per_page=200`,       { headers: headers() }).then(r => r.json()),
      fetch(`${API}/admin/donations?per_page=500`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/beneficiaries?per_page=200`,   { headers: headers() }).then(r => r.json()),
      fetch(`${API}/blogs?per_page=200`,           { headers: headers() }).then(r => r.json()),
    ]);
    const [c, d, b, bl] = results;
    if (c.status  === "fulfilled") setCampaigns(c.value.data?.items     ?? c.value.data  ?? []);
    if (d.status  === "fulfilled") setDonations(d.value.data?.items     ?? d.value.data  ?? []);
    if (b.status  === "fulfilled") setBeneficiaries(b.value.data?.items ?? b.value.data  ?? []);
    if (bl.status === "fulfilled") setBlogs(bl.value.data?.items        ?? bl.value.data ?? []);
    setLastSynced(new Date());
    if (!silent) setDataLoading(false);
  }, [token, headers]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // poll silently every 30s so numbers animate to the new value instead of re-mounting
  useEffect(() => {
    const id = setInterval(() => loadAnalytics({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [loadAnalytics]);

  // ── Fetch activity log ──
  const loadLogs = useCallback(async () => {
    if (!token) return;
    setLogLoading(true);
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    try {
      const res  = await fetch(`${API}/activity-logs?${params}`, { headers: headers() });
      const data = await res.json();
      setLogs(data.data?.items ?? data.data ?? []);
      setLogTotal(data.data?.total ?? data.pagination?.total ?? 0);
    } catch { setLogs([]); }
    setLogLoading(false);
  }, [page, token, headers]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // ── Range window (days) ──
  const rangeDays = RANGE_OPTIONS.find(r => r.key === range)?.days ?? 30;

  // ── Derived series ──
  const dailySeries = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = {
        key,
        label: d.toLocaleDateString("en-GB", rangeDays > 60 ? { month: "short", year: "2-digit" } : { day: "numeric", month: "short" }),
        amount: 0, count: 0,
      };
    }
    donations.forEach(d => {
      const key = (d.created_at || "").slice(0, 10);
      if (map[key]) { map[key].amount += Number(d.amount) || 0; map[key].count++; }
    });
    const arr = Object.values(map);
    let running = 0;
    return arr.map(m => {
      running += m.amount;
      return { ...m, amount: Math.round(m.amount), cumulative: Math.round(running) };
    });
  }, [donations, rangeDays]);

  const prevWindowTotals = useMemo(() => {
    // previous equal-length window, for the delta badges
    const now = new Date();
    const start = new Date(now); start.setDate(start.getDate() - rangeDays * 2);
    const end   = new Date(now); end.setDate(end.getDate() - rangeDays);
    let raised = 0, count = 0;
    donations.forEach(d => {
      const dt = new Date(d.created_at || 0);
      if (dt >= start && dt < end) { raised += Number(d.amount) || 0; count++; }
    });
    return { raised, count };
  }, [donations, rangeDays]);

  const currentWindowTotals = useMemo(() => {
    const raised = dailySeries.reduce((s, d) => s + d.amount, 0);
    const count  = dailySeries.reduce((s, d) => s + d.count, 0);
    return { raised, count };
  }, [dailySeries]);

  const pctChange = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : null;
    return ((curr - prev) / prev) * 100;
  };

  const activeCampaigns       = useMemo(() => campaigns.filter(c => c.status === "active").length, [campaigns]);
  const completedCampaigns    = useMemo(() => campaigns.filter(c => c.status === "completed").length, [campaigns]);
  const approvedBeneficiaries = useMemo(() => beneficiaries.filter(b => b.status === "approved").length, [beneficiaries]);
  const publishedBlogs        = useMemo(() => blogs.filter(b => b.published).length, [blogs]);
  const totalRaised           = useMemo(() => donations.reduce((s, d) => s + (Number(d.amount) || 0), 0), [donations]);

  const campaignStatusData = useMemo(() => {
    const counts = { active: 0, draft: 0, completed: 0, paused: 0 };
    campaigns.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  const statusPalette = { active: COLOR.green.dot, draft: COLOR.grey.dot, completed: COLOR.mint.dot, paused: COLOR.amber.dot };

  const topCampaigns = useMemo(() =>
    [...campaigns].filter(c => c.raised_amount > 0)
      .sort((a, b) => b.raised_amount - a.raised_amount).slice(0, 8)
      .map(c => ({
        name:   c.title?.length > 24 ? c.title.slice(0, 24) + "…" : c.title,
        raised: Math.round(c.raised_amount),
        goal:   Math.round(c.goal_amount || 0),
        pct:    c.goal_amount ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0,
      }))
  , [campaigns]);

  const avgCampaignCompletion = useMemo(() => {
    const withGoal = campaigns.filter(c => c.goal_amount > 0);
    if (!withGoal.length) return 0;
    const total = withGoal.reduce((s, c) => s + Math.min(1, c.raised_amount / c.goal_amount), 0);
    return Math.round((total / withGoal.length) * 100);
  }, [campaigns]);

  const radialData = [{ name: "Completion", value: avgCampaignCompletion, fill: COLOR.green.dot }];

  // Donation size distribution (histogram, bucketed client-side from amounts we already have)
  const donationHistogram = useMemo(() => {
    if (!donations.length) return [];
    const amounts = donations.map(d => Number(d.amount) || 0).filter(a => a > 0);
    if (!amounts.length) return [];
    const max = Math.max(...amounts);
    const bucketSize = Math.max(500, Math.ceil(max / 8 / 500) * 500);
    const buckets = {};
    amounts.forEach(a => {
      const b = Math.floor(a / bucketSize) * bucketSize;
      buckets[b] = (buckets[b] || 0) + 1;
    });
    return Object.keys(buckets).map(Number).sort((a, b) => a - b).map(b => ({
      label: `${(b / 1000).toFixed(b >= 1000 ? 0 : 1)}k`,
      count: buckets[b],
    }));
  }, [donations]);

  const avgDonation    = donations.length ? totalRaised / donations.length : 0;
  const medianDonation = useMemo(() => {
    const amounts = donations.map(d => Number(d.amount) || 0).filter(a => a > 0).sort((a, b) => a - b);
    if (!amounts.length) return 0;
    const mid = Math.floor(amounts.length / 2);
    return amounts.length % 2 ? amounts[mid] : (amounts[mid - 1] + amounts[mid]) / 2;
  }, [donations]);
  const largestDonation = useMemo(() => Math.max(0, ...donations.map(d => Number(d.amount) || 0)), [donations]);

  // ── Activity feed filtering ──
  const filteredLogs = useMemo(() => {
    let out = logs;
    if (feedFilter !== "All") {
      out = out.filter(r => (ACTION_META[r.action]?.group ?? "System") === feedFilter);
    }
    if (feedSearch.trim()) {
      const q = feedSearch.trim().toLowerCase();
      out = out.filter(r =>
        (r.description || "").toLowerCase().includes(q) ||
        (r.entity || "").toLowerCase().includes(q) ||
        String(r.entity_id ?? "").toLowerCase().includes(q) ||
        String(r.user_id ?? "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [logs, feedFilter, feedSearch]);

  const totalPages = Math.ceil(logTotal / PER_PAGE);

  // ── CSV export (client-side, from the currently loaded page of logs) ──
  const exportCsv = () => {
    const cols = ["timestamp", "action", "user_id", "entity", "entity_id", "description"];
    const rows = filteredLogs.map(r => [
      r.created_at ?? "", r.action ?? "", r.user_id ?? "", r.entity ?? "", r.entity_id ?? "", (r.description ?? "").replace(/"/g, '""'),
    ]);
    const csv = [cols.join(","), ...rows.map(row => row.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // sparkline feeds for stat cards — trailing 14 pts from whichever series applies
  const spark14 = dailySeries.slice(-14);

  return (
    <motion.div className="al__root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

      {/* ── Tab bar ── */}
      <div className="al__tabs">
        <button className={`al__tab ${tab === "analytics" ? "al__tab--active" : ""}`} onClick={() => setTab("analytics")}>
          <i className="bi bi-graph-up-arrow" /> Analytics
        </button>
        <button className={`al__tab ${tab === "feed" ? "al__tab--active" : ""}`} onClick={() => setTab("feed")}>
          <i className="bi bi-journal-text" /> Activity Feed
          {logTotal > 0 && <span className="al__tab-count">{logTotal}</span>}
        </button>
        <div className="al__tab-spacer" />
        {lastSynced && (
          <span className="al__sync-note">
            <span className="al__live-dot" /> synced {lastSynced.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button className="al__refresh-btn" onClick={() => { loadAnalytics(); loadLogs(); }}>
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
      {tab === "analytics" && (
        <div className="al__analytics">

          {/* Range filter */}
          <div className="al__range-bar">
            {RANGE_OPTIONS.map(r => (
              <button key={r.key} className={`al__range-btn ${range === r.key ? "al__range-btn--active" : ""}`} onClick={() => setRange(r.key)}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Stat cards */}
          {dataLoading ? (
            <div className="al__stats-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="al__stats-grid">
              <StatCard index={0} icon="bi-cash-stack" label="Total Funds Raised" value={totalRaised} isCurrency
                deltaPct={pctChange(currentWindowTotals.raised, prevWindowTotals.raised)}
                spark={spark14} sparkKey="amount" color={COLOR.green} />
              <StatCard index={1} icon="bi-heart-pulse" label="Total Donations" value={donations.length}
                deltaPct={pctChange(currentWindowTotals.count, prevWindowTotals.count)}
                spark={spark14} sparkKey="count" color={COLOR.mint} />
              <StatCard index={2} icon="bi-megaphone-fill" label="Active Campaigns" value={activeCampaigns}
                spark={spark14} sparkKey="count" color={COLOR.amber} />
              <StatCard index={3} icon="bi-trophy-fill" label="Completed Campaigns" value={completedCampaigns}
                spark={spark14} sparkKey="amount" color={COLOR.clay} />
              <StatCard index={4} icon="bi-people-fill" label="Beneficiaries Approved" value={approvedBeneficiaries}
                spark={spark14} sparkKey="count" color={COLOR.green} />
              <StatCard index={5} icon="bi-journal-richtext" label="Published Blog Posts" value={publishedBlogs}
                spark={spark14} sparkKey="amount" color={COLOR.mint} />
            </div>
          )}

          {/* Synced funds charts */}
          <div className="al__section-head">
            <h3>Funds Raised Analytics</h3>
            <span className="al__section-sub">Hover either chart to inspect a date</span>
          </div>
          {dataLoading ? (
            <div className="al__charts-row">
              <SkeletonChart /><SkeletonChart />
            </div>
          ) : dailySeries.every(d => d.amount === 0) ? (
            <EmptyState icon="bi-graph-up" title="No donations recorded in this window yet." />
          ) : (
            <div className="al__charts-row al__charts-row--split">
              <div className="al__chart-card">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-graph-up" /> Cumulative Funds Raised</span></div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailySeries} onMouseMove={s => setHoverIdx(s?.activeTooltipIndex ?? null)} onMouseLeave={() => setHoverIdx(null)}>
                    <defs>
                      <linearGradient id="areaCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLOR.green.dot} stopOpacity={0.28} />
                        <stop offset="95%" stopColor={COLOR.green.dot} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<ChartTooltip prefix="KES " />} />
                    {hoverIdx != null && dailySeries[hoverIdx] && (
                      <Line data={dailySeries} dataKey={() => null} isAnimationActive={false} />
                    )}
                    <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke={COLOR.green.line} strokeWidth={2.5}
                      fill="url(#areaCumulative)" dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="al__chart-card">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-bar-chart" /> Daily Donations</span></div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailySeries} onMouseMove={s => setHoverIdx(s?.activeTooltipIndex ?? null)} onMouseLeave={() => setHoverIdx(null)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}
                      interval={rangeDays > 30 ? Math.floor(rangeDays / 12) : 1} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<ChartTooltip prefix="KES " />} />
                    <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
                      {dailySeries.map((d, i) => (
                        <Cell key={i} fill={hoverIdx === i ? COLOR.clay.dot : COLOR.amber.dot} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Donation analytics */}
          <div className="al__section-head">
            <h3>Donation Analytics</h3>
            <span className="al__section-sub">
              Avg KES {Math.round(avgDonation).toLocaleString()} · Median KES {Math.round(medianDonation).toLocaleString()} · Largest KES {Math.round(largestDonation).toLocaleString()}
            </span>
          </div>
          {dataLoading ? (
            <div className="al__charts-row"><SkeletonChart /><SkeletonChart /></div>
          ) : !donations.length ? (
            <EmptyState icon="bi-heart" title="No donations yet." cta="Create a Campaign" onCta={() => window?.sendPrompt?.("Create Campaign")} />
          ) : (
            <div className="al__charts-row al__charts-row--split">
              <div className="al__chart-card">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-bar-chart-line" /> Donation Size Distribution</span></div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={donationHistogram}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip suffix=" donations" />} />
                    <Bar dataKey="count" name="Donations" fill={COLOR.mint.dot} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="al__chart-card">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-pie-chart" /> Campaign Status Split</span></div>
                {!campaignStatusData.length ? (
                  <EmptyState icon="bi-megaphone" title="No campaigns yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={campaignStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3}
                        dataKey="value" isAnimationActive animationDuration={800}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {campaignStatusData.map((d, i) => <Cell key={i} fill={statusPalette[d.name] ?? COLOR.grey.dot} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Campaign performance */}
          <div className="al__section-head">
            <h3>Campaign Performance</h3>
            <span className="al__section-sub">Top campaigns by amount raised, goal progress</span>
          </div>
          {dataLoading ? (
            <div className="al__charts-row al__charts-row--split"><SkeletonChart /><SkeletonChart h={160} /></div>
          ) : !topCampaigns.length ? (
            <EmptyState icon="bi-megaphone" title="No campaigns with donations yet." cta="Create a Campaign" onCta={() => window?.sendPrompt?.("Create Campaign")} />
          ) : (
            <div className="al__charts-row al__charts-row--wide-narrow">
              <div className="al__chart-card">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-bar-chart-steps" /> Top Campaigns — Goal vs Raised</span></div>
                <ResponsiveContainer width="100%" height={Math.max(220, topCampaigns.length * 34)}>
                  <BarChart data={topCampaigns} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip prefix="KES " />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="goal" name="Goal" fill="#e5e7eb" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={800} />
                    <Bar dataKey="raised" name="Raised" fill={COLOR.green.dot} radius={[0, 4, 4, 0]} isAnimationActive animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="al__chart-card al__chart-card--center">
                <div className="al__chart-header"><span className="al__chart-title"><i className="bi bi-speedometer2" /> Avg Completion Rate</span></div>
                <ResponsiveContainer width="100%" height={180}>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#f1f5f9" }} isAnimationActive animationDuration={1000} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="al__radial-center-label">
                  <CountUp value={avgCampaignCompletion} suffix="%" />
                  <span>of goal, on average</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ ACTIVITY FEED TAB ══════════════════ */}
      {tab === "feed" && (
        <div className="al__feed">
          <div className="al__feed-toolbar">
            <div className="al__feed-filters">
              {FEED_FILTERS.map(f => (
                <button key={f} className={`al__chip ${feedFilter === f ? "al__chip--active" : ""}`} onClick={() => setFeedFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className="al__feed-toolbar-right">
              <div className="al__search">
                <i className="bi bi-search" />
                <input placeholder="Search user, campaign, entity…" value={feedSearch} onChange={e => setFeedSearch(e.target.value)} />
              </div>
              <div className="al__export-wrap">
                <button className="al__export-btn" onClick={() => setExportOpen(o => !o)}>
                  <i className="bi bi-download" /> Export
                </button>
                <AnimatePresence>
                  {exportOpen && (
                    <motion.div className="al__export-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                      <button onClick={exportCsv}><i className="bi bi-filetype-csv" /> CSV (this page)</button>
                      <button disabled title="Add xlsx dependency to enable"><i className="bi bi-filetype-xlsx" /> Excel — coming soon</button>
                      <button disabled title="Add jspdf dependency to enable"><i className="bi bi-filetype-pdf" /> PDF — coming soon</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {logLoading ? (
            <div className="al__feed-list">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="al__skeleton al__skeleton--row" />)}
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState icon="bi-clipboard-data" title="No activity matches this filter." />
          ) : (
            <>
              <div className="al__feed-list">
                <AnimatePresence initial={false}>
                  {filteredLogs.map((r, idx) => {
                    const meta  = ACTION_META[r.action] ?? { color: "grey", icon: "bi-circle", label: r.action, group: "System" };
                    const color = COLOR[meta.color] ?? COLOR.grey;
                    return (
                      <motion.div
                        key={r.id}
                        className="al__feed-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx, 10) * 0.03 }}
                        whileHover={{ backgroundColor: "rgba(34,197,94,0.03)" }}
                      >
                        <div className="al__feed-dot" style={{ background: color.dot }} />
                        <div className="al__feed-content">
                          <div className="al__feed-top">
                            <span className="al__badge" style={{ background: color.bg, color: color.text }}>
                              <i className={`bi ${meta.icon}`} /><span>{meta.label}</span>
                            </span>
                            {r.entity && (
                              <span className="al__entity-chip">
                                <i className="bi bi-tag" />{r.entity}{r.entity_id ? <strong>#{r.entity_id}</strong> : null}
                              </span>
                            )}
                            <span className="al__feed-time">
                              <i className="bi bi-clock" />
                              {r.created_at ? new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                            </span>
                          </div>
                          {r.description && <div className="al__feed-desc">{r.description}</div>}
                          <div className="al__feed-footer">
                            <i className="bi bi-person-badge" />
                            {r.user_id ? `Admin #${r.user_id}` : "system"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              {totalPages > 1 && (
                <div className="crud__pagination" style={{ marginTop: 16 }}>
                  <span>Page {page} of {totalPages} ({logTotal} total events)</span>
                  <div className="crud__pagination-btns">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}><i className="bi bi-chevron-left" /> Prev</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next <i className="bi bi-chevron-right" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}