import React from "react";
import { Truck, Package, FileText, CheckCircle2, AlertTriangle, Eye } from "lucide-react";

interface LogisticsViewProps {
  orders: any[];
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ orders }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Title */}
      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <Truck color="var(--primary-gold)" /> 🚚 Supervision Logistique Sendit & Transport Direct (Art. 8, 9, 10, 17)
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
          Suivi de l'acheminement des colis, gestion des clients injoignables et vérification des preuves d'étiquetage et de signature.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--primary-gold)", margin: "0 0 14px" }}>
          Expéditions Actives sur le Réseau
        </h4>

        <table className="data-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Transporteur</th>
              <th>Code Suivi Sendit</th>
              <th>Statut Logistique</th>
              <th>Injoignable (Art. 17)</th>
              <th>Preuves de Livraison</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <p style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-main)", margin: 0 }}>{o.id}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Type : {o.productType}</p>
                  </td>
                  <td>
                    <span className={`badge ${o.transportProvider === "sendit" ? "badge-info" : "badge-warning"}`}>
                      {o.transportProvider === "sendit" ? "Sendit Express" : "Maâlem Direct"}
                    </span>
                  </td>
                  <td>
                    {o.senditDeliveryCode ? (
                      <code style={{ fontSize: 11, background: "rgba(45,106,79,0.15)", color: "#34D399", padding: "2px 6px", borderRadius: 4 }}>{o.senditDeliveryCode}</code>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>-</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{o.status}</span>
                  </td>
                  <td>
                    {o.counterUnreachable > 0 ? (
                      <span className="badge badge-urgent">{o.counterUnreachable} échec(s)</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>0</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {o.senditWaybillUrl && (
                        <a href={o.senditWaybillUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: "3px 6px", fontSize: 10 }}>
                          <FileText size={12} /> BL PDF
                        </a>
                      )}
                      {o.vendeurDeliverySignaturePhoto && (
                        <a href={o.vendeurDeliverySignaturePhoto} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: "3px 6px", fontSize: 10 }}>
                          <Eye size={12} /> Reçu Signé
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  Aucune expédition active sur le réseau.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
