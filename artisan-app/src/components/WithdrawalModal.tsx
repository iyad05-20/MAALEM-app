import React, { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, X, ArrowRight, Check } from "lucide-react";

interface WithdrawalModalProps {
  availableBalance: number;
  onClose: () => void;
  onRequestWithdrawal: (amount: number, rib: string) => Promise<any>;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  availableBalance,
  onClose,
  onRequestWithdrawal,
}) => {
  const [amount, setAmount] = useState<string>(String(Math.floor(availableBalance)));
  const [rib, setRib] = useState<string>("123456789012345678901234");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || num > availableBalance) {
      alert("Montant de retrait invalide ou supérieur au solde disponible.");
      return;
    }
    if (rib.length !== 24 || !/^\d+$/.test(rib)) {
      alert("Le RIB marocain doit comporter exactement 24 chiffres.");
      return;
    }

    setLoading(true);
    try {
      await onRequestWithdrawal(num, rib);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur lors du retrait.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(11, 15, 25, 0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20,
    }}>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 24,
          border: "1px solid var(--border-gold)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Landmark size={20} color="var(--primary-gold)" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                Demander un Virement Bancaire (Art. 15)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Solde disponible : <strong style={{ color: "var(--primary-gold)" }}>{availableBalance} MAD</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Montant à virer (MAD) *
            </label>
            <input
              type="number"
              min={100}
              max={availableBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 14, fontWeight: 700 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Relevé d'Identité Bancaire (RIB marocain - 24 chiffres) *
            </label>
            <input
              type="text"
              maxLength={24}
              required
              value={rib}
              onChange={(e) => setRib(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 230780000123456789012345"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 13, letterSpacing: 1 }}
            />
            <span style={{ fontSize: 10, color: rib.length === 24 ? "#34D399" : "var(--text-muted)", marginTop: 4, display: "block" }}>
              {rib.length} / 24 chiffres {rib.length === 24 ? "✓ Valide" : ""}
            </span>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: 10, padding: 10, marginBottom: 16, fontSize: 11, color: "var(--text-muted)" }}>
            ℹ️ Virement bancaire exécuté sous <strong>3 à 5 jours ouvrés</strong> vers votre banque marocaine (Attijari, BCP, BMCE, CIH, etc.).
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" disabled={loading || availableBalance <= 0 || rib.length !== 24} className="btn-gold">
              <Check size={16} />
              <span>{loading ? "Traitement..." : "Confirmer le Virement"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
