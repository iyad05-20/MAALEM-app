import type { 
  AdminStats, 
  DisputeDossier, 
  VendorProfile, 
  VendorWarning, 
  WithdrawalRequest, 
  LedgerEntry, 
  CronExecution 
} from "../types/adminTypes";

export function getBackendUrl(): string {
  const custom = localStorage.getItem("admin_target_backend_url");
  if (custom && custom.trim()) {
    return custom.replace(/\/$/, "");
  }
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001/api";
  return envUrl.replace(/\/$/, "");
}

export function setBackendUrl(url: string) {
  if (!url || url.trim() === "http://localhost:3001/api") {
    localStorage.removeItem("admin_target_backend_url");
  } else {
    localStorage.setItem("admin_target_backend_url", url.trim());
  }
}

const getApiBase = () => `${getBackendUrl()}/admin`;
const getCronBase = () => `${getBackendUrl()}/cron`;

export const adminAPI = {
  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${getApiBase()}/stats`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération KPIs.");
    return data.stats;
  },

  async getDisputes(): Promise<DisputeDossier[]> {
    const res = await fetch(`${getApiBase()}/disputes`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération litiges.");
    return data.disputes;
  },

  async getDisputeDetail(id: string): Promise<{ dispute: DisputeDossier; order: any }> {
    const res = await fetch(`${getApiBase()}/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération dossier de litige.");
    return data;
  },

  async resolveDispute(
    id: string, 
    resolutionType: "refund_total" | "refund_partial" | "replacement" | "rejected", 
    arbitrationDecision: string, 
    arbitrationAmount: number = 0
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionType, arbitrationDecision, arbitrationAmount }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de l'enregistrement de l'arbitrage.");
    return data;
  },

  async getVendors(): Promise<{ profiles: VendorProfile[]; warnings: VendorWarning[] }> {
    const res = await fetch(`${getApiBase()}/vendors`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération profils vendeurs.");
    return data;
  },

  async issueVendorWarning(vendorId: string, reason: string, orderId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/vendors/${vendorId}/warning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, orderId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de l'émission de l'avertissement.");
    return data;
  },

  async updateVendorStatus(vendorId: string, suspensionStatus: string, suspendedUntil?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/vendors/${vendorId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspensionStatus, suspendedUntil }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur mise à jour statut boutique.");
    return data;
  },

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    const res = await fetch(`${getApiBase()}/withdrawals`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération retraits.");
    return data.requests;
  },

  async processWithdrawal(id: string, status: "processed" | "rejected"): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/withdrawals/${id}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur traitement virement.");
    return data;
  },

  async getLedger(): Promise<LedgerEntry[]> {
    const res = await fetch(`${getApiBase()}/ledger`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération Grand Livre.");
    return data.entries;
  },

  async getLogistics(): Promise<any[]> {
    const res = await fetch(`${getApiBase()}/logistics`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération expéditions.");
    return data.orders;
  },

  async getCronStatus(): Promise<CronExecution[]> {
    const res = await fetch(`${getCronBase()}/status`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur status Cron.");
    return data.executions;
  },

  async triggerCron(jobName: string = "run-all"): Promise<any> {
    const endpoint = jobName === "run-all" ? `${getCronBase()}/run-all` : `${getCronBase()}/run/${jobName}`;
    const res = await fetch(endpoint, { method: "POST" });
    return res.json();
  },

  async getDbMode(): Promise<{ success: boolean; activeMode: "dev" | "prod"; sqlite: any; supabase: any }> {
    const res = await fetch(`${getApiBase()}/config/db-mode`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur statut BDD.");
    return data;
  },

  async setDbMode(mode: "dev" | "prod"): Promise<any> {
    const res = await fetch(`${getApiBase()}/config/db-mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur bascule BDD.");
    return data;
  },

  async simulateSenditWebhook(payload: any): Promise<any> {
    const res = await fetch(`${getBackendUrl()}/webhooks/sendit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sendit-signature": "dummy_signature",
      },
      body: JSON.stringify({
        event: "delivery.status.update",
        ...payload,
      }),
    });
    return res.json();
  }
};

