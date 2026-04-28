import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";

import Navbar              from "./components/Navbar";
import HeroSection         from "./components/HeroSection";
import IntroSection        from "./components/IntroSection";
import MarqueeSection      from "./components/MarqueeSection";
import AboutSection        from "./components/AboutSection";
import ImpactSection       from "./components/ImpactSection";
import CausesSection       from "./components/CausesSection";
import VideoSection        from "./components/VideoSection";
import GetInvolvedSection  from "./components/GetInvolvedSection";
import TestimonialsSection from "./components/TestimonialsSection";
import { CTASection, Footer } from "./components/CTASection";
import GlobeSection        from "./components/GlobeSection";

import AuthPage       from "./components/Auth/AuthPage";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

// ── Read localStorage synchronously so initial state is correct ──
function getStoredSession() {
  try {
    const token = localStorage.getItem("fb_token");
    const admin = localStorage.getItem("admin");
    if (token && admin) return { token, admin: JSON.parse(admin) };
  } catch { /* corrupt */ }
  return { token: null, admin: null };
}

function PrivateRoute({ admin, token, children }) {
  if (!admin || !token) return <Navigate to="/login" replace />;
  return children;
}

// Redirect logged-in users away from /login and /register
function PublicOnlyRoute({ admin, token, children }) {
  if (admin && token) return <Navigate to="/admin-dashboard" replace />;
  return children;
}

const INACTIVITY_MS = 15 * 60 * 1000;

export default function App() {
  const cursorRef     = useRef(null);
  const followerRef   = useRef(null);
  const inactivityRef = useRef(null);
  const navigate      = useNavigate();

  const [pendingNav, setPendingNav] = useState(null);
  const [session, setSession]       = useState(getStoredSession);
  const { admin, token } = session;

  // ── Navigate AFTER React commits the new session state ──
  useEffect(() => {
    if (pendingNav) {
      navigate(pendingNav, { replace: true });
      setPendingNav(null);
    }
  }, [session, pendingNav, navigate]);

  // ── Inactivity logout ──
  const resetInactivityTimer = () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => handleLogout(true), INACTIVITY_MS);
  };

  useEffect(() => {
    if (!admin || !token) return;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, token]);

  // ── Login ──
  const handleLogin = (adminData, fbToken) => {
    localStorage.setItem("fb_token", fbToken);
    localStorage.setItem("admin",    JSON.stringify(adminData));
    setSession({ admin: adminData, token: fbToken });
    setPendingNav("/admin-dashboard");   // navigates after state commits
  };

  // ── Logout ──
  const handleLogout = async (silent = false) => {
    const currentToken = localStorage.getItem("fb_token");
    localStorage.removeItem("fb_token");
    localStorage.removeItem("admin");
    setSession({ admin: null, token: null });
    setPendingNav("/");

    // Tell Flask to terminate the session — must use backend port, not Vite's
    if (currentToken) {
      try {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch { /* swallow — client is already logged out */ }
    }
  };

  // ── Custom cursor ──
  useEffect(() => {
    const cursor   = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0, fX = 0, fY = 0, rafId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, { x: mouseX - 6, y: mouseY - 6, duration: 0.06, ease: "none" });
    };

    const raf = () => {
      fX += (mouseX - fX - 20) * 0.1;
      fY += (mouseY - fY - 20) * 0.1;
      gsap.set(follower, { x: fX, y: fY });
      rafId = requestAnimationFrame(raf);
    };

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(raf);

    const onEnter = () => gsap.to([cursor, follower], { scale: 1.8, duration: 0.2 });
    const onLeave = () => gsap.to([cursor, follower], { scale: 1,   duration: 0.2 });
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>

        {/* ── Public site ── */}
        <Route
          path="/"
          element={
            <>
              <div className="cursor"          ref={cursorRef} />
              <div className="cursor-follower" ref={followerRef} />
              <Navbar />
              <main className="app-main">
                <HeroSection />
                <IntroSection />
                <MarqueeSection />
                <AboutSection />
                <GlobeSection />
                <ImpactSection />
                <CausesSection />
                <VideoSection />
                <GetInvolvedSection />
                <TestimonialsSection />
                <CTASection />
              </main>
              <Footer />
            </>
          }
        />

        {/* ── Login ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute admin={admin} token={token}>
              <AuthPage onLogin={handleLogin} onBack={() => navigate("/")} />
            </PublicOnlyRoute>
          }
        />

        {/* ── Register ── */}
        <Route
          path="/register"
          element={
            <PublicOnlyRoute admin={admin} token={token}>
              <AuthPage onLogin={handleLogin} onBack={() => navigate("/")} />
            </PublicOnlyRoute>
          }
        />

        {/* ── Admin dashboard ── */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute admin={admin} token={token}>
              <AdminDashboard
                admin={admin}
                token={token}
                onLogout={() => handleLogout(false)}
              />
            </PrivateRoute>
          }
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}