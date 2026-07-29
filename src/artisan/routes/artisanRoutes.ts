import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../core/db";
import { orders } from "../../core/db/schema";
import { acceptOrder, refuseOrder } from "../services/artisanOrderService";
import { getWalletBalance, requestWithdrawal } from "../services/artisanWalletService";

const router = Router();

const withdrawSchema = z.object({
  amount: z.number().positive(),
  rib: z.string().min(10),
});

/**
 * [ARTISAN APP] Liste des commandes reçues par l'artisan.
 */
router.get("/:artisanId/orders", (req, res) => {
  const artisanOrders = db
    .select()
    .from(orders)
    .where(eq(orders.artisanRef, req.params.artisanId))
    .all();
  res.json(artisanOrders);
});

/**
 * [ARTISAN APP] Accepter une commande.
 */
router.post("/orders/:id/accept", (req, res) => {
  try {
    acceptOrder(db, req.params.id);
    res.json({ success: true, status: "en_preparation" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * [ARTISAN APP] Refuser une commande.
 */
router.post("/orders/:id/refuse", (req, res) => {
  try {
    refuseOrder(db, req.params.id);
    res.json({ success: true, status: "annulee" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * [ARTISAN APP] Solde du portefeuille virtuel de l'artisan.
 */
router.get("/wallet/:artisanId/balance", (req, res) => {
  try {
    const balance = getWalletBalance(db, req.params.artisanId);
    res.json({ artisanId: req.params.artisanId, balance });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * [ARTISAN APP] Demande de virement sur RIB bancaire.
 */
router.post("/wallet/:artisanId/withdraw", (req, res) => {
  const parsed = withdrawSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: parsed.error.flatten() });
  }

  try {
    const withdrawalId = requestWithdrawal(
      db,
      req.params.artisanId,
      parsed.data.amount,
      parsed.data.rib
    );
    res.json({ success: true, withdrawalId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
