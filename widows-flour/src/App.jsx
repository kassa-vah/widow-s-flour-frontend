// App.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "../src/styles/global.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MarqueeSection from "./components/MarqueeSection";
import AboutSection from "./components/AboutSection";
import ImpactSection from "./components/ImpactSection";
import CausesSection from "./components/CausesSection";
import VideoSection from "./components/VideoSection";
import GetInvolvedSection from "./components/GetInvolvedSection";
import TestimonialsSection from "./components/TestimonialsSection";
import { CTASection, Footer } from "./components/CTASection";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const cursorRef   = useRef(null);
  const followerRef = useRef(null);

  // Refresh ScrollTrigger after mount
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);

  // Custom cursor
  useEffect(() => {
    const cursor   = cursorRef.current;
    const follower = followerRef.current;
    let mouseX = 0, mouseY = 0;
    let fX = 0, fY = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, { x: mouseX - 6, y: mouseY - 6, duration: 0.08, ease: "none" });
    };

    let rafId;
    const raf = () => {
      fX += (mouseX - fX - 20) * 0.12;
      fY += (mouseY - fY - 20) * 0.12;
      gsap.set(follower, { x: fX, y: fY });
      rafId = requestAnimationFrame(raf);
    };

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(raf);

    const enter = () => {
      gsap.to(cursor,   { scale: 2.5, duration: 0.25 });
      gsap.to(follower, { scale: 1.6, opacity: 0.3, duration: 0.25 });
    };
    const leave = () => {
      gsap.to(cursor,   { scale: 1, duration: 0.25 });
      gsap.to(follower, { scale: 1, opacity: 0.6, duration: 0.25 });
    };

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor"          ref={cursorRef}   />
      <div className="cursor-follower" ref={followerRef} />

      <Navbar />
      <main>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ImpactSection />
        <CausesSection />
        <VideoSection />
        <GetInvolvedSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}