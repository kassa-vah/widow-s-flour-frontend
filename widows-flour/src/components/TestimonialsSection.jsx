// TestimonialsSection.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./TestimonialsSection.css";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "The mentorship that helped me stay focused on my goals. Widows Flour gave me more than flour — they gave me hope and a future.",
    name: "Grace Wanjiku",
    role: "Program Beneficiary",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
  },
  {
    quote: "Success stories and genuine gratitude make donors feel valued. Knowing my contributions are truly helping families motivates me to continue giving.",
    name: "Robert Chen",
    role: "Monthly Donor",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    quote: "Our team feels guided, motivated, and inspired to give their best. It's rewarding to see how collective efforts bring hope to so many families.",
    name: "Sarah Kimani",
    role: "Volunteer Coordinator",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: i * 0.14,
            scrollTrigger: { trigger: card, start: "top 85%" }
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="container">
        <div className="testimonials__header">
          <span className="tag-pill">Voices</span>
          <h2 className="testimonials__headline">
            Words from Those<br />Whose Lives Were Touched
          </h2>
        </div>

        <div className="testimonials__grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card"
              ref={(el) => (cardsRef.current[i] = el)}
            >
              {/* Stars */}
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, s) => (
                  <span key={s} className="testimonial-card__star">★</span>
                ))}
              </div>

              <p className="testimonial-card__quote">{t.quote}</p>

              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">
                  <img src={t.img} alt={t.name} />
                </div>
                <div>
                  <span className="testimonial-card__name">{t.name}</span>
                  <span className="testimonial-card__role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}