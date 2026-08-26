import React, { useState } from "react";
import { ShoppingBag, Send, CheckCircle2, MapPin, Clock, Tag, Sparkles } from "lucide-react";
import type { CustomOrderRequest } from "../types/artisanTypes";

interface ArtisanMarketplaceViewProps {
  customRequests: CustomOrderRequest[];
  onSubmitQuote: (requestId: string, price: number, days: number, note: string) => Promise<void>;
}

export const ArtisanMarketplaceView: React.FC<ArtisanMarketplaceViewProps> = ({
  customRequests,
  onSubmitQuote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [activeRequest, setActiveRequest] = useState<CustomOrderRequest | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [confectionDays, setConfectionDays] = useState<string>("7");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categories = ["Toutes", "Céramique & Poterie", "Cuir & Maroquinerie", "Textile & Caftans", "Bois & Zellige"];

  const filteredRequests = customRequests.filter((r) => {
    if (selectedCategory === "Toutes") return true;
    return r.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleOpenQuoteModal = (reqItem: CustomOrderRequest) => {
    setActiveRequest(reqItem);
    setProposedPrice(reqItem.budget.replace(/\D/g, "") || "1500");
    setConfectionDays("7");
    setNote("Exécution artisanale dans notre atelier avec finitions faites à la main.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !proposedPrice || !confectionDays) return;
    setSubmitting(true);
    try {
      await onSubmitQuote(
        activeRequest.id,
        Number(proposedPrice),
        Number(confectionDays),
        note.trim()
      );
      setActiveRequest(null);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi du devis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header Info */}
      <div className="artisan-card" style={{ background: "linear-gradient(135deg, rgba(204, 119, 85, 0.1), rgba(26, 42, 58, 0.03))", border: "1px solid rgba(204, 119, 85, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <ShoppingBag size={20} color="var(--accent-warm)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "var(--primary)", margin: 0 }}>
            Marché des Commandes Sur-Mesure
          </h3>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
          Annonces personnalisées déposées par les clients. Soumettez votre devis (prix et délai) pour remporter la commande.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              border: selectedCategory === cat ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: selectedCategory === cat ? "var(--primary)" : "var(--surface)",
              color: selectedCategory === cat ? "#FFFFFF" : "var(--text-secondary)",
              fontFamily: "var(--font-display)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <ShoppingBag size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucune demande sur-mesure dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredRequests.map((reqItem) => {
            const hasMyQuote = reqItem.quotes.some(q => q.artisanName.includes("Abdelkader"));

            return (
              <div key={reqItem.id} className="artisan-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                    <img src={reqItem.image} alt={reqItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <span className="badge-pill badge-info" style={{ fontSize: 9 }}>
                        {reqItem.category}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                        {new Date(reqItem.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--primary)", margin: "2px 0" }}>
                      {reqItem.title}
                    </h4>

                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>👤 {reqItem.clientName}</span>
                      <span>•</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <MapPin size={10} /> {reqItem.deliveryCity}
                      </span>
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: "var(--primary)", margin: "0 0 10px", lineHeight: 1.4, background: "rgba(0,0,0,0.03)", padding: 8, borderRadius: 10, fontStyle: "italic" }}>
                  "{reqItem.description}"
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Budget Estimé Client :</span>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--accent-warm)", margin: 0 }}>
                      {reqItem.budget}
                    </p>
                  </div>

                  {hasMyQuote ? (
                    <span className="badge-pill badge-success" style={{ padding: "6px 12px" }}>
                      ✓ Devis Transmis
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenQuoteModal(reqItem)}
                      className="btn-mobile-terracotta"
                      style={{ width: "auto", padding: "8px 14px", fontSize: 11 }}
                    >
                      <Send size={13} /> Soumettre un Devis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote Submission Bottom Sheet Drawer */}
      {activeRequest && (
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
              📜 Transmettre Devis / Offre Vendeur
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 14 }}>
              Pour l'annonce : <strong>{activeRequest.title}</strong>
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                    Prix Proposé (MAD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                    Délai de Confection (Jours) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={confectionDays}
                    onChange={(e) => setConfectionDays(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
                  Note explicative au Client
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Expliquez la qualité des matériaux et le processus d'atelier..."
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, color: "var(--primary)" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="btn-mobile-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-mobile-terracotta"
                  style={{ flex: 2 }}
                >
                  <Send size={15} />
                  <span>{submitting ? "Transmission..." : "Envoyer le Devis"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
