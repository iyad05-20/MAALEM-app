import React from "react";
import { Home, ShoppingBag, PlusCircle, Layers, User } from "lucide-react";

export type MobileArtisanTab = "home" | "market" | "create" | "posts" | "profile";

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
    { id: "home" as MobileArtisanTab, label: "Accueil", icon: Home, badge: pendingOrdersCount },
    { id: "market" as MobileArtisanTab, label: "Marché", icon: ShoppingBag },
    { id: "create" as MobileArtisanTab, label: "Publier", icon: PlusCircle, isCentralAction: true },
    { id: "posts" as MobileArtisanTab, label: "Mes Posts", icon: Layers },
    { id: "profile" as MobileArtisanTab, label: "Profil", icon: User, badge: (openDisputesCount + returnsCount) > 0 ? (openDisputesCount + returnsCount) : undefined },
  ];

  return (
    <nav className="artisan-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        if (tab.isCentralAction) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: "linear-gradient(135deg, var(--accent-warm) 0%, #B85830 100%)",
                border: "none",
                borderRadius: "50%",
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(204,119,85,0.4)",
                margin: "-12px 4px 0 4px",
                flexShrink: 0,
                transition: "transform 0.15s ease",
              }}
              title="Publier un Nouveau Post"
            >
              <PlusCircle size={26} strokeWidth={2.2} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-tab-btn ${isActive ? "active" : ""}`}
          >
            <div style={{ position: "relative" }}>
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? "var(--accent-warm)" : "var(--text-secondary)"} />
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
