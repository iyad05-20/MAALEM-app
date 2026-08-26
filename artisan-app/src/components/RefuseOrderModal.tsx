import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, Ban } from "lucide-react";

interface RefuseOrderModalProps {
  orderId: string;
  onClose: () => void;
  onRefuse: (orderId: string, reason: string) => Promise<any>;
}

export const RefuseOrderModal: React.FC<RefuseOrderModalProps> = ({ orderId, onClose, onRefuse }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onRefuse(orderId, reason);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur lors du refus.");
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
          maxWidth: 520,
          padding: 24,
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-crimson-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} color="#F87171" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                Refuser la Commande (Art. 6.4)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Commande <strong style={{ color: "#F87171" }}>{orderId}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.4 }}>
          Veuillez indiquer le motif explicatif de votre refus. Le client sera immédiatement et intégralement remboursé sur son Wallet.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Motif du refus (texte libre) *
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Atelier surchargé jusqu'à la fin du mois, rupture d'approvisionnement sur le bois de cèdre..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" disabled={loading || !reason.trim()} className="btn-danger">
              <Ban size={16} />
              <span>{loading ? "Annulation..." : "Confirmer le Refus & Rembourser Client"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
