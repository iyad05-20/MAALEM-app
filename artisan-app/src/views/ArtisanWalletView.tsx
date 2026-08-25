import React from "react";
import { Wallet, Landmark, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { ArtisanWallet } from "../types/artisanTypes";

interface ArtisanWalletViewProps {
  wallet: ArtisanWallet | null;
  onOpenWithdrawalModal: () => void;
}

export const ArtisanWalletView: React.FC<ArtisanWalletViewProps> = ({
  wallet,
  onOpenWithdrawalModal,
}) => {
  if (!wallet) {
    return (
      <div className="artisan-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
        <p>Chargement du portefeuille...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Main Luxury Navy Wallet Card */}
      <div style={{
        background: "linear-gradient(135deg, #1A2A3A 0%, #111D29 100%)",
        borderRadius: 24,
        padding: 22,
        color: "#FFFFFF",
        boxShadow: "0 12px 30px rgba(26, 42, 58, 0.25)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Wallet size={18} color="var(--accent-premium)" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              Portefeuille Maâlem Vork
            </span>
          </div>
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontWeight: 700 }}>
            Artisanat Certifié
          </span>
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "0 0 4px" }}>
          Solde Disponible Immédiat
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px" }}>
          {wallet.availableBalance} <span style={{ fontSize: 18, color: "var(--accent-premium)" }}>MAD</span>
        </p>

        <button
          onClick={onOpenWithdrawalModal}
          disabled={wallet.availableBalance <= 0}
          className="btn-mobile-terracotta"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Landmark size={16} />
          <span>Demander un Virement sur RIB (Art. 15)</span>
        </button>
      </div>

      {/* 2 Stats Mini Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="artisan-card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Clock size={14} color="#60A5FA" />
            <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Sous Séquestre</span>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary)", margin: 0 }}>
            {wallet.lockedEscrow} MAD
          </p>
          <p style={{ fontSize: 9, color: "var(--text-secondary)", margin: "2px 0 0" }}>
            Post-7j ou livraison émargée
          </p>
        </div>

        <div className="artisan-card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <CheckCircle2 size={14} color="var(--accent-premium)" />
            <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Volume Ventes</span>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary)", margin: 0 }}>
            {wallet.totalGrossSales} MAD
          </p>
          <p style={{ fontSize: 9, color: "#2D6A4F", margin: "2px 0 0", fontWeight: 700 }}>
            Commission Vork 10%
          </p>
        </div>
      </div>

      {/* Withdrawal History Card */}
      <div className="artisan-card">
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>
          🏛️ Historique des Virements Bancaires
        </h4>

        {wallet.withdrawals.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "16px 0" }}>
            Aucun virement demandé pour le moment.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wallet.withdrawals.map((w) => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <strong style={{ fontSize: 13, color: "var(--primary)" }}>{w.amount} MAD</strong>
                  <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                    RIB: {w.rib.slice(0, 4)}...{w.rib.slice(-4)} · {new Date(w.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={`badge-pill ${w.status === "processed" ? "badge-success" : "badge-warning"}`}>
                  {w.status === "processed" ? "✓ Virement Effectué" : "En cours (3-5j)"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
