// VideoSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./VideoSection.css";

gsap.registerPlugin(ScrollTrigger);

import bgVideo from "../assets/story-bg.mp4";

export default function VideoSection() {
  const sectionRef = useRef(null);
  const videoRef   = useRef(null);
  const headerRef  = useRef(null);
  const bodyRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Headline + eyebrow stagger in
      gsap.fromTo(
        headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.14, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );

      // Body copy, stats, CTA stagger in slightly after
      gsap.fromTo(
        bodyRef.current.children,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out",
          delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        }
      );

      // Slow parallax zoom on the background video
      gsap.to(videoRef.current, {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="story" className="video-section" ref={sectionRef}>

      {/* ── Background video layer ── */}
      <div className="video-section__bg">
        <video
          ref={videoRef}
          className="video-section__bg-video"
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Dark grey overlay for readability */}
        <div className="video-section__overlay" />
      </div>

      {/* ── Foreground content ── */}
      <div className="video-container">

        {/* Eyebrow + Headline */}
        <div className="video-section__header" ref={headerRef}>
          <span className="video-section__eyebrow">Our Story</span>
          <h2 className="video-section__headline">
            Your Kindness Has the<br />Power to Change Lives
          </h2>
        </div>

        {/* Body content */}
        <div className="video-section__body" ref={bodyRef}>

          <p className="video-section__sub">
            Since 2018, Widows Flour has walked alongside women who have lost
            their providers — delivering not just food, but dignity, community,
            and renewed hope. Every bag of flour carries a message:{" "}
            <em>you are seen, you are loved, you are not forgotten.</em>
          </p>

          {/* Inline stats strip */}
          <div className="video-section__stats">
            <div className="video-section__stat">
              <span className="video-section__stat-num">500+</span>
              <span className="video-section__stat-label">Meals Delivered</span>
            </div>
            <div className="video-section__stat-divider" />
            <div className="video-section__stat">
              <span className="video-section__stat-num">38</span>
              <span className="video-section__stat-label">Communities Reached</span>
            </div>
            <div className="video-section__stat-divider" />
            <div className="video-section__stat">
              <span className="video-section__stat-num">60+</span>
              <span className="video-section__stat-label">Active Volunteers</span>
            </div>
            <div className="video-section__stat-divider" />
            <div className="video-section__stat">
              <span className="video-section__stat-num">KSH 820K</span>
              <span className="video-section__stat-label">Total Aid Raised</span>
            </div>
          </div>

          {/* CTA row */}
          <div className="video-section__cta-row">
            <a href="#donate" className="video-section__btn video-section__btn--primary">
              Donate Now
            </a>
            <a href="#get-involved" className="video-section__btn video-section__btn--ghost">
              Get Involved
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}