import React, { useState } from "react";
import { RefreshCw, Globe, Bell } from "lucide-react";
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
    <header style={{
      padding: "12px 16px",
      background: "rgba(250, 250, 248, 0.96)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      {/* Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-premium)",
          fontWeight: 800,
          fontFamily: "var(--font-display)",
          fontSize: 15,
          boxShadow: "0 2px 8px rgba(26,42,58,0.15)",
        }}>
          م
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--primary)", margin: 0 }}>
              Maâlem Abdelkader
            </h2>
            <span className={`badge-pill ${warningCount >= 5 ? "badge-urgent" : "badge-success"}`}>
              {warningCount}/10 avert.
            </span>
          </div>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>
            {title} · Atelier Fès
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            position: "relative",
          }}
          title="Notifications"
        >
          <Bell size={16} />
          {unreadNotifsCount > 0 && (
            <span style={{
              position: "absolute",
              top: -2,
              right: -2,
              background: "#DC3545",
              color: "#FFF",
              fontSize: 8,
              fontWeight: 800,
              width: 14,
              height: 14,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
            borderRadius: 12,
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLocal ? "#2D6A4F" : "var(--accent-warm)",
          }}
          title="Serveur Backend Cible"
        >
          <Globe size={16} />
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
          }}
          title="Actualiser"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* Target Config Modal Sheet */}
      {showConfig && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            borderRadius: "24px 24px 0 0",
            padding: "20px 20px 32px",
            boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
          }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", marginBottom: 4 }}>
              Serveur Backend Cible
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 14 }}>
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
