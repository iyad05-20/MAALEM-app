import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, X, Check, Image as ImageIcon, Plus } from "lucide-react";

interface PrepPhotosModalProps {
  orderId: string;
  onClose: () => void;
  onUpload: (orderId: string, photos: string[]) => Promise<void>;
}

export const PrepPhotosModal: React.FC<PrepPhotosModalProps> = ({ orderId, onClose, onUpload }) => {
  const defaultSamplePhotos = [
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600",
    "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=600",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600",
  ];

  const [photos, setPhotos] = useState<string[]>(defaultSamplePhotos);
  const [photoInput, setPhotoInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddPhoto = () => {
    if (photoInput.trim() && photos.length < 4) {
      setPhotos([...photos, photoInput.trim()]);
      setPhotoInput("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) return;
    setSubmitting(true);
    try {
      await onUpload(orderId, photos);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur upload photos.");
    } finally {
      setSubmitting(false);
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
          border: "1px solid var(--border-terracotta)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-terracotta-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={20} color="var(--primary-terracotta)" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                📸 4 Photos de Préparation (Art. 8.1)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Commande N° <strong style={{ color: "var(--primary-terracotta)" }}>{orderId}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ background: "rgba(200, 100, 50, 0.08)", border: "1px solid rgba(200, 100, 50, 0.25)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "var(--text-main)", lineHeight: 1.4, margin: 0 }}>
            📌 <strong>Règle CGV Art. 8.1 :</strong> Prenez en photo votre article fini sous 4 angles différents (face, profil, finitions, détails). Ces photos protègent votre atelier en cas de contestation client.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Photo Gallery Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
            {photos.map((url, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-color)", height: 110 }}>
                <img src={url} alt={`Vue ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#FFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={12} />
                </button>
                <span style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.6)", color: "#FFF", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                  Angle {i + 1}
                </span>
              </div>
            ))}
          </div>

          {photos.length < 4 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="URL de photo supplémentaire..."
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 11 }}
              />
              <button type="button" onClick={handleAddPhoto} className="btn-outline" style={{ fontSize: 11 }}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--border-color)", paddingTop: 14 }}>
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" disabled={submitting || photos.length === 0} className="btn-terracotta">
              <Check size={16} />
              <span>Valider les {photos.length} Photos de Confection</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
