import React, { useState } from "react";
import { Layers, Plus, Check, Image as ImageIcon, Tag, Clock } from "lucide-react";
import type { ArtisanProduct } from "../types/artisanTypes";

interface CatalogManagementViewProps {
  products: ArtisanProduct[];
  onCreateProduct: (productData: any) => Promise<void>;
}

export const CatalogManagementView: React.FC<CatalogManagementViewProps> = ({
  products,
  onCreateProduct,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [productType, setProductType] = useState<"standard" | "personnalise" | "sur_commande">("standard");
  const [category, setCategory] = useState("Poterie & Céramique");
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
      setShowAddForm(false);
      setTitle("");
      setDescription("");
      setPrice("");
    } catch (err: any) {
      alert(err.message || "Erreur création produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header with Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: "0 0 2px" }}>
            Catalogue & Créations de l'Atelier (Art. 4 CGV)
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            {products.length} pièce(s) artisanale(s) répertoriée(s)
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-terracotta"
        >
          <Plus size={16} />
          <span>{showAddForm ? "Fermer le Formulaire" : "Ajouter une Création"}</span>
        </button>
      </div>

      {/* Product Creation Form */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: 24, border: "1px solid var(--border-terracotta)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--primary-terracotta)", marginBottom: 16 }}>
            ✨ Ajouter une Nouvelle Création Artisanale
          </h4>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Titre de la création *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tajine Émaillé Fès Fait Main"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Prix de vente (MAD) *</label>
                <input
                  type="number"
                  required
                  min={50}
                  placeholder="Ex: 450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12, fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Type de Produit (Règles CGV) *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12, fontWeight: 700 }}
                >
                  <option value="standard">📦 Standard (Sendit & Retour 7j)</option>
                  <option value="personnalise">🎨 Personnalisé (Livraison Directe)</option>
                  <option value="sur_commande">🔨 Sur Commande (Livraison Directe)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Catégorie Artisanale</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
                >
                  <option value="Poterie & Céramique">Poterie & Céramique</option>
                  <option value="Cuir & Maroquinerie">Cuir & Maroquinerie</option>
                  <option value="Bois & Marqueterie">Bois & Marqueterie</option>
                  <option value="Tapis & Tissage">Tapis & Tissage</option>
                  <option value="Dinanderie & Métal">Dinanderie & Métal</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Délai Confection Estimé (Jours)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={manufacturingDays}
                  onChange={(e) => setManufacturingDays(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>URL Photo Principale</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Description & Savoir-faire</label>
              <textarea
                rows={3}
                placeholder="Détails sur les matières premières utilisées, finitions faites à la main..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline">Annuler</button>
              <button type="submit" disabled={loading} className="btn-terracotta">
                <Check size={16} />
                <span>{loading ? "Publication..." : "Publier sur la Marketplace Vork"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 160, position: "relative" }}>
              <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: p.productType === "standard" ? "rgba(45, 106, 79, 0.85)" : "rgba(196, 169, 106, 0.85)",
                backdropFilter: "blur(4px)",
                color: "#FFF",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
              }}>
                {p.productType === "standard" ? "📦 Standard" : "🎨 Sur-Mesure"}
              </span>
            </div>

            <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", margin: "0 0 2px" }}>{p.category}</p>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px" }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, margin: 0, maxHeight: 34, overflow: "hidden" }}>
                  {p.description}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--primary-gold)" }}>
                  {p.price} MAD
                </span>
                <span className="badge badge-success">En Ligne</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
