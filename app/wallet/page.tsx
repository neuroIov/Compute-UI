'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethodButton } from "./components/PaymentMethodButton";

// Import wallet assets
import cardIcon from './assets/card-icon.svg';
import upiIcon from './assets/upi-icon.svg';
import bankIcon from './assets/bank-icon.svg';
import cryptoIcon from './assets/crypto-icon.svg';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import { PaymentStatus, PaymentResponse } from './types';
import { paymentService } from './services/payment';
import './wallet.css';

// Extend Window interface to include Phantom only
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
      };
    };
  }
}

// Type for ethereum provider
interface EthereumProvider {
  request: (args: { method: string }) => Promise<string[]>;
  isMetaMask?: boolean;
}

interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

const initialWalletStates: Record<string, WalletState> = {
  metamask: {
    isAvailable: false,
    isConnected: false,
    address: null,
    error: null
  },
  phantom: {
    isAvailable: false,
    isConnected: false,
    address: null,
    error: null
  }
};

const WalletPage = () => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [walletStates, setWalletStates] = useState(initialWalletStates);
  const [isPaymentModesOpen, setIsPaymentModesOpen] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<{
    type: 'metamask' | 'phantom' | null;
    address: string | null;
  }>({ type: null, address: null });
  const [mounted, setMounted] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(2);
  const [cardType, setCardType] = useState<{
    brand: string;
    type: 'credit' | 'debit' | null;
    variant: string;
  }>({ brand: '', type: null, variant: '' });
  const [upiId, setUpiId] = useState('');
  const [upiVerificationStatus, setUpiVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'upi' | 'card' | 'netbanking' | 'crypto' | null>(null);
  const [activeTab, setActiveTab] = useState<'payment' | 'amount'>('payment');

  const calculateBatteryLevel = (balance: number) => {
    return Math.min(Math.floor(balance / 10), 10);
  };

  const batteryLevelValue = calculateBatteryLevel(walletBalance);

  const getBatteryColor = (level: number) => {
    if (level <= 1) return 'bg-red-500';
    if (level <= 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet({ type: 'metamask', address: accounts[0] });
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const connectPhantom = async () => {
    if (typeof window.solana !== 'undefined') {
      try {
        const response = await window.solana.connect();
        setConnectedWallet({ type: 'phantom', address: response.publicKey.toString() });
      } catch (error) {
        console.error('Error connecting to Phantom:', error);
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet({ type: null, address: null });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const detectCardType = (cardNumber: string) => {
    // Remove spaces and dashes
    const number = cardNumber.replace(/[\s-]/g, '');
    
    let brand = '';
    let variant = '';
    
    // Visa
    if (/^4/.test(number)) {
      brand = 'Visa';
      variant = number.length === 16 ? 'Classic' : 'Infinite';
    }
    // Mastercard
    else if (/^5[1-5]/.test(number)) {
      brand = 'Mastercard';
      variant = 'World';
    }
    // American Express
    else if (/^3[47]/.test(number)) {
      brand = 'American Express';
      variant = 'Platinum';
    }
    // Discover
    else if (/^6011/.test(number)) {
      brand = 'Discover';
      variant = 'It';
    }
    // RuPay
    else if (/^6[0-9]{15}/.test(number)) {
      brand = 'RuPay';
      variant = 'Platinum';
    }

    setCardType(prev => ({
      ...prev,
      brand,
      variant
    }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCardNumber(value);
    e.target.value = formattedValue;
    detectCardType(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = formatExpiryDate(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substr(0, 3);
  };

  const formatCardNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    const groups = number.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (number.length >= 2) {
      return number.substr(0, 2) + '/' + number.substr(2, 4);
    }
    return number;
  };

  const validateUpiId = (upiId: string) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upiId);
  };

  const handleUpiVerification = () => {
    setUpiVerificationStatus('verifying');
    
    // Simulate verification process
    setTimeout(() => {
      if (validateUpiId(upiId)) {
        setUpiVerificationStatus('success');
      } else {
        setUpiVerificationStatus('error');
      }
    }, 1500);
  };

  const updateWalletBalance = (amount: number) => {
    setWalletBalance(prevBalance => {
      const newBalance = prevBalance + amount;
      // Update battery level
      const newBatteryLevel = calculateBatteryLevel(newBalance);
      setBatteryLevel(newBatteryLevel);
      return newBalance;
    });
  };

  const handlePayment = async (paymentType: 'upi' | 'card' | 'netbanking' | 'crypto') => {
    try {
      setPaymentStatus('processing');
      setPaymentError(null);

      let response: PaymentResponse;

      switch (paymentType) {
        case 'upi':
          response = await paymentService.processUPIPayment({
            upiId,
            amount: paymentAmount,
            currency: 'INR',
            merchantId: 'MERCHANT_001',
          });
          break;

        case 'card':
          response = await paymentService.processCardPayment({
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate,
            cvv,
            cardHolderName: cardName,
            amount: paymentAmount,
            currency: 'INR',
          });
          break;

        case 'netbanking':
          response = await paymentService.processNetbankingPayment({
            bankCode: selectedBank,
            accountNumber: '1234567890', // In real app, this would come from form
            amount: paymentAmount,
            currency: 'INR',
          });
          break;

        case 'crypto':
          response = await paymentService.processCryptoPayment({
            walletAddress: selectedWallet || '',
            amount: paymentAmount,
            currency: 'ETH',
            network: 'ethereum',
          });
          break;

        default:
          throw new Error('Invalid payment type');
      }

      if (response.success) {
        setPaymentStatus('success');
        // Update wallet balance
        updateWalletBalance(paymentAmount);
        // Reset payment amount
        setPaymentAmount(0);
        // Show success message
        toast.success(`Successfully added ₹${paymentAmount} to your wallet!`);
        
        // Reset form fields based on payment type
        switch (paymentType) {
          case 'upi':
            setUpiId('');
            setUpiVerificationStatus('idle');
            break;
          case 'card':
            setCardNumber('');
            setExpiryDate('');
            setCvv('');
            setCardName('');
            break;
          case 'netbanking':
            setSelectedBank('');
            break;
          case 'crypto':
            // Keep wallet connected but reset other fields
            break;
        }
      } else {
        setPaymentStatus('error');
        setPaymentError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setPaymentStatus('error');
      setPaymentError('Payment processing failed. Please try again.');
      toast.error('Payment processing failed');
      console.error('Payment error:', error);
    }
  };

  const handleAddFunds = () => {
    setIsAddFundsOpen(true);
    setSelectedPaymentOption(null);
    setPaymentAmount(0);
    setPaymentStatus('idle');
    setPaymentError(null);
  };

  const closeAddFunds = () => {
    setIsAddFundsOpen(false);
    setSelectedPaymentMode(null);
    setSelectedPaymentOption(null);
    setPaymentAmount(0);
    setPaymentStatus('idle');
    setPaymentError(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const metamaskAvailable = !!window.ethereum;
      const phantomAvailable = !!window.phantom?.solana;

      setWalletStates(prev => ({
        ...prev,
        metamask: { ...prev.metamask, isAvailable: metamaskAvailable },
        phantom: { ...prev.phantom, isAvailable: phantomAvailable }
      }));
    }
  }, [mounted]);

  useEffect(() => {
    if (isCvvFocused) {
      setIsCardFlipped(true);
    } else {
      setIsCardFlipped(false);
    }
  }, [isCvvFocused]);

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '/metamask.svg',
      width: 32,
      height: 32
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '/phantom.svg',
      width: 32,
      height: 32
    }
  ];

  const handleWalletNotListed = () => {
    window.open('https://forms.gle/YourGoogleFormLink', '_blank');
  };

  const handleConnect = async (walletId: string) => {
    if (connecting === walletId) {
      setConnecting(null);
      return;
    }

    try {
      setConnecting(walletId);
      setWalletStates(prev => ({
        ...prev,
        [walletId]: {
          ...prev[walletId],
          error: null,
          isConnected: false
        }
      }));

      switch (walletId) {
        case 'metamask':
          if (window.ethereum) {
            try {
              const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
              });
              
              if (accounts?.[0]) {
                setWalletStates(prev => ({
                  ...prev,
                  metamask: {
                    ...prev.metamask,
                    isConnected: true,
                    address: accounts[0],
                    error: null
                  }
                }));
              }
            } catch (error) {
              setConnecting(null);
              setWalletStates(prev => ({
                ...prev,
                metamask: {
                  ...prev.metamask,
                  isConnected: false,
                  error: 'Failed to connect'
                }
              }));
              
              if ((error as { code?: number })?.code === 4001) {
                console.log('MetaMask: User rejected the request');
              } else {
                console.error('MetaMask error:', error);
              }
              return;
            }
          } else {
            window.open('https://metamask.io/download/', '_blank');
          }
          break;

        case 'phantom':
          if (window.phantom?.solana) {
            try {
              const response = await window.phantom.solana.connect();
              const address = response.publicKey.toString();
              
              setWalletStates(prev => ({
                ...prev,
                phantom: {
                  ...prev.phantom,
                  isConnected: true,
                  address,
                  error: null
                }
              }));
            } catch (error) {
              setWalletStates(prev => ({
                ...prev,
                phantom: {
                  ...prev.phantom,
                  isConnected: false,
                  error: 'Failed to connect'
                }
              }));
              console.error('Phantom error:', error);
            }
          } else {
            window.open('https://phantom.app/', '_blank');
          }
          break;

        default:
          console.error('Wallet not supported');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setWalletStates(prev => ({
        ...prev,
        [walletId]: {
          ...prev[walletId],
          isConnected: false,
          error: 'Failed to connect'
        }
      }));
    } finally {
      setConnecting(null);
    }
  };

  const LowBalanceButton = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="balance-btn">
            Running Low on Balance
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-zinc-800 p-2">
          <button className="menu-option-btn">
            Join Newsletter
          </button>
          <button className="menu-option-btn">
            Coingem Quests
          </button>
          <button className="menu-option-btn">
            Web 3 Carnival
          </button>
          <button className="menu-option-btn">
            Promotions
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const banks = [
    { name: 'State Bank of India', code: 'SBI' },
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'Axis Bank', code: 'AXIS' },
    { name: 'Kotak Mahindra Bank', code: 'KOTAK' },
    { name: 'Punjab National Bank', code: 'PNB' },
    { name: 'Bank of Baroda', code: 'BOB' },
    { name: 'Canara Bank', code: 'CANARA' },
    { name: 'Union Bank of India', code: 'UNION' },
    { name: 'IndusInd Bank', code: 'INDUSIND' },
    { name: 'Yes Bank', code: 'YES' },
    { name: 'IDBI Bank', code: 'IDBI' },
    { name: 'Bank of India', code: 'BOI' },
    { name: 'Central Bank of India', code: 'CBI' },
    { name: 'Indian Bank', code: 'INDIAN' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  if (!mounted) return null;

  return (
    <div className="wallet-container">
      <div className="flex gap-6">
        {/* Left side - Wallet Connection */}
        <div className="flex-1">
          <Card className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800/50 backdrop-blur-xl h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect your wallet</h2>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <Image src="/close.svg" alt="Close" width={24} height={24} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Connect your wallet to start using the platform.</p>

              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <Card 
                    key={wallet.id} 
                    className="relative overflow-hidden bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={wallet.icon}
                            alt={`${wallet.name} icon`}
                            width={wallet.width}
                            height={wallet.height}
                            className="rounded-full"
                          />
                          <span>{wallet.name}</span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {walletStates[wallet.id].isConnected ? (
                          <span className="text-green-600 dark:text-green-500">Connected</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnect(wallet.id)}
                            disabled={connecting === wallet.id}
                            className="bg-white hover:bg-gray-100 dark:bg-transparent dark:hover:bg-zinc-800 text-gray-900 dark:text-white border-gray-200 dark:border-zinc-800"
                          >
                            {connecting === wallet.id ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}

                <div className="text-center pt-4">
                  <button
                    onClick={handleWalletNotListed}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Wallet not listed? Let us know →
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle - Payment Method and Card */}
        <div className="w-[420px] space-y-6">
          <Card className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800/50 backdrop-blur-xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-6 h-6 relative">
                  <Image 
                    src="/card.svg" 
                    alt="Card" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Modes</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Select your preferred payment mode.</p>
              
              <div className="space-y-4">
                <Button 
                  className="w-full payment-modes-btn"
                  onClick={() => setIsPaymentModesOpen(!isPaymentModesOpen)}
                >
                  Payment Modes
                </Button>
                
                <div className={`payment-options ${isPaymentModesOpen ? 'open' : ''}`}>
                  <button 
                    className="payment-option-btn"
                    onClick={() => setSelectedPaymentOption(selectedPaymentOption === 'upi' ? null : 'upi')}
                  >
                    <span>UPI</span>
                  </button>
                  <div className={`payment-option-content ${selectedPaymentOption === 'upi' ? 'open' : ''}`}>
                    <div className="card-form">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button className="upi-option-btn flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#4285F4] transition-colors">
                          <Image
                            src="/googlepay.svg"
                            alt="Google Pay"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                          <span>Google Pay</span>
                        </button>
                        <button className="upi-option-btn flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#002E6E] transition-colors">
                          <Image
                            src="/paytm.svg"
                            alt="Paytm"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                          <span>Paytm</span>
                        </button>
                        <button className="upi-option-btn flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#5F259F] transition-colors">
                          <Image
                            src="/phonepe.svg"
                            alt="PhonePe"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                          <span>PhonePe</span>
                        </button>
                        <button className="upi-option-btn flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#FF9900] transition-colors">
                          <Image
                            src="/amazonpay.svg"
                            alt="Amazon Pay"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                          <span>Amazon Pay</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Enter UPI ID</label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <Input
                                type="text"
                                placeholder="username@upi"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setUpiVerificationStatus('idle');
                                }}
                                className={`w-full bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 ${
                                  upiVerificationStatus === 'error' ? 'border-red-500' : ''
                                } ${upiVerificationStatus === 'success' ? 'border-green-500' : ''}`}
                              />
                              {upiVerificationStatus === 'success' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={handleUpiVerification}
                              disabled={upiVerificationStatus === 'verifying'}
                              className={`${
                                upiVerificationStatus === 'verifying' ? 'opacity-75 cursor-not-allowed' : ''
                              } bg-blue-600 text-white hover:bg-blue-700`}
                            >
                              {upiVerificationStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                            </Button>
                          </div>
                          {upiVerificationStatus === 'error' && (
                            <p className="text-sm text-red-500 mt-1">Invalid UPI ID format</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Amount (INR)</label>
                          <Input
                            type="number"
                            min="1"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800"
                          />
                        </div>
                        <Button 
                          onClick={(e) => {
                            if (selectedPaymentOption && ['upi', 'card', 'netbanking', 'crypto'].includes(selectedPaymentOption)) {
                              handlePayment(selectedPaymentOption as "upi" | "card" | "netbanking" | "crypto");
                            }
                          }}
                          disabled={paymentStatus === 'processing' || !upiId || !paymentAmount}
                          className={`w-full ${
                            paymentStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : ''
                          } bg-blue-600 text-white hover:bg-blue-700`}
                        >
                          {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="payment-option-btn"
                    onClick={() => setSelectedPaymentOption(selectedPaymentOption === 'card' ? null : 'card')}
                  >
                    <span>Credit & Debit Cards</span>
                  </button>
                  <div className={`payment-option-content ${selectedPaymentOption === 'card' ? 'open' : ''}`}>
                    <div className="card-form">
                      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Name on card</label>
                          <Input
                            type="text"
                            placeholder="Olivia Rhye"
                            maxLength={50}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Card number</label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Input
                                type="text"
                                placeholder="1234 1234 1234 1234"
                                maxLength={19}
                                onChange={handleCardNumberChange}
                                className="w-full bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                              />
                              {cardType.brand && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {cardType.brand} {cardType.variant}
                                </p>
                              )}
                            </div>
                            <Input
                              type="text"
                              placeholder="CVV"
                              maxLength={3}
                              onChange={handleCvvChange}
                              className="w-20 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                              onFocus={() => setIsCvvFocused(true)}
                              onBlur={() => setIsCvvFocused(false)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Expiry</label>
                          <Input
                            type="text"
                            placeholder="MM/YYYY"
                            maxLength={7}
                            onChange={handleExpiryChange}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                          />
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1 bg-white hover:bg-gray-100 dark:bg-transparent dark:hover:bg-zinc-800 text-gray-900 dark:text-white border-gray-200 dark:border-zinc-800"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={(e) => {
                              if (selectedPaymentOption && ['upi', 'card', 'netbanking', 'crypto'].includes(selectedPaymentOption)) {
                                handlePayment(selectedPaymentOption as "upi" | "card" | "netbanking" | "crypto");
                              }
                            }}
                            disabled={paymentStatus === 'processing' || !cardNumber || !expiryDate || !cvv || !paymentAmount}
                            className={`flex-1 ${
                              paymentStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : ''
                            } bg-blue-600 text-white hover:bg-blue-700`}
                          >
                            {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <button 
                    className="payment-option-btn"
                    onClick={() => setSelectedPaymentOption(selectedPaymentOption === 'netbanking' ? null : 'netbanking')}
                  >
                    <span>Netbanking</span>
                  </button>
                  <div className={`payment-option-content ${selectedPaymentOption === 'netbanking' ? 'open' : ''}`}>
                    <div className="card-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Bank</label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full rounded-md bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select a bank</option>
                            {banks.map((bank) => (
                              <option key={bank.code} value={bank.code}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button 
                          onClick={(e) => {
                            if (selectedPaymentOption && ['upi', 'card', 'netbanking', 'crypto'].includes(selectedPaymentOption)) {
                              handlePayment(selectedPaymentOption as "upi" | "card" | "netbanking" | "crypto");
                            }
                          }}
                          disabled={paymentStatus === 'processing' || !selectedBank || !paymentAmount}
                          className={`w-full ${
                            paymentStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : ''
                          } bg-blue-600 text-white hover:bg-blue-700`}
                        >
                          {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="payment-option-btn"
                    onClick={() => setSelectedPaymentOption(selectedPaymentOption === 'paypal' ? null : 'paypal')}
                  >
                    <span>PayPal</span>
                  </button>
                  <div className={`payment-option-content ${selectedPaymentOption === 'paypal' ? 'open' : ''}`}>
                    <p className="text-gray-600 dark:text-gray-400">PayPal integration coming soon...</p>
                  </div>

                  <button 
                    className="payment-option-btn"
                    onClick={() => setSelectedPaymentOption(selectedPaymentOption === 'crypto' ? null : 'crypto')}
                  >
                    <span>Crypto</span>
                  </button>
                  <div className={`payment-option-content ${selectedPaymentOption === 'crypto' ? 'open' : ''}`}>
                    {!connectedWallet.type ? (
                      <div className="card-form">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to make crypto payments</p>
                        <div className="space-y-3">
                          <Button 
                            onClick={connectMetaMask}
                            className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white flex items-center justify-center gap-2"
                          >
                            <Image
                              src="/metamask-fox.svg"
                              alt="MetaMask"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                            Connect MetaMask
                          </Button>
                          <Button 
                            onClick={connectPhantom}
                            className="w-full bg-[#AB9FF2] hover:bg-[#9580FF] text-white flex items-center justify-center gap-2"
                          >
                            <Image
                              src="/phantom-icon.svg"
                              alt="Phantom"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                            Connect Phantom
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="card-form">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Connected with {connectedWallet.type}</p>
                            <p className="font-medium">{formatAddress(connectedWallet.address!)}</p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={disconnectWallet}
                            className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                          >
                            Disconnect
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-600 dark:text-gray-400">Ready to make crypto payments!</p>
                          <Button 
                            onClick={(e) => {
                              if (selectedPaymentOption && ['upi', 'card', 'netbanking', 'crypto'].includes(selectedPaymentOption)) {
                                handlePayment(selectedPaymentOption as "upi" | "card" | "netbanking" | "crypto");
                              }
                            }}
                            disabled={paymentStatus === 'processing' || !selectedWallet || !paymentAmount}
                            className={`w-full ${
                              paymentStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : ''
                            } bg-blue-600 text-white hover:bg-blue-700`}
                          >
                            {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Card Preview */}
          <div 
            className="relative h-[200px] w-[320px] mx-auto [perspective:1000px]"
            onMouseEnter={() => !isCvvFocused && setIsCardFlipped(true)}
            onMouseLeave={() => !isCvvFocused && setIsCardFlipped(false)}
          >
            <div 
              className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
                isCardFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front of card */}
              <div className="absolute w-full h-full [backface-visibility:hidden]">
                <div className="relative w-full h-full">
                  <Image
                    src="/front.png"
                    alt="Card Front"
                    fill
                    className="object-cover rounded-xl"
                    priority
                    sizes="(max-width: 320px) 100vw, 320px"
                  />
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="relative w-full h-full">
                  <Image
                    src="/back.png"
                    alt="Card Back"
                    fill
                    className="object-cover rounded-xl"
                    priority
                    sizes="(max-width: 320px) 100vw, 320px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Wallet Balance */}
        <div className="w-[320px]">
          <Card className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800/50 backdrop-blur-xl h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Wallet Balance</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Available balance</span>
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ₹{walletBalance}
                    </span>
                  </div>
                  
                  <div className="h-2.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBatteryColor(batteryLevelValue)} transition-all duration-500`}
                      style={{ width: `${(batteryLevelValue / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleAddFunds}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Funds
                  </Button>
                  
                  {isAddFundsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Funds</h2>
                          <button
                            onClick={closeAddFunds}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Selected Payment Method Display */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={`/${selectedPaymentOption}-icon.svg`} 
                                alt={selectedPaymentOption || undefined} 
                                className="w-8 h-8"
                              />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Selected Payment Method</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {selectedPaymentOption === 'upi' && 'UPI Payment'}
                                  {selectedPaymentOption === 'card' && 'Credit/Debit Card'}
                                  {selectedPaymentOption === 'netbanking' && 'Netbanking'}
                                  {selectedPaymentOption === 'crypto' && 'Cryptocurrency'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                closeAddFunds();
                                setActiveTab('payment');
                              }}
                              className="text-sm"
                            >
                              Change
                            </Button>
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Enter Amount (₹)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800"
                            placeholder="Enter amount"
                          />
                        </div>

                        {/* Continue Button */}
                        <Button
                          onClick={(e) => {
                            if (selectedPaymentOption && ['upi', 'card', 'netbanking', 'crypto'].includes(selectedPaymentOption)) {
                              handlePayment(selectedPaymentOption as "upi" | "card" | "netbanking" | "crypto");
                            }
                          }}
                          disabled={!paymentAmount}
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  )}
                  <LowBalanceButton />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
