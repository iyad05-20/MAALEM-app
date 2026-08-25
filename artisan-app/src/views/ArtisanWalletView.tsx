import React from "react";
import { Wallet, Landmark, ArrowUpRight, CheckCircle2, Clock, DollarSign } from "lucide-react";
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
      <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        <p>Chargement du portefeuille financier...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Balances Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16 }}>
        {/* Main Available Balance */}
        <div className="glass-card" style={{ padding: 22, background: "linear-gradient(135deg, rgba(200, 100, 50, 0.15) 0%, rgba(18, 24, 38, 0.9) 100%)", border: "1px solid var(--border-terracotta)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Solde Disponible Immédiat</span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#34D399", margin: "4px 0 0" }}>
                {wallet.availableBalance} MAD
              </p>
            </div>
            <div style={{ padding: 10, borderRadius: 12, background: "var(--accent-emerald-light)" }}>
              <Wallet size={24} color="#34D399" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 16 }}>
            Fonds libérés post-séquestre 7j ou post-livraison sur-mesure émargée.
          </p>
          <button
            onClick={onOpenWithdrawalModal}
            disabled={wallet.availableBalance <= 0}
            className="btn-gold"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Landmark size={16} />
            <span>Demander un Virement sur RIB (Art. 15)</span>
          </button>
        </div>

        {/* Locked Escrow Balance */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Sous Séquestre (Escrow)</span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#60A5FA", margin: "4px 0 0" }}>
                {wallet.lockedEscrow} MAD
              </p>
            </div>
            <div style={{ padding: 8, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)" }}>
              <Clock size={20} color="#60A5FA" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            Montants en cours de confection ou en délai légal de rétractation de 7 jours.
          </p>
        </div>

        {/* Total Sales & Commission */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Volume Brut Ventes</span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--primary-gold)", margin: "4px 0 0" }}>
                {wallet.totalGrossSales} MAD
              </p>
            </div>
            <div style={{ padding: 8, borderRadius: 10, background: "var(--primary-gold-light)" }}>
              <DollarSign size={20} color="var(--primary-gold)" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
            Commission Vork (10%) : <strong style={{ color: "var(--text-main)" }}>{wallet.vorkPlatformFeesTotal} MAD</strong>
          </p>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-main)", marginBottom: 14 }}>
          🏛️ Historique des Virements Bancaires sur RIB
        </h3>

        {wallet.withdrawals.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
            Aucun virement demandé pour le moment.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Montant</th>
                <th>RIB Destinataire</th>
                <th>Statut</th>
                <th>Date Demande</th>
              </tr>
            </thead>
            <tbody>
              {wallet.withdrawals.map((w) => (
                <tr key={w.id}>
                  <td><strong>#{w.id}</strong></td>
                  <td style={{ color: "var(--primary-gold)", fontWeight: 700 }}>{w.amount} MAD</td>
                  <td><code>{w.rib.slice(0, 6)}...{w.rib.slice(-4)}</code></td>
                  <td>
                    <span className={`badge ${w.status === "processed" ? "badge-success" : "badge-warning"}`}>
                      {w.status === "processed" ? "✓ Virement Effectué" : "En cours (3-5j)"}
                    </span>
                  </td>
                  <td>{new Date(w.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
