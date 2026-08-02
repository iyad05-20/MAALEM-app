import { Router } from "express";
import { db } from "../db/index.js";
import { MockCmiProvider } from "./MockCmiProvider.js";
import { processCallback } from "../../client/services/clientPaymentService.js";

const router = Router();
const provider = new MockCmiProvider();

router.get("/pay", (req, res) => {
  const intentId = String(req.query.intent_id ?? "");
  const amount = String(req.query.amount ?? "");
  const orderId = String(req.query.order_id ?? "");

  // Origine de l'application frontend (Vercel ou Local)
  const referer = req.get("referer");
  let clientOrigin = process.env.FRONTEND_URL;
  if (!clientOrigin && referer) {
    try { clientOrigin = new URL(referer).origin; } catch {}
  }
  if (!clientOrigin) clientOrigin = "http://localhost:3000";

  console.log(`\n[VORK-CMI] 🖥️ Simulation Page Loaded - IntentID: ${intentId}, Amount: ${amount} MAD, ClientTarget: ${clientOrigin}`);
  res.send(`
    <html><body style="font-family:sans-serif;max-width:400px;margin:60px auto;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);border-radius:16px;">
      <h3 style="color:#1A2A3A;margin-top:0;">Simulateur CMI (3D Secure 2.0)</h3>
      <p style="font-size:14px;color:#64748B;">Commande ID : <strong>${orderId || intentId}</strong></p>
      <p style="font-size:16px;color:#2D6A4F;">Montant à régler : <strong>${amount} MAD</strong></p>
      <p id="erreur" style="color:red;display:none;font-size:13px;"></p>
      <button id="succes" style="width:100%;padding:12px;background:#2D6A4F;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;margin-bottom:10px;">Simuler paiement réussi</button>
      <button id="echec" style="width:100%;padding:12px;background:#DC3545;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Simuler paiement échoué</button>
      <script>
        async function simuler(resultat) {
          const btnSucces = document.getElementById('succes');
          const btnEchec = document.getElementById('echec');
          const err = document.getElementById('erreur');
          btnSucces.disabled = true;
          btnEchec.disabled = true;
          err.style.display = 'none';
          try {
            const res = await fetch('/mock-cmi/simulate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                intent_id: '${intentId}', amount: ${amount || 0}, resultat,
              }),
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            window.location.href = '${clientOrigin}/?order_id=${orderId}';
          } catch (e) {
            err.textContent = e.message;
            err.style.display = 'block';
            btnSucces.disabled = false;
            btnEchec.disabled = false;
          }
        }
        document.getElementById('succes').onclick = () => simuler('succes');
        document.getElementById('echec').onclick = () => simuler('echec');
      </script>
    </body></html>
  `);
});

router.post("/simulate", async (req, res) => {
  const { intent_id: intentId, amount, resultat } = req.body;
  console.log(`\n[VORK-CMI] 🔔 Webhook Simulation Triggered - IntentID: ${intentId}, Status: ${resultat}`);
  const signed = MockCmiProvider.buildSignedCallback(intentId, Number(amount), resultat === "succes");
  const result = provider.verifierCallback(signed);
  const intent = await processCallback(db, result, "mock_cmi_webhook");
  console.log(`[VORK-CMI] ✅ Webhook Callback Processed successfully (IntentID: ${intent.id}, Status: ${intent.statut})`);
  res.json({ resultat, paymentIntentId: intent.id, statut: intent.statut });
});

export default router;
