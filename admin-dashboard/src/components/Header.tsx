import React from "react";
import { ShieldCheck, Bell, RefreshCw, UserCheck } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh, loading }) => {
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
