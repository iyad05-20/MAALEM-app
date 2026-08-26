import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Camera, Sparkles, X } from "lucide-react";

interface CreatePostModalSheetProps {
  onClose: () => void;
  onCreateProduct: (productData: any) => Promise<void>;
}

export const CreatePostModalSheet: React.FC<CreatePostModalSheetProps> = ({
  onClose,
  onCreateProduct,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [productType, setProductType] = useState<"standard" | "personnalise" | "sur_commande">("standard");
  const [category, setCategory] = useState("Céramique & Poterie");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600");
  const [manufacturingDays, setManufacturingDays] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;
    setLoading(true);
    try {
      await onCreateProduct({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        productType,
        category,
        image,
        manufacturingDays: Number(manufacturingDays),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la publication du post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          zIndex: 200,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            borderRadius: "28px 28px 0 0",
            padding: "20px 22px 34px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 -14px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ width: 40, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto 16px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 17, color: "var(--primary)", margin: 0 }}>
                ✨ Publier une Création (Post)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                Ajoutez un produit d'artisanat sur la marketplace Vork
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
            >
              <X size={18} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Titre de la création / Post *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Tajine Fassi en Céramique Bleue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, color: "var(--primary)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Prix (MAD) *
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  placeholder="450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 14, fontWeight: 900, color: "var(--primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Type de produit *
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, fontWeight: 800, color: "var(--primary)" }}
                >
                  <option value="standard">📦 Standard (Ramassage Sendit)</option>
                  <option value="personnalise">🎨 Sur-Mesure / Commande Directe</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Catégorie d'artisanat *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, fontWeight: 800, color: "var(--primary)" }}
                >
                  <option value="Céramique & Poterie">Céramique & Poterie</option>
                  <option value="Cuir & Maroquinerie">Cuir & Maroquinerie</option>
                  <option value="Textile & Caftans">Textile & Caftans</option>
                  <option value="Bois & Zellige">Bois & Zellige</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Délai Fabrication (Jours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={manufacturingDays}
                  onChange={(e) => setManufacturingDays(Number(e.target.value))}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 900, color: "var(--primary)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                URL Photo de la création
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, color: "var(--primary)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Description détaillée de la pièce
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez les matériaux, la technique de fabrication traditionnelle et les dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, color: "var(--primary)" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={onClose} className="btn-mobile-outline" style={{ flex: 1 }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} className="btn-mobile-terracotta" style={{ flex: 2 }}>
                <Check size={16} />
                <span>{loading ? "Publication..." : "Publier le Post sur Vork"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
