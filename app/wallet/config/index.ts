export const WALLET_CONFIG = {
  // Payment Gateway configurations
  PAYMENT_GATEWAY: {
    API_ENDPOINT: process.env.NEXT_PUBLIC_PAYMENT_API || '/api/payment',
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Supported payment methods
  PAYMENT_METHODS: {
    UPI: {
      enabled: true,
      providers: ['googlepay', 'phonepe', 'paytm'],
    },
    CARD: {
      enabled: true,
      types: ['credit', 'debit'],
    },
    NETBANKING: {
      enabled: true,
    },
    CRYPTO: {
      enabled: true,
      networks: ['ethereum', 'solana', 'polygon'],
    },
  },

  // UI configurations
  UI: {
    ANIMATIONS: true,
    THEME: {
      PRIMARY_COLOR: '#3B82F6', // blue-500
      SECONDARY_COLOR: '#1F2937', // gray-800
    },
  },
}
