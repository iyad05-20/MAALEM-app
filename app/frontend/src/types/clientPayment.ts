export type ProductType = "standard" | "personnalise";

export type OrderStatus =
  | "en_attente_paiement"
  | "paiement_initie"
  | "paiement_echoue"
  | "acompte_verse"
  | "payee_integralement"
  | "en_preparation"
  | "pret_a_expedier"
  | "en_cours_de_transport"
  | "livre"
  | "auto_valide"
  | "livre_reserve_bloquee"
  | "en_reclamation"
  | "litige_post_liberation"
  | "retour_initie"
  | "complete"
  | "annulee";

export interface ClientOrder {
  id: string;
  clientRef: string;
  artisanRef: string;
  artisanName?: string;
  productTitle?: string;
  productImage?: string;
  totalPrice: number;
  productType: ProductType;
  status: OrderStatus;
  createdAt: string;
  acceptedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  autoValidatedAt?: string | null;
  returnInitiatedAt?: string | null;
  depositAmount?: number;
  tranche?: "total_100" | "acompte_50";
  carrierChoice?: "sendit" | "propres_moyens" | null;
  trackingNumber?: string | null;
  returnShippingFee?: number;
  returnStatus?: "initie" | "valide" | "refuse" | null;
  disputeReason?: string | null;
  disputeStatus?: "ouvert" | "resolu" | null;
  senditDeliveryCode?: string | null;
  pickupDistrictId?: number | null;
  deliveryDistrictId?: number | null;
  allowOpen?: number | null;
  allowTry?: number | null;
  counterUnreachable?: number | null;
  proofImage?: string | null;
}

export interface WalletTransaction {
  id: string;
  type: string;
  montant: number;
  compteDebit: string;
  compteCredit: string;
  createdAt: string;
  metadata?: string;
}

export interface ClientWallet {
  userId: string;
  balance: number;
  pendingWithdrawals: number;
  transactions: WalletTransaction[];
}
