import { PaymentType, PaymentDetails, WalletState, PaymentResponse } from '../types';
import { WALLET_CONFIG } from '../config';

export class WalletService {
  static async connectWallet(type: 'metamask' | 'phantom'): Promise<WalletState> {
    try {
      if (type === 'metamask' && window.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return {
          isAvailable: true,
          isConnected: true,
          address: accounts[0],
          error: null,
        };
      } else if (type === 'phantom' && window.solana?.isPhantom) {
        const resp = await window.solana.connect();
        return {
          isAvailable: true,
          isConnected: true,
          address: resp.publicKey.toString(),
          error: null,
        };
      }
      throw new Error(`${type} wallet not found`);
    } catch (err) {
      const error = err as Error;
      return {
        isAvailable: false,
        isConnected: false,
        address: null,
        error: error.message || 'Failed to connect wallet',
      };
    }
  }

  static async processPayment(
    amount: number,
    paymentType: PaymentType,
    details: PaymentDetails
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(WALLET_CONFIG.PAYMENT_GATEWAY.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentType,
          details,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        transactionId: null,
        message: error.message || 'Payment processing failed',
        status: 'failed',
        paymentDetails: {
          amount,
          currency: details.currency,
          method: paymentType
        }
      };
    }
  }
}
