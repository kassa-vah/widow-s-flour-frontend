import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/globals.css";

import Navbar             from "./components/Navbar";
import IntroSection       from "./components/IntroSection";
import HeroSection        from "./components/HeroSection";
import MarqueeSection     from "./components/MarqueeSection";
import AboutSection       from "./components/AboutSection";
import ImpactSection      from "./components/ImpactSection";
import CausesSection      from "./components/CausesSection";
import VideoSection       from "./components/VideoSection";
import GetInvolvedSection from "./components/GetInvolvedSection";
import TestimonialsSection from "./components/TestimonialsSection";
import { CTASection, Footer } from "./components/CTASection";

export default function App() {
  const cursorRef   = useRef(null);
  const followerRef = useRef(null);

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
    const onLeave = () => gsap.to([cursor, follower], { scale: 1, duration: 0.2 });
    document.querySelectorAll("a, button").forEach(el => {
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
      <div className="cursor"          ref={cursorRef} />
      <div className="cursor-follower" ref={followerRef} />
      <Navbar />
      {/* IMPORTANT: main must have NO overflow:hidden/clip — kills sticky */}
      <main>
        <IntroSection />
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