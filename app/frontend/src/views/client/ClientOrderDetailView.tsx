import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  XCircle,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Package,
  ChevronRight,
  Lock,
} from "lucide-react";
import type { ClientOrder } from "../../types/clientPayment";
import { clientWalletAPI } from "../../services/clientWalletApi";

interface ClientOrderDetailViewProps {
  orderId?: string;
  onBack?: () => void;
  onNavigateToWallet?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente_paiement: "En attente de paiement",
  paiement_initie: "Paiement initié",
  paiement_echoue: "Paiement échoué",
  acompte_verse: "Acompte versé (50%)",
  payee_integralement: "Payée intégralement",
  en_preparation: "En fabrication chez le Maâlem",
  en_cours_de_transport: "En cours de livraison Cathedis",
  livre: "Livrée à domicile",
  en_reclamation: "Litige ouvert (Escrow gelé)",
  retour_initie: "Retour produit initié",
  complete: "Terminée",
  annulee: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente_paiement: "#CC7755",
  paiement_echoue: "#DC3545",
  acompte_verse: "#4A7C59",
  payee_integralement: "#4A7C59",
  en_preparation: "#D4AF37",
  en_cours_de_transport: "#1A2A3A",
  livre: "#2D6A4F",
  en_reclamation: "#DC3545",
  retour_initie: "#CC7755",
  complete: "#2D6A4F",
  annulee: "#6B7280",
};

