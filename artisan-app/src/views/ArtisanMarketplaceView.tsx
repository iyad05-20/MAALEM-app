import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Send, CheckCircle2, MapPin, Clock, Tag, Sparkles, X } from "lucide-react";
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
    setNote("Exécution artisanale dans notre atelier de Fès avec finitions traditionnelles à la main.");
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      {/* Header Info Banner */}
      <div className="artisan-card" style={{ background: "linear-gradient(135deg, rgba(184, 98, 63, 0.08), rgba(212, 175, 55, 0.04))", border: "1px solid rgba(184, 98, 63, 0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
          <ShoppingBag size={20} color="var(--accent-warm)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "var(--font-md)", color: "var(--primary)", margin: 0 }}>
            Marché des Commandes Sur-Mesure
          </h3>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
          Annonces personnalisées des clients. Soumettez votre devis (prix et délai) pour fabriquer la pièce.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: 22,
              border: selectedCategory === cat ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: selectedCategory === cat ? "var(--primary)" : "var(--surface)",
              color: selectedCategory === cat ? "#FFFFFF" : "var(--text-secondary)",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: selectedCategory === cat ? "var(--shadow-sm)" : "none",
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <div className="artisan-card" style={{ padding: "44px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <ShoppingBag size={38} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>Aucune annonce sur-mesure dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {filteredRequests.map((reqItem, idx) => {
            const hasMyQuote = reqItem.quotes.some(q => q.artisanName.includes("Abdelkader"));

            return (
              <motion.div
                key={reqItem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="artisan-card"
              >
                <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                  {/* Photo with Section 7 Treatment (Overlay 15% + 90% desaturation) */}
                  <div className="artisan-photo-wrapper" style={{ width: 84, height: 84, flexShrink: 0, border: "1px solid var(--border)" }}>
                    <img src={reqItem.image} alt={reqItem.title} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <span className="badge-pill badge-info" style={{ fontSize: 9 }}>
                        {reqItem.category}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                        {new Date(reqItem.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-sm)", fontWeight: 900, color: "var(--primary)", margin: "2px 0 4px" }}>
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

                <p style={{ fontSize: 11, color: "var(--primary)", margin: "0 0 12px", lineHeight: 1.5, background: "rgba(26,42,58,0.03)", padding: 10, borderRadius: 12, fontStyle: "italic" }}>
                  "{reqItem.description}"
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600 }}>Budget Client :</span>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-md)", fontWeight: 900, color: "var(--accent-warm)", margin: 0 }}>
                      {reqItem.budget}
                    </p>
                  </div>

                  {hasMyQuote ? (
                    <span className="badge-pill badge-success" style={{ padding: "6px 14px" }}>
                      ✓ Devis Transmis
                    </span>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenQuoteModal(reqItem)}
                      className="btn-mobile-terracotta"
                      style={{ width: "auto", padding: "9px 16px", fontSize: 11 }}
                    >
                      <Send size={13} /> Soumettre un Devis
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quote Submission Glass Sheet Drawer */}
      <AnimatePresence>
        {activeRequest && (
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
                boxShadow: "0 -14px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ width: 40, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto var(--space-4)" }} />

              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "var(--font-md)", color: "var(--primary)", marginBottom: 2 }}>
                📜 Transmettre un Devis Vendeur
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: 16 }}>
                Pour l'annonce : <strong>{activeRequest.title}</strong>
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                      Prix Proposé (MAD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
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
                      min={1}
                      value={confectionDays}
                      onChange={(e) => setConfectionDays(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 14, fontWeight: 900, color: "var(--primary)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Note explicative au Client
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Expliquez la qualité des matériaux et les finitions faites main..."
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, color: "var(--primary)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
