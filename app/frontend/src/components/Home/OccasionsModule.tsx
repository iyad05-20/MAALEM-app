import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../types';
import { ProductCard } from '../Shared/ProductCard';

interface OccasionsModuleProps {
  occasionsData: {
    cadeaux: Product[];
    maison: Product[];
    cuisine: Product[];
  };
  onSelectProduct?: (product: Product) => void;
}

type TabType = 'cadeaux' | 'maison' | 'cuisine';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'cadeaux', label: 'Cadeaux', icon: '🎁' },
  { id: 'maison', label: 'Maison', icon: '🛋️' },
  { id: 'cuisine', label: 'Cuisine', icon: '🍲' },
];

export const OccasionsModule: React.FC<OccasionsModuleProps> = ({
  occasionsData,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cadeaux');

  const currentProducts = (occasionsData[activeTab] || []).slice(0, 4);

  return (
    <div className="occasions-module">
      {/* 3 Pills Tabs */}
      <div className="occasions-tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`occasion-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-bullet">{isActive ? '●' : '○'}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated 2x2 Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="occasions-grid-2x2"
        >
          {currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
