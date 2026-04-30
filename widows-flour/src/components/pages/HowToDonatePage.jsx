import { useState } from "react";
import { FaMobileAlt, FaCreditCard, FaUniversity, FaHandHoldingHeart, FaCheckCircle, FaShieldAlt, FaChevronDown } from "react-icons/fa";
import "./HowToDonatePage.css";

const ICON_COLOR = "var(--green-deep)";

const METHODS = [
  {
    icon: <FaMobileAlt color={ICON_COLOR} size={28} />,
    title: "M-Pesa",
    subtitle: "Fastest & most popular",
    steps: [
      "Go to M-Pesa on your phone",
      "Select Lipa na M-Pesa → Paybill",
      "Enter Business Number: 522533",
      "Enter Account Number: 7836492",
      "Enter your donation amount",
      "Enter your M-Pesa PIN and confirm",
    ],
    highlight: true,
  },
  {
    icon: <FaCreditCard color={ICON_COLOR} size={28} />,
    title: "Card Payment",
    subtitle: "Visa, Mastercard & more",
    steps: [
      "Click the 'Donate Now' button on any campaign",
      "Select 'Card Payment' as your method",
      "Enter your card details securely",
      "Choose your amount and confirm",
      "You'll receive a receipt by email",
    ],
    highlight: false,
  },
  {
    icon: <FaUniversity color={ICON_COLOR} size={28} />,
    title: "Bank Transfer",
    subtitle: "For larger donations",
    steps: [
      "Bank: Equity Bank Kenya",
      "Account Name: Widows Flour Initiative",
      "Account Number: 0190299385993",
      "Branch: Eldoret Branch",
      "Email us your transfer reference at donations@widowsflour.org",
    ],
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Is my donation tax-deductible?",
    a: "Widows Flour Initiative is a registered NGO in Kenya. Donations may qualify for tax relief under the Income Tax Act. Please consult your tax advisor for specific guidance.",
  },
  {
    q: "Can I donate from outside Kenya?",
    a: "Yes! Card payments and bank transfers are accepted from anywhere in the world. For international wire transfers, please contact us at donations@widowsflour.org for our SWIFT details.",
  },
  {
    q: "How do I know my money reaches the right people?",
    a: "We publish quarterly impact reports with a full breakdown of every shilling received and spent. You can find these in our News & Blog section. We also send personal thank-you updates from the families you help.",
  },
  {
    q: "Can I set up a recurring donation?",
    a: "Yes. Through our card payment gateway you can set up monthly standing orders. For M-Pesa recurring donations, you can save our Paybill details and send any time.",
  },
  {
    q: "What's the minimum donation amount?",
    a: "There is no minimum. Even KES 50 makes a difference — it can buy a meal for a child. Every shilling is counted and appreciated.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`htd-faq-item${open ? " open" : ""}`}>
      <button className="htd-faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <FaChevronDown
          size={14}
          color="var(--green-deep)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}
        />
      </button>
      {open && <p className="htd-faq-a">{a}</p>}
    </div>
  );
}

export default function HowToDonatePage() {
  return (
    <main className="htd-page">
      {/* Hero */}
      <section className="htd-hero">
        <div className="htd-hero__inner">
          <span className="tag-pill">How to Donate</span>
          <h1 className="htd-hero__headline">
            Simple Ways to<br /><em>Give with Heart</em>
          </h1>
          <p className="htd-hero__sub">
            Donating is easy, secure, and takes less than two minutes.
            Every method below sends your gift directly to the families who need it.
          </p>
        </div>
        <div className="htd-hero__deco" aria-hidden>
          <FaHandHoldingHeart size={220} color="var(--green-light)" />
        </div>
      </section>

      {/* Trust bar */}
      <div className="htd-trust-bar">
        <div className="htd-trust-bar__inner container">
          {[
            { icon: <FaShieldAlt size={16} color={ICON_COLOR} />, text: "100% Secure Payments" },
            { icon: <FaCheckCircle size={16} color={ICON_COLOR} />, text: "Registered NGO — Kenya" },
            { icon: <FaCheckCircle size={16} color={ICON_COLOR} />, text: "Quarterly Transparency Reports" },
            { icon: <FaShieldAlt size={16} color={ICON_COLOR} />, text: "No Hidden Fees" },
          ].map(({ icon, text }) => (
            <div key={text} className="htd-trust-item">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Methods */}
      <section className="htd-methods container">
        <h2 className="htd-section-title">Choose Your Method</h2>
        <div className="htd-methods-grid">
          {METHODS.map(m => (
            <div key={m.title} className={`htd-method-card${m.highlight ? " htd-method-card--highlight" : ""}`}>
              {m.highlight && <span className="htd-recommended">Recommended</span>}
              <div className="htd-method-icon">{m.icon}</div>
              <h3 className="htd-method-title">{m.title}</h3>
              <p className="htd-method-sub">{m.subtitle}</p>
              <ol className="htd-steps">
                {m.steps.map((s, i) => (
                  <li key={i} className="htd-step">
                    <span className="htd-step-num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="htd-faq-section container">
        <h2 className="htd-section-title">Frequently Asked Questions</h2>
        <div className="htd-faq-list">
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="htd-cta">
        <div className="htd-cta__inner container">
          <h2>Ready to Make a Difference?</h2>
          <p>Head to our Causes page and choose a family to support today.</p>
          <a href="/campaigns" className="btn-primary">Browse Campaigns</a>
        </div>
      </section>
    </main>
  );
}