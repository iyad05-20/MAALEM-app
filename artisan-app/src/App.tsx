import React, { useState, useEffect } from "react";
import { ArtisanBottomNav, type MobileArtisanTab } from "./components/ArtisanBottomNav";
import { ArtisanMobileHeader } from "./components/ArtisanMobileHeader";
import { OrdersWorkshopView } from "./views/OrdersWorkshopView";
import { ReturnsWorkshopView } from "./views/ReturnsWorkshopView";
import { DisputesWorkshopView } from "./views/DisputesWorkshopView";
import { ArtisanWalletView } from "./views/ArtisanWalletView";
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
  ArtisanProduct 
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
  const [loading, setLoading] = useState(false);

  // Modals state
  const [prepPhotosOrderId, setPrepPhotosOrderId] = useState<string | null>(null);
  const [senditModalOrder, setSenditModalOrder] = useState<ArtisanOrder | null>(null);
  const [directDeliveryOrder, setDirectDeliveryOrder] = useState<ArtisanOrder | null>(null);
  const [refuseOrderId, setRefuseOrderId] = useState<string | null>(null);
  const [replyDispute, setReplyDispute] = useState<ArtisanDispute | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [o, r, d, w, h, p] = await Promise.all([
        artisanAPI.getOrders(),
        artisanAPI.getReturns().catch(() => []),
        artisanAPI.getDisputes().catch(() => []),
        artisanAPI.getWallet().catch(() => null),
        artisanAPI.getProfileHealth().catch(() => ({ profile: null, warnings: [] })),
        artisanAPI.getProducts().catch(() => []),
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

  const getHeaderTitle = () => {
    switch (currentTab) {
      case "atelier": return "Atelier de Confection";
      case "retours": return "Retours & Rétractations";
      case "litiges": return "Médiation & Litiges (48h)";
      case "wallet": return "Portefeuille des Ventes";
      case "boutique": return "Boutique & Créations";
    }
  };

  const pendingOrdersCount = orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;
  const openDisputesCount = disputes.filter(d => !d.status.startsWith("resolu") && d.status !== "rejete").length;
  const pendingReturnsCount = returns.filter(r => r.status === "initie").length;

  return (
    <div className="phone-shell">
      {/* Pattern Corners matching Client App */}
      <div className="pattern-corner pattern-top-right" />
      <div className="pattern-corner pattern-bottom-left" />

      {/* Top Mobile Header */}
      <ArtisanMobileHeader
        title={getHeaderTitle()}
        onRefresh={loadAllData}
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

        {currentTab === "retours" && (
          <ReturnsWorkshopView
            returns={returns}
            onConfirmReturn={handleConfirmReturn}
          />
        )}

        {currentTab === "litiges" && (
          <DisputesWorkshopView
            disputes={disputes}
            onOpenReplyModal={setReplyDispute}
          />
        )}

        {currentTab === "wallet" && (
          <ArtisanWalletView
            wallet={wallet}
            onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
          />
        )}

        {currentTab === "boutique" && (
          <ShopManagementMobileView
            health={health}
            warnings={warnings}
            products={products}
            onCreateProduct={handleCreateProduct}
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

      {/* Bottom Sheet Modals */}
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
