import React from "react";
import { Hammer, RotateCcw, Scale, Wallet, Store } from "lucide-react";

export type MobileArtisanTab = "atelier" | "retours" | "litiges" | "wallet" | "boutique";

interface ArtisanBottomNavProps {
  currentTab: MobileArtisanTab;
  onTabChange: (tab: MobileArtisanTab) => void;
  pendingOrdersCount: number;
  openDisputesCount: number;
  returnsCount: number;
}

export const ArtisanBottomNav: React.FC<ArtisanBottomNavProps> = ({
  currentTab,
  onTabChange,
  pendingOrdersCount,
  openDisputesCount,
  returnsCount,
}) => {
  const tabs = [
    { id: "atelier" as MobileArtisanTab, label: "Atelier", icon: Hammer, badge: pendingOrdersCount },
    { id: "retours" as MobileArtisanTab, label: "Retours (7j)", icon: RotateCcw, badge: returnsCount },
    { id: "litiges" as MobileArtisanTab, label: "Litiges (48h)", icon: Scale, badge: openDisputesCount },
    { id: "wallet" as MobileArtisanTab, label: "Portefeuille", icon: Wallet },
    { id: "boutique" as MobileArtisanTab, label: "Ma Boutique", icon: Store },
  ];

  return (
    <nav className="artisan-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-tab-btn ${isActive ? "active" : ""}`}
          >
            <div style={{ position: "relative" }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? "var(--accent-warm)" : "var(--text-secondary)"} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="nav-badge">{tab.badge}</span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
