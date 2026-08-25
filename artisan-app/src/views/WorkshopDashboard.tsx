import React from "react";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Wallet, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import type { ArtisanOrder, ArtisanDispute, ArtisanReturn, ArtisanWallet, ArtisanProfileHealth } from "../types/artisanTypes";

interface WorkshopDashboardProps {
  orders: ArtisanOrder[];
  disputes: ArtisanDispute[];
  returns: ArtisanReturn[];
  wallet: ArtisanWallet | null;
  health: ArtisanProfileHealth | null;
  onNavigateTab: (tab: any) => void;
}

export const WorkshopDashboard: React.FC<WorkshopDashboardProps> = ({
  orders,
  disputes,
  returns,
  wallet,
  health,
  onNavigateTab,
}) => {
  // Calculs KPIs
  const pendingAcceptOrders = orders.filter(o => ["acompte_verse", "payee_integralement"].includes(o.status));
  const inPrepOrders = orders.filter(o => o.status === "en_preparation");
  const inTransportOrders = orders.filter(o => o.status === "en_cours_de_transport");
  const deliveredOrders = orders.filter(o => ["livre", "terminee"].includes(o.status));
  const openDisputes = disputes.filter(d => !d.status.startsWith("resolu") && d.status !== "rejete");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Alert Banner if pending accept orders exist */}
      {pendingAcceptOrders.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(200, 100, 50, 0.2) 0%, rgba(168, 74, 30, 0.1) 100%)",
          border: "1px solid var(--border-terracotta)",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-glow)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-terracotta)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={22} color="#FFFFFF" />
            </div>
            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-main)", margin: "0 0 2px" }}>
                ⏳ {pendingAcceptOrders.length} Commande(s) en attente d'acceptation sous 72h max !
              </h4>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                Conformément à l'Article 6.1 des CGV, acceptez les commandes pour lancer la confection et éviter la relance J+2.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigateTab("orders")} className="btn-terracotta" style={{ fontSize: 12 }}>
            <span>Voir l'Atelier</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Main Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>À Accepter (&lt;72h)</span>
            <div style={{ padding: 6, borderRadius: 8, background: "var(--primary-terracotta-light)" }}>
              <Clock size={16} color="var(--primary-terracotta)" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--primary-terracotta)", margin: "0 0 4px" }}>
            {pendingAcceptOrders.length}
          </p>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Relance J+2 à 48h</span>
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>En Fabrication</span>
            <div style={{ padding: 6, borderRadius: 8, background: "var(--primary-gold-light)" }}>
              <Package size={16} color="var(--primary-gold)" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--primary-gold)", margin: "0 0 4px" }}>
            {inPrepOrders.length}
          </p>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>4 photos d'atelier requises</span>
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Solde Disponible</span>
            <div style={{ padding: 6, borderRadius: 8, background: "var(--accent-emerald-light)" }}>
              <Wallet size={16} color="#34D399" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#34D399", margin: "0 0 4px" }}>
            {wallet ? `${wallet.availableBalance} MAD` : "0 MAD"}
          </p>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Virable sur RIB 24ch</span>
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Sous Séquestre (Escrow)</span>
            <div style={{ padding: 6, borderRadius: 8, background: "rgba(59, 130, 246, 0.15)" }}>
              <CheckCircle2 size={16} color="#60A5FA" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#60A5FA", margin: "0 0 4px" }}>
            {wallet ? `${wallet.lockedEscrow} MAD` : "0 MAD"}
          </p>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Libéré post-7j / signature</span>
        </div>
      </div>

      {/* Two columns: Active Orders Preview & Shop Compliance Status */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Recent Orders in Workshop */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
              📦 Commandes Récentes en Atelier
            </h3>
            <button onClick={() => onNavigateTab("orders")} className="btn-outline" style={{ fontSize: 11, padding: "4px 10px" }}>
              Tout voir
            </button>
          </div>

          {orders.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "30px 0" }}>
              Aucune commande assignée pour le moment.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: "var(--text-main)" }}>#{o.id}</strong>
                      <span className={`badge ${o.status === "en_preparation" ? "badge-warning" : o.status === "en_cours_de_transport" ? "badge-info" : o.status === "livre" ? "badge-success" : "badge-urgent"}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                      Type: <strong>{o.productType}</strong> · Montant: <strong style={{ color: "var(--primary-gold)" }}>{o.totalPrice} MAD</strong>
                    </p>
                  </div>
                  <button onClick={() => onNavigateTab("orders")} className="btn-outline" style={{ fontSize: 11, padding: "6px 12px" }}>
                    Gérer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shop Health & Compliance Card */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-main)", margin: "0 0 16px" }}>
            🛡️ Conformité & Santé Boutique
          </h3>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Avertissements ce mois :</span>
              <strong style={{ fontSize: 14, color: (health?.warningCountCurrentMonth || 0) >= 5 ? "#F87171" : "#34D399" }}>
                {health?.warningCountCurrentMonth || 0} / 10
              </strong>
            </div>
            <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{
                width: `${((health?.warningCountCurrentMonth || 0) / 10) * 100}%`,
                height: "100%",
                background: (health?.warningCountCurrentMonth || 0) >= 5 ? "var(--accent-crimson)" : "var(--primary-terracotta)",
              }} />
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            <p style={{ margin: "0 0 6px" }}>• <strong>0 à 4 :</strong> Statut sain ✓</p>
            <p style={{ margin: "0 0 6px" }}>• <strong>5 à 9 :</strong> Alerte modération</p>
            <p style={{ margin: 0 }}>• <strong>10 :</strong> Suspension automatique (Art. 19.3)</p>
          </div>

          <button onClick={() => onNavigateTab("health")} className="btn-outline" style={{ width: "100%", marginTop: 14, fontSize: 11, justifyContent: "center" }}>
            Détails des Avertissements
          </button>
        </div>
      </div>
    </div>
  );
};
