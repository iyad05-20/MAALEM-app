import { useState } from 'react';
import type { HeroData } from '../../types';

interface HeroCardProps {
  hero: HeroData;
  scrollY?: number; // receives parent scroll position for scale effect
}

export const HeroCard: React.FC<HeroCardProps> = ({ hero, scrollY = 0 }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Scale from 1 → 0.95 as user scrolls down (0–120px range)
  const scale = Math.max(0.95, 1 - (scrollY / 120) * 0.05);

  const formattedPrice = hero.price.replace(' DH', '');

  return (
    <div
      className={`hero-card glow-${hero.glowColor}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
    >
      {/* Skeleton + Image */}
      <div className={`skeleton-box`} style={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: 24 }}>
        <img
          src={hero.image}
          alt={hero.title}
          className={`hero-img ${imgLoaded ? 'img-loaded' : 'img-loading'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Gradient overlay */}
      <div className="hero-gradient" />

      {/* E4 Pattern */}
      <div className="hero-pattern" />

      {/* AI Badge */}
      <div className="hero-badge-ai">✦ AI Selection</div>

      {/* Content */}
      <div className="hero-content">
        <h2 className="hero-title">{hero.title}</h2>
        <p className="hero-desc">{hero.description}</p>
        <div className="hero-divider" />
        <div className="hero-footer">
          <span className="hero-price">
            {formattedPrice} <span className="currency">DH</span>
          </span>
          <button className="hero-btn" aria-label="Explorer la collection">
            Explorer
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
