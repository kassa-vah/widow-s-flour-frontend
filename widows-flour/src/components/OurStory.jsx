import { useEffect, useRef, useState } from "react";
import { GiWheat, GiDove, GiFarmer }            from "react-icons/gi";
import { FaCross, FaChurch, FaHandHoldingHeart } from "react-icons/fa";
import { MdVolunteerActivism }                   from "react-icons/md";
import { IoClose }                               from "react-icons/io5";
import { BsArrowDown, BsArrowRight }             from "react-icons/bs";
import "./OurStory.css";

/* ── Scripture verses ── */
const VERSES = [
  { text: "He defends the cause of the fatherless and the widow.", ref: "Deuteronomy 10:18" },
  { text: "Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows in their distress.", ref: "James 1:27" },
  { text: "Share with the Lord's people who are in need. Practice hospitality.", ref: "Romans 12:13" },
];

/* ── Timeline milestones ── */
const TIMELINE = [
  {
    year: "The Beginning",
    Icon: FaCross,
    title: "A Burden Placed on Three Hearts",
    body: "Rev. Joseph Omondi, a pastor who has walked the dirt paths of Siwar all his life, watched his neighbours sell their last goats to feed their children after the rains failed. Together with his brothers Dan McCharles and Mike McCharles Omondi — men who grew up sharing whatever little the village had — they knelt in prayer and made a covenant: no widow in Siwar would go to bed hungry while they had breath in their lungs.",
  },
  {
    year: "The Crisis",
    Icon: GiWheat,
    title: "When the Harvest Did Not Come",
    body: "Climate variability stripped Siwar of its harvest. Widows and the elderly — 80 to 120 households — were hardest hit. Meal portions shrank to once a day. Livestock were sold. Children dropped out of school to help forage. The Omondi brothers documented every household, every story, every face. What they found lit an urgency that could not be ignored.",
  },
  {
    year: "The Mission",
    Icon: FaHandHoldingHeart,
    title: "Flour, Seeds, and Dignity",
    body: "The Widow's Flour was born — not as charity, but as covenant community. Monthly food baskets of maize flour, beans, rice, cooking oil and salt. Climate-smart seeds for the next planting season. Village Savings & Loan Associations so women could build their own buffers. The goal: six months of relief, a lifetime of resilience.",
  },
  {
    year: "The Vision",
    Icon: GiDove,
    title: "From Relief to Resilience",
    body: "In three to five years, Rev. Joseph, Dan, and Mike see Siwar transformed — not dependent on donations, but anchored in community grain banks, thriving VSLA groups, and diversified incomes through poultry, beekeeping, and kitchen gardens. The flour is the beginning. The harvest of human dignity is the goal.",
  },
];

/* ── Founders ── */
const FOUNDERS = [
  {
    name:     "Rev. Joseph Omondi",
    role:     "Founder & Spiritual Director",
    Icon:     FaChurch,
    color:    "var(--green-deep)",
    initials: "JO",
    desc:     "A pastor and shepherd of his community, Rev. Joseph has ministered in Siwar for years. When the harvest failed, he did not preach from a distance — he walked into the crisis with his congregation and turned his calling into action.",
  },
  {
    name:     "Dan McCharles Omondi",
    role:     "Co-Founder & Operations",
    Icon:     GiFarmer,
    color:    "var(--green-mid)",
    initials: "DO",
    desc:     "Dan grew up understanding that in Siwar, every grain counts. His hands-on knowledge of the village — its households, its rhythms, its people — shaped the distribution model that ensures food reaches the most vulnerable first.",
  },
  {
    name:     "Mike McCharles Omondi",
    role:     "Co-Founder & Community Liaison",
    Icon:     MdVolunteerActivism,
    color:    "var(--green-muted)",
    initials: "MO",
    desc:     "Mike is the bridge between the village and the wider world. He maps the needs, carries the stories, and ensures that every donor and partner understands the human face behind each food basket distributed.",
  },
];

/* ── Intersection observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`os-reveal ${inView ? "os-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Verse pull-quote ── */
function VerseQuote({ verse, align = "left" }) {
  const [ref, inView] = useInView();
  return (
    <blockquote
      ref={ref}
      className={`os-verse os-verse--${align} ${inView ? "os-verse--visible" : ""}`}
    >
      <span className="os-verse__mark">"</span>
      <p className="os-verse__text">{verse.text}</p>
      <cite className="os-verse__ref">— {verse.ref}</cite>
    </blockquote>
  );
}

