import React from "react";
import { Scale, MessageSquare, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { ArtisanDispute } from "../types/artisanTypes";

interface DisputesWorkshopViewProps {
  disputes: ArtisanDispute[];
  onOpenReplyModal: (dispute: ArtisanDispute) => void;
}

export const DisputesWorkshopView: React.FC<DisputesWorkshopViewProps> = ({
  disputes,
  onOpenReplyModal,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: 18, borderLeft: "4px solid var(--accent-crimson)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Scale size={20} color="#F87171" />
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-main)", margin: "0 0 2px" }}>
              Médiation & Défense Contradictoire sous 48h (Art. 20 CGV)
            </h4>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              En cas de réclamation ouverte par l'acheteur, formulez vos explications contradictoires et transmettez vos photos d'atelier avant le rendu de l'arbitrage officiel Vork.
            </p>
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <CheckCircle2 size={40} style={{ opacity: 0.3, marginBottom: 10, color: "#34D399" }} />
          <p style={{ fontSize: 13, margin: 0 }}>Aucun litige ni réclamation en cours pour votre atelier.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {disputes.map((d) => {
            const isResolved = d.status.startsWith("resolu") || d.status === "rejete";
            const hasArtisanResponded = !!d.artisanResponse;

            return (
              <div key={d.id} className="glass-panel" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                        Dossier Litige #{d.id}
                      </h4>
                      <span className={`badge ${isResolved ? "badge-success" : "badge-urgent"}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border-color)" }}>
                        Type : <strong>{d.type.replace(/_/g, " ")}</strong>
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                      Commande concernée : <strong>#{d.orderId}</strong> · Déclaré le : {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => onOpenReplyModal(d)}
                      className="btn-terracotta"
                      style={{ fontSize: 11 }}
                    >
                      <MessageSquare size={14} />
                      <span>{hasArtisanResponded ? "Modifier ma Défense" : "Répondre sous 48h (Art. 20)"}</span>
                    </button>
                  )}
                </div>

                {/* Client Reason */}
                <div style={{ background: "rgba(220, 53, 69, 0.05)", border: "1px solid rgba(220, 53, 69, 0.15)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#F87171", margin: "0 0 4px" }}>
                    Motif Client :
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0, fontStyle: "italic" }}>
                    "{d.reason}"
                  </p>
                </div>

                {/* Artisan Contradictory Response if already sent */}
                {hasArtisanResponded && (
                  <div style={{ background: "rgba(45, 106, 79, 0.08)", border: "1px solid rgba(45, 106, 79, 0.2)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#34D399", margin: "0 0 4px" }}>
                      Votre Réponse d'Atelier Transmise :
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0 }}>
                      "{d.artisanResponse}"
                    </p>
                  </div>
                )}

                {/* Arbitration Decision if resolved */}
                {d.arbitrationDecision && (
                  <div style={{ background: "rgba(196, 169, 106, 0.08)", border: "1px solid var(--border-gold)", borderRadius: 10, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-gold)", margin: "0 0 4px" }}>
                      ⚖️ Décision Officielle d'Arbitrage Vork (Art. 20.5) :
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0 }}>
                      {d.arbitrationDecision}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
