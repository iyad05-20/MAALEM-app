import React, { useState } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  Landmark, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Scale, 
  Star, 
  ChevronRight, 
  FileText,
  Clock,
  Check
} from "lucide-react";
import type { ArtisanProfileDetails, ArtisanStats, ArtisanProfileHealth, ArtisanReturn, ArtisanDispute } from "../types/artisanTypes";

interface ArtisanProfileViewProps {
  profileDetails: ArtisanProfileDetails | null;
  health: ArtisanProfileHealth | null;
  stats: ArtisanStats | null;
  returns: ArtisanReturn[];
  disputes: ArtisanDispute[];
  onUpdateProfile: (details: Partial<ArtisanProfileDetails>) => Promise<void>;
  onOpenReturns: () => void;
  onOpenDisputes: () => void;
}

export const ArtisanProfileView: React.FC<ArtisanProfileViewProps> = ({
  profileDetails,
  health,
  stats,
  returns,
  disputes,
  onUpdateProfile,
  onOpenReturns,
  onOpenDisputes,
}) => {
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showCgvModal, setShowCgvModal] = useState(false);

  const [phone, setPhone] = useState(profileDetails?.phone || "06 61 23 45 67");
  const [pickupAddress, setPickupAddress] = useState(profileDetails?.pickupAddress || "Derb El Miter, N° 14, Médina de Fès");
  const [defaultRib, setDefaultRib] = useState(profileDetails?.defaultRib || "230780000123456789012345");
  const [bio, setBio] = useState(profileDetails?.bio || "Maître artisan issu de la médina de Fès.");
  const [isVacationMode, setIsVacationMode] = useState(profileDetails?.isVacationMode || false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const warningCount = health?.warningCountCurrentMonth || 0;
  const isSuspended = health?.suspensionStatus && health.suspensionStatus.startsWith("suspended");
  const pendingReturns = returns.filter(r => r.status === "initie").length;
  const openDisputes = disputes.filter(d => !d.status.startsWith("resolu") && d.status !== "rejete").length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    try {
      await onUpdateProfile({
        phone,
        pickupAddress,
        defaultRib,
        bio,
        isVacationMode,
      });
      setSavedMsg(true);
      setShowSettingsForm(false);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || "Erreur sauvegarde profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVacation = async () => {
    const nextVal = !isVacationMode;
    setIsVacationMode(nextVal);
    await onUpdateProfile({ isVacationMode: nextVal });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Workshop Master Card */}
      <div style={{
        background: "linear-gradient(135deg, #1A2A3A 0%, #111D29 100%)",
        borderRadius: 24,
        padding: 20,
        color: "#FFFFFF",
        boxShadow: "0 10px 25px rgba(26, 42, 58, 0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-warm), var(--accent-premium))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
          }}>
            م
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#FFFFFF", margin: 0 }}>
                {profileDetails?.artisanName || "Maâlem Abdelkader"}
              </h3>
              <span className="badge-pill" style={{ background: "rgba(212,175,55,0.2)", color: "var(--accent-premium)", border: "1px solid rgba(212,175,55,0.4)" }}>
                ★ Maître Artisan
              </span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
              {profileDetails?.specialty || "Céramique & Cuir Fassi"} · Médina de Fès
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, background: "rgba(255,255,255,0.06)", padding: 10, borderRadius: 14 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Note Boutique</p>
            <strong style={{ fontSize: 13, color: "var(--accent-premium)", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Star size={12} fill="var(--accent-premium)" /> {stats?.overallRating || 4.9}
            </strong>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Acceptation</p>
            <strong style={{ fontSize: 13, color: "#34D399" }}>
              {stats?.acceptanceRate || 100}%
            </strong>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Expédition</p>
            <strong style={{ fontSize: 13, color: "#FFFFFF" }}>
              ~{stats?.averageShippingDays || 3}j
            </strong>
          </div>
        </div>
      </div>

      {/* Vacation Mode Quick Card */}
      <div className="artisan-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: "0 0 2px" }}>
            Mode Congés / Pause Atelier
          </h4>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
            {isVacationMode ? "🏖️ Vos créations sont masquées pour la pause" : "🟢 Votre boutique accepte les commandes"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleVacation}
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            border: "none",
            background: isVacationMode ? "var(--accent-warm)" : "rgba(45, 106, 79, 0.12)",
            color: isVacationMode ? "#FFFFFF" : "#2D6A4F",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {isVacationMode ? "En Pause" : "Actif ✓"}
        </button>
      </div>

      {/* Menu List matching Client App Profile View */}
      <div className="artisan-card" style={{ padding: "6px 0" }}>
        {/* 1. Retours Clients 7j */}
        <button
          onClick={onOpenReturns}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RotateCcw size={16} color="var(--accent-premium)" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
                Retours Clients & Forclusion 17j (Art. 13)
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                Confirmation sous 48h et forclusion des fonds
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {pendingReturns > 0 && <span className="nav-badge" style={{ position: "static" }}>{pendingReturns}</span>}
            <ChevronRight size={16} color="var(--text-secondary)" />
          </div>
        </button>

        {/* 2. Litiges & Médiation 48h */}
        <button
          onClick={onOpenDisputes}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(220,53,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={16} color="#DC3545" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
                Médiation & Litiges (48h - Art. 20)
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                Défense contradictoire d'atelier et preuves
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {openDisputes > 0 && <span className="nav-badge" style={{ position: "static" }}>{openDisputes}</span>}
            <ChevronRight size={16} color="var(--text-secondary)" />
          </div>
        </button>

        {/* 3. Santé Boutique & Compteur Avertissements */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: isSuspended ? "rgba(220,53,69,0.1)" : "rgba(45,106,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isSuspended ? <ShieldAlert size={16} color="#DC3545" /> : <ShieldCheck size={16} color="#2D6A4F" />}
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
                Santé Boutique : {warningCount} / 10 avertissements
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                {warningCount < 5 ? "Statut conforme ✓ Réinitialisation mensuelle" : "Seuil critique (Art. 19.3)"}
              </p>
            </div>
          </div>
          <span className={`badge-pill ${warningCount >= 5 ? "badge-urgent" : "badge-success"}`}>
            {warningCount >= 5 ? "Alerte" : "Conforme"}
          </span>
        </div>

        {/* 4. Coordonnées & Paramètres */}
        <button
          onClick={() => setShowSettingsForm(!showSettingsForm)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(26,42,58,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={16} color="var(--primary)" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
                Coordonnées de Ramassage Sendit & RIB
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                Adresse atelier, téléphone livreur, RIB 24ch
              </p>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-secondary)" />
        </button>

        {/* 5. Conditions Générales Vendeur */}
        <button
          onClick={() => setShowCgvModal(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(26,42,58,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} color="var(--primary)" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
                Conditions Générales Vork Vendeur (CGV)
              </p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                Séquestre, Sendit, rétractation et arbitrage (26 pages)
              </p>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Settings Form Modal Sheet */}
      {showSettingsForm && (
        <form onSubmit={handleSave} className="artisan-card" style={{ display: "flex", flexDirection: "column", gap: 10, border: "1.5px solid var(--primary)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
            ✏️ Modifier les Paramètres Atelier
          </h4>

          <div>
            <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Téléphone livreur Sendit *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>Adresse exacte de ramassage *</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 2 }}>RIB marocain (24 chiffres) *</label>
            <input
              type="text"
              maxLength={24}
              required
              value={defaultRib}
              onChange={(e) => setDefaultRib(e.target.value.replace(/\D/g, ""))}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => setShowSettingsForm(false)} className="btn-mobile-outline" style={{ flex: 1 }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-mobile-primary" style={{ flex: 2 }}>
              <Check size={16} />
              <span>{saving ? "Sauvegarde..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      )}

      {/* CGV Modal */}
      {showCgvModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#FCFBF9",
            width: "100%",
            maxWidth: 440,
            maxHeight: "80vh",
            borderRadius: "24px 24px 0 0",
            padding: "20px 20px 32px",
            overflowY: "auto",
            boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
          }}>
            <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--primary)", marginBottom: 10 }}>
              Règles d'Or Maâlem (CGV Vork)
            </h3>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 10 }}>
              <p><strong>1. Délai d'Acceptation (&lt;72h - Art. 6.1) :</strong> Tout retard de plus de 48h déclenche une relance J+2, et à 72h l'annulation avec avertissement vendeur.</p>
              <p><strong>2. 4 Photos de Préparation (Art. 8.1) :</strong> Obligation de photographier la pièce finie sous 4 angles avant fermeture du carton pour vous protéger.</p>
              <p><strong>3. Expédition Sendit en 2 Étapes (Art. 8.3) :</strong> Étape 1 (Génération du Bon) ➡️ Étape 2 (Photo du carton étiqueté).</p>
              <p><strong>4. Produits Sur-Mesure (Art. 9.3 & 11.5) :</strong> Livraison directe et bordereau manuscrit signé par le client obligatoire pour débloquer les fonds.</p>
            </div>
            <button onClick={() => setShowCgvModal(false)} className="btn-mobile-primary" style={{ marginTop: 16 }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
