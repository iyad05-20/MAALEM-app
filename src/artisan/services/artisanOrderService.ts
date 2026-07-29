import { eq } from "drizzle-orm";
import type { db as DbType } from "../../core/db";
import { orders, ledgerEntries, paymentsReceived } from "../../core/db/schema";

export function acceptOrder(db: typeof DbType, orderId: string): void {
  db.transaction((tx) => {
    const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      throw new Error("commande_introuvable");
    }
    if (!["payee_integralement", "acompte_verse"].includes(order.status)) {
      throw new Error(`statut_incompatible_pour_acceptation:${order.status}`);
    }

    const now = new Date().toISOString();
    tx.update(orders)
      .set({
        status: "en_preparation",
        acceptedAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .run();
  });
}

export function refuseOrder(db: typeof DbType, orderId: string): void {
  db.transaction((tx) => {
    const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      throw new Error("commande_introuvable");
    }
    if (!["payee_integralement", "acompte_verse"].includes(order.status)) {
      throw new Error(`statut_incompatible_pour_refus:${order.status}`);
    }

    const payments = tx
      .select()
      .from(paymentsReceived)
      .where(eq(paymentsReceived.orderId, orderId))
      .all();
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date().toISOString();

    if (totalPaid > 0) {
      tx.insert(ledgerEntries)
        .values({
          id: crypto.randomUUID(),
          orderId,
          compteDebit: `escrow[${orderId}]`,
          compteCredit: `wallet[${order.clientRef}]`,
          montant: totalPaid,
          type: "refus_artisan_remboursement",
          metadata: JSON.stringify({ totalPaid }),
          createdAt: now,
        })
        .run();
    }

    tx.update(orders)
      .set({
        status: "annulee",
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .run();
  });
}
