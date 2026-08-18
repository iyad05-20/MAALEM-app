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
  X,
  Bell,
} from "lucide-react";
import type { ClientOrder } from "../../types/clientPayment";
import { clientWalletAPI } from "../../services/clientWalletApi";

interface ClientOrderDetailViewProps {
  orderId?: string;
  userId?: string;
  onBack?: () => void;
  onNavigateToWallet?: () => void;
  onDetailToggle?: (isOpen: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente_paiement: "En attente de paiement",
  paiement_initie: "Paiement initié",
  paiement_echoue: "Paiement échoué",
  acompte_verse: "Acompte versé (50%)",
  payee_integralement: "Payée intégralement",
  en_preparation: "En fabrication chez le Maâlem",
  en_cours_de_transport: "En cours de livraison Sendit",
  livre: "Livrée à domicile",
  auto_valide: "Réception validée automatiquement",
  en_reclamation: "Litige ouvert (Escrow gelé)",
  litige_post_liberation: "Litige post-libération (Remb. Vendeur)",
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
  auto_valide: "#4A7C59",
  en_reclamation: "#DC3545",
  litige_post_liberation: "#CC7755",
  retour_initie: "#CC7755",
  complete: "#2D6A4F",
  annulee: "#6B7280",
};

const getStatusSteps = (status: string) => {
  const steps = [
    { label: "Paiement", active: false, done: false },
    { label: "Atelier", active: false, done: false },
    { label: "Transit", active: false, done: false },
    { label: "Remis", active: false, done: false },
  ];

  if (status === "en_attente_paiement" || status === "paiement_echoue" || status === "paiement_initie") {
    steps[0].active = true;
  } else if (status === "acompte_verse" || status === "payee_integralement") {
    steps[0].done = true;
    steps[1].active = true;
  } else if (status === "en_preparation") {
    steps[0].done = true;
    steps[1].active = true;
  } else if (status === "en_cours_de_transport") {
    steps[0].done = true;
    steps[1].done = true;
    steps[2].active = true;
  } else if (status === "livre" || status === "complete") {
    steps[0].done = true;
    steps[1].done = true;
    steps[2].done = true;
    steps[3].done = true;
  } else if (status === "en_reclamation" || status === "retour_initie") {
    steps[0].done = true;
    steps[1].done = true;
    steps[2].done = true;
    steps[3].active = true;
  }

  return steps;
};

export const ClientOrderDetailView: React.FC<ClientOrderDetailViewProps> = ({
  orderId,
  userId,
  onBack,
  onNavigateToWallet,
  onDetailToggle,
}) => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modales
  const [showCmiModal, setShowCmiModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [showCgvTextModal, setShowCgvTextModal] = useState(false);

  // Formulaires & Sécurité
  const [returnMode, setReturnMode] = useState<"sendit" | "propres_moyens">("propres_moyens");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [extendHours, setExtendHours] = useState<24 | 48 | 72>(24);
  const [disputeReasonCategory, setDisputeReasonCategory] = useState("Défaut de structure / assemblage (fissure interne, collage défaillant)");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputePhotoUrl, setDisputePhotoUrl] = useState("");

  // Sendit Shipping and Webhook simulation states
  const [paymentChoice, setPaymentChoice] = useState<"deposit" | "total">("deposit");
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [pickupDistrictId, setPickupDistrictId] = useState<number>(1);
  const [deliveryDistrictId, setDeliveryDistrictId] = useState<number>(2);
  const artisanNameInput = "Maâlem Abdelkader";
  const artisanPhoneInput = "0612345678";
  const [artisanAddressInput, setArtisanAddressInput] = useState<string>("Ahl Fes, N° 12, Fès");
  const [webhookStatus, setWebhookStatus] = useState<string>("DELIVERED");
  const [webhookProofImage, setWebhookProofImage] = useState<string>("https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop");

