import { eq } from "drizzle-orm";
import { db } from "../../core/db/index.js";
import { orders } from "../../core/db/schema.js";
import { senditClient } from "../../services/sendit/senditClient.js";

export async function acceptOrder(orderId) {
  return db.transaction((tx) => {
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

export async function shipOrder(orderId, deliveryData) {
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) {
    throw new Error("commande_introuvable");
  }
  if (order.status !== "en_preparation") {
    throw new Error(`statut_incompatible_pour_expedition:${order.status}`);
  }

  // 1. Call Sendit API to create delivery
  const senditResult = await senditClient.createDelivery({
    pickup_district_id: Number(deliveryData.pickup_district_id),
    district_id: Number(deliveryData.district_id),
    name: deliveryData.name,
    amount: order.totalPrice,
    address: deliveryData.address,
    phone: deliveryData.phone,
    reference: order.id,
    allow_open: order.allowOpen ?? 1,
    allow_try: order.allowTry ?? 0,
  });

  if (!senditResult.success || !senditResult.data?.code) {
    throw new Error("echec_creation_livraison_sendit");
  }

  const senditDeliveryCode = senditResult.data.code;
  const now = new Date().toISOString();

  // 2. Update status and save Sendit tracking code
  db.update(orders)
    .set({
      status: "en_cours_de_transport",
      senditDeliveryCode: senditDeliveryCode,
      pickupDistrictId: Number(deliveryData.pickup_district_id),
      deliveryDistrictId: Number(deliveryData.district_id),
      shippedAt: now,
      updatedAt: now,
    })
    .where(eq(orders.id, orderId))
    .run();

  return senditDeliveryCode;
}
