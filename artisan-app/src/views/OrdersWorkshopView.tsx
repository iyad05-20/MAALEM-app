import React, { useState } from "react";
import { 
  Package, 
  Check, 
  X, 
  Camera, 
  Truck, 
  FileSignature, 
  Clock, 
  Printer,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { ArtisanOrder } from "../types/artisanTypes";

interface OrdersWorkshopViewProps {
  orders: ArtisanOrder[];
  onAccept: (orderId: string) => Promise<void>;
  onOpenRefuseModal: (orderId: string) => void;
  onOpenPrepPhotosModal: (orderId: string) => void;
  onOpenSenditModal: (order: ArtisanOrder) => void;
  onOpenDirectDeliveryModal: (order: ArtisanOrder) => void;
}

export const OrdersWorkshopView: React.FC<OrdersWorkshopViewProps> = ({
  orders,
  onAccept,
  onOpenRefuseModal,
  onOpenPrepPhotosModal,
  onOpenSenditModal,
  onOpenDirectDeliveryModal,
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === "to_accept") return ["acompte_verse", "payee_integralement"].includes(o.status);
    if (filter === "in_prep") return o.status === "en_preparation";
    if (filter === "in_transport") return o.status === "en_cours_de_transport";
    if (filter === "delivered") return ["livre", "terminee"].includes(o.status);
    return true;
  });

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await onAccept(orderId);
    } catch (err: any) {
      alert(err.message || "Erreur acceptation.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Alert Card if pending accept orders */}
      {pendingCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(204, 119, 85, 0.12), rgba(26, 42, 58, 0.04))",
          border: "1px solid rgba(204, 119, 85, 0.3)",
          borderRadius: 18,
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "var(--accent-warm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Clock size={20} color="#FFFFFF" />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: "0 0 2px" }}>
              ⏳ {pendingCount} Commande(s) à accepter (&lt;72h)
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              Article 6.1 CGV : Validez pour lancer la confection et éviter la relance J+2.
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Filter Pills */}
      <div style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "none",
      }}>
        {[
          { id: "all", label: "Toutes", count: orders.length },
          { id: "to_accept", label: "À Valider (<72h)", count: pendingCount, highlight: true },
          { id: "in_prep", label: "Confection (4 Photos)", count: orders.filter(o => o.status === "en_preparation").length },
          { id: "in_transport", label: "En Livraison", count: orders.filter(o => o.status === "en_cours_de_transport").length },
          { id: "delivered", label: "Livrées", count: orders.filter(o => ["livre", "terminee"].includes(o.status)).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "7px 12px",
              borderRadius: 20,
              border: filter === tab.id ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: filter === tab.id ? "var(--primary)" : "var(--surface)",
              color: filter === tab.id ? "#FFFFFF" : "var(--text-secondary)",
              fontFamily: "var(--font-display)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: filter === tab.id ? "var(--shadow-sm)" : "none",
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: filter === tab.id ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
              color: filter === tab.id ? "#FFFFFF" : "var(--text-secondary)",
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 8,
              fontWeight: 800,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Package size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Aucune commande dans cet onglet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredOrders.map((order) => {
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
                      {order.productType === "standard" ? "📦 Standard (Sendit)" : "🎨 Sur-Mesure / Commande"}
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
                <div style={{ background: "rgba(26,42,58,0.03)", borderRadius: 12, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "var(--text-secondary)" }}>
                  <span>1. {isToAccept ? "⏳ À Accepter" : "✓ Acceptée"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>2. {hasPrepPhotos ? "✓ 4 Photos" : isInPrep ? "📸 Photos requises" : "Photos"}</span>
                  <ChevronRight size={12} opacity={0.4} />
                  <span>3. {isDelivered ? "✓ Livré" : isInTransport ? "🚚 Transit" : "Envoi"}</span>
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

                  {/* Step 2 : Upload Prep Photos */}
                  {isInPrep && (
                    <button
                      onClick={() => onOpenPrepPhotosModal(order.id)}
                      className="btn-mobile-outline"
                      style={{ width: "100%", justifyContent: "space-between", padding: "10px 14px", border: hasPrepPhotos ? "1px solid #2D6A4F" : "1.5px solid var(--accent-warm)" }}
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
