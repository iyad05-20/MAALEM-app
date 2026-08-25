import React, { useState } from "react";
import { 
  Package, 
  Check, 
  X, 
  Camera, 
  Truck, 
  FileSignature, 
  Clock, 
  AlertCircle,
  Eye,
  Printer
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { id: "all", label: "Toutes les Commandes", count: orders.length },
          { id: "to_accept", label: "À Accepter (<72h)", count: orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length, highlight: true },
          { id: "in_prep", label: "En Fabrication (4 Photos)", count: orders.filter(o => o.status === "en_preparation").length },
          { id: "in_transport", label: "En Livraison / Sendit", count: orders.filter(o => o.status === "en_cours_de_transport").length },
          { id: "delivered", label: "Livrées / Terminées", count: orders.filter(o => ["livre", "terminee"].includes(o.status)).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="btn-outline"
            style={{
              fontSize: 12,
              padding: "8px 14px",
              borderColor: filter === tab.id ? "var(--primary-terracotta)" : "var(--border-color)",
              background: filter === tab.id ? "var(--primary-terracotta-light)" : "transparent",
              color: filter === tab.id ? "var(--primary-terracotta)" : "var(--text-secondary)",
              fontWeight: filter === tab.id ? 700 : 600,
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: tab.highlight ? "var(--primary-terracotta)" : "rgba(255,255,255,0.08)",
              color: "#FFF",
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 8,
              marginLeft: 4,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Aucune commande dans cette section.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.map((order) => {
            const isToAccept = ["acompte_verse", "payee_integralement"].includes(order.status);
            const isInPrep = order.status === "en_preparation";
            const isInTransport = order.status === "en_cours_de_transport";
            const isDelivered = ["livre", "terminee"].includes(order.status);
            const hasPrepPhotos = order.prepPhotos && order.prepPhotos.length >= 4;

            return (
              <div key={order.id} className="glass-panel" style={{ padding: 20 }}>
                {/* Top Row: Info & Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                        Commande #{order.id}
                      </h4>
                      <span className={`badge ${isToAccept ? "badge-urgent" : isInPrep ? "badge-warning" : isInTransport ? "badge-info" : "badge-success"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                        Type : <strong>{order.productType === "standard" ? "📦 Standard (Sendit)" : "🎨 Sur-Mesure / Commande (Direct)"}</strong>
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                      Reçue le : {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>Montant Total (Acompte ou Total)</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary-gold)", margin: 0 }}>
                      {order.totalPrice} MAD
                    </p>
                    <span style={{ fontSize: 10, color: "#34D399" }}>
                      Net Maâlem (~90%) : {Math.round(order.totalPrice * 0.90)} MAD
                    </span>
                  </div>
                </div>

                {/* Pipeline Progress Indicator */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ opacity: isToAccept ? 1 : 0.6 }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", margin: "0 0 2px" }}>1. Acceptation (Art. 6.1)</p>
                    <strong style={{ fontSize: 12, color: isToAccept ? "var(--primary-terracotta)" : "#34D399" }}>
                      {isToAccept ? "⏳ En attente (<72h)" : "✓ Acceptée"}
                    </strong>
                  </div>

                  <div style={{ opacity: isInPrep ? 1 : isToAccept ? 0.4 : 0.6 }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", margin: "0 0 2px" }}>2. Preuve Confection (Art. 8.1)</p>
                    <strong style={{ fontSize: 12, color: hasPrepPhotos ? "#34D399" : isInPrep ? "var(--primary-gold)" : "var(--text-muted)" }}>
                      {hasPrepPhotos ? `✓ ${order.prepPhotos?.length} Photos validées` : isInPrep ? "📸 4 photos requises" : "À venir"}
                    </strong>
                  </div>

                  <div style={{ opacity: isInTransport || isDelivered ? 1 : 0.4 }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", margin: "0 0 2px" }}>3. Expédition & Fin</p>
                    <strong style={{ fontSize: 12, color: isDelivered ? "#34D399" : isInTransport ? "#60A5FA" : "var(--text-muted)" }}>
                      {isDelivered ? "✓ Livré / Fonds libérables" : isInTransport ? "🚚 En transit" : "À expédier"}
                    </strong>
                  </div>
                </div>

                {/* Action Buttons Toolbar according to current status */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  {/* Step 1 : Accept or Refuse */}
                  {isToAccept && (
                    <>
                      <button
                        onClick={() => onOpenRefuseModal(order.id)}
                        className="btn-outline"
                        style={{ borderColor: "rgba(220,53,69,0.3)", color: "#F87171" }}
                      >
                        <X size={14} /> Refuser avec motif
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={actionLoading === order.id}
                        className="btn-terracotta"
                      >
                        <Check size={14} />
                        <span>{actionLoading === order.id ? "Validation..." : "Accepter & Lancer Confection"}</span>
                      </button>
                    </>
                  )}

                  {/* Step 2 : Upload Prep Photos */}
                  {isInPrep && (
                    <button
                      onClick={() => onOpenPrepPhotosModal(order.id)}
                      className="btn-gold"
                    >
                      <Camera size={14} />
                      <span>{hasPrepPhotos ? "Modifier les 4 Photos" : "Uploader les 4 Photos d'Atelier (Art. 8.1)"}</span>
                    </button>
                  )}

                  {/* Step 3 : Shipping Actions */}
                  {isInPrep && (
                    <>
                      {order.productType === "standard" ? (
                        <button
                          onClick={() => onOpenSenditModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-success"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <Truck size={14} />
                          <span>Générer Étiquette Sendit (Étape 1 & 2)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenDirectDeliveryModal(order)}
                          disabled={!hasPrepPhotos}
                          className="btn-gold"
                          style={{ opacity: !hasPrepPhotos ? 0.5 : 1 }}
                        >
                          <FileSignature size={14} />
                          <span>Déclarer Expédition Directe</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Direct Delivery Completion (Art. 11.5) */}
                  {isInTransport && order.productType !== "standard" && (
                    <button
                      onClick={() => onOpenDirectDeliveryModal(order)}
                      className="btn-success"
                    >
                      <FileSignature size={14} />
                      <span>Valider Livraison avec Bordereau Signé (Art. 11.5)</span>
                    </button>
                  )}

                  {/* Label Print if Sendit Code exists */}
                  {order.senditDeliveryCode && (
                    <a
                      href={`http://localhost:3001/api/artisan/orders/${order.id}/label?code=${order.senditDeliveryCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ fontSize: 11 }}
                    >
                      <Printer size={14} /> Re-télécharger BL Sendit PDF
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
