import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import "./ContactPage.css";

const ICON_COLOR = "var(--green-deep)";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Enquiry", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Integrate with your backend here
    setSent(true);
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