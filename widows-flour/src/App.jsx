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

function PublicOnlyRoute({ admin, token, children }) {
  if (admin && token) return <Navigate to="/admin-dashboard" replace />;
  return children;
}

export default function App() {
  const cursorRef   = useRef(null);
  const followerRef = useRef(null);
  const navigate    = useNavigate();

  // ── Initialize state synchronously from localStorage ──
  const [session, setSession] = useState(getStoredSession);
  const { admin, token } = session;

  const handleLogin = (adminData, fbToken) => {
    localStorage.setItem("fb_token", fbToken);
    localStorage.setItem("admin", JSON.stringify(adminData));
    setSession({ admin: adminData, token: fbToken });
    navigate("/admin-dashboard", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("fb_token");
    localStorage.removeItem("admin");
    setSession({ admin: null, token: null });
    navigate("/", { replace: true });
  };

  // Custom cursor
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
              <Navbar onAdminClick={() => navigate("/login")} />
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

        {/* ── Admin dashboard ── */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute admin={admin} token={token}>
              <AdminDashboard admin={admin} token={token} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}