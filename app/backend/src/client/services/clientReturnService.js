import { eq } from "drizzle-orm";
import { orders, returnRequests, ledgerEntries, paymentsReceived } from "../../core/db/schema.js";

export function requestReturn(db, orderId, mode, returnShippingFee = 0) {
  return db.transaction((tx) => {
    const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      throw new Error("commande_introuvable");
    }
    if (order.productType !== "standard") {
      throw new Error("droit_de_retractation_exclu_produit_non_standard");
    }
    if (order.status !== "livre") {
      throw new Error(`retour_impossible_statut_incompatible:${order.status}`);
    }

    const now = new Date().toISOString();
    const returnId = crypto.randomUUID();

    tx.insert(returnRequests)
      .values({
        id: returnId,
        orderId,
        mode,
        returnShippingFee: mode === "cathedis" ? returnShippingFee : 0,
        status: "initie",
        createdAt: now,
      })
      .run();

    tx.update(orders)
      .set({
        status: "retour_initie",
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .run();

    return returnId;
  });
}

export function processReturnRefund(db, returnId, action) {
  return db.transaction((tx) => {
    const req = tx.select().from(returnRequests).where(eq(returnRequests.id, returnId)).get();
    if (!req) {
      throw new Error("demande_retour_introuvable");
    }
    if (req.status !== "initie") {
      throw new Error("demande_retour_deja_traitee");
    }

    const order = tx.select().from(orders).where(eq(orders.id, req.orderId)).get();
    if (!order) {
      throw new Error("commande_introuvable");
    }

    const now = new Date().toISOString();

    if (action === "reject") {
      tx.update(returnRequests)
        .set({ status: "refuse", resolvedAt: now })
        .where(eq(returnRequests.id, returnId))
        .run();

      tx.update(orders)
        .set({ status: "livre", updatedAt: now })
        .where(eq(orders.id, order.id))
        .run();

      return { status: "refuse" };
    }

    const payments = tx
      .select()
      .from(paymentsReceived)
      .where(eq(paymentsReceived.orderId, order.id))
      .all();
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    let refundCash = totalPaid;
    if (req.mode === "cathedis" && req.returnShippingFee > 0) {
      refundCash = Math.max(0, Math.round((totalPaid - req.returnShippingFee) * 100) / 100);
    }

    if (refundCash > 0) {
      tx.insert(ledgerEntries)
        .values({
          id: crypto.randomUUID(),
          orderId: order.id,
          compteDebit: `escrow[${order.id}]`,
          compteCredit: `wallet[${order.clientRef}]`,
          montant: refundCash,
          type: "retour_remboursement_client",
          metadata: JSON.stringify({ mode: req.mode, returnShippingFee: req.returnShippingFee }),
          createdAt: now,
        })
        .run();
    }

    if (req.mode === "cathedis" && req.returnShippingFee > 0) {
      const feeAmount = Math.min(totalPaid, req.returnShippingFee);
      tx.insert(ledgerEntries)
        .values({
          id: crypto.randomUUID(),
          orderId: order.id,
          compteDebit: `escrow[${order.id}]`,
          compteCredit: "cathedis_revenue",
          montant: feeAmount,
          type: "retour_frais_cathedis",
          createdAt: now,
        })
        .run();
    }

    tx.update(returnRequests)
      .set({ status: "valide", resolvedAt: now })
      .where(eq(returnRequests.id, returnId))
      .run();

    tx.update(orders)
      .set({ status: "annulee", updatedAt: now })
      .where(eq(orders.id, order.id))
      .run();

    return { status: "valide", refundCash };
  });
}
