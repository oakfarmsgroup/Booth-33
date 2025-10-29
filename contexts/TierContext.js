import React, { createContext, useContext, useMemo, useState } from 'react';
import { TIERS, TIER_ORDER, getTierProgress, getNextTier, determineTier } from '../data/tierSystem';

const TierContext = createContext(null);

export const useTier = () => {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error('useTier must be used within TierProvider');
  return ctx;
};

export const TierProvider = ({ children }) => {
  // Mocked user stats (replace with backend data later)
  const [userStats, setUserStats] = useState({
    sessionsBooked: 7,
    referrals: 1,
    postsCreated: 12,
    daysActive: 21,
    totalSpent: 740,
  });

  const currentTier = useMemo(() => determineTier(userStats), [userStats]);
  const progress = useMemo(() => getTierProgress(userStats, currentTier.key), [userStats, currentTier]);
  const nextTier = useMemo(() => getNextTier(currentTier.key), [currentTier]);

  const value = {
    TIERS,
    TIER_ORDER,
    userStats,
    setUserStats,
    currentTier,
    progress,
    nextTier,
    getTierProgress: (tierName) => getTierProgress(userStats, tierName),
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
};