export const ClientOrderDetailView: React.FC<ClientOrderDetailViewProps> = ({
  orderId = "ord-std-001",
  onBack,
  onNavigateToWallet,
}) => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modales
  const [showCmiModal, setShowCmiModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Formulaires & Sécurité
  const [returnMode, setReturnMode] = useState<"cathedis" | "propres_moyens">("cathedis");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputePhotoUrl, setDisputePhotoUrl] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await clientWalletAPI.fetchOrders("client-me");
      setOrders(list);
      const current = list.find((o: ClientOrder) => o.id === orderId) || list[0] || null;
      setSelectedOrder(current);
    } catch {
      setMessage({ type: "error", text: "Impossible de charger les commandes." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [orderId]);

  if (loading && orders.length === 0) {
    return (
      <div className="app-view" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Chargement de vos commandes Vork…</p>
      </div>
    );
  }

  if (!selectedOrder || orders.length === 0) {
    return (
      <div className="app-view" style={{ paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
            <ArrowLeft size={18} color="var(--primary)" />
          </button>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", margin: 0 }}>Mes Commandes</h1>
        </div>

        <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)", padding: "32px 20px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <Package size={36} color="var(--text-secondary)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", margin: "0 0 6px 0" }}>Aucune commande active</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>Vous n'avez aucune commande en cours d'exécution.</p>
          <button onClick={loadData} style={{ padding: "12px 20px", borderRadius: 14, background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Recharger les données
          </button>
        </div>
      </div>
    );
  }

  const isCustom = selectedOrder.productType === "personnalise";
  const isHighAmount = selectedOrder.totalPrice >= 1000;
  const depositAmount = isHighAmount ? Math.round(selectedOrder.totalPrice * 0.5) : selectedOrder.totalPrice;

  let diffMinutes = 0;
  if (selectedOrder.acceptedAt) {
    diffMinutes = (Date.now() - new Date(selectedOrder.acceptedAt).getTime()) / (1000 * 60);
  }
  const isGracePeriodActive = !!(isCustom && selectedOrder.acceptedAt && diffMinutes <= 60);
  const isCustomLocked = !!(isCustom && selectedOrder.acceptedAt && diffMinutes > 60);

  let daysSinceDelivery = 0;
  if (selectedOrder.deliveredAt) {
    daysSinceDelivery = (Date.now() - new Date(selectedOrder.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  }
  const canReturn7d = !isCustom && selectedOrder.status === "livre" && daysSinceDelivery <= 7;
  const canDispute15d = (selectedOrder.status === "livre" || selectedOrder.status === "livre_reserve_bloquee") && daysSinceDelivery <= 15;
  const canCancel = !["en_cours_de_transport", "livre", "complete", "annulee"].includes(selectedOrder.status);

  // Actions sécurisées
  const handlePay = async () => {
    if (loading) return;
    setLoading(true); setMessage(null);
    try {
      const res = await clientWalletAPI.payOrder(selectedOrder.id);
      setShowCmiModal(false);
      setMessage({ type: "success", text: `Paiement CMI 3D Secure validé (${res.amount} MAD réglés).` });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (loading || isCustomLocked) return;
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;
    setLoading(true); setMessage(null);
    try {
      const res = await clientWalletAPI.cancelOrder(selectedOrder.id);
      setMessage({ type: "success", text: `Commande annulée. ${res.refundAmount} MAD crédités sur votre Wallet Vork.` });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleReturnSubmit = async () => {
    if (loading) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.requestReturn(selectedOrder.id, returnMode, 35);
      setShowReturnModal(false);
      setMessage({ type: "success", text: "Demande de retour initiée. L'artisan dispose de 48h à réception." });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleDisputeSubmit = async () => {
    const cleanReason = disputeReason.trim().slice(0, 500);
    if (!cleanReason) {
      alert("Veuillez décrire le vice caché constaté.");
      return;
    }
    if (loading) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.createDispute(selectedOrder.id, cleanReason, disputePhotoUrl ? [disputePhotoUrl.trim()] : []);
      setShowDisputeModal(false);
      setMessage({ type: "success", text: "Réclamation transmise à Vork. L'escrow est gelé pour arbitrage." });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const statusColor = STATUS_COLORS[selectedOrder.status] || "#6B7280";
  const statusLabel = STATUS_LABELS[selectedOrder.status] || selectedOrder.status;

  return (
    <div className="app-view" style={{ paddingTop: 0, position: "relative" }}>

      {/* ── Mobile Top Header ───────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <ArrowLeft size={18} color="var(--primary)" />
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", margin: 0 }}>Suivi Commande</h1>
        {onNavigateToWallet ? (
          <button onClick={onNavigateToWallet} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 12, padding: "8px 12px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "#8B6914", cursor: "pointer" }}>
            💳 Wallet
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      {/* ── Horizontal Scrollable Tabs ───────────────────────────── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none", marginBottom: 16 }}>
        {orders.map((o) => (
          <button key={o.id} onClick={() => setSelectedOrder(o)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: o.id === selectedOrder.id ? "1.5px solid var(--primary)" : "1px solid var(--border)", background: o.id === selectedOrder.id ? "var(--primary)" : "var(--surface)", color: o.id === selectedOrder.id ? "#fff" : "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {o.productTitle ? o.productTitle.slice(0, 18) + "…" : o.id}
          </button>
        ))}
      </div>

      {/* ── Feedback Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: "12px 14px", borderRadius: 14, marginBottom: 16, background: message.type === "success" ? "rgba(45,106,79,0.10)" : "rgba(220,53,69,0.10)", border: `1px solid ${message.type === "success" ? "rgba(45,106,79,0.30)" : "rgba(220,53,69,0.30)"}`, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, color: message.type === "success" ? "#2D6A4F" : "#DC3545" }}>
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span style={{ flex: 1 }}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Card (Mobile Native Bounds) ──────────────────── */}
      <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16, boxShadow: "var(--shadow-md)" }}>
        {selectedOrder.productImage && (
          <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
            <img src={selectedOrder.productImage} alt={selectedOrder.productTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,42,58,0.85) 0%, transparent 65%)" }} />
            <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
              <span style={{ display: "inline-block", background: isCustom ? "rgba(204,119,85,0.90)" : "rgba(156,175,136,0.90)", color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-body)", padding: "2px 8px", borderRadius: 12, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                {isCustom ? "Sur-Mesure IA" : "Standard"}
              </span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOrder.productTitle}</p>
            </div>
          </div>
        )}

        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Maâlem Créateur</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--primary)", margin: 0 }}>{selectedOrder.artisanName || selectedOrder.artisanRef}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Prix Total</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--primary)", margin: 0 }}>{selectedOrder.totalPrice} <span style={{ fontSize: 11, fontWeight: 500 }}>MAD</span></p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>{new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Action Buttons Section ────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", marginBottom: 10 }}>Actions disponibles</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* 1. [Payer en ligne via CMI] */}
          {(selectedOrder.status === "en_attente_paiement" || selectedOrder.status === "paiement_echoue") && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowCmiModal(true)} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "var(--shadow-md)", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CreditCard size={18} />
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, margin: 0 }}>Payer via CMI (3D Secure)</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.75, margin: 0 }}>{isHighAmount ? `Acompte 50% : ${depositAmount} MAD` : `Règlement total : ${depositAmount} MAD`}</p>
                </div>
              </div>
              <ChevronRight size={16} opacity={0.7} />
            </motion.button>
          )}

          {/* 2. [Annuler la commande] */}
          {canCancel && (
            <div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleCancel} disabled={loading || !!isCustomLocked} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: isCustomLocked ? "rgba(107,114,128,0.08)" : "rgba(220,53,69,0.08)", color: isCustomLocked ? "var(--text-secondary)" : "#C0392B", border: `1px solid ${isCustomLocked ? "var(--border)" : "rgba(220,53,69,0.25)"}`, cursor: isCustomLocked ? "not-allowed" : "pointer", width: "100%", opacity: isCustomLocked ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <XCircle size={18} />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, margin: 0 }}>Annuler la commande</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.75, margin: 0 }}>
                      {isCustomLocked ? "Ferme après 1h" : isGracePeriodActive ? `Gratuit · ${Math.round(60 - diffMinutes)}min` : "Remboursement 100% Wallet"}
                    </p>
                  </div>
                </div>
                {!isCustomLocked && <ChevronRight size={16} opacity={0.6} />}
              </motion.button>
              {isCustomLocked && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#C0392B", marginTop: 4, paddingLeft: 4 }}>
                  ⚠️ Produit sur-mesure : commande ferme après 1h.
                </p>
              )}
              {isGracePeriodActive && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#2D6A4F", marginTop: 4, paddingLeft: 4 }}>
                  ⏱️ Heure de grâce active : {Math.round(60 - diffMinutes)} min restantes pour annuler.
                </p>
              )}
            </div>
          )}

          {/* 3. [Demander un Retour 7j] */}
          {canReturn7d && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowReturnModal(true)} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: "rgba(26,42,58,0.05)", color: "var(--primary)", border: "1px solid var(--border)", cursor: "pointer", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RotateCcw size={18} />
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, margin: 0 }}>Demander un Retour (7j)</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.6, margin: 0 }}>Cathedis ou propres moyens</p>
                </div>
              </div>
              <ChevronRight size={16} opacity={0.5} />
            </motion.button>
          )}

          {/* 4. [Signaler un Vice Caché 15j] */}
          {canDispute15d && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowDisputeModal(true)} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: "rgba(212,175,55,0.08)", color: "#8B6914", border: "1px solid rgba(212,175,55,0.30)", cursor: "pointer", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={18} />
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, margin: 0 }}>Signaler un Vice Caché (15j)</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.7, margin: 0 }}>Gel de l'escrow · Arbitrage Vork</p>
                </div>
              </div>
              <ChevronRight size={16} opacity={0.6} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── MODALE MOBILE : Paiement CMI ─────────────────────────── */}
      <AnimatePresence>
        {showCmiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 6 }}>Paiement CMI 3D Secure</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Montant à régler : <strong style={{ color: "var(--primary)" }}>{depositAmount} MAD</strong> {isHighAmount ? "(Acompte 50%)" : "(Paiement 100%)"}.
              </p>
              <div style={{ background: "rgba(26,42,58,0.04)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>
                <Lock size={14} color="#4A7C59" /> Simulation sécurisée CMI Maroc 3D-Secure 2.0
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowCmiModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Annuler</button>
                <button onClick={handlePay} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>{loading ? "Traitement…" : `Payer ${depositAmount} MAD`}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Demande de Retour (7j) ───────────────── */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 6 }}>Rétractation (7 jours)</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Choisissez votre mode d'expédition pour le retour.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {(["cathedis", "propres_moyens"] as const).map((mode) => (
                  <label key={mode} onClick={() => setReturnMode(mode)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: returnMode === mode ? "2px solid var(--primary)" : "1px solid var(--border)", background: returnMode === mode ? "rgba(26,42,58,0.04)" : "var(--surface)", cursor: "pointer" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${returnMode === mode ? "var(--primary)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {returnMode === mode && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--primary)", margin: 0 }}>{mode === "cathedis" ? "Retour Cathedis (35 MAD)" : "Mes propres moyens"}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{mode === "cathedis" ? "Frais déduits du remboursement" : "Remboursement 100% sur Wallet"}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowReturnModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Fermer</button>
                <button onClick={handleReturnSubmit} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>{loading ? "Envoi…" : "Valider le retour"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Vice Caché (15j) ────────────────────── */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 4 }}>Signaler un Vice Caché</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>Décrivez le défaut. L'escrow sera gelé pour arbitrage.</p>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description du vice *</label>
                <textarea rows={3} maxLength={500} placeholder="Ex: Fissure interne, défaut de fabrication…" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--primary)", resize: "none", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>URL photo de preuve (optionnel)</label>
                <input type="text" placeholder="https://…" value={disputePhotoUrl} onChange={(e) => setDisputePhotoUrl(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--primary)", outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowDisputeModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Annuler</button>
                <button onClick={handleDisputeSubmit} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "#CC7755", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>{loading ? "Envoi…" : "Ouvrir la réclamation"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
