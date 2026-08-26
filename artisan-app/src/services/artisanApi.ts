import type { 
  ArtisanOrder, 
  ArtisanReturn, 
  ArtisanDispute, 
  ArtisanWallet, 
  ArtisanProfileHealth, 
  ArtisanProduct,
  ArtisanNotification,
  ArtisanProfileDetails,
  ArtisanStats,
  CustomOrderRequest
} from "../types/artisanTypes";

export function getBackendUrl(): string {
  const custom = localStorage.getItem("artisan_target_backend_url");
  if (custom && custom.trim()) {
    return custom.replace(/\/$/, "");
  }
  const envUrl = ((import.meta as any).env?.VITE_BACKEND_URL as string) || "http://localhost:3001/api";
  return envUrl.replace(/\/$/, "");
}

export function setBackendUrl(url: string) {
  if (!url || url.trim() === "http://localhost:3001/api") {
    localStorage.removeItem("artisan_target_backend_url");
  } else {
    localStorage.setItem("artisan_target_backend_url", url.trim());
  }
}

const getApiBase = () => `${getBackendUrl()}/artisan`;

export const artisanAPI = {
  async getOrders(artisanRef = "artisan-1"): Promise<ArtisanOrder[]> {
    const res = await fetch(`${getApiBase()}/orders?artisanRef=${artisanRef}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération commandes.");
    return data.orders;
  },

  async acceptOrder(orderId: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/accept`, { method: "POST" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de l'acceptation.");
    return data;
  },

  async refuseOrder(orderId: string, reason: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/refuse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors du refus.");
    return data;
  },

  async uploadPrepPhotos(orderId: string, photos: string[]): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/prep-photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur upload photos.");
    return data;
  },

  async shipSenditStep1(orderId: string, deliveryData: any): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/ship-sendit-step1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deliveryData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur étape 1 Sendit.");
    return data;
  },

  async shipSenditStep2(orderId: string, blAttachedPhoto: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/ship-sendit-step2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blAttachedPhoto }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur étape 2 Sendit.");
    return data;
  },

  async shipVendeur(orderId: string, transportDurationDays: number = 7): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/ship-vendeur`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportDurationDays }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur expédition directe.");
    return data;
  },

  async completeVendeurDelivery(orderId: string, signaturePhoto: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/orders/${orderId}/complete-delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signaturePhoto }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur validation livraison.");
    return data;
  },

  async getReturns(): Promise<ArtisanReturn[]> {
    const res = await fetch(`${getApiBase()}/returns`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération retours.");
    return data.returns;
  },

  async confirmReturn(returnId: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/returns/${returnId}/confirm`, { method: "POST" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur validation retour.");
    return data;
  },

  async getDisputes(): Promise<ArtisanDispute[]> {
    const res = await fetch(`${getApiBase()}/disputes`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération litiges.");
    return data.disputes;
  },

  async respondDispute(disputeId: string, artisanResponse: string, artisanEvidencePhotos: string[] = []): Promise<any> {
    const res = await fetch(`${getApiBase()}/disputes/${disputeId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanResponse, artisanEvidencePhotos }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur envoi réponse litige.");
    return data;
  },

  async getWallet(artisanRef = "artisan-1"): Promise<ArtisanWallet> {
    const res = await fetch(`${getApiBase()}/wallet?artisanRef=${artisanRef}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération portefeuille.");
    return data.wallet;
  },

  async requestWithdrawal(amount: number, rib: string, artisanRef = "artisan-1"): Promise<any> {
    const res = await fetch(`${getApiBase()}/wallet/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanRef, amount, rib }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur demande de virement.");
    return data;
  },

  async getProfileHealth(artisanRef = "artisan-1"): Promise<{ profile: ArtisanProfileHealth; warnings: any[] }> {
    const res = await fetch(`${getApiBase()}/profile/health?artisanRef=${artisanRef}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur statut boutique.");
    return { profile: data.profile, warnings: data.warnings || [] };
  },

  async getNotifications(artisanRef = "artisan-1"): Promise<ArtisanNotification[]> {
    const res = await fetch(`${getApiBase()}/notifications?artisanRef=${artisanRef}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur notifications.");
    return data.notifications;
  },

  async getProfileDetails(): Promise<ArtisanProfileDetails> {
    const res = await fetch(`${getApiBase()}/profile/details`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur profil.");
    return data.profileDetails;
  },

  async updateProfileDetails(details: Partial<ArtisanProfileDetails>): Promise<ArtisanProfileDetails> {
    const res = await fetch(`${getApiBase()}/profile/details`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur mise à jour profil.");
    return data.profileDetails;
  },

  async getStats(artisanRef = "artisan-1"): Promise<ArtisanStats> {
    const res = await fetch(`${getApiBase()}/stats?artisanRef=${artisanRef}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur statistiques.");
    return data.stats;
  },

  async getProducts(): Promise<ArtisanProduct[]> {
    const res = await fetch(`${getApiBase()}/products`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur catalogue.");
    return data.products;
  },

  async createProduct(productData: any): Promise<any> {
    const res = await fetch(`${getApiBase()}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur création produit.");
    return data;
  },

  async getCustomRequests(category = "Toutes"): Promise<CustomOrderRequest[]> {
    const res = await fetch(`${getApiBase()}/custom-requests?category=${encodeURIComponent(category)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur marché sur-mesure.");
    return data.requests;
  },

  async submitCustomQuote(requestId: string, proposedPrice: number, confectionDays: number, note: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/custom-requests/${requestId}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposedPrice, confectionDays, note }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur soumission devis.");
    return data;
  }
};
