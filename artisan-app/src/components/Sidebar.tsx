import React from "react";
import { 
  Hammer, 
  Package, 
  RotateCcw, 
  Scale, 
  Wallet, 
  ShieldCheck, 
  Layers,
  ChevronRight
} from "lucide-react";

export type ArtisanTab = "dashboard" | "orders" | "returns" | "disputes" | "wallet" | "health" | "catalog";

interface SidebarProps {
  currentTab: ArtisanTab;
  onTabChange: (tab: ArtisanTab) => void;
  pendingOrdersCount: number;
  openDisputesCount: number;
  returnsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  pendingOrdersCount,
  openDisputesCount,
  returnsCount
}) => {
  const navItems = [
    { id: "dashboard", label: "Vue d'Ensemble", icon: Hammer },
    { id: "orders", label: "Atelier des Commandes", icon: Package, badge: pendingOrdersCount, badgeColor: "#C86432" },
    { id: "returns", label: "Retours Clients (7j)", icon: RotateCcw, badge: returnsCount > 0 ? returnsCount : undefined, badgeColor: "#D4AF37" },
    { id: "disputes", label: "Médiation & Litiges (48h)", icon: Scale, badge: openDisputesCount > 0 ? openDisputesCount : undefined, badgeColor: "#DC3545" },
    { id: "wallet", label: "Portefeuille & Retraits RIB", icon: Wallet },
    { id: "health", label: "Santé & Avertissements (X/10)", icon: ShieldCheck },
    { id: "catalog", label: "Catalogue de l'Atelier", icon: Layers },
  ];

  return (
    <aside style={{
      width: 270,
      background: "rgba(18, 24, 38, 0.95)",
      backdropFilter: "blur(16px)",
      borderRight: "1px solid var(--border-color)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 50,
      padding: "24px 16px",
    }}>
      {/* Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 8, marginBottom: 28 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "linear-gradient(135deg, #C86432 0%, #A84A1E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(200, 100, 50, 0.35)"
        }}>
          <Hammer size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--primary-terracotta)", letterSpacing: 0.5, margin: 0 }}>
            ESPACE MAÂLEM
          </h1>
          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0, fontWeight: 600 }}>
            Atelier Artisanal Vork
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ArtisanTab)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: 12,
                border: "none",
                background: isActive ? "linear-gradient(135deg, rgba(200, 100, 50, 0.18) 0%, rgba(168, 74, 30, 0.05) 100%)" : "transparent",
                borderLeft: isActive ? "3.5px solid var(--primary-terracotta)" : "3.5px solid transparent",
                color: isActive ? "var(--primary-terracotta)" : "var(--text-secondary)",
                fontFamily: "var(--font-display)",
                fontWeight: isActive ? 700 : 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={18} color={isActive ? "var(--primary-terracotta)" : "var(--text-muted)"} />
                <span>{item.label}</span>
              </div>
              
              {item.badge !== undefined && item.badge > 0 ? (
                <span style={{
                  background: item.badgeColor || "var(--primary-terracotta)",
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 10,
                }}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight size={14} style={{ opacity: isActive ? 0.8 : 0.2 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: 12,
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-color)",
        fontSize: 10,
        color: "var(--text-muted)",
        textAlign: "center"
      }}>
        <p style={{ margin: "0 0 2px", fontWeight: 700, color: "var(--text-main)" }}>Maâlem Abdelkader</p>
        <p style={{ margin: 0 }}>Atelier Fès · Artisan Certifié</p>
      </div>
    </aside>
  );
};
