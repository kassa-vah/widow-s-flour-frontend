import { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTwitter, FaComments } from "react-icons/fa";
import "./ContactPage.css";

const ICON_COLOR = "var(--green-deep)";
const TAWK_SRC   = "https://embed.tawk.to/69fcd783381d8a1c3101a861/1jo1qjnbu";
const TAWK_ID    = "tawk-script";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Enquiry", message: "" });
  const [sent, setSent] = useState(false);

  // ── Load Tawk when this page mounts; hide widget on unmount ──
  useEffect(() => {
    if (!document.getElementById(TAWK_ID)) {
      const s1 = document.createElement("script");
      s1.id      = TAWK_ID;
      s1.async   = true;
      s1.src     = TAWK_SRC;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.head.appendChild(s1);
    } else {
      try { window.Tawk_API && window.Tawk_API.showWidget && window.Tawk_API.showWidget(); }
      catch (_) {}
    }

    return () => {
      try { window.Tawk_API && window.Tawk_API.hideWidget && window.Tawk_API.hideWidget(); }
      catch (_) {}
    };
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Integrate with your backend here
    setSent(true);
  };

  const openChat = () => {
    try {
      if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
        window.Tawk_API.maximize();
      }
    } catch (_) {}
  };

  return (
    <main className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero__inner">
          <span className="tag-pill">Contact Us</span>
          <h1 className="contact-hero__headline">
            We'd Love to<br /><em>Hear from You</em>
          </h1>
          <p className="contact-hero__sub">
            Whether you want to donate, volunteer, partner with us, or simply
            learn more — our team is here and happy to help.
          </p>
        </div>
      </section>

      {/* ── Live chat nudge banner ── */}
      <div
        onClick={openChat}
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "14px",
          background:     "linear-gradient(135deg, #eaf3df 0%, #d4e8c2 100%)",
          border:         "1px solid #a8d080",
          borderRadius:   "12px",
          padding:        "16px 24px",
          margin:         "0 auto 8px",
          maxWidth:       "1100px",
          cursor:         "pointer",
          transition:     "box-shadow 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(90,158,58,0.15)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        role="button"
        aria-label="Open live chat"
      >
        {/* Pulsing green dot */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: "10px", height: "10px",
            borderRadius: "50%",
            background: "#5a9e3a",
            position: "absolute", top: 0, left: 0,
            animation: "tawk-pulse 1.8s ease-out infinite",
          }} />
          <FaComments size={22} color="#5a9e3a" style={{ position: "relative", zIndex: 1, marginTop: "1px" }} />
          <style>{`
            @keyframes tawk-pulse {
              0%   { transform: scale(1);   opacity: 0.8; }
              70%  { transform: scale(2.4); opacity: 0;   }
              100% { transform: scale(1);   opacity: 0;   }
            }
          `}</style>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "'DM Sans', Arial, sans-serif",
            fontSize:   "14px",
            fontWeight: "500",
            color:      "#1a1a1a",
            margin:     "0 0 2px",
          }}>
            Need a faster response? We're live right now.
          </p>
          <p style={{
            fontFamily: "'DM Sans', Arial, sans-serif",
            fontSize:   "13px",
            color:      "#5a9e3a",
            margin:     0,
          }}>
            Click here to open the live chat widget in the bottom-right corner ↘
          </p>
        </div>
      </div>

      <div className="contact-body container">
        {/* Info cards */}
        <aside className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon"><FaMapMarkerAlt size={20} color={ICON_COLOR} /></div>
            <div>
              <h3 className="contact-info-title">Our Office</h3>
              <p className="contact-info-text">Widows Flour Initiative<br />Pioneer House, Uganda Road<br />Eldoret, Uasin Gishu County<br />Kenya</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><FaPhone size={20} color={ICON_COLOR} /></div>
            <div>
              <h3 className="contact-info-title">Phone</h3>
              <a href="tel:+254700000000" className="contact-info-text contact-info-link">+254 700 000 000</a>
              <p className="contact-info-text contact-info-note">Mon–Fri, 8 am–5 pm EAT</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><FaEnvelope size={20} color={ICON_COLOR} /></div>
            <div>
              <h3 className="contact-info-title">Email</h3>
              <a href="mailto:info@widowsflour.org" className="contact-info-text contact-info-link">info@widowsflour.org</a>
              <a href="mailto:donations@widowsflour.org" className="contact-info-text contact-info-link">donations@widowsflour.org</a>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><FaClock size={20} color={ICON_COLOR} /></div>
            <div>
              <h3 className="contact-info-title">Office Hours</h3>
              <p className="contact-info-text">Monday – Friday: 8:00 am – 5:00 pm<br />Saturday: 9:00 am – 1:00 pm<br />Sunday: Closed</p>
            </div>
          </div>

          {/* Social */}
          <div className="contact-social">
            <p className="contact-social-label">Follow Our Work</p>
            <div className="contact-social-links">
              <a href="#" className="contact-social-btn" aria-label="Facebook"><FaFacebook size={18} color={ICON_COLOR} /></a>
              <a href="#" className="contact-social-btn" aria-label="Instagram"><FaInstagram size={18} color={ICON_COLOR} /></a>
              <a href="#" className="contact-social-btn" aria-label="Twitter"><FaTwitter size={18} color={ICON_COLOR} /></a>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-success">
              <div className="contact-success__icon">✓</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll get back to you within 1–2 business days.</p>
              <button className="btn-ghost" onClick={() => setSent(false)}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <h2 className="contact-form-title">Send Us a Message</h2>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Your full name"
                    value={form.name} onChange={handleChange} required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email" name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                  <option>General Enquiry</option>
                  <option>Donation Help</option>
                  <option>Volunteer Interest</option>
                  <option>Partnership Proposal</option>
                  <option>Media / Press</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message" name="message"
                  placeholder="Tell us how we can help..."
                  rows={6}
                  value={form.message} onChange={handleChange} required
                />
              </div>

              <button type="submit" className="btn-primary contact-submit-btn">
                Send Message
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}