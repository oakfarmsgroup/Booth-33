import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  // Payment Methods (Cards)
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      holderName: 'John Doe',
    },
  ]);

  // Payment Transactions
  const [transactions, setTransactions] = useState([
    {
      id: 'txn_1',
      amount: 120.00,
      status: 'completed', // pending, completed, failed, refunded
      bookingId: 'book1',
      paymentMethodId: 'pm_1',
      description: 'Studio Recording Session - 2 hours',
      date: new Date(2025, 9, 25, 14, 30),
      receiptUrl: null,
      refundedAmount: 0,
      refundDate: null,
    },
  ]);

  // Add Payment Method
  const addPaymentMethod = (cardDetails) => {
    // Mock card validation
    if (!cardDetails.cardNumber || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
      return { success: false, message: 'Please fill in all card details' };
    }

    // Basic card number validation (mock)
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 15 || cardNumber.length > 16) {
      return { success: false, message: 'Invalid card number' };
    }

    // Mock expiry validation
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (cardDetails.expiryYear < currentYear ||
        (cardDetails.expiryYear === currentYear && cardDetails.expiryMonth < currentMonth)) {
      return { success: false, message: 'Card has expired' };
    }

    // Detect card brand (mock)
    const firstDigit = cardNumber.charAt(0);
    let brand = 'unknown';
    if (firstDigit === '4') brand = 'visa';
    else if (firstDigit === '5') brand = 'mastercard';
    else if (firstDigit === '3') brand = 'amex';
    else if (firstDigit === '6') brand = 'discover';

    const newPaymentMethod = {
      id: `pm_${Date.now()}`,
      type: 'card',
      brand: brand,
      last4: cardNumber.slice(-4),
      expiryMonth: parseInt(cardDetails.expiryMonth),
      expiryYear: parseInt(cardDetails.expiryYear),
      isDefault: paymentMethods.length === 0, // First card is default
      holderName: cardDetails.holderName || 'Card Holder',
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    return { success: true, paymentMethod: newPaymentMethod };
  };

  // Remove Payment Method
  const removePaymentMethod = (paymentMethodId) => {
    const method = paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!method) {
      return { success: false, message: 'Payment method not found' };
    }

    // Don't allow removing default if there are other cards
    if (method.isDefault && paymentMethods.length > 1) {
      return { success: false, message: 'Please set another card as default first' };
    }

    setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
    return { success: true };
  };

  // Set Default Payment Method
  const setDefaultPaymentMethod = (paymentMethodId) => {
    setPaymentMethods(
      paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }))
    );
    return { success: true };
  };

  // Get Default Payment Method
  const getDefaultPaymentMethod = () => {
    return paymentMethods.find(pm => pm.isDefault) || paymentMethods[0] || null;
  };

  // Process Payment
  const processPayment = async (amount, bookingId, description, paymentMethodId = null) => {
    // Use default payment method if none specified
    const methodId = paymentMethodId || getDefaultPaymentMethod()?.id;

    if (!methodId) {
      return {
        success: false,
        message: 'No payment method available. Please add a card first.',
      };
    }

    const paymentMethod = paymentMethods.find(pm => pm.id === methodId);
    if (!paymentMethod) {
      return {
        success: false,
        message: 'Payment method not found',
      };
    }

    // Mock payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock payment success (90% success rate for testing)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      // Failed payment
      const failedTransaction = {
        id: `txn_${Date.now()}`,
        amount: amount,
        status: 'failed',
        bookingId: bookingId,
        paymentMethodId: methodId,
        description: description,
        date: new Date(),
        receiptUrl: null,
        refundedAmount: 0,
        refundDate: null,
        failureReason: 'Card declined',
      };

      setTransactions([failedTransaction, ...transactions]);

      return {
        success: false,
        message: 'Payment failed. Please try another card.',
        transaction: failedTransaction,
      };
    }

    // Successful payment
    const newTransaction = {
      id: `txn_${Date.now()}`,
      amount: amount,
      status: 'completed',
      bookingId: bookingId,
      paymentMethodId: methodId,
      description: description,
      date: new Date(),
      receiptUrl: `receipt_${Date.now()}`, // Mock receipt URL
      refundedAmount: 0,
      refundDate: null,
    };

    setTransactions([newTransaction, ...transactions]);

    return {
      success: true,
      message: 'Payment successful',
      transaction: newTransaction,
    };
  };

  // Process Refund (Admin only)
  const processRefund = async (transactionId, refundAmount = null) => {
    const transaction = transactions.find(t => t.id === transactionId);

    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    if (transaction.status !== 'completed') {
      return { success: false, message: 'Can only refund completed transactions' };
    }

    const maxRefundable = transaction.amount - transaction.refundedAmount;
    const amountToRefund = refundAmount || maxRefundable;

    if (amountToRefund > maxRefundable) {
      return { success: false, message: 'Refund amount exceeds available amount' };
    }

    // Mock refund processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedTransaction = {
      ...transaction,
      status: amountToRefund === transaction.amount ? 'refunded' : 'completed',
      refundedAmount: transaction.refundedAmount + amountToRefund,
      refundDate: new Date(),
    };

    setTransactions(
      transactions.map(t => t.id === transactionId ? updatedTransaction : t)
    );

    return {
      success: true,
      message: 'Refund processed successfully',
      transaction: updatedTransaction,
      refundedAmount: amountToRefund,
    };
  };

  // Get Transaction by ID
  const getTransaction = (transactionId) => {
    return transactions.find(t => t.id === transactionId);
  };

  // Get Transactions by Booking ID
  const getTransactionsByBooking = (bookingId) => {
    return transactions.filter(t => t.bookingId === bookingId);
  };

  // Get Payment History
  const getPaymentHistory = () => {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get Revenue Statistics
  const getRevenueStats = () => {
    const completed = transactions.filter(t => t.status === 'completed' || t.status === 'refunded');
    const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
    const totalRefunded = completed.reduce((sum, t) => sum + t.refundedAmount, 0);
    const netRevenue = totalRevenue - totalRefunded;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTransactions = completed.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount - t.refundedAmount, 0);

    return {
      totalRevenue,
      totalRefunded,
      netRevenue,
      monthlyRevenue,
      totalTransactions: completed.length,
      monthlyTransactions: monthlyTransactions.length,
    };
  };

  const value = {
    // Payment Methods
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getDefaultPaymentMethod,

    // Transactions
    transactions,
    processPayment,
    processRefund,
    getTransaction,
    getTransactionsByBooking,
    getPaymentHistory,

    // Stats
    getRevenueStats,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
