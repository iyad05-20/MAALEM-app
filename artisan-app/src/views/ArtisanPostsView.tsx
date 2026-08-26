import React, { useState } from "react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Top Header Card */}
      <div className="artisan-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--primary)", margin: 0 }}>
            Mes Posts & Catalogue ({products.length})
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            Éditez prix, descriptions et délais de confection
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn-mobile-terracotta"
          style={{ width: "auto", padding: "8px 14px", fontSize: 11 }}
        >
          <Plus size={14} />
          <span>Nouveau Post</span>
        </button>
      </div>

      {/* Posts List */}
      {products.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Layers size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucun post publié pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map((p) => (
            <div key={p.id} className="artisan-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 70, height: 70, borderRadius: 12, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: p.productType === "standard" ? "rgba(45, 106, 79, 0.9)" : "rgba(204, 119, 85, 0.9)",
                    color: "#FFFFFF",
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "2px 5px",
                    borderRadius: 4,
                  }}>
                    {p.productType === "standard" ? "Standard" : "Sur-mesure"}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--primary)", margin: 0 }}>
                      {p.title}
                    </h4>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--accent-warm)" }}>
                      {p.price} MAD
                    </span>
                  </div>

                  <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: "2px 0 4px" }}>
                    Catégorie : {p.category}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={11} /> Confection : {p.manufacturingDays || 5} jours
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => handleStartEdit(p)}
                  className="btn-mobile-outline"
                  style={{ flex: 1, padding: "6px", fontSize: 11 }}
                >
                  <Edit3 size={13} /> Éditer Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Sheet Drawer */}
      {editingProduct && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            borderRadius: "24px 24px 0 0",
            padding: "20px 20px 32px",
            boxShadow: "0 -12px 32px rgba(0,0,0,0.3)",
          }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />

            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--primary)", marginBottom: 2 }}>
              ✏️ Éditer le Post : {editingProduct.title}
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 14 }}>
              Ajustez le prix et les délais en cas de surcharge d'atelier.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                    Prix (MAD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                    Délai Confection (Jours) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editDays}
                    onChange={(e) => setEditDays(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                  Description de la création
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, color: "var(--primary)" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
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
                  <Check size={15} />
                  <span>{saving ? "Sauvegarde..." : "Enregistrer les modifications"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
