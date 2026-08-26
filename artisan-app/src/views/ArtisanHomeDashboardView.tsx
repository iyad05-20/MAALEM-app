import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Printer
} from "lucide-react";
import { AnimatedZelligePattern } from "../components/AnimatedZelligePattern";
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
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
    >
      {/* ─── 1. PORTEFEUILLE DUEL (WALLETS BLOQUÉ vs LIBRE) ─────────────────── */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        style={{
          background: "linear-gradient(135deg, #1A2A3A 0%, #101B26 100%)",
          borderRadius: 28,
          padding: "var(--space-5)",
          color: "#FFFFFF",
          boxShadow: "0 14px 36px rgba(26, 42, 58, 0.28)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(212, 175, 55, 0.3)",
        }}
      >
        {/* Animated Zellige Signature Element */}
        <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "none" }}>
          <AnimatedZelligePattern size={52} color="var(--accent-premium)" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Wallet size={20} color="var(--accent-premium)" />
            <span style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "var(--text-on-dark)",
            }}>
              Portefeuille Maâlem Vork
            </span>
          </div>
          <span className="badge-pill" style={{ background: "rgba(212,175,55,0.18)", color: "var(--accent-premium)", border: "1px solid rgba(212,175,55,0.35)", marginRight: 42 }}>
            ★ Séquestre Sécurisé
          </span>
        </div>

        {/* Dual Wallet Display (Partie Libre vs Partie Bloquée) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          {/* Partie Libre / Disponible */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "var(--space-3) var(--space-4)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: 4 }}>
              <CheckCircle2 size={14} color="#34D399" />
              <span style={{ fontSize: "10px", color: "rgba(244,241,234,0.8)", fontWeight: 700 }}>Partie Libre</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-lg)", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
              {wallet?.availableBalance || 0} <span style={{ fontSize: "13px", color: "var(--accent-premium)" }}>MAD</span>
            </p>
            <p style={{ fontSize: "9px", color: "rgba(244,241,234,0.6)", margin: "2px 0 0" }}>
              Disponible sur RIB
            </p>
          </div>

          {/* Partie Bloquée (Confection / Transport / Retractation) */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "var(--space-3) var(--space-4)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: 4 }}>
              <Lock size={14} color="#60A5FA" />
              <span style={{ fontSize: "10px", color: "rgba(244,241,234,0.8)", fontWeight: 700 }}>Partie Bloquée</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-lg)", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
              {wallet?.lockedEscrow || 0} <span style={{ fontSize: "13px", color: "#60A5FA" }}>MAD</span>
            </p>
            <p style={{ fontSize: "9px", color: "rgba(244,241,234,0.6)", margin: "2px 0 0" }}>
              Confection & Rétractation
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
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "var(--font-md)", color: "var(--primary)", margin: 0 }}>
            Commandes Actives ({activeOrders.length})
          </h3>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
            Ordre chronologique de confection
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
          <p style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>Aucune commande active actuellement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
              >
                {/* Order Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 2 }}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-md)", fontWeight: 900, color: "var(--primary)" }}>
                        #{order.id}
                      </strong>
                      <span className={`badge-pill ${isToAccept ? "badge-urgent" : isInPrep ? "badge-warning" : isInTransport ? "badge-info" : "badge-success"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {order.productType === "standard" ? "📦 Standard Sendit" : "🎨 Sur-Mesure Direct"}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-md)", fontWeight: 900, color: "var(--primary)", margin: 0 }}>
                      {order.totalPrice} MAD
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--accent-emerald)", fontWeight: 800, margin: 0 }}>
                      Net: {Math.round(order.totalPrice * 0.90)} MAD
                    </p>
                  </div>
                </div>

                {/* Progress Mini Step */}
                <div style={{
                  background: "rgba(26,42,58,0.03)",
                  borderRadius: 14,
                  padding: "var(--space-2) var(--space-3)",
                  marginBottom: "var(--space-3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <span>1. {isToAccept ? "⏳ À Valider (<72h)" : "✓ Acceptée"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>2. {hasPrepPhotos ? "✓ 4 Photos Ok" : isInPrep ? "📸 4 Photos" : "Photos"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>3. {isDelivered ? "✓ Livré" : isInTransport ? "🚚 Transit" : "Expédition"}</span>
                </div>

                {/* Action Buttons (Min 44x44px Touch Target) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {/* Step 1 : Accept / Refuse */}
                  {isToAccept && (
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
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
                        border: hasPrepPhotos ? "1.5px solid var(--accent-emerald)" : "1.5px solid var(--accent-warm)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Camera size={16} color={hasPrepPhotos ? "var(--accent-emerald)" : "var(--accent-warm)"} />
                        <span style={{ color: hasPrepPhotos ? "var(--accent-emerald)" : "var(--accent-warm)", fontWeight: 800 }}>
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
                      style={{ background: "var(--accent-emerald)" }}
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
