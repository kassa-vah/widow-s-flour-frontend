// GetInvolvedSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./VideoSection.css"; // shares CSS file

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    category: "Serve",
    title: "Volunteer",
    desc: "Make a difference by giving your time and skills to widows in need. Join distribution drives, mentorship programs, and cooking events.",
    cta: "Be a Volunteer",
    tags: ["Food Drives", "Mentorship"],
    img: "./src/assets/volunteer1.jpg",
  },
  {
    category: "Give",
    title: "Donate",
    desc: "A financial gift — no matter the size — provides flour, food, and dignity to a widow's home. 100% goes to the cause.",
    cta: "Donate Today",
    tags: ["Transparent", "Verified"],
    img: "./src/assets/donate.jpg",
    highlight: true,
  },
  {
    category: "Join",
    title: "Community",
    desc: "Become part of a movement of grace. Connect with like-minded people building stronger families and hope-filled futures.",
    cta: "Get Started",
    tags: ["Stand United", "Kindness First", "Give Back"],
    img: "./src/assets/community.jpg",
  },
];

export default function GetInvolvedSection() {
  const sectionRef = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 70, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.85,
            ease: "power3.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: card, start: "top 85%" }
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" className="get-involved" ref={sectionRef}>
      <div className="get-involved-container">
        <div className="get-involved__header">
          <span className="tag-pill">Get Involved</span>
          <h2 className="get-involved__headline">
            Three Ways to Make<br />a Difference Today
          </h2>
        </div>

        <div className="get-involved__grid">
          {cards.map((card, i) => (
            <div
              key={i}
              className="involve-card"
              ref={(el) => (cardsRef.current[i] = el)}
              style={card.highlight ? {
                background: "var(--green-pale)",
                border: "1.5px solid var(--green-muted)"
              } : {}}
            >
              <div className="involve-card__image">
                <img src={card.img} alt={card.title} />
              </div>
              <div className="involve-card__body">
                <span className="involve-card__category">{card.category}</span>
                <h3 className="involve-card__title">{card.title}</h3>
                {card.tags && (
                  <div className="involve-card__tags">
                    {card.tags.map((t) => (
                      <span key={t} className="involve-card__tag">{t}</span>
                    ))}
                  </div>
                )}
                <p className="involve-card__desc">{card.desc}</p>
                <a href="#donate" className="involve-card__cta">{card.cta} →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}