// Extend Window interface without conflicting with existing declarations
interface CustomWindow {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{
      publicKey: {
        toString: () => string;
      };
    }>;
    disconnect: () => Promise<void>;
  };
}

declare global {
  interface Window extends CustomWindow {}
}

export type PaymentType = 'upi' | 'card' | 'netbanking' | 'crypto';

export interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  description?: string;
}

export interface UPIDetails extends PaymentDetails {
  upiId: string;
  merchantId: string;
}

export interface CardDetails extends PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

export interface NetbankingDetails extends PaymentDetails {
  bankCode: string;
  accountNumber: string;
}

export interface CryptoDetails extends PaymentDetails {
  walletAddress: string;
  network: string;
  currency: 'ETH' | 'SOL' | 'BTC';
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string | null;
  message: string;
  status?: 'pending' | 'completed' | 'failed';
  timestamp?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    method: PaymentType;
  };
}

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';
