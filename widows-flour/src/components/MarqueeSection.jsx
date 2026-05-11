// MarqueeSection.jsx — scrolling partners / supporters strip
import "./MarqueeSection.css";

const partners = [
  "Foundation Chapel Ministries", "Bread of Life", "Grace Ministry",
  "United Hearts", "Vine Sanctuary Assemblies", "Jocala Properties",
  "Provision Trust", "Heralds of Hope", "Relief Alliance",
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