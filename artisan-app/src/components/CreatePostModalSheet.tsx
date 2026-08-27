import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Camera, Sparkles, X, Info } from "lucide-react";

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
  const [netPrice, setNetPrice] = useState("");
  const [productType, setProductType] = useState<"standard" | "personnalise">("standard");
  const [category, setCategory] = useState("Céramique & Poterie");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600");
  const [manufacturingDays, setManufacturingDays] = useState(5);
  const [loading, setLoading] = useState(false);

  // New Pricing Formula: 5% Commission + 20% TVA on Commission
  const numNet = Number(netPrice) || 0;
  const commissionHt = Math.round(numNet * 0.05);
  const tvaVal = Math.round(commissionHt * 0.20);
  const clientDisplayedPrice = numNet > 0 ? numNet + commissionHt + tvaVal : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !netPrice) return;
    setLoading(true);
    try {
      await onCreateProduct({
        title: title.trim(),
        description: description.trim(),
        price: numNet, // Store net price requested by artisan
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
          className="glass-overlay"
          style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            borderRadius: "28px 28px 0 0",
            padding: "var(--space-5) var(--space-5) var(--space-7)",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 -14px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ width: 40, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto var(--space-4)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "var(--font-md)", color: "var(--primary)", margin: 0 }}>
                ✨ Publier une Création d'Atelier
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                Ajoutez un produit d'artisanat sur la marketplace Vork
              </p>
            </div>

            <button
              onClick={onClose}
              style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Titre de la création d'artisanat *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Tajine Fassi en Céramique Bleue Peint à la Main"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, color: "var(--primary)" }}
              />
            </div>

            {/* Pricing Section showing Net Artisan vs Client Price */}
            <div style={{ background: "rgba(184, 98, 63, 0.06)", padding: "14px", borderRadius: 16, border: "1px solid rgba(184, 98, 63, 0.2)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--accent-warm)", display: "block", marginBottom: 4 }}>
                    Prix Net Maâlem (MAD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    placeholder="1000"
                    value={netPrice}
                    onChange={(e) => setNetPrice(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid var(--accent-warm)", background: "var(--surface)", fontSize: 16, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--primary)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Prix Affiché Client (TTC)
                  </label>
                  <div style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>
                    {clientDisplayedPrice} MAD
                  </div>
                </div>
              </div>

              {numNet > 0 && (
                <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <Info size={12} color="var(--accent-warm)" />
                  <span>Vous recevrez exactement <strong>{numNet} MAD NET</strong> (5% frais Vork = {commissionHt} MAD, TVA = {tvaVal} MAD).</span>
                </p>
              )}
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
                  Délai Confection (Jours)
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
                placeholder="Décrivez les matériaux naturels (cuir végétal, argile de Fès), la technique de fabrication traditionnelle..."
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
                <span>{loading ? "Publication..." : "Publier sur Vork"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
