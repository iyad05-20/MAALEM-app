import React, { useState, useEffect } from "react";
import { ArtisanBottomNav, type MobileArtisanTab } from "./components/ArtisanBottomNav";
import { ArtisanMobileHeader } from "./components/ArtisanMobileHeader";
import { OrdersWorkshopView } from "./views/OrdersWorkshopView";
import { ReturnsWorkshopView } from "./views/ReturnsWorkshopView";
import { DisputesWorkshopView } from "./views/DisputesWorkshopView";
import { ArtisanWalletView } from "./views/ArtisanWalletView";
import { ArtisanProfileView } from "./views/ArtisanProfileView";
import { ArtisanNotificationsView } from "./views/ArtisanNotificationsView";
import { ShopManagementMobileView } from "./views/ShopManagementMobileView";

import { PrepPhotosModal } from "./components/PrepPhotosModal";
import { SenditShippingModal } from "./components/SenditShippingModal";
import { DirectDeliveryModal } from "./components/DirectDeliveryModal";
import { RefuseOrderModal } from "./components/RefuseOrderModal";
import { DisputeReplyModal } from "./components/DisputeReplyModal";
import { WithdrawalModal } from "./components/WithdrawalModal";

import { artisanAPI } from "./services/artisanApi";
import type { 
  ArtisanOrder, 
  ArtisanDispute, 
  ArtisanReturn, 
  ArtisanWallet, 
  ArtisanProfileHealth, 
  ArtisanProduct,
  ArtisanNotification,
  ArtisanProfileDetails,
  ArtisanStats
} from "./types/artisanTypes";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<MobileArtisanTab>("atelier");
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [returns, setReturns] = useState<ArtisanReturn[]>([]);
  const [disputes, setDisputes] = useState<ArtisanDispute[]>([]);
  const [wallet, setWallet] = useState<ArtisanWallet | null>(null);
  const [health, setHealth] = useState<ArtisanProfileHealth | null>(null);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [notifications, setNotifications] = useState<ArtisanNotification[]>([]);
  const [profileDetails, setProfileDetails] = useState<ArtisanProfileDetails | null>(null);
  const [stats, setStats] = useState<ArtisanStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals & Drawers state
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showReturnsDrawer, setShowReturnsDrawer] = useState<boolean>(false);
  const [showDisputesDrawer, setShowDisputesDrawer] = useState<boolean>(false);
  const [prepPhotosOrderId, setPrepPhotosOrderId] = useState<string | null>(null);
  const [senditModalOrder, setSenditModalOrder] = useState<ArtisanOrder | null>(null);
  const [directDeliveryOrder, setDirectDeliveryOrder] = useState<ArtisanOrder | null>(null);
  const [refuseOrderId, setRefuseOrderId] = useState<string | null>(null);
  const [replyDispute, setReplyDispute] = useState<ArtisanDispute | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [o, r, d, w, h, p, n, prof, st] = await Promise.all([
        artisanAPI.getOrders(),
        artisanAPI.getReturns().catch(() => []),
        artisanAPI.getDisputes().catch(() => []),
        artisanAPI.getWallet().catch(() => null),
        artisanAPI.getProfileHealth().catch(() => ({ profile: null, warnings: [] })),
        artisanAPI.getProducts().catch(() => []),
        artisanAPI.getNotifications().catch(() => []),
        artisanAPI.getProfileDetails().catch(() => null),
        artisanAPI.getStats().catch(() => null),
      ]);

      setOrders(o);
      setReturns(r);
      setDisputes(d);
      setWallet(w);
      if (h) {
        setHealth(h.profile);
        setWarnings(h.warnings || []);
      }
      setProducts(p);
      setNotifications(n);
      setProfileDetails(prof);
      setStats(st);
    } catch (err: any) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleAcceptOrder = async (orderId: string) => {
    await artisanAPI.acceptOrder(orderId);
    await loadAllData();
  };

  const handleRefuseOrder = async (orderId: string, reason: string) => {
    await artisanAPI.refuseOrder(orderId, reason);
    await loadAllData();
  };

  const handleUploadPrepPhotos = async (orderId: string, photos: string[]) => {
    await artisanAPI.uploadPrepPhotos(orderId, photos);
    await loadAllData();
  };

  const handleSenditStep1 = async (orderId: string, deliveryData: any) => {
    const res = await artisanAPI.shipSenditStep1(orderId, deliveryData);
    await loadAllData();
    return res;
  };

  const handleSenditStep2 = async (orderId: string, blPhoto: string) => {
    const res = await artisanAPI.shipSenditStep2(orderId, blPhoto);
    await loadAllData();
    return res;
  };

  const handleShipDirect = async (orderId: string, days: number) => {
    const res = await artisanAPI.shipVendeur(orderId, days);
    await loadAllData();
    return res;
  };

  const handleCompleteDirectDelivery = async (orderId: string, signaturePhoto: string) => {
    const res = await artisanAPI.completeVendeurDelivery(orderId, signaturePhoto);
    await loadAllData();
    return res;
  };

  const handleConfirmReturn = async (returnId: string) => {
    await artisanAPI.confirmReturn(returnId);
    await loadAllData();
  };

  const handleRespondDispute = async (disputeId: string, text: string, photos: string[]) => {
    await artisanAPI.respondDispute(disputeId, text, photos);
    await loadAllData();
  };

  const handleRequestWithdrawal = async (amount: number, rib: string) => {
    await artisanAPI.requestWithdrawal(amount, rib);
    await loadAllData();
  };

  const handleCreateProduct = async (productData: any) => {
    await artisanAPI.createProduct(productData);
    await loadAllData();
  };

  const handleUpdateProfile = async (details: Partial<ArtisanProfileDetails>) => {
    const updated = await artisanAPI.updateProfileDetails(details);
    setProfileDetails(updated);
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case "atelier": return "Atelier de Confection";
      case "catalogue": return "Catalogue & Créations";
      case "wallet": return "Portefeuille des Ventes";
      case "profil": return "Mon Espace Maâlem";
    }
  };

  const pendingOrdersCount = orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;
  const openDisputesCount = disputes.filter(d => !d.status.startsWith("resolu") && d.status !== "rejete").length;
  const pendingReturnsCount = returns.filter(r => r.status === "initie").length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="phone-shell">
      {/* Pattern Corners matching Client App */}
      <div className="pattern-corner pattern-top-right" />
      <div className="pattern-corner pattern-bottom-left" />

      {/* Top Mobile Header */}
      <ArtisanMobileHeader
        title={getHeaderTitle()}
        onRefresh={loadAllData}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        unreadNotifsCount={unreadNotifsCount}
        loading={loading}
        shopStatus={health?.suspensionStatus || "active"}
        warningCount={health?.warningCountCurrentMonth || 0}
      />

      {/* Scrollable View Area */}
      <main className="app-content">
        {currentTab === "atelier" && (
          <OrdersWorkshopView
            orders={orders}
            onAccept={handleAcceptOrder}
            onOpenRefuseModal={setRefuseOrderId}
            onOpenPrepPhotosModal={setPrepPhotosOrderId}
            onOpenSenditModal={setSenditModalOrder}
            onOpenDirectDeliveryModal={setDirectDeliveryOrder}
          />
        )}

        {currentTab === "catalogue" && (
          <ShopManagementMobileView
            health={health}
            warnings={warnings}
            products={products}
            onCreateProduct={handleCreateProduct}
          />
        )}

        {currentTab === "wallet" && (
          <ArtisanWalletView
            wallet={wallet}
            onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
          />
        )}

        {currentTab === "profil" && (
          <ArtisanProfileView
            profileDetails={profileDetails}
            health={health}
            stats={stats}
            returns={returns}
            disputes={disputes}
            onUpdateProfile={handleUpdateProfile}
            onOpenReturns={() => setShowReturnsDrawer(true)}
            onOpenDisputes={() => setShowDisputesDrawer(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <ArtisanBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingOrdersCount={pendingOrdersCount}
        openDisputesCount={openDisputesCount}
        returnsCount={pendingReturnsCount}
      />

      {/* ─── Drawers & Bottom Sheets ───────────────────────────────────────── */}

      {/* Notifications Drawer */}
      {showNotificationsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#FCFBF9", width: "100%", maxWidth: 440, maxHeight: "82vh", borderRadius: "24px 24px 0 0", padding: "20px", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />
            <ArtisanNotificationsView
              notifications={notifications}
              onNavigateTab={(tab) => {
                setShowNotificationsModal(false);
                if (tab === "retours") setShowReturnsDrawer(true);
                else if (tab === "litiges") setShowDisputesDrawer(true);
                else setCurrentTab(tab);
              }}
            />
            <button onClick={() => setShowNotificationsModal(false)} className="btn-mobile-outline" style={{ width: "100%", marginTop: 14 }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Returns Drawer from Profile */}
      {showReturnsDrawer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#FCFBF9", width: "100%", maxWidth: 440, maxHeight: "82vh", borderRadius: "24px 24px 0 0", padding: "20px", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />
            <ReturnsWorkshopView
              returns={returns}
              onConfirmReturn={handleConfirmReturn}
            />
            <button onClick={() => setShowReturnsDrawer(false)} className="btn-mobile-outline" style={{ width: "100%", marginTop: 14 }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Disputes Drawer from Profile */}
      {showDisputesDrawer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#FCFBF9", width: "100%", maxWidth: 440, maxHeight: "82vh", borderRadius: "24px 24px 0 0", padding: "20px", overflowY: "auto", boxShadow: "0 -10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />
            <DisputesWorkshopView
              disputes={disputes}
              onOpenReplyModal={(d) => {
                setShowDisputesDrawer(false);
                setReplyDispute(d);
              }}
            />
            <button onClick={() => setShowDisputesDrawer(false)} className="btn-mobile-outline" style={{ width: "100%", marginTop: 14 }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {prepPhotosOrderId && (
        <PrepPhotosModal
          orderId={prepPhotosOrderId}
          onClose={() => setPrepPhotosOrderId(null)}
          onUpload={handleUploadPrepPhotos}
        />
      )}

      {senditModalOrder && (
        <SenditShippingModal
          order={senditModalOrder}
          onClose={() => setSenditModalOrder(null)}
          onStep1={handleSenditStep1}
          onStep2={handleSenditStep2}
        />
      )}

      {directDeliveryOrder && (
        <DirectDeliveryModal
          order={directDeliveryOrder}
          onClose={() => setDirectDeliveryOrder(null)}
          onShipDirect={handleShipDirect}
          onCompleteDelivery={handleCompleteDirectDelivery}
        />
      )}

      {refuseOrderId && (
        <RefuseOrderModal
          orderId={refuseOrderId}
          onClose={() => setRefuseOrderId(null)}
          onRefuse={handleRefuseOrder}
        />
      )}

      {replyDispute && (
        <DisputeReplyModal
          dispute={replyDispute}
          onClose={() => setReplyDispute(null)}
          onRespond={handleRespondDispute}
        />
      )}

      {showWithdrawalModal && wallet && (
        <WithdrawalModal
          availableBalance={wallet.availableBalance}
          onClose={() => setShowWithdrawalModal(false)}
          onRequestWithdrawal={handleRequestWithdrawal}
        />
      )}
    </div>
  );
};
