// Payment Types
export type PaymentType = 'upi' | 'card' | 'netbanking' | 'crypto';

// Wallet States
export interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

// Payment Method Types
export type UPIDetails = {
  id: string;
};

export type CardDetails = {
  number: string;
  expiry: string;
  cvv: string;
};

export type NetbankingDetails = {
  bank: string;
};

export type CryptoDetails = {
  wallet: string;
  network: string;
};

export interface PaymentDetails {
  upi?: UPIDetails;
  card?: CardDetails;
  netbanking?: NetbankingDetails;
  crypto?: CryptoDetails;
}
