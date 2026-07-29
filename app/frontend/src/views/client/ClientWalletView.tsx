import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Calendar, ArrowLeft, TrendingUp, Lock } from "lucide-react";
import type { ClientWallet, WalletTransaction } from "../../types/clientPayment";
import { clientWalletAPI } from "../../services/clientWalletApi";

interface ClientWalletViewProps {
  userId?: string;
  onBack?: () => void;
}

const TX_LABELS: Record<string, string> = {
  annulation_remboursement_client: "Remboursement d'annulation",
  retrait_demande_rib: "Virement RIB demandé",
  retour_remboursement: "Remboursement retour",
};

export const ClientWalletView: React.FC<ClientWalletViewProps> = ({ userId = "client-me", onBack }) => {
  const [wallet, setWallet] = useState<ClientWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [rib, setRib] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await clientWalletAPI.getWallet(userId);
      setWallet(data);
    } catch {
      setMessage({ type: "error", text: "Impossible de charger les données du portefeuille." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWallet(); }, [userId]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount);
    const cleanRib = rib.replace(/\D/g, "");

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    if (wallet && cleanAmount > wallet.balance) {
      alert("Le montant demandé dépasse votre solde disponible.");
      return;
    }
    if (cleanRib.length !== 24 || !/^\d{24}$/.test(cleanRib)) {
      alert("Le numéro RIB doit comporter exactement 24 chiffres numériques.");
      return;
    }

    if (loading) return;
    setLoading(true); setMessage(null);
    try {
      await clientWalletAPI.requestWithdrawal(userId, cleanAmount, cleanRib);
      setShowModal(false); setAmount(""); setRib("");
      setMessage({ type: "success", text: `Virement de ${cleanAmount} MAD demandé. Exécution le Lundi matin.` });
      await loadWallet();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally { setLoading(false); }
  };

  const availableBalance = wallet?.balance ?? 0;
  const pending = wallet?.pendingWithdrawals ?? 0;

  return (
    <div className="app-view" style={{ paddingTop: 0, position: "relative" }}>

      {/* ── Mobile Top Header ───────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
          <ArrowLeft size={18} color="var(--primary)" />
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", margin: 0 }}>Mon Wallet Vork</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* ── Feedback Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: "12px 14px", borderRadius: 14, marginBottom: 14, background: message.type === "success" ? "rgba(45,106,79,0.10)" : "rgba(220,53,69,0.10)", border: `1px solid ${message.type === "success" ? "rgba(45,106,79,0.30)" : "rgba(220,53,69,0.30)"}`, fontFamily: "var(--font-body)", fontSize: 12, color: message.type === "success" ? "#2D6A4F" : "#DC3545" }}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Wallet Balance Card (Luxury Dark Gradient) ──────────── */}
      <div style={{ background: "linear-gradient(135deg, #1A2A3A 0%, #243447 100%)", borderRadius: 24, padding: "24px 20px", marginBottom: 14, boxShadow: "0 12px 32px rgba(26,42,58,0.20)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(212,175,55,0.08)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Wallet size={16} color="rgba(212,175,55,0.9)" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: 0.5, textTransform: "uppercase" }}>Solde disponible</span>
        </div>

        <div style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "#fff", letterSpacing: -1 }}>{availableBalance}</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>MAD</span>
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
          Avoirs de remboursement · 100% disponibles
        </p>

        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} disabled={availableBalance <= 0} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: 14, background: availableBalance > 0 ? "rgba(212,175,55,0.95)" : "rgba(255,255,255,0.15)", border: "none", cursor: availableBalance > 0 ? "pointer" : "not-allowed", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: availableBalance > 0 ? "#1A2A3A" : "rgba(255,255,255,0.4)" }}>
          <ArrowUpRight size={16} /> Demander un virement RIB
        </motion.button>
      </div>

      {/* ── Pending Withdrawal Card ─────────────────────────────── */}
      {pending > 0 && (
        <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.30)", borderRadius: 16, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <Calendar size={18} color="#8B6914" />
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#8B6914", margin: 0 }}>{pending} MAD en cours de virement</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#A07820", margin: 0 }}>Execution automatique prévue ce Lundi matin</p>
          </div>
        </div>
      )}

      {/* ── Info Card ────────────────────────────────────────────── */}
      <div style={{ background: "rgba(156,175,136,0.10)", border: "1px solid rgba(156,175,136,0.30)", borderRadius: 16, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <TrendingUp size={18} color="#4A7C59" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#4A7C59", margin: 0 }}>
          Les crédits d'annulations ou de retours arrivent immédiatement sur votre Wallet.
        </p>
      </div>

      {/* ── Transaction History ───────────────────────────────────── */}
      <div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)", marginBottom: 12 }}>Historique des transactions</p>

        {wallet && wallet.transactions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wallet.transactions.map((tx: WalletTransaction) => {
              const isCredit = tx.compteCredit.includes(userId) || tx.type.includes("remboursement");
              return (
                <motion.div key={tx.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: isCredit ? "rgba(45,106,79,0.10)" : "rgba(220,53,69,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isCredit ? <ArrowDownLeft size={16} color="#2D6A4F" /> : <ArrowUpRight size={16} color="#C0392B" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {TX_LABELS[tx.type] ?? tx.type}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                      {new Date(tx.createdAt).toLocaleDateString("fr-FR")} · {new Date(tx.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: isCredit ? "#2D6A4F" : "#C0392B", flexShrink: 0 }}>
                    {isCredit ? "+" : "-"}{tx.montant} MAD
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 16px", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <Wallet size={24} color="var(--text-secondary)" style={{ marginBottom: 8 }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Aucune transaction enregistrée.</p>
          </div>
        )}
      </div>

      {/* ── MODALE MOBILE : Virement RIB ─────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(26,42,58,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }} style={{ background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 2, margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--primary)", marginBottom: 4 }}>Demande de Virement RIB</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Solde retirable : <strong style={{ color: "var(--primary)" }}>{availableBalance} MAD</strong></p>

              <form onSubmit={handleWithdraw}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Montant à virer (MAD) *</label>
                  <input type="number" placeholder={`Max ${availableBalance} MAD`} max={availableBalance} min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--primary)", outline: "none" }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Numéro RIB Marocain (24 chiffres) *</label>
                  <input type="text" maxLength={24} placeholder="230780000000000000123456" value={rib} onChange={(e) => setRib(e.target.value.replace(/\D/g, ""))} required style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${rib.length === 24 ? "rgba(45,106,79,0.5)" : "var(--border)"}`, background: "var(--bg-primary)", fontFamily: "monospace", fontSize: 13, color: "var(--primary)", outline: "none", letterSpacing: 0.5 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: rib.length === 24 ? "#2D6A4F" : "var(--text-secondary)", display: "block", marginTop: 4 }}>{rib.length}/24 chiffres numériques</span>
                </div>

                <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12, padding: "10px 12px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "#8B6914" }}>
                  <Lock size={14} color="#8B6914" /> Execution automatique par Vork chaque Lundi matin.
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Annuler</button>
                  <button type="submit" disabled={loading || rib.length !== 24} style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer", opacity: rib.length !== 24 ? 0.6 : 1 }}>{loading ? "Envoi…" : "Valider le virement"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
