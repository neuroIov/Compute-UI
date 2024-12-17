import { DEV_CONFIG } from '../config/dev';

export class ValidationService {
  static validateUPIId(upiId: string): { isValid: boolean; error?: string } {
    if (!upiId) {
      return { isValid: false, error: 'UPI ID is required' };
    }

    if (!DEV_CONFIG.VALIDATION.UPI.ID_REGEX.test(upiId)) {
      return { isValid: false, error: DEV_CONFIG.ERROR_MESSAGES.INVALID_UPI };
    }

    return { isValid: true };
  }

  static validateCardDetails(details: {
    cardNumber: string;
    cvv: string;
    expiryDate: string;
  }): { isValid: boolean; error?: string } {
    const { cardNumber, cvv, expiryDate } = details;

    // Remove spaces from card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (!DEV_CONFIG.VALIDATION.CARD.NUMBER_REGEX.test(cleanCardNumber)) {
      return { isValid: false, error: 'Invalid card number' };
    }

    if (!DEV_CONFIG.VALIDATION.CARD.CVV_REGEX.test(cvv)) {
      return { isValid: false, error: 'Invalid CVV' };
    }

    if (!DEV_CONFIG.VALIDATION.CARD.EXPIRY_REGEX.test(expiryDate)) {
      return { isValid: false, error: 'Invalid expiry date' };
    }

    // Validate expiry date is not in the past
    const [month, year] = expiryDate.split('/');
    const expiryDateTime = new Date(parseInt(year), parseInt(month) - 1);
    if (expiryDateTime < new Date()) {
      return { isValid: false, error: 'Card has expired' };
    }

    return { isValid: true };
  }

  static validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (!amount || amount < DEV_CONFIG.VALIDATION.AMOUNT.MIN) {
      return {
        isValid: false,
        error: `Amount must be at least ₹${DEV_CONFIG.VALIDATION.AMOUNT.MIN}`,
      };
    }

    if (amount > DEV_CONFIG.VALIDATION.AMOUNT.MAX) {
      return {
        isValid: false,
        error: `Amount cannot exceed ₹${DEV_CONFIG.VALIDATION.AMOUNT.MAX}`,
      };
    }

    return { isValid: true };
  }

  static validateBank(bankCode: string): { isValid: boolean; error?: string } {
    const bank = DEV_CONFIG.BANKS.find((b) => b.code === bankCode);

    if (!bank) {
      return { isValid: false, error: 'Invalid bank selected' };
    }

    if (bank.status !== 'active') {
      return { isValid: false, error: DEV_CONFIG.ERROR_MESSAGES.BANK_UNAVAILABLE };
    }

    return { isValid: true };
  }

  // Luhn algorithm for card number validation
  static validateCardLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost digit
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Detect card type based on number
  static detectCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    if (/^2[2-7]/.test(cleanNumber)) return 'Mastercard';
    if (/^62/.test(cleanNumber)) return 'UnionPay';
    if (/^35(?:2[89]|[3-8][0-9])/.test(cleanNumber)) return 'JCB';
    if (/^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$/.test(cleanNumber)) return 'Maestro';
    
    return 'Unknown';
  }
}
