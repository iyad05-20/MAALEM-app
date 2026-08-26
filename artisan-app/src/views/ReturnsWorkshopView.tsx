import React, { useState } from "react";
import { RotateCcw, Check, Clock, PackageCheck } from "lucide-react";
import type { ArtisanReturn } from "../types/artisanTypes";

interface ReturnsWorkshopViewProps {
  returns: ArtisanReturn[];
  onConfirmReturn: (returnId: string) => Promise<void>;
}

export const ReturnsWorkshopView: React.FC<ReturnsWorkshopViewProps> = ({
  returns,
  onConfirmReturn,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (returnId: string) => {
    if (!window.confirm("Confirmez-vous la bonne réception et la conformité du produit retourné dans votre atelier ?")) return;
    setLoadingId(returnId);
    try {
      await onConfirmReturn(returnId);
    } catch (err: any) {
      alert(err.message || "Erreur validation retour.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Informative Header Card */}
      <div className="artisan-card" style={{ background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(26, 42, 58, 0.03))", border: "1px solid rgba(212, 175, 55, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <RotateCcw size={18} color="var(--accent-premium)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)", margin: 0 }}>
            Retours Clients 7 jours & Forclusion (Art. 13)
          </h3>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
          L'acheteur a 10j (+7j tolérance) pour déposer le colis. À réception dans votre atelier, vous avez <strong>48h (J+2)</strong> pour inspecter la pièce et valider le remboursement (Art. 13.6).
        </p>
      </div>

      {returns.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <PackageCheck size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucune demande de retour client en cours.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {returns.map((ret) => {
            const isPending = ret.status === "initie";

            return (
              <div key={ret.id} className="artisan-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--primary)" }}>
                        Dossier Retour #{ret.id}
                      </strong>
                      <span className={`badge-pill ${isPending ? "badge-warning" : "badge-success"}`}>
                        {ret.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      Commande #{ret.orderId} · {ret.mode === "sendit" ? "Sendit Express (35 MAD déduits)" : "Propres Moyens Client"}
                    </p>
                  </div>

                  <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                    {new Date(ret.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {isPending && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
                      <Clock size={14} color="var(--accent-premium)" />
                      <span>Forclusion active. Si non retourné sous 17j, les fonds vous restent acquis.</span>
                    </div>
                    <button
                      onClick={() => handleConfirm(ret.id)}
                      disabled={loadingId === ret.id}
                      className="btn-mobile-primary"
                      style={{ background: "#2D6A4F" }}
                    >
                      <Check size={16} />
                      <span>{loadingId === ret.id ? "Validation..." : "Confirmer la Réception Conforme (48h)"}</span>
                    </button>
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
