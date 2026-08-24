import React, { useState } from "react";
import { ShieldCheck, RefreshCw, UserCheck, Globe } from "lucide-react";
import { getBackendUrl, setBackendUrl } from "../services/adminApi";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh, loading }) => {
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
      height: 70,
      background: "rgba(17, 24, 39, 0.75)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-color)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 40,
      marginLeft: 260,
    }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-main)", margin: 0 }}>
          {title}
        </h2>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Environment Badge / Switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-outline"
            style={{ 
              padding: "6px 12px", 
              fontSize: 11, 
              borderColor: isLocal ? "rgba(255,255,255,0.15)" : "var(--primary-gold)",
              background: isLocal ? "transparent" : "var(--primary-gold-light)",
            }}
          >
            <Globe size={14} color={isLocal ? "#34D399" : "var(--primary-gold)"} />
            <span>Target: <strong style={{ color: isLocal ? "#34D399" : "var(--primary-gold)" }}>{isLocal ? "🟢 Local Backend" : "🌐 Production Deploy"}</strong></span>
          </button>

          {showConfig && (
            <div className="glass-panel" style={{
              position: "absolute",
              top: 44,
              right: 0,
              width: 340,
              padding: 16,
              zIndex: 100,
              border: "1px solid var(--border-gold)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 6px", color: "var(--primary-gold)" }}>
                🔗 Serveur Backend Cible :
              </p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 10px" }}>
                Entrez l'URL de votre backend déployé pour administrer votre application en production depuis cette page locale.
              </p>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://votre-backend-deployer.com/api"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 11, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setTargetUrl("http://localhost:3001/api");
                    setBackendUrl("http://localhost:3001/api");
                    setShowConfig(false);
                    onRefresh();
                  }}
                  className="btn-outline"
                  style={{ fontSize: 10, padding: "4px 8px" }}
                >
                  Reset Local
                </button>
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="btn-gold"
                  style={{ fontSize: 10, padding: "4px 10px" }}
                >
                  Connecter
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-outline"
          style={{ padding: "8px 14px", fontSize: 12 }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} color="var(--primary-gold)" />
          <span>Actualiser</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "rgba(45, 106, 79, 0.15)", border: "1px solid rgba(45, 106, 79, 0.3)", fontSize: 11, color: "#34D399", fontWeight: 600 }}>
          <ShieldCheck size={14} /> Mode Médiation Actif
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 10, borderLeft: "1px solid var(--border-color)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary-gold-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck size={18} color="#FFFFFF" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Médiateur Vork</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>admin@vork.ma</p>
          </div>
        </div>
      </div>
    </header>
  );
};
