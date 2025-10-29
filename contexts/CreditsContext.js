import React, { createContext, useContext, useState } from 'react';

const CreditsContext = createContext();

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider');
  }
  return context;
};

export const CreditsProvider = ({ children }) => {
  // User credits state - in real app, this would be per user from backend
  const [credits, setCredits] = useState(0); // Credits in dollars
  const [transactions, setTransactions] = useState([
    // Mock transaction for demo
    {
      id: 1,
      type: 'granted', // 'granted' or 'used'
      amount: 60,
      description: 'Welcome bonus',
      date: new Date(2025, 9, 20),
      grantedBy: 'Studio Admin',
    },
  ]);

  // Grant credits to user (admin function)
  const grantCredits = (amount, description, grantedBy = 'Studio Admin') => {
    const transaction = {
      id: Date.now(),
      type: 'granted',
      amount: amount,
      description: description,
      date: new Date(),
      grantedBy: grantedBy,
    };

    setTransactions([transaction, ...transactions]);
    setCredits(credits + amount);

    return transaction;
  };

  // Use credits for booking
  const useCredits = (amount, bookingId, description = 'Studio booking') => {
    if (amount > credits) {
      return { success: false, message: 'Insufficient credits' };
    }

    const transaction = {
      id: Date.now(),
      type: 'used',
      amount: amount,
      description: description,
      bookingId: bookingId,
      date: new Date(),
    };

    setTransactions([transaction, ...transactions]);
    setCredits(credits - amount);

    return { success: true, transaction };
  };

  // Calculate how much of a booking can be covered by credits
  const calculateCreditUsage = (bookingPrice) => {
    const creditsToUse = Math.min(credits, bookingPrice);
    const remainingPrice = bookingPrice - creditsToUse;

    return {
      creditsToUse,
      remainingPrice,
      canCoverFull: creditsToUse === bookingPrice,
    };
  };

  // Get transaction history
  const getTransactionHistory = () => {
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get granted credits only
  const getGrantedCredits = () => {
    return transactions.filter(t => t.type === 'granted');
  };

  // Get used credits only
  const getUsedCredits = () => {
    return transactions.filter(t => t.type === 'used');
  };

  // Get total credits ever granted
  const getTotalGranted = () => {
    return transactions
      .filter(t => t.type === 'granted')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get total credits ever used
  const getTotalUsed = () => {
    return transactions
      .filter(t => t.type === 'used')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const value = {
    credits,
    transactions,
    grantCredits,
    useCredits,
    calculateCreditUsage,
    getTransactionHistory,
    getGrantedCredits,
    getUsedCredits,
    getTotalGranted,
    getTotalUsed,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};
