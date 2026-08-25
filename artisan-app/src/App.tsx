import React, { useState, useEffect } from "react";
import { Sidebar, type ArtisanTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { WorkshopDashboard } from "./views/WorkshopDashboard";
import { OrdersWorkshopView } from "./views/OrdersWorkshopView";
import { ReturnsWorkshopView } from "./views/ReturnsWorkshopView";
import { DisputesWorkshopView } from "./views/DisputesWorkshopView";
import { ArtisanWalletView } from "./views/ArtisanWalletView";
import { ShopHealthView } from "./views/ShopHealthView";
import { CatalogManagementView } from "./views/CatalogManagementView";

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
  const [currentTab, setCurrentTab] = useState<ArtisanTab>("dashboard");
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

  // Handlers for orders
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

  // Handlers for returns & disputes
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

  const getHeaderInfo = () => {
    switch (currentTab) {
      case "dashboard":
        return { title: "Vue d'Ensemble de l'Atelier", subtitle: "KPIs, Commandes urgentes et santé globale de la boutique" };
      case "orders":
        return { title: "Atelier des Commandes & Fabrication", subtitle: "Acceptation (<72h), 4 photos d'atelier et expéditions Sendit / Direct" };
      case "returns":
        return { title: "Gestion des Retours Clients (7j)", subtitle: "Suivi des expéditions de retour et confirmation de réception sous 48h" };
      case "disputes":
        return { title: "Médiation & Litiges Contradictoires (48h)", subtitle: "Réponse officielle d'atelier et transmission des pièces justificatives" };
      case "wallet":
        return { title: "Portefeuille Financier & Retraits RIB", subtitle: "Revenus nets des ventes (-10% Vork) et virements bancaires marocains" };
      case "health":
        return { title: "Santé de la Boutique & Avertissements", subtitle: "Jauge de conformité mensuelle (X/10) et respect des règles CGV" };
      case "catalog":
        return { title: "Catalogue des Créations", subtitle: "Ajout et gestion des articles (Standard vs Sur-Mesure)" };
    }
  };

  const headerInfo = getHeaderInfo();
  const pendingOrdersCount = orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status)).length;
  const openDisputesCount = disputes.filter(d => !d.status.startsWith("resolu") && d.status !== "rejete").length;
  const pendingReturnsCount = returns.filter(r => r.status === "initie").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingOrdersCount={pendingOrdersCount}
        openDisputesCount={openDisputesCount}
        returnsCount={pendingReturnsCount}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onRefresh={loadAllData}
          loading={loading}
          shopStatus={health?.suspensionStatus || "active"}
          warningCount={health?.warningCountCurrentMonth || 0}
        />

        <main style={{ padding: "28px 32px", marginLeft: 270, maxWidth: 1300 }}>
          {currentTab === "dashboard" && (
            <WorkshopDashboard
              orders={orders}
              disputes={disputes}
              returns={returns}
              wallet={wallet}
              health={health}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === "orders" && (
            <OrdersWorkshopView
              orders={orders}
              onAccept={handleAcceptOrder}
              onOpenRefuseModal={setRefuseOrderId}
              onOpenPrepPhotosModal={setPrepPhotosOrderId}
              onOpenSenditModal={setSenditModalOrder}
              onOpenDirectDeliveryModal={setDirectDeliveryOrder}
            />
          )}

          {currentTab === "returns" && (
            <ReturnsWorkshopView
              returns={returns}
              onConfirmReturn={handleConfirmReturn}
            />
          )}

          {currentTab === "disputes" && (
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

          {currentTab === "health" && (
            <ShopHealthView
              health={health}
              warnings={warnings}
            />
          )}

          {currentTab === "catalog" && (
            <CatalogManagementView
              products={products}
              onCreateProduct={handleCreateProduct}
            />
          )}
        </main>
      </div>

      {/* Modals */}
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
