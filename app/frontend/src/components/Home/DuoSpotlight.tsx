import React from 'react';
import type { Product } from '../../types';

interface DuoSpotlightProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  badgeTag?: string;
}

export const DuoSpotlight: React.FC<DuoSpotlightProps> = ({
  products,
  onSelectProduct,
  badgeTag = 'Spotlight',
}) => {
  // Take up to 2 items
  const duoItems = products.slice(0, 2);

  return (
    <div className="duo-spotlight-grid">
      {duoItems.map((product) => (
        <div
          key={product.id}
          className="spotlight-card"
          onClick={() => onSelectProduct?.(product)}
        >
          <div className="spotlight-img-wrap">
            <img src={product.image} alt={product.title} className="spotlight-img" loading="lazy" />
            <div className="spotlight-overlay" />
            <span className="spotlight-badge">
              ✦ {product.badgeLabel || product.badge || badgeTag}
            </span>
          </div>

          <div className="spotlight-content">
            <h4 className="spotlight-title">{product.title}</h4>
            <div className="spotlight-footer">
              <span className="spotlight-price">{product.price}</span>
              <span className="spotlight-link">
                Voir
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