  const VICE_CACHE_REASONS = [
    "Défaut de structure / assemblage (fissure interne, collage défaillant)",
    "Défaut de matière ou de matériau (cuir/bois non traité, vice de fabrication)",
    "Usure anormale ou dégradation précoce après utilisation normale",
    "Non-conformité grave non apparente lors de la livraison initiale",
    "Autre vice caché grave",
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await clientWalletAPI.fetchOrders(userId || "client-me");
      setOrders(list);
      if (orderId) {
        const current = list.find((o: ClientOrder) => o.id === orderId) || null;
        setSelectedOrder(current);
        if (current && ["complete", "annulee"].includes(current.status)) {
          setActiveTab("history");
        } else {
          setActiveTab("active");
        }
      } else {
        setSelectedOrder(null);
      }
    } catch {
      setMessage({ type: "error", text: "Impossible de charger les commandes." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [orderId]);

  useEffect(() => {
    clientWalletAPI.getDistricts().then((res) => {
      if (res && res.success && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
    });
  }, []);

  useEffect(() => {
    if (onDetailToggle) {
      onDetailToggle(selectedOrder !== null);
    }
  }, [selectedOrder, onDetailToggle]);

  useEffect(() => {
    return () => {
      if (onDetailToggle) {
        onDetailToggle(false);
      }
    };
  }, [onDetailToggle]);

  if (loading && orders.length === 0) {
    return (
      <div className="app-view" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Chargement de vos commandes Vork…</p>
      </div>
    );
  }

  if (orders.length === 0) {
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

  const isCustom = selectedOrder ? selectedOrder.productType === "personnalise" : false;
  const isHighAmount = selectedOrder ? selectedOrder.totalPrice >= 1000 : false;
  const depositAmount = selectedOrder ? (isHighAmount ? Math.round(selectedOrder.totalPrice * 0.5) : selectedOrder.totalPrice) : 0;

  let diffMinutes = 0;
  if (selectedOrder && selectedOrder.acceptedAt) {
    diffMinutes = (Date.now() - new Date(selectedOrder.acceptedAt).getTime()) / (1000 * 60);
  }
  const isGracePeriodActive = selectedOrder ? !!(isCustom && selectedOrder.acceptedAt && diffMinutes <= 60) : false;
  const isCustomLocked = selectedOrder ? !!(isCustom && selectedOrder.acceptedAt && diffMinutes > 60) : false;

  let daysSinceDelivery = 0;
  let hoursSinceDelivery = 0;
  if (selectedOrder && selectedOrder.deliveredAt) {
    hoursSinceDelivery = (Date.now() - new Date(selectedOrder.deliveredAt).getTime()) / (1000 * 60 * 60);
    daysSinceDelivery = hoursSinceDelivery / 24;
  }

  // Tâche 5 : Suivi retour (borné à 10j + 7j extra - Art. 10.2)
  // let daysReturnInitiated = 0;
  // if (selectedOrder?.returnInitiatedAt) {
  //   daysReturnInitiated = (Date.now() - new Date(selectedOrder.returnInitiatedAt).getTime()) / (1000 * 60 * 60 * 24);
  // }
  // const returnDeadlineDays = 10;
  // const returnDaysLeft = Math.max(0, returnDeadlineDays - daysReturnInitiated);

  // Tâche 2 : Relance J+2 (heures 34h→48h = 10h00 à minuit J+2 - Art. 5.1 & 5.2)
  let hoursSinceCreation = 0;
  if (selectedOrder?.createdAt) {
    hoursSinceCreation = (Date.now() - new Date(selectedOrder.createdAt).getTime()) / (1000 * 60 * 60);
  }
  // Commence à ~34h (J+2 à 10h00) et se termine à 48h exactement (minuit J+2)
  const showJ2Relance = ["acompte_verse", "payee_integralement"].includes(selectedOrder?.status || "")
    && hoursSinceCreation >= 34
    && hoursSinceCreation < 48;

  // Tâche 3 : Bannière validation réception 24h (Art. 4.3 C)
  const showValidateDeliveryBanner = selectedOrder?.status === "livre" && hoursSinceDelivery < 24;
  const showValidateReminder18h = showValidateDeliveryBanner && hoursSinceDelivery >= 18;
  const hoursLeftToValidate = Math.max(0, 24 - hoursSinceDelivery);

  // Tâche 4 : Déclaration non-réception 24h après validation automatique (Art. 4.3 D)
  let hoursAfterAutoValidation = 0;
  if (selectedOrder?.autoValidatedAt) {
    hoursAfterAutoValidation = (Date.now() - new Date(selectedOrder.autoValidatedAt).getTime()) / (1000 * 60 * 60);
  }
  const canDeclareNotReceived = selectedOrder?.status === "auto_valide" && hoursAfterAutoValidation < 24;

  const canReturn7d = selectedOrder ? (!isCustom && ["livre", "auto_valide"].includes(selectedOrder.status) && daysSinceDelivery <= 7) : false;
  // Tâche 1 : Vice caché étendu à 90 jours (Art. 11.2)
  const canDispute90d = selectedOrder ? (
    ["livre", "auto_valide", "complete"].includes(selectedOrder.status) && daysSinceDelivery <= 90
  ) : false;
  const isDisputePostEscrow = selectedOrder ? (canDispute90d && daysSinceDelivery > 15) : false;
  const canCancel = selectedOrder ? (!["en_cours_de_transport", "livre", "auto_valide", "complete", "annulee"].includes(selectedOrder.status)) : false;

  // Actions sécurisées
  const handlePay = async () => {
    if (!selectedOrder || loading) return;
    setLoading(true); setMessage(null);
    try {
      const res = await clientWalletAPI.payOrder(selectedOrder.id, paymentChoice);
      setShowCmiModal(false);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setMessage({ type: "success", text: `Paiement CMI 3D Secure validé (${res.amount} MAD réglés).` });
        await loadData();
      }
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!selectedOrder || loading || isCustomLocked) return;
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
    if (!selectedOrder || loading) return;
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

  const handleCancelReturn = async () => {
    if (!selectedOrder || loading) return;
    if (!window.confirm("Voulez-vous annuler votre demande de retour et conserver l'article ?")) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.cancelReturnRequest(selectedOrder.id);
      setMessage({ type: "success", text: "Demande de retour annulée (Art. 9.5 bis). La commande reprend son cours." });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleExtendSubmit = async () => {
    if (!selectedOrder || loading) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.extendSellerDeadline(selectedOrder.id, extendHours);
      setShowExtendModal(false);
      setMessage({ type: "success", text: `Délai accordé au Maâlem prolongé de ${extendHours}h avec succès.` });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleDisputeSubmit = async () => {
    if (!selectedOrder) return;
    const fullReason = `[${disputeReasonCategory}] ${disputeReason.trim()}`.slice(0, 500);
    if (loading) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.createDispute(selectedOrder.id, fullReason, disputePhotoUrl ? [disputePhotoUrl.trim()] : []);
      setShowDisputeModal(false);
      const msg = isDisputePostEscrow
        ? "Réclamation transmise (Art. 11.6). Les fonds étant déjà libérés, le Vendeur dispose de 15 jours pour vous rembourser directement."
        : "Réclamation transmise à Vork. L'escrow est gelé pour arbitrage.";
      setMessage({ type: "success", text: msg });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  // Tâche 3 : Validation manuelle de la réception (Art. 4.3 C)
  const handleValidateDelivery = async () => {
    if (!selectedOrder || loading) return;
    if (!window.confirm("Confirmez-vous la bonne réception de votre commande ?")) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.validateDelivery(selectedOrder.id);
      setMessage({ type: "success", text: "Réception confirmée. Le séquestre sera libéré à l'artisan dans 15 jours." });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  // Tâche 4 : Déclaration de non-réception 24h post-auto-validation (Art. 4.3 D)
  const handleDeclareNotReceived = async () => {
    if (!selectedOrder || loading) return;
    if (!window.confirm("Confirmer que vous n'avez pas reçu ce colis ? Cette déclaration gèle temporairement les fonds en attente d'enquête Admin.")) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.declareNotReceived(selectedOrder.id);
      setMessage({ type: "success", text: "Déclaration de non-réception transmise à Vork. L'escrow est gelé pour enquête." });
      await loadData();
    } catch (e: unknown) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally { setLoading(false); }
  };

  const handleSimulateAccept = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await clientWalletAPI.acceptOrder(selectedOrder.id);
      if (res.success) {
        setMessage({ type: "success", text: "Commande acceptée par le Maâlem ! Entrée en fabrication." });
        await loadData();
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erreur d'acceptation." });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateShipping = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await clientWalletAPI.shipOrder(selectedOrder.id, {
        pickup_district_id: pickupDistrictId,
        district_id: deliveryDistrictId,
        name: artisanNameInput,
        phone: artisanPhoneInput,
        address: artisanAddressInput,
      });
      if (res.success) {
        setMessage({ type: "success", text: `Colis créé avec succès ! Code Sendit : ${res.senditDeliveryCode}` });
        await loadData();
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erreur lors de la création du colis." });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLabel = async () => {
    if (!selectedOrder || !selectedOrder.senditDeliveryCode) return;
    setLoading(true);
    try {
      const res = await clientWalletAPI.getOrderLabel(selectedOrder.id, selectedOrder.senditDeliveryCode);
      if (res && res.labelUrl) {
        window.open(res.labelUrl, "_blank");
        setMessage({ type: "success", text: "Étiquette PDF ouverte dans un nouvel onglet." });
      } else {
        setMessage({ type: "error", text: "Impossible de récupérer l'étiquette." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erreur étiquette." });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!selectedOrder || !selectedOrder.senditDeliveryCode) return;
    setLoading(true);
    try {
      const payload = {
        event: "delivery.status.update",
        code: selectedOrder.senditDeliveryCode,
        oldStatus: "TRANSIT",
        newStatus: webhookStatus,
        proofImage: webhookStatus === "DELIVERED" ? webhookProofImage : undefined,
        counterUnreachable: webhookStatus === "UNREACHABLE" ? (selectedOrder.counterUnreachable || 0) + 1 : undefined,
        lastActionAt: new Date().toISOString()
      };
      const res = await clientWalletAPI.simulateWebhook(payload);
      if (res.success) {
        setMessage({ type: "success", text: `Événement ${webhookStatus} simulé avec succès !` });
        await loadData();
      } else {
        setMessage({ type: "error", text: `Erreur webhook : ${res.error || "Inconnu"}` });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erreur lors de l'envoi du webhook." });
    } finally {
      setLoading(false);
    }
  };

  const visibleOrders = activeTab === "active"
    ? orders.filter(o => !["complete", "annulee"].includes(o.status))
    : orders.filter(o => ["complete", "annulee"].includes(o.status));

  const statusColor = selectedOrder ? (STATUS_COLORS[selectedOrder.status] || "#6B7280") : "#6B7280";
  const statusLabel = selectedOrder ? (STATUS_LABELS[selectedOrder.status] || selectedOrder.status) : "";

  return (
    <div className="app-view" style={{ paddingTop: 0, position: "relative" }}>

      {/* ── Mobile Top Header (Always list header) ────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <ArrowLeft size={18} color="var(--primary)" />
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", margin: 0 }}>
          Mes Commandes
        </h1>
        {onNavigateToWallet ? (
          <button onClick={onNavigateToWallet} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 12, padding: "8px 12px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "#8B6914", cursor: "pointer" }}>
            💳 Wallet
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      {/* ── Feedback Banner (Only shown on list page) ─────────────── */}
      <AnimatePresence>
        {message && !selectedOrder && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: "12px 14px", borderRadius: 14, marginBottom: 16, background: message.type === "success" ? "rgba(45,106,79,0.10)" : "rgba(220,53,69,0.10)", border: `1px solid ${message.type === "success" ? "rgba(45,106,79,0.30)" : "rgba(220,53,69,0.30)"}`, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, color: message.type === "success" ? "#2D6A4F" : "#DC3545" }}>
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span style={{ flex: 1 }}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Tab Switcher */}
      <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: 14, padding: 4, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 10,
            border: "none",
            background: activeTab === "active" ? "#FFFFFF" : "transparent",
            color: activeTab === "active" ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            boxShadow: activeTab === "active" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          En cours ({orders.filter(o => !["complete", "annulee"].includes(o.status)).length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 10,
            border: "none",
            background: activeTab === "history" ? "#FFFFFF" : "transparent",
            color: activeTab === "history" ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            boxShadow: activeTab === "history" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          Historique ({orders.filter(o => ["complete", "annulee"].includes(o.status)).length})
        </button>
      </div>

      {/* Vertical scroll list of orders (Premium Minimalist Cards) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "calc(100vh - 200px)", paddingBottom: 40, scrollbarWidth: "none" }}>
        {visibleOrders.length > 0 ? (
          visibleOrders.map((o) => {
            const getSimpleStatus = (status: string) => {
              switch (status) {
                case "en_attente_paiement":
                case "paiement_initie":
                case "paiement_echoue":
                  return { dotColor: "#CC7755", label: "Paiement" };
                case "acompte_verse":
                case "payee_integralement":
                case "en_preparation":
                  return { dotColor: "#D4AF37", label: "Fabrication" };
                case "en_cours_de_transport":
                  return { dotColor: "#1A2A3A", label: "Livraison" };
                case "livre":
                case "complete":
                  return { dotColor: "#2D6A4F", label: "Livrée" };
                case "en_reclamation":
                case "retour_initie":
                  return { dotColor: "#DC3545", label: "Litige" };
                case "annulee":
                default:
                  return { dotColor: "#6B7280", label: "Annulée" };
              }
            };
            const statInfo = getSimpleStatus(o.status);

            return (
              <div 
                key={o.id} 
                onClick={() => setSelectedOrder(o)}
                style={{
                  display: 'flex',
                  gap: 16,
                  background: '#FFFEFC',
                  border: '1px solid rgba(196, 169, 106, 0.12)',
                  borderRadius: 16,
                  padding: 16,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 42, 58, 0.02)',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                {/* Product image (larger, premium) */}
                <img 
                  src={o.productImage || 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&q=80'} 
                  alt={o.productTitle} 
                  style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(26, 42, 58, 0.05)' }}
                />
                
                {/* Middle details: title and simplified status */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.productTitle}
                  </p>
                  
                  {/* Status text with simple colored dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statInfo.dotColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {statInfo.label}
                    </span>
                  </div>
                </div>

                {/* Right side: price and clickable arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', margin: 0 }}>
                    {o.totalPrice} MAD
                  </p>
                  <ChevronRight size={16} color="var(--text-secondary)" style={{ opacity: 0.6 }} />
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px dashed var(--border)", padding: "48px 20px", textAlign: "center", marginTop: 20 }}>
            <Package size={36} color="var(--text-secondary)" style={{ marginBottom: 12, opacity: 0.7 }} />
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--primary)", margin: "0 0 6px 0" }}>Aucune commande</h4>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              {activeTab === "active" ? "Vous n'avez pas de commande en cours de traitement." : "Votre historique de commande est vide."}
            </p>
          </div>
        )}
      </div>

      {/* ── PREMIUM DETAILED OVERLAY (slides up from bottom when selectedOrder !== null) ── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedOrder(null)}
            style={{ 
              position: "fixed", 
              inset: 0, 
              background: "rgba(26,42,58,0.45)", 
              backdropFilter: "blur(6px)", 
              WebkitBackdropFilter: "blur(6px)", 
              display: "flex", 
              alignItems: "flex-end", 
              justifyContent: "center", 
              zIndex: 80 
            }}
          >
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: "#FCFBF9", 
                borderRadius: "32px 32px 0 0", 
                padding: "20px 20px 40px", 
                width: "100%", 
                maxWidth: 640,
                height: "92vh", 
                boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
                borderTop: "1.5px solid rgba(196, 169, 106, 0.2)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Grabber Handle */}
              <div style={{ width: 40, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px", flexShrink: 0 }} />

              {/* Overlay Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  style={{ 
                    background: "var(--surface)", 
                    border: "1px solid var(--border)", 
                    borderRadius: 12, 
                    width: 36, 
                    height: 36, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer" 
                  }}
                >
                  <ArrowLeft size={16} color="var(--primary)" />
                </button>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--primary)", margin: 0 }}>
                  Suivi de Création
                </h2>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  style={{ 
                    background: "var(--surface)", 
                    border: "1px solid var(--border)", 
                    borderRadius: 12, 
                    width: 36, 
                    height: 36, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer" 
                  }}
                >
                  <X size={16} color="var(--primary)" />
                </button>
              </div>

              {/* Scrollable Overlay Content */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, scrollbarWidth: "none" }}>
                
                {/* Stepper Progress Bar */}
                <div style={{ background: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)", padding: "20px 16px", marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: "0 0 16px 0" }}>État de fabrication & livraison</p>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", padding: "0 8px" }}>
                    {/* Progress bar background line */}
                    <div style={{ position: "absolute", top: 12, left: 24, right: 24, height: 3, background: "#E5E7EB", zIndex: 0 }} />
                    
                    {/* Active green progress line */}
                    <div 
                      style={{ 
                        position: "absolute", 
                        top: 12, 
                        left: 24, 
                        width: `${
                          selectedOrder.status === "en_attente_paiement" || selectedOrder.status === "paiement_echoue" || selectedOrder.status === "paiement_initie" ? "0%" :
                          selectedOrder.status === "acompte_verse" || selectedOrder.status === "payee_integralement" || selectedOrder.status === "en_preparation" ? "33%" :
                          selectedOrder.status === "en_cours_de_transport" ? "66%" : "100%"
                        }`,
                        height: 3, 
                        background: "#4A7C59", 
                        zIndex: 0,
                        transition: "width 0.4s ease"
                      }} 
                    />

                    {getStatusSteps(selectedOrder.status).map((step, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative", width: 60 }}>
                        <div 
                          style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: "50%", 
                            background: step.done ? "#4A7C59" : step.active ? "#D4AF37" : "#FFFFFF", 
                            border: `2px solid ${step.done ? "#4A7C59" : step.active ? "#D4AF37" : "#CBD5E1"}`, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: step.done ? "#FFFFFF" : step.active ? "#FFFFFF" : "#64748B",
                            boxShadow: step.active ? "0 0 0 4px rgba(212,175,55,0.18)" : "none",
                            transition: "all 0.3s ease"
                          }}
                        >
                          {step.done ? "✓" : idx + 1}
                        </div>
                        <span 
                          style={{ 
                            marginTop: 6, 
                            fontFamily: "var(--font-body)", 
                            fontSize: 10, 
                            fontWeight: step.active || step.done ? 600 : 500, 
                            color: step.active ? "#8B6914" : step.done ? "#2D6A4F" : "#64748B",
                            textAlign: "center"
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Card */}
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

                {/* Overlay Inner Feedback Banner */}
                {message && (
                  <div style={{ padding: "12px 14px", borderRadius: 14, marginBottom: 16, background: message.type === "success" ? "rgba(45,106,79,0.10)" : "rgba(220,53,69,0.10)", border: `1px solid ${message.type === "success" ? "rgba(45,106,79,0.30)" : "rgba(220,53,69,0.30)"}`, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, color: message.type === "success" ? "#2D6A4F" : "#DC3545" }}>
                    {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <span style={{ flex: 1 }}>{message.text}</span>
                  </div>
                )}

                {/* Action Buttons Section */}
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", marginBottom: 10 }}>Actions disponibles</p>

                  {/* ── Tâche 2 : Relance Maâlem J+2 (10h00 → Minuit - Art. 5.1 & 5.2) ── */}
                  {showJ2Relance && (
                    <div style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Bell size={16} color="#8B6914" />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#8B6914" }}>
                          Relance Maâlem J+2 — Fenêtre 10h00 à Minuit
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: "0 0 10px" }}>
                        Le Maâlem n'a pas encore validé votre commande payée. Sans action de votre part avant <strong>minuit (00h00)</strong>, la commande sera automatiquement annulée et remboursée à 100%.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleCancel} disabled={loading} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid #C0392B", background: "rgba(192,57,43,0.06)", color: "#C0392B", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                          Annuler maintenant
                        </button>
                        <button onClick={() => setShowExtendModal(true)} disabled={loading} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                          Prolonger le Maâlem
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Tâche 3 : Bannière Validation Réception 24h (Art. 4.3 C) ── */}
                  {showValidateDeliveryBanner && (
                    <div style={{ background: showValidateReminder18h ? "rgba(220,53,69,0.08)" : "rgba(45,106,79,0.08)", border: `1px solid ${showValidateReminder18h ? "rgba(220,53,69,0.3)" : "rgba(45,106,79,0.3)"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <CheckCircle size={16} color={showValidateReminder18h ? "#DC3545" : "#2D6A4F"} />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: showValidateReminder18h ? "#DC3545" : "#2D6A4F" }}>
                          {showValidateReminder18h ? "⚠️ Validation automatique imminente" : "✅ Confirmez la réception"}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: "0 0 10px" }}>
                        {showValidateReminder18h
                          ? `Il vous reste environ ${Math.ceil(hoursLeftToValidate)}h pour valider. Sans action, la réception sera validée automatiquement à minuit (Art. 4.3 C).`
                          : `Votre colis a été livré. Vous disposez de 24h pour confirmer la réception ou signaler un défaut apparent. (Encore ~${Math.ceil(hoursLeftToValidate)}h)`
                        }
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowDisputeModal(true)} disabled={loading} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.08)", color: "#8B6914", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                          Signaler un défaut
                        </button>
                        <button onClick={handleValidateDelivery} disabled={loading} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#2D6A4F", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                          {loading ? "…" : "Confirmer la réception"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Tâche 4 : Déclaration Non-Réception 24h post-auto (Art. 4.3 D) ── */}
                  {canDeclareNotReceived && (
                    <div style={{ background: "rgba(220,53,69,0.07)", border: "1px solid rgba(220,53,69,0.25)", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <AlertTriangle size={16} color="#DC3545" />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#DC3545" }}>
                          Colis non reçu ? Déclarez-le maintenant
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: "0 0 10px" }}>
                        La réception a été validée automatiquement, mais vous n'avez pas reçu le colis ? Vous disposez de <strong>24h</strong> pour le déclarer (Art. 4.3 D). Encore ~{Math.ceil(24 - hoursAfterAutoValidation)}h.
                      </p>
                      <button onClick={handleDeclareNotReceived} disabled={loading} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#DC3545", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                        {loading ? "Envoi…" : "Déclarer colis non reçu (Art. 4.3 D)"}
                      </button>
                    </div>
                  )}

                  {/* Annulation de demande de retour (Art 9.5 bis) */}
                  {selectedOrder.status === "retour_initie" && (
                    <div style={{ marginBottom: 12 }}>
                      <motion.button whileTap={{ scale: 0.98 }} onClick={handleCancelReturn} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: "rgba(45,106,79,0.08)", color: "#2D6A4F", border: "1px solid rgba(45,106,79,0.25)", cursor: "pointer", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <RotateCcw size={18} />
                          <div style={{ textAlign: "left" }}>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, margin: 0 }}>Annuler ma demande de retour (Art. 9.5 bis)</p>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.75, margin: 0 }}>Conserver l'article et clôturer le retour</p>
                          </div>
                        </div>
                        <ChevronRight size={16} opacity={0.6} />
                      </motion.button>
                    </div>
                  )}

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
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.6, margin: 0 }}>Sendit ou propres moyens</p>
                          </div>
                        </div>
                        <ChevronRight size={16} opacity={0.5} />
                      </motion.button>
                    )}

                    {/* ── Tâche 1 : Signaler un Vice Caché (3 mois / 90j - Art. 11.2) ── */}
                    {canDispute90d && (
                      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowDisputeModal(true)} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, background: isDisputePostEscrow ? "rgba(220,53,69,0.07)" : "rgba(212,175,55,0.08)", color: isDisputePostEscrow ? "#C0392B" : "#8B6914", border: `1px solid ${isDisputePostEscrow ? "rgba(220,53,69,0.25)" : "rgba(212,175,55,0.30)"}`, cursor: "pointer", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ShieldAlert size={18} />
                          <div style={{ textAlign: "left" }}>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, margin: 0 }}>Signaler un Vice Caché (3 mois)</p>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.7, margin: 0 }}>
                              {isDisputePostEscrow ? "⚠️ Fonds libérés — Remboursement direct Vendeur (Art. 11.6)" : "Gel de l'escrow · Arbitrage Vork"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} opacity={0.6} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* ── SECTION D'INTEGRATION & SIMULATION SENDIT ── */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    📦 Outils d'Intégration & Simulation Sendit
                  </h4>

                  {/* 1. Simulation Acceptation par le Maâlem */}
                  {["acompte_verse", "payee_integralement"].includes(selectedOrder.status) && (
                    <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: 12, marginBottom: 12 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, margin: "0 0 6px", color: "var(--primary)" }}>Simuler l'acceptation par le Maâlem</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: "0 0 8px" }}>
                        Une fois payée, la commande doit être acceptée par l'artisan pour passer en fabrication.
                      </p>
                      <button onClick={handleSimulateAccept} disabled={loading} style={{ width: "100%", padding: 8, borderRadius: 8, border: "none", background: "#8B6914", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                        {loading ? "Acceptation en cours..." : "Simuler l'acceptation et lancer la fabrication"}
                      </button>
                    </div>
                  )}

                  {/* 2. Simulation Expédition (Artisan) */}
                  {selectedOrder.status === "en_preparation" && (
                    <div style={{ background: "rgba(26,42,58,0.03)", border: "1px solid var(--border)", borderRadius: 14, padding: 12, marginBottom: 12 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, margin: "0 0 8px", color: "var(--primary)" }}>Simuler l'expédition par le Maâlem</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Ville Ramassage</label>
                            <select value={pickupDistrictId} onChange={(e) => setPickupDistrictId(Number(e.target.value))} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, background: "var(--surface)" }}>
                              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Ville Livraison</label>
                            <select value={deliveryDistrictId} onChange={(e) => setDeliveryDistrictId(Number(e.target.value))} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, background: "var(--surface)" }}>
                              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Adresse de Livraison</label>
                          <input type="text" value={artisanAddressInput} onChange={(e) => setArtisanAddressInput(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, background: "var(--surface)" }} />
                        </div>
                        <button onClick={handleSimulateShipping} disabled={loading} style={{ width: "100%", padding: 8, borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer", marginTop: 4 }}>
                          {loading ? "Création du colis..." : "Simuler la création du colis chez Sendit"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Étiquette Sendit */}
                  {selectedOrder.senditDeliveryCode && (
                    <div style={{ background: "rgba(45,106,79,0.03)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: 14, padding: 12, marginBottom: 12 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, margin: "0 0 2px", color: "var(--primary)" }}>Code de suivi Sendit : <code style={{ color: "#2D6A4F" }}>{selectedOrder.senditDeliveryCode}</code></p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: "0 0 8px" }}>Le colis a été informatiquement enregistré.</p>
                      <button onClick={handleDownloadLabel} disabled={loading} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #2D6A4F", background: "rgba(45,106,79,0.05)", color: "#2D6A4F", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                        Imprimer l'étiquette Sendit (PDF)
                      </button>
                    </div>
                  )}

                  {/* 3. Simulation Webhook Sendit */}
                  {selectedOrder.status === "en_cours_de_transport" && selectedOrder.senditDeliveryCode && (
                    <div style={{ background: "rgba(220,53,69,0.03)", border: "1px solid rgba(220,53,69,0.15)", borderRadius: 14, padding: 12 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, margin: "0 0 8px", color: "var(--primary)" }}>Simuler Notification Webhook (Sendit)</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Nouvel état du colis</label>
                          <select value={webhookStatus} onChange={(e) => setWebhookStatus(e.target.value)} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, background: "var(--surface)" }}>
                            <option value="DELIVERED">DELIVERED (Livré)</option>
                            <option value="UNREACHABLE">UNREACHABLE (Client injoignable)</option>
                            <option value="REJECTED">REJECTED (Colis refusé)</option>
                          </select>
                        </div>
                        {webhookStatus === "DELIVERED" && (
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>URL de preuve de livraison</label>
                            <input type="text" value={webhookProofImage} onChange={(e) => setWebhookProofImage(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, background: "var(--surface)" }} />
                          </div>
                        )}
                        <button onClick={handleSimulateWebhook} disabled={loading} style={{ width: "100%", padding: 8, borderRadius: 8, border: "none", background: "#DC3545", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, cursor: "pointer", marginTop: 4 }}>
                          {loading ? "Envoi du Webhook..." : "Déclencher l'événement Webhook"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Paiement CMI ─────────────────────────── */}
      <AnimatePresence>
        {showCmiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "#FCFBF9", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 640, borderTop: "1.5px solid rgba(196, 169, 106, 0.2)", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 6 }}>Paiement CMI 3D Secure</h3>
              {isHighAmount ? (
                <div style={{ marginBottom: 16 }}>
                  {/* Note explaining the payment structure */}
                  <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    ℹ️ <strong>Règle de commande supérieure à 1 000 MAD :</strong> Vous pouvez choisir de ne régler qu'un acompte de 50% aujourd'hui. Le solde restant (50%) sera perçu en espèces par le transporteur (Sendit) lors de la livraison à votre domicile. Voir les détails dans les{" "}
                    <span 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCgvTextModal(true); }}
                      style={{ textDecoration: "underline", fontWeight: 700, color: "#8B6914", cursor: "pointer" }}
                    >
                      CGV Clients Vork
                    </span>.
                  </div>

                  {/* Payment Choice Selection */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setPaymentChoice("deposit")}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: paymentChoice === "deposit" ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: paymentChoice === "deposit" ? "linear-gradient(135deg, rgba(196,169,106,0.06), rgba(26,42,58,0.02))" : "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>Payer l'acompte (50%)</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>Reste à payer à la livraison : {selectedOrder ? Math.round(selectedOrder.totalPrice * 0.5) : 0} MAD</p>
                      </div>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {paymentChoice === "deposit" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChoice("total")}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: paymentChoice === "total" ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: paymentChoice === "total" ? "linear-gradient(135deg, rgba(196,169,106,0.06), rgba(26,42,58,0.02))" : "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>Payer la totalité (100%)</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>Règlement intégral sécurisé en ligne</p>
                      </div>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {paymentChoice === "total" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Montant à régler : <strong style={{ color: "var(--primary)" }}>{selectedOrder?.totalPrice} MAD</strong>.
                </p>
              )}
              
              {/* CGV Checkbox */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, background: "rgba(26,42,58,0.02)", border: "1px dashed var(--border)", padding: "12px", borderRadius: 12 }}>
                <input 
                  type="checkbox" 
                  id="cgv-accept-checkbox"
                  checked={cgvAccepted} 
                  onChange={(e) => setCgvAccepted(e.target.checked)}
                  style={{ marginTop: 2, cursor: "pointer" }}
                />
                <label htmlFor="cgv-accept-checkbox" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-primary)", cursor: "pointer", lineHeight: "1.3" }}>
                  J'accepte sans réserve les{" "}
                  <span 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCgvTextModal(true); }}
                    style={{ textDecoration: "underline", fontWeight: 700, color: "#8B6914", cursor: "pointer" }}
                  >
                    CGV Vork
                  </span>{" "}
                  (Rétractation 7j, Heure de grâce 60m sur-mesure, Séquestre sécurisé 15j).
                </label>
              </div>

              <div style={{ background: "rgba(26,42,58,0.04)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>
                <Lock size={14} color="#4A7C59" /> Simulation sécurisée CMI Maroc 3D-Secure 2.0
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowCmiModal(false); setCgvAccepted(false); }} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Annuler</button>
                <button 
                  onClick={handlePay} 
                  disabled={loading || !cgvAccepted} 
                  style={{ 
                    flex: 2, 
                    padding: "12px", 
                    borderRadius: 14, 
                    border: "none", 
                    background: cgvAccepted ? "var(--primary)" : "var(--text-placeholder)", 
                    fontFamily: "var(--font-display)", 
                    fontWeight: 700, 
                    fontSize: 13, 
                    color: "#fff", 
                    cursor: cgvAccepted ? "pointer" : "not-allowed" 
                  }}
                >
                  {loading ? "Traitement…" : `Payer ${paymentChoice === "deposit" && isHighAmount ? Math.round((selectedOrder?.totalPrice || 0) * 0.5) : (selectedOrder?.totalPrice || 0)} MAD`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Texte des CGV Vork ────────────────────── */}
      <AnimatePresence>
        {showCgvTextModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(26,42,58,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 110 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ background: "var(--surface)", borderRadius: 24, padding: 20, width: "100%", maxHeight: "80%", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Conditions Générales Vork</h3>
              <div style={{ flex: 1, overflowY: "auto", fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: 10, paddingRight: 6, scrollbarWidth: "none" }}>
                <p><strong>1. Modèle Séquestre (Escrow 15j) :</strong> Afin de protéger l'acheteur et l'artisan, 100% des fonds réglés par CMI sont séquestrés et conservés par la plateforme Vork pendant 15 jours révolus après la livraison de la commande.</p>
                <p><strong>2. Rétractation légale (7 jours) :</strong> Pour tout produit standard, l'acheteur dispose d'un droit de rétractation de 7 jours après la livraison. Les frais de retour Sendit de 35 MAD sont déduits du remboursement.</p>
                <p><strong>3. Produits Sur-Mesure / Personnalisés :</strong> Conformément à l'article 36 de la Loi 31-08, le droit de rétractation ne s'applique pas aux produits confectionnés sur commande. L'acheteur dispose d'une période de grâce de 60 minutes après acceptation par le Maâlem pour annuler sans frais.</p>
                <p><strong>4. Signalement Vice Caché (15 jours) :</strong> Pendant les 15 jours de séquestre, en cas de défaut de fabrication ou vice caché grave, l'acheteur peut geler le séquestre pour examen par l'arbitrage Vork.</p>
              </div>
              <button 
                onClick={() => setShowCgvTextModal(false)} 
                style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 14, background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Fermer et retourner au paiement
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Demande de Prolongation Maâlem (J+2 - Art 4.3) ── */}
      <AnimatePresence>
        {showExtendModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 110 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "#FCFBF9", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 640, borderTop: "1.5px solid rgba(196, 169, 106, 0.2)", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 4 }}>Prolonger le délai du Maâlem</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Accordez un délai supplémentaire au Maâlem pour valider votre fabrication (Article 4.3 CGV).</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {([24, 48, 72] as const).map((h) => (
                  <label key={h} onClick={() => setExtendHours(h)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 14, border: extendHours === h ? "2px solid var(--primary)" : "1px solid var(--border)", background: extendHours === h ? "rgba(26,42,58,0.04)" : "var(--surface)", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${extendHours === h ? "var(--primary)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {extendHours === h && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)", margin: 0 }}>Prolongation de +{h} heures</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Nouveau délai accordé jusqu'à J+{(h / 24) + 2} à 10h00 du matin</p>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowExtendModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Fermer</button>
                <button onClick={handleExtendSubmit} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>{loading ? "Envoi…" : "Valider la prolongation"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Demande de Retour (7j - Art. 9.3 & 9.4) ── */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 110 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "#FCFBF9", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 640, borderTop: "1.5px solid rgba(196, 169, 106, 0.2)", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 4 }}>Rétractation (7 jours)</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>Organisez l'expédition de votre retour d'article.</p>

              {selectedOrder?.carrierChoice === "sendit" ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(220,53,69,0.06)", border: "1px solid rgba(220,53,69,0.15)", borderRadius: 12, padding: 12 }}>
                  ℹ️ <strong>Règle Art. 9.3 A :</strong> La livraison initiale ayant été effectuée par Sendit, l'organisation du retour s'effectue obligatoirement par vos propres moyens.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(["sendit", "propres_moyens"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setReturnMode(mode)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: returnMode === mode ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: returnMode === mode ? "linear-gradient(135deg, rgba(196,169,106,0.06), rgba(26,42,58,0.02))" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--primary)", margin: 0 }}>{mode === "sendit" ? "Service Retour Vendeur (35 MAD)" : "Mes propres moyens"}</p>
                        <span style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "1px solid var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 2
                        }}>
                          {returnMode === mode && <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--primary)" }} />}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>{mode === "sendit" ? "Frais déduits du remboursement" : "Remboursement 100% sur Wallet"}</p>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Numéro de suivi / Preuve de transport (Art 9.4) *</label>
                <input type="text" placeholder="Ex: N° de récépissé, code de suivi transporteur…" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--primary)", outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowReturnModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Fermer</button>
                <button onClick={handleReturnSubmit} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>{loading ? "Envoi…" : "Valider le retour (100% remboursé)"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE MOBILE : Vice Caché (15j - Art. 10) ────────────────── */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 110 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "#FCFBF9", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 640, borderTop: "1.5px solid rgba(196, 169, 106, 0.2)", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 4 }}>Signaler un Vice Caché (Art. 10)</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>Sélectionnez le motif. L'escrow sera immédiatement gelé pour arbitrage Vork.</p>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Motif du vice caché *</label>
                <select value={disputeReasonCategory} onChange={(e) => setDisputeReasonCategory(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--primary)", outline: "none", marginBottom: 10 }}>
                  {VICE_CACHE_REASONS.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Détails complémentaires (optionnel)</label>
                <textarea rows={3} maxLength={500} placeholder="Précisez le problème constaté…" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--primary)", resize: "none", outline: "none" }} />
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
