import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Award, CheckCircle2, Info } from "lucide-react";
import type { ArtisanProfileHealth } from "../types/artisanTypes";

interface ShopHealthViewProps {
  health: ArtisanProfileHealth | null;
  warnings: any[];
}

export const ShopHealthView: React.FC<ShopHealthViewProps> = ({
  health,
  warnings,
}) => {
  const warningCount = health?.warningCountCurrentMonth || 0;
  const isSuspended = health?.suspensionStatus && health.suspensionStatus.startsWith("suspended");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Health Status Banner */}
      <div className="glass-panel" style={{
        padding: 24,
        background: isSuspended ? "linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(18, 24, 38, 0.9) 100%)" : "linear-gradient(135deg, rgba(45, 106, 79, 0.15) 0%, rgba(18, 24, 38, 0.9) 100%)",
        border: `1px solid ${isSuspended ? "rgba(220, 53, 69, 0.3)" : "rgba(45, 106, 79, 0.3)"}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: isSuspended ? "var(--accent-crimson)" : "var(--accent-emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {isSuspended ? <ShieldAlert size={28} color="#FFFFFF" /> : <ShieldCheck size={28} color="#FFFFFF" />}
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-main)", margin: "0 0 4px" }}>
                Statut de la Boutique : {isSuspended ? "⚠️ Suspendue Temporairement" : "✓ Active & Conforme"}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Compteur Mensuel : <strong style={{ color: warningCount >= 5 ? "#F87171" : "#34D399" }}>{warningCount} / 10 avertissements</strong> (Réinitialisation le 1er du mois).
              </p>
            </div>
          </div>

          <div style={{ width: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
              <span>Seuil critique</span>
              <span>10 max</span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{
                width: `${(warningCount / 10) * 100}%`,
                height: "100%",
                background: warningCount >= 7 ? "var(--accent-crimson)" : warningCount >= 4 ? "var(--accent-amber)" : "var(--accent-emerald)",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Thresholds Guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="glass-card" style={{ padding: 18, borderLeft: "4px solid var(--accent-emerald)" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#34D399", margin: "0 0 6px" }}>
            🟢 0 à 4 Avertissements
          </h4>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            Boutique parfaitement saine. Vos créations bénéficient d'une visibilité maximale sur la marketplace Vork.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 18, borderLeft: "4px solid var(--accent-amber)" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#FBBF24", margin: "0 0 6px" }}>
            🟡 5 à 9 Avertissements
          </h4>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            Alerte modération. Traitez rapidement les commandes sous 48h et soignez les 4 photos de confection.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 18, borderLeft: "4px solid var(--accent-crimson)" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#F87171", margin: "0 0 6px" }}>
            🔴 10 Avertissements (Art. 19.3)
          </h4>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            Suspension automatique temporaire de la boutique (7 jours, puis 14 jours en cas de récidive).
          </p>
        </div>
      </div>

      {/* Warnings Log */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-main)", marginBottom: 14 }}>
          📜 Historique des Avertissements Reçus
        </h3>

        {warnings.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            🎉 Félicitations ! Aucun avertissement enregistré sur votre boutique.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Commande</th>
                <th>Motif de l'Avertissement</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((w) => (
                <tr key={w.id}>
                  <td>{new Date(w.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td><strong>#{w.orderId || "N/A"}</strong></td>
                  <td style={{ color: "#F87171" }}>{w.reason}</td>
                  <td><span className="badge badge-urgent">+1 Avertissement</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
