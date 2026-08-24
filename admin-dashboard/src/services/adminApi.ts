import type { 
  AdminStats, 
  DisputeDossier, 
  VendorProfile, 
  VendorWarning, 
  WithdrawalRequest, 
  LedgerEntry, 
  CronExecution 
} from "../types/adminTypes";

const API_BASE = "http://localhost:3001/api/admin";
const CRON_BASE = "http://localhost:3001/api/cron";

export const adminAPI = {
  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération KPIs.");
    return data.stats;
  },

  async getDisputes(): Promise<DisputeDossier[]> {
    const res = await fetch(`${API_BASE}/disputes`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération litiges.");
    return data.disputes;
  },

  async getDisputeDetail(id: string): Promise<{ dispute: DisputeDossier; order: any }> {
    const res = await fetch(`${API_BASE}/disputes/${id}`);
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
    const res = await fetch(`${API_BASE}/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionType, arbitrationDecision, arbitrationAmount }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de l'enregistrement de l'arbitrage.");
    return data;
  },

  async getVendors(): Promise<{ profiles: VendorProfile[]; warnings: VendorWarning[] }> {
    const res = await fetch(`${API_BASE}/vendors`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération profils vendeurs.");
    return data;
  },

  async issueVendorWarning(vendorId: string, reason: string, orderId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/warning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, orderId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de l'émission de l'avertissement.");
    return data;
  },

  async updateVendorStatus(vendorId: string, suspensionStatus: string, suspendedUntil?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspensionStatus, suspendedUntil }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur mise à jour statut boutique.");
    return data;
  },

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    const res = await fetch(`${API_BASE}/withdrawals`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération retraits.");
    return data.requests;
  },

  async processWithdrawal(id: string, status: "processed" | "rejected"): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/withdrawals/${id}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur traitement virement.");
    return data;
  },

  async getLedger(): Promise<LedgerEntry[]> {
    const res = await fetch(`${API_BASE}/ledger`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération Grand Livre.");
    return data.entries;
  },

  async getLogistics(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/logistics`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur récupération expéditions.");
    return data.orders;
  },

  async getCronStatus(): Promise<CronExecution[]> {
    const res = await fetch(`${CRON_BASE}/status`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur status Cron.");
    return data.executions;
  },

  async triggerCron(jobName: string = "run-all"): Promise<any> {
    const endpoint = jobName === "run-all" ? `${CRON_BASE}/run-all` : `${CRON_BASE}/run/${jobName}`;
    const res = await fetch(endpoint, { method: "POST" });
    return res.json();
  }
};
