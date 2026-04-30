import "./PrivacyPolicyPage.css";

const LAST_UPDATED = "1 April 2025";

const SECTIONS = [
  {
    title: "1. Who We Are",
    content: `Widows Flour Initiative ("we", "our", "us") is a registered non-governmental organisation based in Eldoret, Uasin Gishu County, Kenya. We operate the website at widowsflour.org and associated donation and campaign platforms. This Privacy Policy explains how we collect, use, and protect your personal data when you interact with us online or in person.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect information you provide directly, such as your name, email address, phone number, and payment details when you make a donation, register to volunteer, or contact us. We also collect information automatically through our website, including your IP address, browser type, pages visited, and referral source, via cookies and similar technologies. We do not collect sensitive personal data (such as health or political information) without your explicit consent.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use your information to process donations and issue receipts, send you updates about campaigns and impact reports (with your consent), respond to your enquiries, improve our website and services, comply with legal obligations including anti-money laundering checks on significant donations, and send you our newsletter if you have subscribed. We will never sell your data to third parties. We will never share your data with commercial advertisers.`,
  },
  {
    title: "4. Legal Basis for Processing",
    content: `We process your data on the following legal bases: (a) Contract — to fulfil a donation or volunteer agreement with you; (b) Legitimate Interests — to maintain the security of our systems and improve our services; (c) Consent — for marketing communications, which you may withdraw at any time; (d) Legal Obligation — where required by Kenyan law or court order.`,
  },
  {
    title: "5. Cookies",
    content: `Our website uses essential cookies to make it function correctly, and optional analytics cookies (via Google Analytics) to help us understand how visitors use the site. You may decline optional cookies without affecting your experience. A cookie consent banner is displayed on your first visit. You can also manage cookies through your browser settings at any time.`,
  },
  {
    title: "6. Data Sharing",
    content: `We share your data only with trusted service providers who help us operate — including our payment processor (Flutterwave/M-Pesa), email service provider, and cloud hosting provider. Each provider is bound by data processing agreements and is prohibited from using your data for their own purposes. We may disclose data if required by law, court order, or regulatory authority.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain donation records for 7 years to comply with Kenyan financial regulations. Contact and volunteer records are retained for 3 years after your last interaction with us, or until you request deletion. Analytics data is retained for 26 months. You may request deletion of your personal data at any time (subject to legal retention requirements).`,
  },
  {
    title: "8. Your Rights",
    content: `Under applicable data protection law you have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to or restrict certain processing; withdraw consent for marketing at any time; lodge a complaint with the Office of the Data Protection Commissioner of Kenya. To exercise any of these rights, please contact us at privacy@widowsflour.org.`,
  },
  {
    title: "9. Security",
    content: `We take the security of your data seriously. All payment transactions are encrypted using TLS. We limit access to personal data to staff and volunteers who need it to perform their duties, and we conduct regular security reviews of our systems. However, no internet transmission is completely secure and we cannot guarantee absolute security.`,
  },
  {
    title: "10. Children's Privacy",
    content: `Our website is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.`,
  },
  {
    title: "11. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page and, for material changes, notify you by email or a prominent notice on our website. We encourage you to review this page periodically.`,
  },
  {
    title: "12. Contact Us",
    content: `For any privacy-related questions or to exercise your rights, please contact our Data Protection Officer at:\n\nEmail: privacy@widowsflour.org\nPost: Widows Flour Initiative, Pioneer House, Uganda Road, Eldoret, Kenya`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      {/* Hero */}
      <section className="privacy-hero">
        <div className="privacy-hero__inner">
          <span className="tag-pill">Legal</span>
          <h1 className="privacy-hero__headline">Privacy Policy</h1>
          <p className="privacy-hero__meta">Last updated: <strong>{LAST_UPDATED}</strong></p>
          <p className="privacy-hero__intro">
            We are committed to protecting your personal information and being transparent
            about what we collect and how we use it. This policy applies to all services
            operated by Widows Flour Initiative.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="privacy-body container">
        {/* Table of contents */}
        <aside className="privacy-toc">
          <h3 className="privacy-toc-title">Contents</h3>
          <nav>
            {SECTIONS.map(s => (
              <a
                key={s.title}
                href={`#${s.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="privacy-toc-link"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Sections */}
        <article className="privacy-content">
          {SECTIONS.map(s => (
            <section
              key={s.title}
              id={s.title.replace(/\s+/g, "-").toLowerCase()}
              className="privacy-section"
            >
              <h2 className="privacy-section-title">{s.title}</h2>
              {s.content.split("\n\n").map((para, i) => (
                <p key={i} className="privacy-para">{para}</p>
              ))}
            </section>
          ))}

          <div className="privacy-footer-note">
            <p>
              This document is provided for informational purposes. For legal advice,
              please consult a qualified Kenyan legal professional.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}