export const DEV_CONFIG = {
  // Simulated processing times (in ms)
  PROCESSING_DELAYS: {
    UPI: 2000,
    CARD: 3000,
    NETBANKING: 4000,
    CRYPTO: 2500,
  },

  // Success rates for different payment methods
  SUCCESS_RATES: {
    UPI: 0.95, // 95% success
    CARD: 0.90, // 90% success
    NETBANKING: 0.85, // 85% success
    CRYPTO: 0.80, // 80% success
  },

  // Validation rules
  VALIDATION: {
    UPI: {
      ID_REGEX: /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/,
      MIN_LENGTH: 8,
      MAX_LENGTH: 50,
    },
    CARD: {
      NUMBER_REGEX: /^[0-9]{16}$/,
      CVV_REGEX: /^[0-9]{3,4}$/,
      EXPIRY_REGEX: /^(0[1-9]|1[0-2])\/20[2-9][0-9]$/,
    },
    AMOUNT: {
      MIN: 1,
      MAX: 100000,
    },
  },

  // Mock bank list for netbanking
  BANKS: [
    { code: 'SBI', name: 'State Bank of India', status: 'active' },
    { code: 'HDFC', name: 'HDFC Bank', status: 'active' },
    { code: 'ICICI', name: 'ICICI Bank', status: 'active' },
    { code: 'AXIS', name: 'Axis Bank', status: 'active' },
    { code: 'KOTAK', name: 'Kotak Mahindra Bank', status: 'active' },
    { code: 'YES', name: 'Yes Bank', status: 'maintenance' },
    { code: 'PNB', name: 'Punjab National Bank', status: 'active' },
  ],

  // Simulated error messages
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    INVALID_AMOUNT: 'Invalid amount. Please enter an amount between ₹1 and ₹100,000.',
    INVALID_UPI: 'Invalid UPI ID format.',
    INVALID_CARD: 'Invalid card details.',
    BANK_UNAVAILABLE: 'Selected bank is temporarily unavailable.',
    INSUFFICIENT_BALANCE: 'Insufficient balance.',
    GENERAL: 'Something went wrong. Please try again.',
  },

  // Simulated transaction statuses
  TRANSACTION_STATUS: {
    INITIATED: 'initiated',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
};
