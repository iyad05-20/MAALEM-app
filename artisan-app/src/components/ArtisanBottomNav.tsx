import React from "react";
import { Hammer, Layers, Wallet, User } from "lucide-react";

export type MobileArtisanTab = "atelier" | "catalogue" | "wallet" | "profil";

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
  const profileBadgeCount = openDisputesCount + returnsCount;

  const tabs = [
    { id: "atelier" as MobileArtisanTab, label: "Atelier", icon: Hammer, badge: pendingOrdersCount },
    { id: "catalogue" as MobileArtisanTab, label: "Catalogue", icon: Layers },
    { id: "wallet" as MobileArtisanTab, label: "Portefeuille", icon: Wallet },
    { id: "profil" as MobileArtisanTab, label: "Mon Espace", icon: User, badge: profileBadgeCount > 0 ? profileBadgeCount : undefined },
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
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? "var(--accent-warm)" : "var(--text-secondary)"} />
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
