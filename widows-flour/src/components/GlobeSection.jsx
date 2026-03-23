import { useEffect, useRef } from 'react';
import './GlobeSection.css';

export default function GlobeSection({ videoSrc = './src/assets/globe.mp4' }) {
  const sectionRef  = useRef(null);
  const videoRef    = useRef(null);
  const eyebrowRef  = useRef(null);
  const headlineRef = useRef(null);
  const sublineRef  = useRef(null);
  const ctaRef      = useRef(null);

  /* ── Slow-mo loop ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.45;
    const onEnd = () => { v.currentTime = 0; v.play(); };
    v.addEventListener('ended', onEnd);
    v.play().catch(() => {});
    return () => v.removeEventListener('ended', onEnd);
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

        /* Eyebrow */
        gsap.fromTo(eyebrowRef.current,
          { opacity: 0, y: 24, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease,
            scrollTrigger: st(eyebrowRef.current) });

        /* Headline words */
        const words = headlineRef.current?.querySelectorAll('.word');
        if (words?.length) {
          gsap.fromTo(words,
            { opacity: 0, y: 44, rotateX: -20 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.85, ease, stagger: 0.07,
              scrollTrigger: st(headlineRef.current) });
        }

        /* Subline */
        gsap.fromTo(sublineRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease,
            scrollTrigger: st(sublineRef.current) });

        /* CTA */
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

      {/* Globe video — natural size, centred, not cover */}
      <div className="globe-video-wrap">
        <video
          ref={videoRef}
          className="globe-video"
          src={videoSrc}
          muted
          playsInline
          loop
          preload="auto"
        />
      </div>

      {/* Text — absolutely centred over the globe */}
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