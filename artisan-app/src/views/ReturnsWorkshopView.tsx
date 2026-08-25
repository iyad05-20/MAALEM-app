import React, { useState } from "react";
import { RotateCcw, Check, AlertCircle, Clock, PackageCheck } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Information Banner */}
      <div className="glass-panel" style={{ padding: 18, borderLeft: "4px solid var(--accent-amber)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RotateCcw size={20} color="var(--accent-amber)" />
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-main)", margin: "0 0 2px" }}>
              Suivi des Retours & Forclusion 17 jours (Art. 13 CGV)
            </h4>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              Le client a 10 jours (+ 7j tolérance) pour déposer son colis. À la réception dans votre atelier, vous disposez de <strong>48h (J+2)</strong> pour inspecter l'article et valider le remboursement (Art. 13.6).
            </p>
          </div>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <PackageCheck size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Aucune demande de retour client en cours.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {returns.map((ret) => {
            const isPending = ret.status === "initie";

            return (
              <div key={ret.id} className="glass-panel" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: 14, color: "var(--text-main)" }}>Dossier Retour #{ret.id}</strong>
                      <span className={`badge ${isPending ? "badge-warning" : "badge-success"}`}>
                        {ret.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                      Commande #{ret.orderId} · Mode : <strong>{ret.mode === "sendit" ? "Sendit (35 MAD déduits)" : "Propres Moyens Client"}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Date de Déclaration</p>
                    <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0 }}>
                      {new Date(ret.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {isPending && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10, border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} color="var(--primary-gold)" />
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        Délai forclusion client actif. Si non retourné sous 17j, les fonds vous restent définitivement acquis.
                      </span>
                    </div>

                    <button
                      onClick={() => handleConfirm(ret.id)}
                      disabled={loadingId === ret.id}
                      className="btn-success"
                      style={{ fontSize: 11, padding: "6px 12px" }}
                    >
                      <Check size={14} />
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
