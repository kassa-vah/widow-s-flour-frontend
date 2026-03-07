// MarqueeSection.jsx — scrolling partners / supporters strip
import "./MarqueeSection.css";

const partners = [
  "Hope Foundation", "Bread of Life", "Grace Ministry",
  "United Hearts", "The Widow's Mite", "Mercy Corps",
  "Provision Trust", "Community Harvest", "Relief Alliance",
];

export default function MarqueeSection() {
  const doubled = [...partners, ...partners];

  return (
    <div className="marquee-section">
      <p className="marquee-section__label">Trusted Partners &amp; Supporters</p>

      <div className="marquee-track">
        {doubled.map((name, i) => (
          <div key={i} className="marquee-item">
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="marquee-track marquee-track--reverse">
        {doubled.map((name, i) => (
          <div key={i} className="marquee-item">
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}