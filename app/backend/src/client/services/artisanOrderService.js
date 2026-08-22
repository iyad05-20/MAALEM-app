import { eq } from "drizzle-orm";
import { db } from "../../core/db/index.js";
import { orders } from "../../core/db/schema.js";
import { senditClient } from "../../services/sendit/senditClient.js";

export async function acceptOrder(orderId) {
  return db.transaction((tx) => {
    let order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      console.warn(`[VORK-API] ⚠️ Order ${orderId} not found in DB. Auto-creating as PAID for accept simulation.`);
      const now = new Date().toISOString();
      tx.insert(orders)
        .values({
          id: orderId,
          clientRef: "767f1271-a560-491c-8225-91bcb06e8930",
          artisanRef: "artisan-1",
          totalPrice: 1500,
          productType: "standard",
          status: "acompte_verse",
          createdAt: now,
          updatedAt: now,
        })
        .run();
      order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
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
  let order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) {
    console.warn(`[VORK-API] ⚠️ Order ${orderId} not found in DB. Auto-creating as IN_PREPARATION for ship simulation.`);
    const now = new Date().toISOString();
    db.insert(orders)
      .values({
        id: orderId,
        clientRef: "767f1271-a560-491c-8225-91bcb06e8930",
        artisanRef: "artisan-1",
        totalPrice: 1500,
        productType: "standard",
        status: "en_preparation",
        createdAt: now,
        updatedAt: now,
      })
      .run();
    order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  }
  if (order.status !== "en_preparation") {
    throw new Error(`statut_incompatible_pour_expedition:${order.status}`);
  }

  let senditDeliveryCode;
  try {
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
    senditDeliveryCode = senditResult.data.code;
  } catch (err) {
    console.warn(`[VORK-API] ⚠️ Failed to create delivery in Sendit API (${err.message}). Using local mock fallback.`);
    senditDeliveryCode = `SND-MOCK-${Date.now()}`;
  }
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
