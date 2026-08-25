import React from "react";
import { Scale, MessageSquare, CheckCircle2 } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Top Header Banner */}
      <div className="artisan-card" style={{ background: "linear-gradient(135deg, rgba(220, 53, 69, 0.08), rgba(26, 42, 58, 0.03))", border: "1px solid rgba(220, 53, 69, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Scale size={18} color="#DC3545" />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)", margin: 0 }}>
            Médiation & Défense Contradictoire sous 48h (Art. 20)
          </h3>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
          En cas de réclamation client (Non-réception, vice caché 3 mois, non-conformité), transmettez vos explications d'atelier et vos photos pour l'arbitrage Vork.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <CheckCircle2 size={36} style={{ opacity: 0.3, marginBottom: 8, color: "#2D6A4F" }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucun litige en cours pour votre atelier.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {disputes.map((d) => {
            const isResolved = d.status.startsWith("resolu") || d.status === "rejete";
            const hasArtisanResponded = !!d.artisanResponse;

            return (
              <div key={d.id} className="artisan-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--primary)" }}>
                        Litige #{d.id}
                      </strong>
                      <span className={`badge-pill ${isResolved ? "badge-success" : "badge-urgent"}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      Commande #{d.orderId} · Type : {d.type.replace(/_/g, " ")}
                    </p>
                  </div>

                  <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {/* Client Reason */}
                <div style={{ background: "rgba(220, 53, 69, 0.05)", border: "1px solid rgba(220, 53, 69, 0.15)", borderRadius: 12, padding: 10, marginBottom: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#DC3545", margin: "0 0 2px" }}>Motif déclaré par le Client :</p>
                  <p style={{ fontSize: 11, color: "var(--primary)", margin: 0, fontStyle: "italic" }}>
                    "{d.reason}"
                  </p>
                </div>

                {/* Artisan response */}
                {hasArtisanResponded && (
                  <div style={{ background: "rgba(45, 106, 79, 0.06)", border: "1px solid rgba(45, 106, 79, 0.2)", borderRadius: 12, padding: 10, marginBottom: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#2D6A4F", margin: "0 0 2px" }}>Votre Réponse d'Atelier Transmise :</p>
                    <p style={{ fontSize: 11, color: "var(--primary)", margin: 0 }}>
                      "{d.artisanResponse}"
                    </p>
                  </div>
                )}

                {/* Arbitration Decision */}
                {d.arbitrationDecision && (
                  <div style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 10, marginBottom: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-premium)", margin: "0 0 2px" }}>⚖️ Décision d'Arbitrage Officielle (Art. 20.5) :</p>
                    <p style={{ fontSize: 11, color: "var(--primary)", margin: 0 }}>
                      {d.arbitrationDecision}
                    </p>
                  </div>
                )}

                {!isResolved && (
                  <button
                    onClick={() => onOpenReplyModal(d)}
                    className="btn-mobile-terracotta"
                    style={{ padding: "10px", fontSize: 12 }}
                  >
                    <MessageSquare size={14} />
                    <span>{hasArtisanResponded ? "Modifier ma Défense" : "Répondre sous 48h (Art. 20)"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
