import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  clientRef: text("client_ref").notNull(),
  artisanRef: text("artisan_ref").notNull().default("artisan-1"),
  totalPrice: real("total_price").notNull(),
  productType: text("product_type").notNull().default("standard"),
  status: text("status").notNull().default("en_attente_paiement"),
  createdAt: text("created_at").notNull(),
  acceptedAt: text("accepted_at"),
  readyToShipAt: text("ready_to_ship_at"),
  shippedAt: text("shipped_at"),
  deliveredAt: text("delivered_at"),
  updatedAt: text("updated_at").notNull(),

  // Sendit delivery integrations
  senditDeliveryCode: text("sendit_delivery_code"),
  senditPickupCode: text("sendit_pickup_code"),
  pickupDistrictId: real("pickup_district_id"),
  deliveryDistrictId: real("delivery_district_id"),
  allowOpen: real("allow_open").default(1),
  allowTry: real("allow_try").default(0),
  counterUnreachable: real("counter_unreachable").default(0),
  proofImage: text("proof_image"),
});

export const withdrawalRequests = sqliteTable("withdrawal_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: real("amount").notNull(),
  rib: text("rib").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  processedAt: text("processed_at"),
});

export const paymentIntents = sqliteTable("payment_intents", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  montant: real("montant").notNull(),
  tranche: text("tranche").notNull(),
  provider: text("provider").notNull().default("mock_cmi"),
  statut: text("statut").notNull().default("cree"),
  providerRef: text("provider_ref"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const ledgerEntries = sqliteTable("ledger_entries", {
  id: text("id").primaryKey(),
  orderId: text("order_id"),
  compteDebit: text("compte_debit").notNull(),
  compteCredit: text("compte_credit").notNull(),
  montant: real("montant").notNull(),
  type: text("type").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
});

export const paymentsReceived = sqliteTable("payments_received", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  paymentIntentId: text("payment_intent_id").unique(),
  source: text("source").notNull(),
  amount: real("amount").notNull(),
  tranche: text("tranche").notNull(),
  confirmedAt: text("confirmed_at").notNull(),
});

export const returnRequests = sqliteTable("return_requests", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  mode: text("mode").notNull(),
  returnShippingFee: real("return_shipping_fee").notNull().default(0),
  status: text("status").notNull().default("initie"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});

export const disputes = sqliteTable("disputes", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  reason: text("reason").notNull(),
  resolution: text("resolution"),
  status: text("status").notNull().default("ouvert"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});
