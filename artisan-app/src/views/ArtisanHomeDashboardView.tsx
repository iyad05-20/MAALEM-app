import React, { useState } from "react";
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

  // Chronological Active Orders (exclut les annulées)
  const activeOrders = orders
    .filter(o => o.status !== "annulee")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingAcceptCount = activeOrders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* ─── 1. PORTEFEUILLE (WALLET CARD) ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1A2A3A 0%, #111D29 100%)",
        borderRadius: 24,
        padding: 20,
        color: "#FFFFFF",
        boxShadow: "0 12px 30px rgba(26, 42, 58, 0.22)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle Moroccan Pattern Accent */}
        <div style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Wallet size={18} color="var(--accent-premium)" />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
              Portefeuille Maâlem Vork
            </span>
          </div>
          <span className="badge-pill" style={{ background: "rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: 9 }}>
            Escrow Securisé
          </span>
        </div>

        {/* Dual Wallet Display (Partie Bloquée vs Partie Libre) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* Partie Libre / Disponible */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 12,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={14} color="#34D399" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Partie Libre</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              {wallet?.availableBalance || 0} <span style={{ fontSize: 12, color: "var(--accent-premium)" }}>MAD</span>
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
              Déblocable sur RIB
            </p>
          </div>

          {/* Partie Bloquée (Confection / Transport / Retractation) */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 12,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Lock size={14} color="#60A5FA" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Partie Bloquée</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              {wallet?.lockedEscrow || 0} <span style={{ fontSize: 12, color: "#60A5FA" }}>MAD</span>
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
              Confection & Rétractation 7j
            </p>
          </div>
        </div>

        {/* Button Demander Virement */}
        <button
          onClick={onOpenWithdrawalModal}
          disabled={!wallet || wallet.availableBalance <= 0}
          className="btn-mobile-terracotta"
          style={{ width: "100%", justifyContent: "center", opacity: (!wallet || wallet.availableBalance <= 0) ? 0.6 : 1 }}
        >
          <Landmark size={16} />
          <span>Demander un Virement sur RIB (Art. 15)</span>
        </button>
      </div>

      {/* ─── 2. COMMANDES ACTIVES CHRONOLOGIQUES ───────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--primary)", margin: 0 }}>
            Commandes Actives ({activeOrders.length})
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            Classées chronologiquement par date & heure
          </p>
        </div>

        {pendingAcceptCount > 0 && (
          <span className="badge-pill badge-urgent">
            🚨 {pendingAcceptCount} À Valider
          </span>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Package size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucune commande active actuellement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeOrders.map((order) => {
            const isToAccept = ["acompte_verse", "payee_integralement"].includes(order.status);
            const isInPrep = order.status === "en_preparation";
            const isInTransport = order.status === "en_cours_de_transport";
            const isDelivered = ["livre", "terminee"].includes(order.status);
            const hasPrepPhotos = order.prepPhotos && order.prepPhotos.length >= 4;

            return (
              <div key={order.id} className="artisan-card" style={{ padding: 16 }}>
                {/* Order Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--primary)" }}>
                        #{order.id}
                      </strong>
                      <span className={`badge-pill ${isToAccept ? "badge-urgent" : isInPrep ? "badge-warning" : isInTransport ? "badge-info" : "badge-success"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {order.productType === "standard" ? "📦 Standard" : "🎨 Sur-Mesure"}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--primary)", margin: 0 }}>
                      {order.totalPrice} MAD
                    </p>
                    <p style={{ fontSize: 10, color: "#2D6A4F", fontWeight: 700, margin: 0 }}>
                      Net: {Math.round(order.totalPrice * 0.90)} MAD
                    </p>
                  </div>
                </div>

                {/* Progress Mini Step */}
                <div style={{
                  background: "rgba(26,42,58,0.03)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 10,
                  color: "var(--text-secondary)"
                }}>
                  <span>1. {isToAccept ? "⏳ À Valider (<72h)" : "✓ Acceptée"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>2. {hasPrepPhotos ? "✓ 4 Photos Ok" : isInPrep ? "📸 4 Photos d'Atelier" : "Photos"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>3. {isDelivered ? "✓ Livré" : isInTransport ? "🚚 En Transit" : "Expédition"}</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Step 1 : Accept / Refuse */}
                  {isToAccept && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => onOpenRefuseModal(order.id)}
                        className="btn-mobile-outline"
                        style={{ flex: 1, borderColor: "rgba(220,53,69,0.3)", color: "#DC3545" }}
                      >
                        <X size={14} /> Refuser
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={actionLoading === order.id}
                        className="btn-mobile-terracotta"
                        style={{ flex: 2 }}
                      >
                        <Check size={16} />
                        <span>{actionLoading === order.id ? "Validation..." : "Accepter (<72h)"}</span>
                      </button>
                    </div>
                  )}

                  {/* Step 2 : Upload 4 Prep Photos */}
                  {isInPrep && (
                    <button
                      onClick={() => onOpenPrepPhotosModal(order.id)}
                      className="btn-mobile-outline"
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        border: hasPrepPhotos ? "1px solid #2D6A4F" : "1.5px solid var(--accent-warm)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Camera size={16} color={hasPrepPhotos ? "#2D6A4F" : "var(--accent-warm)"} />
                        <span style={{ color: hasPrepPhotos ? "#2D6A4F" : "var(--accent-warm)", fontWeight: 700 }}>
                          {hasPrepPhotos ? `✓ ${order.prepPhotos?.length} Photos d'Atelier validées` : "Uploader les 4 Photos d'Atelier (Art. 8.1)"}
                        </span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  )}

                  {/* Step 3 : Shipping Action */}
                  {isInPrep && (
                    <>
                      {order.productType === "standard" ? (
                        <button
                          onClick={() => onOpenSenditModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-mobile-primary"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <Truck size={16} />
                          <span>Générer Bon Sendit (Étape 1 & 2)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenDirectDeliveryModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-mobile-primary"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <FileSignature size={16} />
                          <span>Déclarer Expédition Directe</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Direct Delivery Completion */}
                  {isInTransport && order.productType !== "standard" && (
                    <button
                      onClick={() => onOpenDirectDeliveryModal(order)}
                      className="btn-mobile-primary"
                      style={{ background: "#2D6A4F" }}
                    >
                      <FileSignature size={16} />
                      <span>Valider Livraison avec Bordereau Signé (Art. 11.5)</span>
                    </button>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
