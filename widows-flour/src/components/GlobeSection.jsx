import { useEffect, useRef } from 'react';
import './GlobeSection.css';

import globeVideo from "../assets/globe.mp4";

export default function GlobeSection() {
  const sectionRef  = useRef(null);
  const videoRef    = useRef(null);
  const eyebrowRef  = useRef(null);
  const headlineRef = useRef(null);
  const sublineRef  = useRef(null);
  const ctaRef      = useRef(null);

  /* ── Bulletproof mobile autoplay ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // These attributes must also be set in JS for iOS Safari —
    // having them only in JSX is sometimes not enough.
    v.muted       = true;
    v.loop        = true;
    v.playsInline = true;
    v.playbackRate = 0.45;

    const tryPlay = () => {
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay blocked — try again on first user interaction
          const resume = () => {
            v.play().catch(() => {});
            document.removeEventListener('touchstart', resume);
            document.removeEventListener('click', resume);
          };
          document.addEventListener('touchstart', resume, { once: true });
          document.addEventListener('click',      resume, { once: true });
        });
      }
    };

    // Try immediately
    if (v.readyState >= 2) {
      tryPlay();
    } else {
      v.addEventListener('canplay', tryPlay, { once: true });
    }

    // Also retry when page becomes visible again (tab switch / app switch)
    const onVisible = () => {
      if (!document.hidden) v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      v.removeEventListener('canplay', tryPlay);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  /* ── GSAP ScrollTrigger ── */
  useEffect(() => {
    let ctx;
    (async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const ease = 'power3.out';
        const st = (trigger, start = 'top 85%') => ({
          trigger, start, toggleActions: 'play none none reverse',
        });

        gsap.fromTo(eyebrowRef.current,
          { opacity: 0, y: 24, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease,
            scrollTrigger: st(eyebrowRef.current) });

        const words = headlineRef.current?.querySelectorAll('.word');
        if (words?.length) {
          gsap.fromTo(words,
            { opacity: 0, y: 44, rotateX: -20 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.85, ease, stagger: 0.07,
              scrollTrigger: st(headlineRef.current) });
        }

        gsap.fromTo(sublineRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease,
            scrollTrigger: st(sublineRef.current) });

        gsap.fromTo(ctaRef.current,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.7, delay: 0.1, ease: 'back.out(1.5)',
            scrollTrigger: st(ctaRef.current, 'top 90%') });

      }, sectionRef);
    })();
    return () => ctx?.revert();
  }, []);

  const splitWords = (text) =>
    text.split(' ').map((w, i) => (
      <span className="word" key={i}>{w}</span>
    ));

  return (
    <section className="globe-section" ref={sectionRef}>

      <div className="globe-video-wrap">
        {/*
          All four attributes must be present as both JSX props AND
          set imperatively in useEffect — iOS Safari requires both.
          autoPlay (camelCase) is the React prop for the autoplay attribute.
        */}
        <video
          ref={videoRef}
          className="globe-video"
          src={globeVideo}
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
      </div>

      <div className="globe-overlay-content">
        <span className="tag-pill globe-eyebrow" ref={eyebrowRef}>
          Global impact
        </span>

        <h2 className="globe-headline" ref={headlineRef}>
          {splitWords('Every heartbeat, somewhere on this planet, your gift arrives.')}
        </h2>

        <p className="globe-subline" ref={sublineRef}>
          Hunger doesn't pause for weekends. Neither do we.
          When you give, the ripple travels further than you'll ever see —
          and further than we can fully measure.
        </p>

        <a href="#donate" className="btn-primary globe-cta" ref={ctaRef}>
          Keep the ripple going
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

    </section>
  );
}