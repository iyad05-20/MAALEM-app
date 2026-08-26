import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Lock, 
  CheckCircle2, 
  Landmark, 
  Package, 
  Clock, 
  Check, 
  X, 
  Camera, 
  Truck, 
  FileSignature, 
  ChevronRight,
  Printer,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import type { ArtisanOrder, ArtisanWallet } from "../types/artisanTypes";

interface ArtisanHomeDashboardViewProps {
  wallet: ArtisanWallet | null;
  orders: ArtisanOrder[];
  onOpenWithdrawalModal: () => void;
  onAccept: (orderId: string) => Promise<void>;
  onOpenRefuseModal: (orderId: string) => void;
  onOpenPrepPhotosModal: (orderId: string) => void;
  onOpenSenditModal: (order: ArtisanOrder) => void;
  onOpenDirectDeliveryModal: (order: ArtisanOrder) => void;
}

export const ArtisanHomeDashboardView: React.FC<ArtisanHomeDashboardViewProps> = ({
  wallet,
  orders,
  onOpenWithdrawalModal,
  onAccept,
  onOpenRefuseModal,
  onOpenPrepPhotosModal,
  onOpenSenditModal,
  onOpenDirectDeliveryModal,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await onAccept(orderId);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'acceptation.");
    } finally {
      setActionLoading(null);
    }
  };

  // Chronological Active Orders
  const activeOrders = orders
    .filter(o => o.status !== "annulee")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingAcceptCount = activeOrders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      {/* ─── 1. PORTEFEUILLE LUXE (DUAL WALLET) ─────────────────────────────────── */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        style={{
          background: "linear-gradient(135deg, #1A2A3A 0%, #0F1B27 100%)",
          borderRadius: 26,
          padding: 22,
          color: "#FFFFFF",
          boxShadow: "0 14px 36px rgba(26, 42, 58, 0.28)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(212, 175, 55, 0.25)",
        }}
      >
        {/* Glow Effects */}
        <div style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Wallet size={20} color="var(--accent-premium)" />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
              Portefeuille Maâlem Vork
            </span>
          </div>
          <span className="badge-pill" style={{ background: "rgba(212,175,55,0.18)", color: "var(--accent-premium)", border: "1px solid rgba(212,175,55,0.35)" }}>
            ★ Escrow Séquestre
          </span>
        </div>

        {/* Dual Wallet Display */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {/* Partie Libre / Disponible */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={14} color="#34D399" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>Partie Libre</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
              {wallet?.availableBalance || 0} <span style={{ fontSize: 13, color: "var(--accent-premium)" }}>MAD</span>
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
              Déblocable sur RIB
            </p>
          </div>

          {/* Partie Bloquée */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Lock size={14} color="#60A5FA" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>Partie Bloquée</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
              {wallet?.lockedEscrow || 0} <span style={{ fontSize: 13, color: "#60A5FA" }}>MAD</span>
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
              Confection & Rétractation 7j
            </p>
          </div>
        </div>

        {/* Button Demander Virement */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOpenWithdrawalModal}
          disabled={!wallet || wallet.availableBalance <= 0}
          className="btn-mobile-terracotta"
          style={{ width: "100%", justifyContent: "center", opacity: (!wallet || wallet.availableBalance <= 0) ? 0.6 : 1 }}
        >
          <Landmark size={16} />
          <span>Demander un Virement sur RIB (Art. 15)</span>
        </motion.button>
      </motion.div>

      {/* ─── 2. COMMANDES ACTIVES CHRONOLOGIQUES ───────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--primary)", margin: 0 }}>
            Commandes Actives ({activeOrders.length})
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            Fil d'atelier trié chronologiquement
          </p>
        </div>

        {pendingAcceptCount > 0 && (
          <span className="badge-pill badge-urgent">
            🚨 {pendingAcceptCount} À Valider
          </span>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="artisan-card" style={{ padding: "44px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Package size={38} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Aucune commande active actuellement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activeOrders.map((order, idx) => {
            const isToAccept = ["acompte_verse", "payee_integralement"].includes(order.status);
            const isInPrep = order.status === "en_preparation";
            const isInTransport = order.status === "en_cours_de_transport";
            const isDelivered = ["livre", "terminee"].includes(order.status);
            const hasPrepPhotos = order.prepPhotos && order.prepPhotos.length >= 4;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="artisan-card"
                style={{ padding: 18 }}
              >
                {/* Order Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 900, color: "var(--primary)" }}>
                        #{order.id}
                      </strong>
                      <span className={`badge-pill ${isToAccept ? "badge-urgent" : isInPrep ? "badge-warning" : isInTransport ? "badge-info" : "badge-success"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {order.productType === "standard" ? "📦 Standard Sendit" : "🎨 Sur-Mesure Direct"}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--primary)", margin: 0 }}>
                      {order.totalPrice} MAD
                    </p>
                    <p style={{ fontSize: 10, color: "var(--accent-emerald)", fontWeight: 800, margin: 0 }}>
                      Net: {Math.round(order.totalPrice * 0.90)} MAD
                    </p>
                  </div>
                </div>

                {/* Progress Mini Step */}
                <div style={{
                  background: "rgba(26,42,58,0.03)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 10,
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <span>1. {isToAccept ? "⏳ À Valider (<72h)" : "✓ Acceptée"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>2. {hasPrepPhotos ? "✓ 4 Photos Ok" : isInPrep ? "📸 4 Photos" : "Photos"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>3. {isDelivered ? "✓ Livré" : isInTransport ? "🚚 Transit" : "Expédition"}</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Step 1 : Accept / Refuse */}
                  {isToAccept && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onOpenRefuseModal(order.id)}
                        className="btn-mobile-outline"
                        style={{ flex: 1, borderColor: "rgba(220,53,69,0.35)", color: "#DC3545" }}
                      >
                        <X size={15} /> Refuser
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAccept(order.id)}
                        disabled={actionLoading === order.id}
                        className="btn-mobile-terracotta"
                        style={{ flex: 2 }}
                      >
                        <Check size={16} />
                        <span>{actionLoading === order.id ? "Validation..." : "Accepter (<72h)"}</span>
                      </motion.button>
                    </div>
                  )}

                  {/* Step 2 : Upload 4 Prep Photos */}
                  {isInPrep && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenPrepPhotosModal(order.id)}
                      className="btn-mobile-outline"
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        border: hasPrepPhotos ? "1.5px solid #2D6A4F" : "1.5px solid var(--accent-warm)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Camera size={16} color={hasPrepPhotos ? "#2D6A4F" : "var(--accent-warm)"} />
                        <span style={{ color: hasPrepPhotos ? "#2D6A4F" : "var(--accent-warm)", fontWeight: 800 }}>
                          {hasPrepPhotos ? `✓ ${order.prepPhotos?.length} Photos d'Atelier validées` : "Uploader les 4 Photos d'Atelier (Art. 8.1)"}
                        </span>
                      </div>
                      <ChevronRight size={14} />
                    </motion.button>
                  )}

                  {/* Step 3 : Shipping Action */}
                  {isInPrep && (
                    <>
                      {order.productType === "standard" ? (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onOpenSenditModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-mobile-primary"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <Truck size={16} />
                          <span>Générer Bon Sendit (Étape 1 & 2)</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onOpenDirectDeliveryModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-mobile-primary"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <FileSignature size={16} />
                          <span>Déclarer Expédition Directe</span>
                        </motion.button>
                      )}
                    </>
                  )}

                  {/* Direct Delivery Completion */}
                  {isInTransport && order.productType !== "standard" && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onOpenDirectDeliveryModal(order)}
                      className="btn-mobile-primary"
                      style={{ background: "#2D6A4F" }}
                    >
                      <FileSignature size={16} />
                      <span>Valider Livraison avec Bordereau Signé (Art. 11.5)</span>
                    </motion.button>
                  )}

                  {/* PDF Label Link */}
                  {order.senditDeliveryCode && (
                    <a
                      href={`http://localhost:3001/api/artisan/orders/${order.id}/label?code=${order.senditDeliveryCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-mobile-outline"
                      style={{ textDecoration: "none", fontSize: 11, textAlign: "center", justifyContent: "center" }}
                    >
                      <Printer size={14} /> Télécharger Étiquette Sendit PDF
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
