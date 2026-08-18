import express, { type Express } from "express";
import path from "path";
import { initSchema } from "./core/db";
import clientRoutes from "./client/routes/clientRoutes";
import artisanRoutes from "./artisan/routes/artisanRoutes";
import adminRoutes from "./admin/routes/adminRoutes";
import mockCmiRouter from "./core/paymentProviders/mockCmi";
import ordersRouter from "./routes/orders";
import walletRouter from "./routes/wallet";
import paymentsRouter from "./routes/payments";
import { senditWebhookHandler } from "./services/sendit/senditWebhookHandler";

export function createApp(): Express {
  initSchema();

  const app = express();
  app.use(express.json());

  app.post("/api/webhooks/sendit", senditWebhookHandler);

  // Modules découplés pour l'App Client, App Artisan et Back-Office Admin
  app.use("/api/client", clientRoutes);
  app.use("/api/artisan", artisanRoutes);
  app.use("/api/admin", adminRoutes);

  // Rétro-compatibilité pour les routes principales
  app.use("/orders", ordersRouter);
  app.use("/wallet", walletRouter);
  app.use("/payments", paymentsRouter);
  app.use("/mock-cmi", mockCmiRouter);

  app.use(express.static(path.join(__dirname, "..", "public")));

  return app;
}