/* ── Timeline item ── */
function TimelineItem({ item, index }) {
  const [ref, inView] = useInView();
  const isEven = index % 2 === 0;
  const { Icon } = item;
  return (
    <div
      ref={ref}
      className={`os-tl-item os-tl-item--${isEven ? "left" : "right"} ${inView ? "os-tl-item--visible" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="os-tl-connector">
        <div className="os-tl-node"><Icon size={16} /></div>
        <div className="os-tl-line" />
      </div>
      <div className="os-tl-card">
        <span className="os-tl-year">{item.year}</span>
        <h3 className="os-tl-title">{item.title}</h3>
        <p className="os-tl-body">{item.body}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
export default function OurStory({ onClose }) {
  const modalRef   = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="os-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <div className="os-modal" ref={modalRef}>

        <button className="os-close" onClick={onClose} aria-label="Close story">
          <IoClose size={20} />
        </button>

        {/* HERO */}
        <header className="os-hero">
          <div className="os-hero__grain" aria-hidden />
          <div className="os-hero__inner">
            <span className="os-hero__pill">Our Story</span>
            <h1 className="os-hero__headline">
              The Widow's<br /><em>Flour</em>
            </h1>
            <p className="os-hero__sub">
              A covenant of bread and brotherhood,<br />
              born in the dust of Siwar village.
            </p>
            <div className="os-hero__cross" aria-hidden>
              <FaCross size={28} />
            </div>
          </div>
          <div className="os-hero__scroll-hint" aria-hidden>
            <span>Scroll to read</span>
            <BsArrowDown size={16} />
          </div>
        </header>

        <div className="os-body">

          {/* FOUNDERS */}
          <section className="os-section os-section--founders">
            <Reveal>
              <span className="os-label">The Founders</span>
              <h2 className="os-section__title">Three Brothers,<br />One Calling</h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="os-prose os-prose--lead">
                Siwar is a quiet village in Siaya County, Kenya — a place where the rains
                decide everything, and where a failed harvest can unravel a family's entire
                year. It is home. And it is exactly where Rev. Joseph Omondi, Dan McCharles
                Omondi, and Mike McCharles Omondi grew up.
              </p>
            </Reveal>
            <div className="os-founders-grid">
              {FOUNDERS.map((founder, i) => {
                const { Icon } = founder;
                return (
                  <Reveal key={founder.name} delay={i * 120} className="os-founder-card">
                    <div className="os-founder-card__avatar" style={{ "--avatar-color": founder.color }}>
                      <div className="os-founder-card__avatar-ring" />
                      <div className="os-founder-card__avatar-inner">
                        <Icon size={28} color="#fff" />
                        <span className="os-founder-card__initials">{founder.initials}</span>
                      </div>
                    </div>
                    <h3 className="os-founder-card__name">{founder.name}</h3>
                    <span className="os-founder-card__role">{founder.role}</span>
                    <p className="os-founder-card__desc">{founder.desc}</p>
                  </Reveal>
                );
              })}
            </div>
          </section>

          <div className="os-verse-wrap">
            <VerseQuote verse={VERSES[0]} align="left" />
          </div>

          {/* TIMELINE */}
          <section className="os-section">
            <Reveal>
              <span className="os-label">The Journey</span>
              <h2 className="os-section__title">From a Prayer<br />to a Movement</h2>
            </Reveal>
            <div className="os-timeline">
              {TIMELINE.map((item, i) => (
                <TimelineItem key={item.year} item={item} index={i} />
              ))}
            </div>
          </section>

          <div className="os-verse-wrap">
            <VerseQuote verse={VERSES[1]} align="right" />
          </div>

          {/* VILLAGE */}
          <section className="os-section os-section--village">
            <Reveal>
              <span className="os-label">The Place</span>
              <h2 className="os-section__title">Siwar Village</h2>
            </Reveal>
            <div className="os-village-grid">
              {[
                { number: "120",      label: "Households targeted" },
                { number: "6",        label: "Months of food support" },
                { number: "5",        label: "VSLA savings groups" },
                { number: "KES 3.1M", label: "Total budget needed" },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 80} className="os-village-stat">
                  <span className="os-village-stat__number">{s.number}</span>
                  <span className="os-village-stat__label">{s.label}</span>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <p className="os-prose">
                The crisis began with the rains — or rather, without them. Climate variability
                stripped Siwar of its harvest and left the most vulnerable with nothing to fall
                back on. Widows, the elderly, and orphans bore the heaviest weight. Livestock
                were sold. Meals shrank to once a day. School attendance fell.
              </p>
              <p className="os-prose" style={{ marginTop: 20 }}>
                The Omondi brothers documented every household. A monthly food basket — maize
                flour, beans, rice, cooking oil, salt — valued at KES 4,500 per family, is the
                immediate lifeline. But the vision extends far beyond: climate-smart seeds,
                Village Savings &amp; Loan Associations, community grain banks, and income
                diversification through poultry, beekeeping, and kitchen gardens.
              </p>
            </Reveal>
          </section>

          <div className="os-verse-wrap">
            <VerseQuote verse={VERSES[2]} align="left" />
          </div>

          {/* VISION */}
          <section className="os-section os-section--vision">
            <Reveal>
              <span className="os-label">The Vision</span>
              <h2 className="os-section__title">Relief Today,<br />Resilience Forever</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="os-prose os-prose--lead">
                The Omondi brothers do not want Siwar to remain dependent on donations.
                Their three-to-five year vision follows a deliberate arc:
              </p>
            </Reveal>
            <div className="os-vision-track">
              {[
                { year: "Year 1", label: "Food support + inputs", active: true },
                { year: "Year 2", label: "Reduced food aid, increased production" },
                { year: "Year 3", label: "No food aid — income & savings focus" },
              ].map((v, i) => (
                <Reveal key={v.year} delay={i * 100} className={`os-vision-step ${v.active ? "os-vision-step--active" : ""}`}>
                  <span className="os-vision-step__year">{v.year}</span>
                  <span className="os-vision-step__label">{v.label}</span>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200}>
              <p className="os-prose" style={{ marginTop: 40 }}>
                This is the faith of The Widow's Flour — that the same God who multiplied
                the widow's oil in Zarephath can multiply the seeds, the savings, and the
                dignity of every family in Siwar. The flour is not the end. The harvest
                of human flourishing is.
              </p>
            </Reveal>
          </section>

          {/* CTA */}
          <section className="os-cta">
            <Reveal>
              <div className="os-cta__inner">
                <span className="os-cta__cross"><FaCross size={22} /></span>
                <h2 className="os-cta__title">Be Part of the Story</h2>
                <p className="os-cta__sub">
                  Every shilling you give writes another line in Siwar's story of redemption.
                  Whether you support a specific cause or give to our general fund, your gift
                  goes directly to a family that needs it.
                </p>
                <button className="os-cta__btn" onClick={onClose}>
                  Support a Cause <BsArrowRight size={16} />
                </button>
              </div>
            </Reveal>
          </section>

        </div>
      </div>
    </div>
  );
}