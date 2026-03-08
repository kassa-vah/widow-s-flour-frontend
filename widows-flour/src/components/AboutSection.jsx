// AboutSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AboutSection.css";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "🌾",
    title: "Flour & Food Provision",
    desc: "Monthly flour baskets and staple food parcels delivered to widows across communities.",
  },
  {
    icon: "💛",
    title: "Financial Contributions",
    desc: "Organizations and individuals partnering to fund ongoing relief programs.",
  },
  {
    icon: "🤝",
    title: "Community & Mentorship",
    desc: "Circles of care connecting widows with mentors, counselors, and each other.",
  },
];

const IMG = {
  main:   "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80",
  accent: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80",
  av1:    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  av2:    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
  av3:    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80",
};

export default function AboutSection() {
  const sectionRef   = useRef(null);
  const leftRef      = useRef(null);
  const mainImgRef   = useRef(null);
  const accentImgRef = useRef(null);
  const badgeRef     = useRef(null);
  const cardsRef     = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo(leftRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
      );

      gsap.fromTo(mainImgRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
      );

      gsap.fromTo(accentImgRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
      );

      gsap.fromTo(badgeRef.current,
        { scale: 0.7, opacity: 0, rotate: -6 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.7, ease: "back.out(1.6)", delay: 0.5,
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: i * 0.12,
            scrollTrigger: { trigger: card, start: "top 85%" } }
        );
      });

      gsap.to(mainImgRef.current, {
        y: -50, ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", end: "bottom top", scrub: 1,
        }
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about" ref={sectionRef}>
      {/* Scoped container — never inherits global .container width bugs */}
      <div className="about-container">
        <div className="about__inner">

          {/* Left — text */}
          <div className="about__left" ref={leftRef}>
            <span className="tag-pill">About Us</span>
            <h2 className="about__headline">
              Who We Are &amp;<br />What Drives Us
            </h2>
            <p className="about__body">
              Widows Flour was born from a simple conviction — that no widow should
              face an empty table alone. We mobilize communities, donors, and
              volunteers to deliver flour, food, and fellowship to women who've lost
              their provider. Every sack of flour is a message: you are seen,
              you are loved, you are not forgotten.
            </p>

            <div className="about__features">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="about__feature-card"
                  ref={(el) => (cardsRef.current[i] = el)}
                >
                  <div className="about__feature-icon">{f.icon}</div>
                  <div className="about__feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image stack */}
          <div className="about__right">
            <div className="about__img-main" ref={mainImgRef}>
              <img src={IMG.main} alt="Widows flour community" />
            </div>

            <div className="about__img-accent" ref={accentImgRef}>
              <img src={IMG.accent} alt="Community support" />
            </div>

            <div className="about__badge" ref={badgeRef}>
              <span className="about__badge-num">6+</span>
              <span className="about__badge-label">Years of Service</span>
            </div>

            <div className="about__green-pill">
              <div className="about__avatars">
                <img src={IMG.av1} alt="" />
                <img src={IMG.av2} alt="" />
                <img src={IMG.av3} alt="" />
              </div>
              <span>120+ Active Volunteers</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}