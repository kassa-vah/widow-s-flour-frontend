// VideoSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./VideoSection.css";

gsap.registerPlugin(ScrollTrigger);

const IMGS = {
  cover: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80",
  t1: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&q=80",
  t2: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&q=80",
  t3: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80",
  t4: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&q=80",
};

export default function VideoSection() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const playerRef  = useRef(null);
  const thumbsRef  = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.15, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 80%" }
        }
      );

      // Player scale up
      gsap.fromTo(playerRef.current,
        { scale: 0.88, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: playerRef.current, start: "top 80%" }
        }
      );

      // Thumbs slide in from sides
      thumbsRef.current.forEach((thumb, i) => {
        if (!thumb) return;
        const fromX = i < 2 ? -50 : 50;
        gsap.fromTo(thumb,
          { x: fromX, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
            delay: 0.2 + (i % 2) * 0.12,
            scrollTrigger: { trigger: playerRef.current, start: "top 75%" }
          }
        );
      });

      // Subtle zoom-out parallax on cover image
      gsap.to(playerRef.current.querySelector("img"), {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="story" className="video-section" ref={sectionRef}>
      <div className="container">
        <div className="video-section__header" ref={headerRef}>
          <span className="video-section__eyebrow">Our Story</span>
          <h2 className="video-section__headline">
            Your Kindness Has the<br />Power to Change Lives
          </h2>
          <p className="video-section__sub">
            Join us in bringing hope, support, and brighter futures to widows and
            their children in communities that need it most.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          {/* Left thumbs */}
          <div className="video-section__thumbs video-section__thumbs--left">
            <div className="video-section__thumb" ref={(el) => (thumbsRef.current[0] = el)}>
              <img src={IMGS.t1} alt="" />
            </div>
            <div className="video-section__thumb" ref={(el) => (thumbsRef.current[1] = el)}>
              <img src={IMGS.t2} alt="" />
            </div>
          </div>

          {/* Video */}
          <div className="video-section__player-wrap" ref={playerRef}>
            <img src={IMGS.cover} alt="Watch our story" />
            <div className="video-section__play">
              <div className="video-section__play-btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right thumbs */}
          <div className="video-section__thumbs video-section__thumbs--right">
            <div className="video-section__thumb" ref={(el) => (thumbsRef.current[2] = el)}>
              <img src={IMGS.t3} alt="" />
            </div>
            <div className="video-section__thumb" ref={(el) => (thumbsRef.current[3] = el)}>
              <img src={IMGS.t4} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}