import React, { useState } from "react";
import { Store, ShieldCheck, ShieldAlert, Plus, Layers, Check, Award, ChevronRight } from "lucide-react";
import type { ArtisanProfileHealth, ArtisanProduct } from "../types/artisanTypes";

interface ShopManagementMobileViewProps {
  health: ArtisanProfileHealth | null;
  warnings: any[];
  products: ArtisanProduct[];
  onCreateProduct: (productData: any) => Promise<void>;
}

export const ShopManagementMobileView: React.FC<ShopManagementMobileViewProps> = ({
  health,
  warnings,
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

  const warningCount = health?.warningCountCurrentMonth || 0;
  const isSuspended = health?.suspensionStatus && health.suspensionStatus.startsWith("suspended");

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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Workshop Profile Card */}
      <div className="artisan-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent-warm), var(--primary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: 800,
          fontFamily: "var(--font-display)",
          boxShadow: "var(--shadow-md)",
        }}>
          م
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--primary)", margin: 0 }}>
              Maâlem Abdelkader
            </h3>
            <span className="badge-pill badge-success">✓ Artisan Certifié</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>
            Médina de Fès · Spécialité Céramique & Cuir
          </p>
        </div>
      </div>

      {/* Monthly Warning & Health Card (Art. 19 & 22) */}
      <div className="artisan-card" style={{
        background: isSuspended ? "linear-gradient(135deg, rgba(220, 53, 69, 0.08), rgba(26, 42, 58, 0.02))" : "var(--surface)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isSuspended ? <ShieldAlert size={18} color="#DC3545" /> : <ShieldCheck size={18} color="#2D6A4F" />}
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>
              Santé Boutique (Art. 19)
            </span>
          </div>
          <span className={`badge-pill ${warningCount >= 5 ? "badge-urgent" : "badge-success"}`}>
            {warningCount} / 10 ce mois
          </span>
        </div>

        <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            width: `${(warningCount / 10) * 100}%`,
            height: "100%",
            background: warningCount >= 5 ? "var(--accent-warm)" : "#2D6A4F",
          }} />
        </div>

        <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
          {warningCount < 5 ? "🟢 Statut sain. Respectez les délais de 48h pour préserver votre visibilité." : "⚠️ Attention, seuil de suspension automatique à 10 avertissements (Art. 19.3)."}
        </p>
      </div>

      {/* Product Catalog Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--primary)", margin: 0 }}>
            Mes Créations ({products.length})
          </h4>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
            Catalogue en ligne sur la marketplace
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-mobile-terracotta"
          style={{ width: "auto", padding: "8px 14px", fontSize: 11 }}
        >
          <Plus size={14} />
          <span>{showAddForm ? "Fermer" : "Ajouter un Produit"}</span>
        </button>
      </div>

      {/* Add Product Drawer */}
      {showAddForm && (
        <div className="artisan-card" style={{ border: "1.5px solid var(--accent-warm)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--accent-warm)", marginBottom: 10 }}>
            ✨ Nouvelle Création Artisanale
          </h4>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Titre de la création *</label>
              <input
                type="text"
                required
                placeholder="Ex: Tajine Fassi Fait Main"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Prix (MAD) *</label>
                <input
                  type="number"
                  required
                  min={50}
                  placeholder="450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Type (Règles CGV) *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 11, fontWeight: 700 }}
                >
                  <option value="standard">📦 Standard (Sendit)</option>
                  <option value="personnalise">🎨 Sur-Mesure (Direct)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>URL Photo de la création</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 11 }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-mobile-primary">
              <Check size={16} />
              <span>{loading ? "Publication..." : "Publier sur la Marketplace"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Products Mobile List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {products.slice(0, 8).map((p) => (
          <div key={p.id} className="artisan-card" style={{ padding: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 100, borderRadius: 12, overflow: "hidden", marginBottom: 8, position: "relative" }}>
              <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{
                position: "absolute",
                top: 4,
                left: 4,
                background: p.productType === "standard" ? "rgba(45, 106, 79, 0.9)" : "rgba(204, 119, 85, 0.9)",
                color: "#FFFFFF",
                fontSize: 8,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
              }}>
                {p.productType === "standard" ? "Standard" : "Sur-mesure"}
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--primary)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.title}
            </p>
            <p style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-warm)", margin: 0 }}>
              {p.price} MAD
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
