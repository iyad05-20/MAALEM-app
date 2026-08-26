import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, X, FileSignature, Check, Clock } from "lucide-react";
import type { ArtisanOrder } from "../types/artisanTypes";

interface DirectDeliveryModalProps {
  order: ArtisanOrder;
  onClose: () => void;
  onShipDirect: (orderId: string, days: number) => Promise<any>;
  onCompleteDelivery: (orderId: string, signaturePhoto: string) => Promise<any>;
}

export const DirectDeliveryModal: React.FC<DirectDeliveryModalProps> = ({
  order,
  onClose,
  onShipDirect,
  onCompleteDelivery,
}) => {
  const isInTransport = order.status === "en_cours_de_transport";
  const [days, setDays] = useState<number>(7);
  const [signaturePhoto, setSignaturePhoto] = useState<string>("https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600");
  const [loading, setLoading] = useState(false);

  const handleShip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onShipDirect(order.id, days);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur expédition directe.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signaturePhoto.trim()) return;
    setLoading(true);
    try {
      await onCompleteDelivery(order.id, signaturePhoto);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur validation livraison.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(11, 15, 25, 0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20,
    }}>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 580,
          padding: 24,
          border: "1px solid var(--border-gold)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSignature size={20} color="var(--primary-gold)" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                Livraison Directe Vendeur (Art. 9.3 & 11.5)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Produit Sur-Mesure / Pièce Unique · Commande <strong style={{ color: "var(--primary-gold)" }}>{order.id}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        {!isInTransport ? (
          <form onSubmit={handleShip}>
            <div style={{ background: "rgba(196, 169, 106, 0.08)", border: "1px solid var(--border-gold)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "var(--text-main)", margin: 0, lineHeight: 1.4 }}>
                ℹ️ <strong>Règle Art. 9.3 :</strong> Les produits sur-mesure et fragiles sont livrés directement par l'artisan sans passer par Sendit.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Délai de transport annoncé (en jours) *
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
              <button type="submit" disabled={loading} className="btn-gold">
                <Clock size={16} />
                <span>{loading ? "Envoi..." : "Déclarer l'Expédition Directe"}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleComplete}>
            <div style={{ background: "rgba(45, 106, 79, 0.12)", border: "1px solid rgba(45, 106, 79, 0.3)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "#34D399", margin: 0, lineHeight: 1.4 }}>
                ✍️ <strong>Règle Art. 11.5 :</strong> Lors de la remise physique en main propre, faites signer votre bordereau papier par l'acheteur et uploadez la photo ci-dessous pour libérer vos fonds de séquestre.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Photo du Bon de Livraison Émargé / Signé par le client *
              </label>
              <input
                type="text"
                required
                value={signaturePhoto}
                onChange={(e) => setSignaturePhoto(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-outline">Fermer</button>
              <button type="submit" disabled={loading || !signaturePhoto.trim()} className="btn-success">
                <ShieldCheck size={16} />
                <span>{loading ? "Validation..." : "Valider la Livraison avec Preuve Émargée"}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
