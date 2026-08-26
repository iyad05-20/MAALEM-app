import express from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../core/db/index.js";
import { 
  orders, 
  disputes, 
  vendorProfiles, 
  vendorWarnings, 
  withdrawalRequests, 
  ledgerEntries, 
  returnRequests 
} from "../core/db/schema.js";
import { getAllProducts } from "../db/products.repository.js";
import { 
  acceptOrder, 
  uploadPrepPhotos, 
  prepareSenditShipping, 
  confirmSenditPickupReady, 
  shipVendeurSelf, 
  completeVendeurDelivery,
  recordVendorWarning 
} from "../client/services/artisanOrderService.js";

export const artisanRouter = express.Router();

const DEFAULT_ARTISAN_REF = "artisan-1";

/**
 * GET /api/artisan/orders
 * Récupère les commandes assignées à l'artisan.
 */
artisanRouter.get("/orders", async (req, res) => {
  try {
    const artisanRef = req.query.artisanRef ? String(req.query.artisanRef) : DEFAULT_ARTISAN_REF;
    const list = db.select().from(orders).where(eq(orders.artisanRef, artisanRef)).orderBy(desc(orders.createdAt)).all();

    const enriched = list.map(o => ({
      ...o,
      prepPhotos: o.prepPhotos ? JSON.parse(o.prepPhotos) : [],
    }));

    return res.json({ success: true, count: enriched.length, orders: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/accept
 * Accepte la commande sous 72h max (Art. 6.1).
 */
artisanRouter.post("/orders/:id/accept", async (req, res) => {
  const { id } = req.params;
  try {
    await acceptOrder(id);
    const updated = db.select().from(orders).where(eq(orders.id, id)).get();
    return res.json({ success: true, message: "Commande acceptée ! Entrée en fabrication.", order: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/refuse
 * Refuse la commande avec motif explicatif libre (Art. 6.4).
 */
artisanRouter.post("/orders/:id/refuse", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, error: "Un motif explicatif est obligatoire pour refuser une commande." });
  }

  try {
    const order = db.select().from(orders).where(eq(orders.id, id)).get();
    if (!order) return res.status(404).json({ success: false, error: "Commande introuvable." });

    const now = new Date().toISOString();

    // Remboursement 100% Client
    db.update(orders).set({
      status: "annulee",
      updatedAt: now,
    }).where(eq(orders.id, id)).run();

    db.insert(ledgerEntries).values({
      id: `ledger-${Date.now()}`,
      orderId: id,
      compteDebit: "ESCROW_LOCKED",
      compteCredit: `CLIENT_WALLET:${order.clientRef}`,
      montant: order.totalPrice,
      type: "order_refused_by_artisan_refund",
      metadata: JSON.stringify({ reason: reason.trim() }),
      createdAt: now,
    }).run();

    return res.json({ success: true, message: "Commande refusée. Le client a été intégralement remboursé." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/prep-photos
 * Upload des 4 photos de préparation obligatoires (Art. 8.1).
 */
artisanRouter.post("/orders/:id/prep-photos", async (req, res) => {
  const { id } = req.params;
  const { photos } = req.body;

  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ success: false, error: "Veuillez fournir les photos de préparation." });
  }

  try {
    const result = await uploadPrepPhotos(id, photos);
    return res.json({ success: true, message: `${photos.length} photo(s) de préparation enregistrée(s).`, result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/ship-sendit-step1
 * Étape 1 Sendit : Génération du Bon de Livraison (BL).
 */
artisanRouter.post("/orders/:id/ship-sendit-step1", async (req, res) => {
  const { id } = req.params;
  const deliveryData = req.body;

  try {
    const result = await prepareSenditShipping(id, deliveryData);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/ship-sendit-step2
 * Étape 2 Sendit : Upload photo du colis étiqueté & ordre de ramassage (Art. 8.3).
 */
artisanRouter.post("/orders/:id/ship-sendit-step2", async (req, res) => {
  const { id } = req.params;
  const { blAttachedPhoto } = req.body;

  try {
    const result = await confirmSenditPickupReady(id, blAttachedPhoto);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/ship-vendeur
 * Expédition directe par les propres moyens du Maâlem (Art. 8.2 & 9.3).
 */
artisanRouter.post("/orders/:id/ship-vendeur", async (req, res) => {
  const { id } = req.params;
  const { transportDurationDays = 7 } = req.body;

  try {
    const result = await shipVendeurSelf(id, transportDurationDays);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/orders/:id/complete-delivery
 * Validation livraison directe avec photo du bordereau signé (Art. 11.5).
 */
artisanRouter.post("/orders/:id/complete-delivery", async (req, res) => {
  const { id } = req.params;
  const { signaturePhoto } = req.body;

  try {
    const result = await completeVendeurDelivery(id, signaturePhoto);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/artisan/returns
 * Récupère les demandes de retours clients concernant l'artisan.
 */
artisanRouter.get("/returns", async (req, res) => {
  try {
    const allReturns = db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt)).all();
    const allOrders = db.select().from(orders).all();
    const ordersMap = new Map(allOrders.map(o => [o.id, o]));

    const enriched = allReturns.map(r => ({
      ...r,
      order: ordersMap.get(r.orderId) || null,
    }));

    return res.json({ success: true, count: enriched.length, returns: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/returns/:id/confirm
 * Confirmation de réception de l'article retourné sous 48h (Art. 13.6).
 */
artisanRouter.post("/returns/:id/confirm", async (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  try {
    const ret = db.select().from(returnRequests).where(eq(returnRequests.id, id)).get();
    if (!ret) return res.status(404).json({ success: false, error: "Demande de retour introuvable." });

    const order = db.select().from(orders).where(eq(orders.id, ret.orderId)).get();
    if (order) {
      db.update(orders).set({ status: "annulee", updatedAt: now }).where(eq(orders.id, order.id)).run();

      const refundAmount = Math.max(0, order.totalPrice - (ret.returnShippingFee || 0));
      db.insert(ledgerEntries).values({
        id: `ledger-${Date.now()}`,
        orderId: order.id,
        compteDebit: "ESCROW_LOCKED",
        compteCredit: `CLIENT_WALLET:${order.clientRef}`,
        montant: refundAmount,
        type: "return_validated_by_artisan_refund",
        createdAt: now,
      }).run();
    }

    db.update(returnRequests).set({ status: "resolu_conforme", resolvedAt: now }).where(eq(returnRequests.id, id)).run();

    return res.json({ success: true, message: "Retour validé avec succès. Client remboursé." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/artisan/disputes
 * Liste des réclamations concernant le Maâlem.
 */
artisanRouter.get("/disputes", async (req, res) => {
  try {
    const allDisputes = db.select().from(disputes).orderBy(desc(disputes.createdAt)).all();
    const allOrders = db.select().from(orders).all();
    const ordersMap = new Map(allOrders.map(o => [o.id, o]));

    const enriched = allDisputes.map(d => ({
      ...d,
      order: ordersMap.get(d.orderId) || null,
      clientEvidencePhotos: d.clientEvidencePhotos ? JSON.parse(d.clientEvidencePhotos) : [],
      artisanEvidencePhotos: d.artisanEvidencePhotos ? JSON.parse(d.artisanEvidencePhotos) : [],
    }));

    return res.json({ success: true, count: enriched.length, disputes: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/disputes/:id/respond
 * Soumission de la réponse contradictoire du Maâlem sous 48h (Art. 20).
 */
artisanRouter.post("/disputes/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { artisanResponse, artisanEvidencePhotos = [] } = req.body;

  if (!artisanResponse || !artisanResponse.trim()) {
    return res.status(400).json({ success: false, error: "Veuillez formuler vos explications écrites." });
  }

  try {
    const now = new Date().toISOString();
    db.update(disputes).set({
      artisanResponse: artisanResponse.trim(),
      artisanEvidencePhotos: JSON.stringify(artisanEvidencePhotos),
      status: "en_arbitrage_admin",
    }).where(eq(disputes.id, id)).run();

    return res.json({ success: true, message: "Votre réponse contradictoire a été transmise à la médiation Vork." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/artisan/wallet
 * Portefeuille financier du Maâlem (Ventes nettes, Séquestre, Historique).
 */
artisanRouter.get("/wallet", async (req, res) => {
  const artisanRef = req.query.artisanRef ? String(req.query.artisanRef) : DEFAULT_ARTISAN_REF;
  try {
    const allOrders = db.select().from(orders).where(eq(orders.artisanRef, artisanRef)).all();
    const allWithdrawals = db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, artisanRef)).all();

    let availableBalance = 0;
    let lockedEscrow = 0;
    let totalGrossSales = 0;

    allOrders.forEach(o => {
      const netAmount = Math.round(o.totalPrice * 0.90 * 100) / 100; // 90% pour l'artisan (-10% Vork)
      totalGrossSales += o.totalPrice;

      if (o.escrowReleasedAt) {
        availableBalance += netAmount;
      } else if (["acompte_verse", "payee_integralement", "en_preparation", "en_cours_de_transport", "livre"].includes(o.status)) {
        lockedEscrow += netAmount;
      }
    });

    // Déduction des retraits bancaires déjà validés ou en cours
    const processedWithdrawals = allWithdrawals
      .filter(w => ["processed", "pending"].includes(w.status))
      .reduce((sum, w) => sum + w.amount, 0);

    availableBalance = Math.max(0, Math.round((availableBalance - processedWithdrawals) * 100) / 100);

    return res.json({
      success: true,
      wallet: {
        artisanRef,
        availableBalance,
        lockedEscrow,
        totalGrossSales,
        totalNetEarnings: Math.round(totalGrossSales * 0.90),
        vorkPlatformFeesTotal: Math.round(totalGrossSales * 0.10),
        withdrawals: allWithdrawals,
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/artisan/wallet/withdraw
 * Demande de virement des gains sur RIB marocain (24 chiffres - Art. 15).
 */
artisanRouter.post("/wallet/withdraw", async (req, res) => {
  const { artisanRef = DEFAULT_ARTISAN_REF, amount, rib } = req.body;

  if (!rib || rib.length !== 24 || !/^\d+$/.test(rib)) {
    return res.status(400).json({ success: false, error: "Le RIB bancaire marocain doit comporter exactement 24 chiffres." });
  }

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ success: false, error: "Montant de retrait invalide." });
  }

  try {
    const now = new Date().toISOString();
    const withdrawalId = `with-${Date.now()}`;

    db.insert(withdrawalRequests).values({
      id: withdrawalId,
      userId: artisanRef,
      amount: numericAmount,
      rib,
      status: "pending",
      createdAt: now,
    }).run();

    return res.json({
      success: true,
      message: `Demande de virement de ${numericAmount} MAD enregistrée. Virement sous 3 à 5 jours ouvrés.`,
      withdrawalId,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/artisan/profile/health
 * Santé de la boutique & Compteur d'avertissements (Art. 19 & 22).
 */
artisanRouter.get("/profile/health", async (req, res) => {
  const artisanRef = req.query.artisanRef ? String(req.query.artisanRef) : DEFAULT_ARTISAN_REF;
  try {
    let profile = db.select().from(vendorProfiles).where(eq(vendorProfiles.id, artisanRef)).get();
    if (!profile) {
      profile = {
        id: artisanRef,
        warningCountCurrentMonth: 0,
        suspensionStatus: "active",
        suspendedUntil: null,
        updatedAt: new Date().toISOString(),
      };
      try { db.insert(vendorProfiles).values(profile).run(); } catch {}
    }

    const warnings = db.select().from(vendorWarnings).where(eq(vendorWarnings.vendorRef, artisanRef)).orderBy(desc(vendorWarnings.createdAt)).all();

    return res.json({ success: true, profile, warnings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/artisan/products & POST /api/artisan/products
 * Gestion du Catalogue de l'Artisan (Art. 4).
 */
/**
 * GET /api/artisan/notifications & POST /api/artisan/notifications/:id/read
 * Centre de Notifications Artisan.
 */
artisanRouter.get("/notifications", async (req, res) => {
  const artisanRef = req.query.artisanRef ? String(req.query.artisanRef) : DEFAULT_ARTISAN_REF;
  try {
    const allOrders = db.select().from(orders).where(eq(orders.artisanRef, artisanRef)).all();
    const allDisputes = db.select().from(disputes).all();
    const allReturns = db.select().from(returnRequests).all();
    const allWithdrawals = db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, artisanRef)).all();

    const notifications = [];

    // Notifications de commandes
    allOrders.forEach(o => {
      if (["acompte_verse", "payee_integralement"].includes(o.status)) {
        notifications.push({
          id: `notif-order-${o.id}`,
          type: "new_order",
          title: "Nouvelle commande reçue !",
          message: `Commande #${o.id} (${o.totalPrice} MAD) en attente d'acceptation sous 72h.`,
          date: o.createdAt,
          read: false,
          linkTab: "atelier",
          orderId: o.id,
        });
      }
      if (o.escrowReleasedAt) {
        notifications.push({
          id: `notif-escrow-${o.id}`,
          type: "escrow_released",
          title: "💰 Fonds Débloqués !",
          message: `Le séquestre de la commande #${o.id} a été libéré sur votre solde disponible.`,
          date: o.escrowReleasedAt,
          read: true,
          linkTab: "wallet",
          orderId: o.id,
        });
      }
    });

    // Notifications de litiges
    allDisputes.forEach(d => {
      notifications.push({
        id: `notif-dispute-${d.id}`,
        type: "dispute",
        title: "⚠️ Réclamation Client Ouverte",
        message: `Dossier #${d.id} sur la commande #${d.orderId}. Transmettez votre défense sous 48h.`,
        date: d.createdAt,
        read: !!d.artisanResponse,
        linkTab: "litiges",
        orderId: d.orderId,
      });
    });

    // Notifications de retours
    allReturns.forEach(r => {
      notifications.push({
        id: `notif-return-${r.id}`,
        type: "return",
        title: "🔄 Demande de Retour Déclarée",
        message: `Retour 7j déclaré sur la commande #${r.orderId}. Forclusion active (17j).`,
        date: r.createdAt,
        read: r.status !== "initie",
        linkTab: "retours",
        orderId: r.orderId,
      });
    });

    // Notifications de retraits
    allWithdrawals.forEach(w => {
      if (w.status === "processed") {
        notifications.push({
          id: `notif-with-${w.id}`,
          type: "withdrawal",
          title: "🏛️ Virement Bancaire Exécuté",
          message: `Votre virement de ${w.amount} MAD a été transféré vers votre RIB.`,
          date: w.processedAt || w.createdAt,
          read: true,
          linkTab: "wallet",
        });
      }
    });

    // Tri par date décroissante
    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/artisan/profile
 * Mise à jour des informations de l'atelier & coordonnées de ramassage.
 */
let memoryProfileData = {
  artisanName: "Maâlem Abdelkader",
  specialty: "Céramique, Poterie & Maroquinerie",
  bio: "Maître artisan issu de la médina de Fès avec plus de 22 ans de savoir-faire traditionnel. Spécialiste des émaux bleus et du cuir naturel tanné à l'ancienne.",
  phone: "06 61 23 45 67",
  pickupAddress: "Derb El Miter, N° 14, Médina de Fès",
  pickupDistrictId: 2, // Fès
  defaultRib: "230780000123456789012345",
  isVacationMode: false,
  yearsOfExperience: 22,
};

artisanRouter.get("/profile/details", async (req, res) => {
  return res.json({ success: true, profileDetails: memoryProfileData });
});

artisanRouter.put("/profile/details", async (req, res) => {
  const updates = req.body;
  memoryProfileData = { ...memoryProfileData, ...updates };
  return res.json({ success: true, message: "Profil atelier mis à jour avec succès.", profileDetails: memoryProfileData });
});

/**
 * GET /api/artisan/stats
 * Statistiques & Performance de vente pour l'artisan.
 */
artisanRouter.get("/stats", async (req, res) => {
  const artisanRef = req.query.artisanRef ? String(req.query.artisanRef) : DEFAULT_ARTISAN_REF;
  try {
    const allOrders = db.select().from(orders).where(eq(orders.artisanRef, artisanRef)).all();

    const totalOrders = allOrders.length;
    const acceptedOrders = allOrders.filter(o => o.status !== "annulee").length;
    const acceptanceRate = totalOrders > 0 ? Math.round((acceptedOrders / totalOrders) * 100) : 100;
    const averageShippingDays = 3.2; // Estimation standard
    const overallRating = 4.9;
    const reviewCount = 38;

    return res.json({
      success: true,
      stats: {
        totalOrders,
        acceptanceRate,
        averageShippingDays,
        overallRating,
        reviewCount,
        monthlyGrowth: "+14.5%",
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
