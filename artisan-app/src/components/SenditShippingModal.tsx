import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, X, FileText, Check, ArrowRight, Printer } from "lucide-react";
import type { ArtisanOrder } from "../types/artisanTypes";

interface SenditShippingModalProps {
  order: ArtisanOrder;
  onClose: () => void;
  onStep1: (orderId: string, deliveryData: any) => Promise<any>;
  onStep2: (orderId: string, photoUrl: string) => Promise<any>;
}

export const SenditShippingModal: React.FC<SenditShippingModalProps> = ({
  order,
  onClose,
  onStep1,
  onStep2,
}) => {
  const [step, setStep] = useState<1 | 2>(order.senditDeliveryCode ? 2 : 1);
  const [pickupDistrictId, setPickupDistrictId] = useState<number>(46); // Casablanca par défaut
  const [deliveryDistrictId, setDeliveryDistrictId] = useState<number>(1); // Rabat
  const [artisanAddress, setArtisanAddress] = useState<string>("Atelier Fès N° 14, Médina de Fès");
  const [waybillCode, setWaybillCode] = useState<string>(order.senditDeliveryCode || "");
  const [blAttachedPhoto, setBlAttachedPhoto] = useState<string>("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600");
  const [loading, setLoading] = useState(false);

  const districts = [
    { id: 46, name: "Casablanca" },
    { id: 1, name: "Rabat" },
    { id: 2, name: "Fès" },
    { id: 3, name: "Marrakech" },
    { id: 4, name: "Tanger" },
    { id: 5, name: "Agadir" },
    { id: 6, name: "Meknès" },
    { id: 7, name: "Oujda" },
    { id: 8, name: "Kénitra" },
    { id: 9, name: "Tétouan" },
  ];

  const handleExecuteStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await onStep1(order.id, {
        pickup_district_id: pickupDistrictId,
        district_id: deliveryDistrictId,
        name: "Client Acheteur",
        address: artisanAddress,
      });
      if (res && res.senditDeliveryCode) {
        setWaybillCode(res.senditDeliveryCode);
        setStep(2);
      }
    } catch (err: any) {
      alert(err.message || "Erreur étape 1 Sendit.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blAttachedPhoto.trim()) return;
    setLoading(true);
    try {
      await onStep2(order.id, blAttachedPhoto);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur étape 2 Sendit.");
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
          maxWidth: 580,
          padding: 24,
          border: "1px solid var(--border-terracotta)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-emerald-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={20} color="#34D399" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-main)", margin: 0 }}>
                Expédition Sendit Express (Art. 8.3)
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Étape {step} sur 2 · Commande <strong style={{ color: "var(--primary-terracotta)" }}>{order.id}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--primary-terracotta)" }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step === 2 ? "var(--primary-terracotta)" : "rgba(255,255,255,0.1)" }} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleExecuteStep1}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
              1️⃣ Indiquez l'adresse de votre atelier pour générer le Bon de Livraison (BL) officiel Sendit :
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ville Ramassage (Atelier)</label>
                <select
                  value={pickupDistrictId}
                  onChange={(e) => setPickupDistrictId(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
                >
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ville Livraison (Client)</label>
                <select
                  value={deliveryDistrictId}
                  onChange={(e) => setDeliveryDistrictId(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
                >
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Adresse précise de ramassage</label>
              <input
                type="text"
                required
                value={artisanAddress}
                onChange={(e) => setArtisanAddress(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
              <button type="submit" disabled={loading} className="btn-terracotta">
                <FileText size={16} />
                <span>{loading ? "Génération..." : "Générer le Bon de Livraison (BL)"}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleExecuteStep2}>
            <div style={{ background: "rgba(45, 106, 79, 0.12)", border: "1px solid rgba(45, 106, 79, 0.3)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#34D399", margin: "0 0 4px" }}>
                ✓ Bon de Livraison Généré : <code>{waybillCode}</code>
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <a
                  href={`http://localhost:3001/api/artisan/orders/${order.id}/label?code=${waybillCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                  style={{ padding: "6px 12px", fontSize: 11 }}
                >
                  <Printer size={14} /> Imprimer l'Étiquette Sendit (PDF)
                </a>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
              2️⃣ Collez l'étiquette sur le colis et téléversez la photo du carton étiqueté pour déclencher le ramassage :
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>URL photo du carton avec étiquette collée (Art. 8.3 C) *</label>
              <input
                type="text"
                required
                value={blAttachedPhoto}
                onChange={(e) => setBlAttachedPhoto(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-outline">Fermer</button>
              <button type="submit" disabled={loading || !blAttachedPhoto.trim()} className="btn-success">
                <Check size={16} />
                <span>{loading ? "Validation..." : "Confirmer le Colis & Déclencher Ramassage"}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
