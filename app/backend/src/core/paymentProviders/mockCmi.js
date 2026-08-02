import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { paymentIntents } from "../db/schema.js";
import { MockCmiProvider } from "./MockCmiProvider.js";
import { processCallback } from "../../client/services/clientPaymentService.js";

const router = Router();
const provider = new MockCmiProvider();

router.get("/pay", (req, res) => {
  const intentId = String(req.query.intent_id ?? "");
  const amount = String(req.query.amount ?? "");
  
  let orderId = "";
  try {
    const payment = db.select().from(paymentIntents).where(eq(paymentIntents.id, intentId)).get();
    if (payment) {
      orderId = payment.orderId;
    }
  } catch (err) {
    console.error("Failed to query payment intent during CMI simulation page load:", err.message);
  }

  console.log(`\n[VORK-CMI] 🖥️ Simulation Page Loaded - IntentID: ${intentId}, OrderID: ${orderId}, Amount: ${amount} MAD`);
  
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  
  res.send(`
    <html><body style="font-family:sans-serif;max-width:400px;margin:60px auto">
      <h3>Simulateur CMI (dev)</h3>
      <p>Commande : ${orderId || intentId}</p>
      <p>Montant : ${amount} MAD</p>
      <p id="erreur" style="color:red;display:none;"></p>
      <button id="succes">Simuler paiement réussi</button>
      <button id="echec">Simuler paiement échoué</button>
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
            window.location.href = '${frontendUrl}/?order_id=${orderId}';
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
