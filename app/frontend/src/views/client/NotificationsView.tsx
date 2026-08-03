import React from "react";
import { motion } from "framer-motion";
import { X, Bell, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import type { ClientOrder } from "../../types/clientPayment";

interface NotificationsViewProps {
  orders: ClientOrder[];
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export interface AppNotification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success";
  createdAt: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ orders, onClose, onSelectOrder }) => {
  // Generer les notifications dynamiques basées sur l'état réel des commandes
  const notifications: AppNotification[] = [];

  orders.forEach((o) => {
    // 1. Relance J+2 10h00 (Commandes PAYÉES en attente d'acceptation par le Maâlem)
    if (["acompte_verse", "payee_integralement"].includes(o.status)) {
      const createdDate = new Date(o.createdAt).getTime();
      const diffHours = (Date.now() - createdDate) / (1000 * 60 * 60);
      
      // La relance s'affiche UNIQUEMENT si le délai de réponse initial (ex: 48h / J+2) est dépassé
      if (diffHours >= 48) {
        notifications.push({
          id: `notif-j2-${o.id}`,
          orderId: o.id,
          title: "⏳ Relance Maâlem J+2 (10h00)",
          message: `La commande pour "${o.productTitle}" attend la validation du Maâlem. Vous pouvez annuler ou prolonger le délai.`,
          type: "warning",
          createdAt: o.createdAt,
        });
      }
    }

    // 2. Notifications de remboursement ou d'annulation
    if (o.status === "annulee") {
      notifications.push({
        id: `notif-cancel-${o.id}`,
        orderId: o.id,
        title: "✅ Remboursement effectué",
        message: `La commande "${o.productTitle}" a été annulée. Les fonds sont crédités sur votre Wallet.`,
        type: "success",
        createdAt: o.createdAt,
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,42,58,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 120,
      }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        style={{
          background: "#FCFBF9",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 32px",
          width: "100%",
          maxWidth: 640,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderTop: "1.5px solid rgba(196, 169, 106, 0.2)",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* Modal Handle & Header */}
        <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px" }} />
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} color="#8B6914" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", margin: 0 }}>
                Centre de Notifications
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                {notifications.length} alerte(s) importante(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color="var(--primary)" />
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 2, display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onSelectOrder(n.orderId);
                }}
                style={{
                  background: n.type === "warning" ? "rgba(212,175,55,0.08)" : "var(--surface)",
                  border: `1px solid ${n.type === "warning" ? "rgba(212,175,55,0.3)" : "var(--border)"}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {n.type === "warning" ? (
                    <Clock size={18} color="#8B6914" />
                  ) : (
                    <CheckCircle2 size={18} color="#2D6A4F" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: n.type === "warning" ? "#8B6914" : "var(--primary)", margin: "0 0 4px" }}>
                    {n.title}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text-secondary)" style={{ alignSelf: "center", opacity: 0.6 }} />
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Bell size={32} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: 10 }} />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--primary)", margin: "0 0 4px" }}>
                Aucune notification en attente
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Vous serez notifié des étapes de fabrication et de relance ici.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
