import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scale, X, Send, Image as ImageIcon, Plus } from "lucide-react";
import type { ArtisanDispute } from "../types/artisanTypes";

interface DisputeReplyModalProps {
  dispute: ArtisanDispute;
  onClose: () => void;
  onRespond: (disputeId: string, responseText: string, photos: string[]) => Promise<any>;
}

export const DisputeReplyModal: React.FC<DisputeReplyModalProps> = ({
  dispute,
  onClose,
  onRespond,
}) => {
  const [responseText, setResponseText] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"
  ]);
  const [photoInput, setPhotoInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    if (photoInput.trim() && photoUrls.length < 3) {
      setPhotoUrls([...photoUrls, photoInput.trim()]);
      setPhotoInput("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setLoading(true);
    try {
      await onRespond(dispute.id, responseText, photoUrls);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur soumission défense.");
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
          maxWidth: 620,
          padding: 24,
          border: "1px solid var(--accent-crimson)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-crimson-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={20} color="#F87171" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                Défense Contradictoire sous 48h (Art. 20)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Dossier Réclamation N° <strong style={{ color: "#F87171" }}>{dispute.id}</strong> (Commande #{dispute.orderId})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ background: "rgba(220, 53, 69, 0.08)", border: "1px solid rgba(220, 53, 69, 0.25)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#F87171", margin: "0 0 4px" }}>
            Motif déclaré par le Client :
          </p>
          <p style={{ fontSize: 12, color: "var(--text-main)", margin: 0, fontStyle: "italic" }}>
            "{dispute.reason}"
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Vos explications contradictoires d'atelier (Art. 20.3) *
            </label>
            <textarea
              required
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Expliquez la conformité de votre pièce, l'état lors de la fabrication, ou proposez un geste commercial / réfection amiable..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Photos justificatives (Atelier, Devis, Accusé)
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {photoUrls.map((url, i) => (
                <div key={i} style={{ position: "relative", width: 70, height: 70, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={url} alt={`Preuve ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#FFF", border: "none", cursor: "pointer" }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            {photoUrls.length < 3 && (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="URL photo de preuve..."
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 11 }}
                />
                <button type="button" onClick={handleAddPhoto} className="btn-outline" style={{ fontSize: 11, padding: "6px 10px" }}>
                  <Plus size={14} /> Ajouter
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" disabled={loading || !responseText.trim()} className="btn-terracotta">
              <Send size={16} />
              <span>{loading ? "Transmission..." : "Transmettre ma Défense à Vork"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
