import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Edit3, Trash2, Eye, EyeOff, Plus, Check, Clock } from "lucide-react";
import type { ArtisanProduct } from "../types/artisanTypes";

interface ArtisanPostsViewProps {
  products: ArtisanProduct[];
  onOpenCreateModal: () => void;
  onUpdateProduct: (productData: any) => Promise<void>;
}

export const ArtisanPostsView: React.FC<ArtisanPostsViewProps> = ({
  products,
  onOpenCreateModal,
  onUpdateProduct,
}) => {
  const [editingProduct, setEditingProduct] = useState<ArtisanProduct | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDays, setEditDays] = useState<string>("5");
  const [editDescription, setEditDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const handleStartEdit = (p: ArtisanProduct) => {
    setEditingProduct(p);
    setEditPrice(String(p.price));
    setEditDays(String(p.manufacturingDays || 5));
    setEditDescription(p.description || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      await onUpdateProduct({
        ...editingProduct,
        price: Number(editPrice),
        manufacturingDays: Number(editDays),
        description: editDescription,
      });
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || "Erreur modification post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Top Header Card */}
      <div className="artisan-card-glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--primary)", margin: 0 }}>
            Mes Posts & Catalogue ({products.length})
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            Éditez prix, descriptions et délais de confection
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCreateModal}
          className="btn-mobile-terracotta"
          style={{ width: "auto", padding: "9px 16px", fontSize: 11 }}
        >
          <Plus size={15} />
          <span>Nouveau Post</span>
        </motion.button>
      </div>

      {/* Posts Grid List */}
      {products.length === 0 ? (
        <div className="artisan-card" style={{ padding: "44px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Layers size={38} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Aucun post publié pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {products.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="artisan-card"
              style={{ padding: 16 }}
            >
              <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 76, height: 76, borderRadius: 14, overflow: "hidden", flexShrink: 0, position: "relative", border: "1px solid var(--border)" }}>
                  <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: p.productType === "standard" ? "rgba(45, 106, 79, 0.95)" : "rgba(204, 119, 85, 0.95)",
                    color: "#FFFFFF",
                    fontSize: 8,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}>
                    {p.productType === "standard" ? "Standard" : "Sur-mesure"}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 900, color: "var(--primary)", margin: 0 }}>
                      {p.title}
                    </h4>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 900, color: "var(--accent-warm)" }}>
                      {p.price} MAD
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 6px" }}>
                    Catégorie : {p.category}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                      <Clock size={12} color="var(--accent-warm)" /> Confection : {p.manufacturingDays || 5} jours
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleStartEdit(p)}
                  className="btn-mobile-outline"
                  style={{ flex: 1, padding: "8px", fontSize: 11 }}
                >
                  <Edit3 size={14} /> Éditer le Post & Prix
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Product Sheet Drawer */}
      <AnimatePresence>
        {editingProduct && (
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: "#FCFBF9",
                width: "100%",
                maxWidth: 440,
                borderRadius: "28px 28px 0 0",
                padding: "20px 22px 34px",
                boxShadow: "0 -14px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ width: 40, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto 18px" }} />

              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16, color: "var(--primary)", marginBottom: 2 }}>
                ✏️ Éditer le Post : {editingProduct.title}
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 16 }}>
                Ajustez le prix et les délais en cas de surcharge d'atelier.
              </p>

              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                      Prix (MAD) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 14, fontWeight: 900, color: "var(--primary)" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                      Délai Confection (Jours) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editDays}
                      onChange={(e) => setEditDays(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 14, fontWeight: 900, color: "var(--primary)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Description de la création
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, color: "var(--primary)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="btn-mobile-outline"
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-mobile-primary"
                    style={{ flex: 2 }}
                  >
                    <Check size={16} />
                    <span>{saving ? "Sauvegarde..." : "Enregistrer les modifications"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
