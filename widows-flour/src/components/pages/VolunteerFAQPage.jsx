import { useState } from "react";
import { FaHandsHelping, FaChevronDown, FaUsers, FaClock, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import "./VolunteerFAQPage.css";

const ICON_COLOR = "var(--green-deep)";

const ROLES = [
  { title: "Field Visitor", desc: "Visit and assess families in need, build relationships, and report on their progress.", time: "Weekends" },
  { title: "Food Packer", desc: "Join our monthly packing days to prepare and distribute food parcels to beneficiaries.", time: "Once a month" },
  { title: "Admin & Office", desc: "Help with data entry, donor correspondence, and organisational support.", time: "Flexible" },
  { title: "Social Media", desc: "Create content, manage posts, and help tell our community's stories online.", time: "Remote" },
  { title: "Events Crew", desc: "Help organise and run our fundraising walks, dinners, and awareness events.", time: "Events-based" },
  { title: "Mentor", desc: "Provide career, financial literacy, or emotional support to widowed mothers.", time: "Your schedule" },
];

const FAQS = [
  {
    category: "Getting Started",
    items: [
      { q: "How do I sign up to volunteer?", a: "Fill in our volunteer interest form on the Contact Us page. Our volunteer coordinator will reach out within 3 working days to discuss your availability and best role fit." },
      { q: "Do I need any qualifications?", a: "No formal qualifications are required for most roles. We ask for a willingness to serve, reliability, and a compassionate heart. Some specialist roles (e.g. counselling) may require relevant experience." },
      { q: "Is there an age requirement?", a: "Volunteers must be at least 18 years old. Young people aged 16–17 can volunteer with written parental consent and will be paired with an adult volunteer at all times." },
    ],
  },
  {
    category: "Commitment & Time",
    items: [
      { q: "How much time do I need to give?", a: "It depends on the role. Some roles like Social Media can be done in a few hours a week from home. Field Visitor roles typically require 1–2 Saturdays a month. We work around your schedule." },
      { q: "Can I volunteer for a one-off event?", a: "Absolutely. We always need extra hands for our fundraising events and annual walk. You can register as a one-time event volunteer with no ongoing commitment." },
      { q: "What if I need to take a break?", a: "Life happens. Simply let your volunteer coordinator know and we'll pause your involvement with no pressure. Many volunteers return after breaks and are always welcomed back." },
    ],
  },
  {
    category: "Practicalities",
    items: [
      { q: "Will I receive training?", a: "Yes. All volunteers receive an orientation session covering our values, safeguarding policies, and role-specific guidance before their first shift." },
      { q: "Are my expenses covered?", a: "We reimburse reasonable transport costs for field and in-person roles upon submission of receipts. Please discuss this with your coordinator when onboarding." },
      { q: "Is volunteering safe?", a: "Your safety is our priority. Field volunteers always work in pairs, carry ID, and follow our safeguarding guidelines. All volunteers are briefed on safety protocols during orientation." },
    ],
  },
];

function FaqCategory({ category, items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="vfaq-category">
      <h3 className="vfaq-category-title">{category}</h3>
      <div className="vfaq-list">
        {items.map((item, i) => (
          <div key={i} className={`vfaq-item${openIdx === i ? " open" : ""}`}>
            <button className="vfaq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{item.q}</span>
              <FaChevronDown
                size={13}
                color={ICON_COLOR}
                style={{ transform: openIdx === i ? "rotate(180deg)" : "none", transition: "transform 0.25s", flexShrink: 0 }}
              />
            </button>
            {openIdx === i && <p className="vfaq-a">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VolunteerFAQPage() {
  return (
    <main className="vfaq-page">
      {/* Hero */}
      <section className="vfaq-hero">
        <div className="vfaq-hero__inner">
          <span className="tag-pill">Volunteer</span>
          <h1 className="vfaq-hero__headline">
            Lend Your Time,<br /><em>Change a Life</em>
          </h1>
          <p className="vfaq-hero__sub">
            Our volunteers are the backbone of everything we do. Whether you have
            two hours or two days a month, there is a meaningful way for you to help.
          </p>
          <a href="/contact" className="btn-primary vfaq-hero__cta">
            Become a Volunteer
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        <div className="vfaq-hero__stats">
          {[
            { icon: <FaUsers size={24} color={ICON_COLOR} />, val: "120+", label: "Active Volunteers" },
            { icon: <FaClock size={24} color={ICON_COLOR} />, val: "4,800+", label: "Hours Donated in 2024" },
            { icon: <FaMapMarkerAlt size={24} color={ICON_COLOR} />, val: "6", label: "Sub-counties Reached" },
          ].map(s => (
            <div key={s.label} className="vfaq-stat">
              {s.icon}
              <span className="vfaq-stat__val">{s.val}</span>
              <span className="vfaq-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="vfaq-roles container">
        <div className="vfaq-roles__header">
          <span className="tag-pill">Open Roles</span>
          <h2 className="vfaq-section-title">Where Could You Help?</h2>
        </div>
        <div className="vfaq-roles-grid">
          {ROLES.map(r => (
            <div key={r.title} className="vfaq-role-card">
              <div className="vfaq-role-icon">
                <FaHandsHelping size={22} color={ICON_COLOR} />
              </div>
              <div>
                <h3 className="vfaq-role-title">{r.title}</h3>
                <p className="vfaq-role-desc">{r.desc}</p>
                <span className="vfaq-role-time">
                  <FaClock size={11} color="var(--text-light)" style={{ marginRight: 4 }} />
                  {r.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="vfaq-faq-section container">
        <div className="vfaq-roles__header">
          <span className="tag-pill">FAQ</span>
          <h2 className="vfaq-section-title">Common Questions</h2>
        </div>
        <div className="vfaq-categories">
          {FAQS.map(cat => <FaqCategory key={cat.category} {...cat} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="vfaq-cta">
        <div className="vfaq-cta__inner container">
          <FaHeart size={36} color="var(--green-deep)" style={{ marginBottom: 16 }} />
          <h2>Still Have Questions?</h2>
          <p>Our volunteer coordinator is happy to have a chat and find the right fit for you.</p>
          <a href="/contact" className="btn-primary">Get in Touch</a>
        </div>
      </section>
    </main>
  );
}