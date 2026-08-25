import React, { useState } from "react";
import { User, Phone, MapPin, Landmark, Sun, Moon, Check, Award, Star, TrendingUp } from "lucide-react";
import type { ArtisanProfileDetails, ArtisanStats, ArtisanProfileHealth } from "../types/artisanTypes";

interface ArtisanProfileViewProps {
  profileDetails: ArtisanProfileDetails | null;
  health: ArtisanProfileHealth | null;
  stats: ArtisanStats | null;
  onUpdateProfile: (details: Partial<ArtisanProfileDetails>) => Promise<void>;
}

export const ArtisanProfileView: React.FC<ArtisanProfileViewProps> = ({
  profileDetails,
  health,
  stats,
  onUpdateProfile,
}) => {
  const [phone, setPhone] = useState(profileDetails?.phone || "06 61 23 45 67");
  const [pickupAddress, setPickupAddress] = useState(profileDetails?.pickupAddress || "Derb El Miter, N° 14, Médina de Fès");
  const [defaultRib, setDefaultRib] = useState(profileDetails?.defaultRib || "230780000123456789012345");
  const [bio, setBio] = useState(profileDetails?.bio || "Maître artisan issu de la médina de Fès avec plus de 22 ans de savoir-faire.");
  const [isVacationMode, setIsVacationMode] = useState(profileDetails?.isVacationMode || false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

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
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || "Erreur sauvegarde profil.");
    } finally {
      setSaving(false);
    }
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
              {profileDetails?.specialty || "Céramique & Cuir Fassi"} · {profileDetails?.yearsOfExperience || 22} ans d'expérience
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
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Taux Acceptation</p>
            <strong style={{ fontSize: 13, color: "#34D399" }}>
              {stats?.acceptanceRate || 100}%
            </strong>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Délai Expédition</p>
            <strong style={{ fontSize: 13, color: "#FFFFFF" }}>
              ~{stats?.averageShippingDays || 3} jours
            </strong>
          </div>
        </div>
      </div>

      {/* Vacation Mode Toggle */}
      <div className="artisan-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: "0 0 2px" }}>
            Mode Congés / Pause Atelier
          </h4>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
            Masque temporairement vos créations pour éviter de nouvelles commandes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsVacationMode(!isVacationMode)}
          style={{
            padding: "8px 14px",
            borderRadius: 14,
            border: "none",
            background: isVacationMode ? "var(--accent-warm)" : "rgba(0,0,0,0.06)",
            color: isVacationMode ? "#FFFFFF" : "var(--text-secondary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isVacationMode ? "🏖️ En Pause" : "🟢 Actif"}
        </button>
      </div>

      {/* Logistics & Bank Settings Form */}
      <form onSubmit={handleSave} className="artisan-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)", margin: 0 }}>
          📦 Paramètres de Ramassage Sendit & RIB
        </h4>

        <div>
          <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
            <Phone size={12} /> Téléphone de contact livreur Sendit *
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
            <MapPin size={12} /> Adresse exacte de ramassage atelier (Art. 8.3) *
          </label>
          <input
            type="text"
            required
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
            <Landmark size={12} /> Relevé d'Identité Bancaire (RIB 24 chiffres - Art. 15) *
          </label>
          <input
            type="text"
            maxLength={24}
            required
            value={defaultRib}
            onChange={(e) => setDefaultRib(e.target.value.replace(/\D/g, ""))}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12, letterSpacing: 0.5 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", marginBottom: 3 }}>
            Histoire & Présentation de l'Atelier
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-primary)", fontSize: 12 }}
          />
        </div>

        {savedMsg && (
          <div style={{ background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.25)", color: "#2D6A4F", padding: "8px 12px", borderRadius: 10, fontSize: 11, textAlign: "center", fontWeight: 700 }}>
            ✓ Coordonnées et paramètres enregistrés avec succès !
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-mobile-primary" style={{ marginTop: 4 }}>
          <Check size={16} />
          <span>{saving ? "Enregistrement..." : "Enregistrer mes Informations"}</span>
        </button>
      </form>
    </div>
  );
};
