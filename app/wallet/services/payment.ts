import { PaymentDetails, PaymentResponse, UPIDetails, CardDetails, NetbankingDetails, CryptoDetails } from '../types';
import { ValidationService } from './validation';
import { DEV_CONFIG } from '../config/dev';

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  method: 'upi' | 'card' | 'netbanking' | 'crypto';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  details: {
    paymentId: string;
    currency: string;
    description?: string;
  };
}

class PaymentService {
  private transactions: WalletTransaction[] = [];

  private generateTransactionId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  private simulatePaymentProcess = async (
    method: 'UPI' | 'CARD' | 'NETBANKING' | 'CRYPTO',
    amount: number
  ): Promise<PaymentResponse> => {
    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, DEV_CONFIG.PROCESSING_DELAYS[method])
    );

    // Simulate success/failure based on configured rates
    const isSuccessful = Math.random() < DEV_CONFIG.SUCCESS_RATES[method];

    // Simulate random failures
    if (!isSuccessful) {
      const errors = [
        DEV_CONFIG.ERROR_MESSAGES.NETWORK,
        DEV_CONFIG.ERROR_MESSAGES.TIMEOUT,
        DEV_CONFIG.ERROR_MESSAGES.INSUFFICIENT_BALANCE,
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }

    const transactionId = this.generateTransactionId();

    // Record successful transaction
    this.recordTransaction({
      id: transactionId,
      amount,
      type: 'credit',
      method: method.toLowerCase() as any,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        paymentId: transactionId,
        currency: 'INR',
      },
    });

    return {
      success: true,
      transactionId,
      message: 'Payment processed successfully',
      status: 'completed',
      timestamp: new Date().toISOString(),
      paymentDetails: {
        amount,
        currency: 'INR',
        method: method.toLowerCase() as any,
      },
    };
  };

  private recordTransaction(transaction: WalletTransaction) {
    this.transactions.push(transaction);
    // In development, log to console
    console.log('Transaction recorded:', transaction);
  }

  async processUPIPayment(details: UPIDetails): Promise<PaymentResponse> {
    // Validate UPI ID
    const upiValidation = ValidationService.validateUPIId(details.upiId);
    if (!upiValidation.isValid) {
      throw new Error(upiValidation.error);
    }

    // Validate amount
    const amountValidation = ValidationService.validateAmount(details.amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    return this.simulatePaymentProcess('UPI', details.amount);
  }

  async processCardPayment(details: CardDetails): Promise<PaymentResponse> {
    // Validate card details
    const cardValidation = ValidationService.validateCardDetails({
      cardNumber: details.cardNumber,
      cvv: details.cvv,
      expiryDate: details.expiryDate,
    });
    if (!cardValidation.isValid) {
      throw new Error(cardValidation.error);
    }

    // Validate amount
    const amountValidation = ValidationService.validateAmount(details.amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    // Additional Luhn algorithm validation
    if (!ValidationService.validateCardLuhn(details.cardNumber)) {
      throw new Error('Invalid card number (failed checksum)');
    }

    return this.simulatePaymentProcess('CARD', details.amount);
  }

  async processNetbankingPayment(details: NetbankingDetails): Promise<PaymentResponse> {
    // Validate bank selection
    const bankValidation = ValidationService.validateBank(details.bankCode);
    if (!bankValidation.isValid) {
      throw new Error(bankValidation.error);
    }

    // Validate amount
    const amountValidation = ValidationService.validateAmount(details.amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    return this.simulatePaymentProcess('NETBANKING', details.amount);
  }

  async processCryptoPayment(details: CryptoDetails): Promise<PaymentResponse> {
    // Validate amount
    const amountValidation = ValidationService.validateAmount(details.amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error);
    }

    // Validate wallet address (basic check)
    if (!details.walletAddress || details.walletAddress.length < 26) {
      throw new Error('Invalid wallet address');
    }

    return this.simulatePaymentProcess('CRYPTO', details.amount);
  }

  async getTransactionHistory(): Promise<WalletTransaction[]> {
    return this.transactions;
  }

  async getWalletBalance(): Promise<number> {
    return this.transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'credit' ? transaction.amount : -transaction.amount);
    }, 0);
  }
}

export const paymentService = new PaymentService();
