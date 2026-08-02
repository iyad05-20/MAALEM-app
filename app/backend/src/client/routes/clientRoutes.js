import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../core/db/index.js";
import { orders, paymentIntents, withdrawalRequests, ledgerEntries } from "../../core/db/schema.js";
import { montantAPayer } from "../../core/types.js";
import { MockCmiProvider } from "../../core/paymentProviders/MockCmiProvider.js";
import { cancelOrder, deliverOrder } from "../services/clientPaymentService.js";
import { requestReturn } from "../services/clientReturnService.js";

const router = Router();
const provider = new MockCmiProvider();

const createOrderSchema = z.object({
  clientRef: z.string().min(1),
  artisanRef: z.string().min(1).optional(),
  totalPrice: z.number().positive(),
  productType: z.enum(["standard", "personnalise"]).optional(),
});

const returnSchema = z.object({
  mode: z.enum(["cathedis", "propres_moyens"]),
  returnShippingFee: z.number().nonnegative().optional(),
});

const withdrawSchema = z.object({
  amount: z.number().positive(),
  rib: z.string().length(24),
});

/**
 * [CLIENT API] Récupérer la liste des commandes du client.
 */
router.get("/orders", (req, res) => {
  const clientRef = req.query.clientRef ? String(req.query.clientRef) : "client-me";
  console.log(`\n[VORK-API] 📥 GET /orders - Fetching for client: ${clientRef}`);
  const list = db.select().from(orders).where(eq(orders.clientRef, clientRef)).all();
  console.log(`[VORK-API] ✅ Found ${list.length} orders`);
  res.json(list);
});

/**
 * [CLIENT API] Créer une nouvelle commande.
 */
