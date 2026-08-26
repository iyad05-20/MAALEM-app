import React, { useState } from "react";
import { RefreshCw, Globe, Bell, Sparkles } from "lucide-react";
import { getBackendUrl, setBackendUrl } from "../services/artisanApi";

interface ArtisanMobileHeaderProps {
  title: string;
  onRefresh: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  loading: boolean;
  shopStatus?: string;
  warningCount?: number;
}

export const ArtisanMobileHeader: React.FC<ArtisanMobileHeaderProps> = ({
  title,
  onRefresh,
  onOpenNotifications,
  unreadNotifsCount,
  loading,
  shopStatus = "active",
  warningCount = 0,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(getBackendUrl());
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const handleSaveTarget = () => {
    setBackendUrl(targetUrl);
    setShowConfig(false);
    onRefresh();
  };

  const isLocal = targetUrl.includes("localhost") || targetUrl.includes("127.0.0.1");

  return (
    <header className="glass-overlay" style={{
      padding: "var(--space-4) var(--space-5) var(--space-3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 40,
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      {/* Brand Logo matching Client App */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h1 className="brand-logo" style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "22px",
              color: "var(--primary)",
              letterSpacing: "-0.5px",
              margin: 0,
            }}>
              MAÂLEM
            </h1>
            <span style={{
              background: "linear-gradient(135deg, var(--accent-warm) 0%, #994A2B 100%)",
              color: "#FFFFFF",
              fontSize: "9px",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              padding: "2px 8px",
              borderRadius: "8px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              boxShadow: "var(--shadow-terracotta)",
            }}>
              PRO
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
            {title}
          </span>
        </div>
      </div>

      {/* Header Actions (Min 44x44px Touch Targets) */}
      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            position: "relative",
            boxShadow: "var(--shadow-xs)",
          }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadNotifsCount > 0 && (
            <span style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#DC3545",
              color: "#FFF",
              fontSize: "8px",
              fontWeight: 800,
              width: 14,
              height: 14,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #FFF",
            }}>
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Target Switcher */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLocal ? "var(--accent-emerald)" : "var(--accent-warm)",
            boxShadow: "var(--shadow-xs)",
          }}
          title="Serveur Cible"
        >
          <Globe size={18} />
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            boxShadow: "var(--shadow-xs)",
          }}
          title="Actualiser"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* Target Config Modal Sheet (Glass Sheet) */}
      {showConfig && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div className="glass-overlay" style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            borderRadius: "28px 28px 0 0",
            padding: "var(--space-5) var(--space-5) var(--space-7)",
            boxShadow: "0 -12px 36px rgba(0,0,0,0.25)",
          }}>
            <div style={{ width: 36, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto var(--space-4)" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: "var(--primary)", marginBottom: 4 }}>
              Serveur Backend Cible
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: 14 }}>
              Basculez entre le serveur local et votre application déployée en production.
            </p>

            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://votre-backend.com/api"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--primary)",
                marginBottom: 14,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setTargetUrl("http://localhost:3001/api");
                  setBackendUrl("http://localhost:3001/api");
                  setShowConfig(false);
                  onRefresh();
                }}
                className="btn-mobile-outline"
                style={{ flex: 1 }}
              >
                Reset Local
              </button>
              <button
                type="button"
                onClick={handleSaveTarget}
                className="btn-mobile-primary"
                style={{ flex: 2 }}
              >
                Connecter
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