router.post("/orders", (req, res) => {
  console.log(`\n[VORK-API] 📥 POST /orders - Payload:`, req.body);
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error(`[VORK-API] ❌ Validation error:`, parsed.error.format());
    return res.status(422).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.insert(orders)
    .values({
      id,
      clientRef: parsed.data.clientRef,
      artisanRef: parsed.data.artisanRef ?? "artisan-1",
      totalPrice: parsed.data.totalPrice,
      productType: parsed.data.productType ?? "standard",
      status: "en_attente_paiement",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const order = db.select().from(orders).where(eq(orders.id, id)).get();
  console.log(`[VORK-API] ✅ Order created successfully (ID: ${id}, Status: ${order.status})`);
  res.json(order);
});

/**
 * [CLIENT API] Initier le paiement (CMI / Acompte 50%).
 */
router.post("/orders/:id/pay", (req, res) => {
  console.log(`\n[VORK-API] 📥 POST /orders/${req.params.id}/pay - Initiating payment`);
  const order = db.select().from(orders).where(eq(orders.id, req.params.id)).get();
  if (!order) {
    console.error(`[VORK-API] ❌ Order not found: ${req.params.id}`);
    return res.status(404).json({ error: "commande introuvable" });
  }

  const { montant, tranche } = montantAPayer(order.totalPrice);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const intentId = crypto.randomUUID();

  db.insert(paymentIntents)
    .values({
      id: intentId,
      orderId: order.id,
      montant,
      tranche,
      provider: "mock_cmi",
      statut: "cree",
      createdAt: now,
      updatedAt: now,
      expiresAt,
    })
    .run();

  db.update(orders)
    .set({ status: "paiement_initie", updatedAt: now })
    .where(eq(orders.id, order.id))
    .run();

  const hostHeader = req.get("host") || "localhost:3001";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  
  // URL publique du serveur backend (Heroku ou Docker Local)
  const backendPublicUrl = process.env.PUBLIC_BACKEND_URL 
    || `${protocol}://${hostHeader}`;

  const requete = provider.construireRequete(
    { id: intentId, montant },
    `${backendPublicUrl}/mock-cmi`
  );

  console.log(`[VORK-API] ✅ Payment intent created (IntentID: ${intentId}, Amount: ${montant} MAD, Tranche: ${tranche})`);
  res.json({
    success: true,
    paymentIntentId: intentId,
    redirectUrl: requete.redirectUrl,
    amount: montant,
    tranche,
  });
});

/**
 * [CLIENT API] Annulation de la commande par le client.
 */
router.post("/orders/:id/cancel", (req, res) => {
  console.log(`\n[VORK-API] 📥 POST /orders/${req.params.id}/cancel - Requesting cancellation`);
  try {
    const cancelTime = req.body?.cancelTime ? String(req.body.cancelTime) : undefined;
    const result = cancelOrder(db, req.params.id, cancelTime);
    console.log(`[VORK-API] ✅ Order cancelled successfully:`, result);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error(`[VORK-API] ❌ Cancellation failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

/**
 * [CLIENT API] Validation de la réception / Livraison de la commande.
 */
router.post("/orders/:id/deliver", (req, res) => {
  console.log(`\n[VORK-API] 📥 POST /orders/${req.params.id}/deliver - Confirming receipt`);
  try {
    const deliveryTime = req.body?.deliveryTime ? String(req.body.deliveryTime) : undefined;
    deliverOrder(db, req.params.id, deliveryTime);
    console.log(`[VORK-API] ✅ Order marked as delivered successfully.`);
    res.json({ success: true });
  } catch (e) {
    console.error(`[VORK-API] ❌ Receipt confirmation failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

/**
 * [CLIENT API] Demande de retour (Rétractation 7j).
 */
router.post("/orders/:id/return", (req, res) => {
  console.log(`\n[VORK-API] 📥 POST /orders/${req.params.id}/return - Requesting return`);
  const parsed = returnSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error(`[VORK-API] ❌ Return validation error:`, parsed.error.format());
    return res.status(422).json({ error: parsed.error.flatten() });
  }

  try {
    const returnId = requestReturn(
      db,
      req.params.id,
      parsed.data.mode,
      parsed.data.returnShippingFee
    );
    console.log(`[VORK-API] ✅ Return request registered (ReturnID: ${returnId})`);
    res.json({ success: true, returnId });
  } catch (e) {
    console.error(`[VORK-API] ❌ Return request failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

/**
 * [CLIENT API] Consulter le solde du Wallet Client.
 */
router.get("/wallet/:userId/balance", (req, res) => {
  const userId = req.params.userId;
  console.log(`\n[VORK-API] 📥 GET /wallet/${userId}/balance - Fetching balance`);
  const compteClient = `wallet[${userId}]`;

  const creditsResult = db
    .select({ total: sql`COALESCE(SUM(montant), 0)` })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.compteCredit, compteClient))
    .get();

  const debitsResult = db
    .select({ total: sql`COALESCE(SUM(montant), 0)` })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.compteDebit, compteClient))
    .get();

  const credits = Number(creditsResult?.total ?? 0);
  const debits = Number(debitsResult?.total ?? 0);
  const balance = Math.max(0, Math.round((credits - debits) * 100) / 100);

  console.log(`[VORK-API] ✅ Balance for user ${userId} calculated: ${balance} MAD`);
  res.json({
    userId,
    balance,
  });
});

/**
 * [CLIENT API] Demande de virement sur RIB Bancaire Client.
 */
router.post("/wallet/:userId/withdraw", (req, res) => {
  const userId = req.params.userId;
  console.log(`\n[VORK-API] 📥 POST /wallet/${userId}/withdraw - Requesting payout`);
  const parsed = withdrawSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error(`[VORK-API] ❌ Withdrawal validation error:`, parsed.error.format());
    return res.status(422).json({ error: parsed.error.flatten() });
  }

  const now = new Date().toISOString();
  const withdrawalId = crypto.randomUUID();

  try {
    db.transaction((tx) => {
      tx.insert(withdrawalRequests)
        .values({
          id: withdrawalId,
          userId,
          amount: parsed.data.amount,
          rib: parsed.data.rib,
          status: "pending",
          createdAt: now,
        })
        .run();

      tx.insert(ledgerEntries)
        .values({
          id: crypto.randomUUID(),
          orderId: null,
          compteDebit: `wallet[${userId}]`,
          compteCredit: "pending_withdrawals",
          montant: parsed.data.amount,
          type: "retrait_demande_rib",
          metadata: JSON.stringify({ rib: parsed.data.rib }),
          createdAt: now,
        })
        .run();
    });

    console.log(`[VORK-API] ✅ Withdrawal request registered (RequestID: ${withdrawalId}, Amount: ${parsed.data.amount} MAD)`);
    res.json({ success: true, withdrawalId });
  } catch (e) {
    console.error(`[VORK-API] ❌ Withdrawal request failed:`, e.message);
    res.status(400).json({ error: e.message });
  }
});

export default router;
