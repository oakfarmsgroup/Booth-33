export const TIERS = {
  SILVER: {
    name: 'Silver',
    emoji: '⭐',
    color: '#C0C0C0',
    requirements: {
      sessionsBooked: 1,
      referrals: 0,
      postsCreated: 2,
      daysActive: 3,
      totalSpent: 0,
    },
    benefits: ['5% discount on bookings', 'Priority support'],
  },
  GOLD: {
    name: 'Gold',
    emoji: '🌟',
    color: '#FFD700',
    requirements: {
      sessionsBooked: 5,
      referrals: 2,
      postsCreated: 10,
      daysActive: 14,
      totalSpent: 500,
    },
    benefits: ['10% discount', 'Free 30min session monthly', 'Verified badge'],
  },
  PLATINUM: {
    name: 'Platinum',
    emoji: '💫',
    color: '#E5E4E2',
    requirements: {
      sessionsBooked: 15,
      referrals: 5,
      postsCreated: 30,
      daysActive: 45,
      totalSpent: 2000,
    },
    benefits: [
      '15% discount',
      '2 free 30min sessions monthly',
      'Priority studio slots',
      'Featured creator highlights',
    ],
  },
  DIAMOND: {
    name: 'Diamond',
    emoji: '💎',
    color: '#74E0FF',
    requirements: {
      sessionsBooked: 40,
      referrals: 12,
      postsCreated: 80,
      daysActive: 120,
      totalSpent: 6500,
    },
    benefits: [
      '25% discount',
      '4 free 30min sessions monthly',
      'VIP concierge support',
      'Top-tier discovery boost',
    ],
  },
};

export const TIER_ORDER = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

export const getTierProgress = (userStats, tierName) => {
  const key = typeof tierName === 'string' ? tierName : (tierName?.key || 'SILVER');
  const tierKey = key.toUpperCase();
  const tier = TIERS[tierKey];
  if (!tier) return { percent: 0, breakdown: {}, tier: null };

  const reqs = tier.requirements;
  const breakdown = {};
  const keys = Object.keys(reqs);
  let sum = 0;
  keys.forEach((k) => {
    const need = reqs[k] ?? 0;
    const have = userStats[k] ?? 0;
    const part = need === 0 ? 1 : Math.min(1, have / need);
    breakdown[k] = { have, need, percent: Math.round(part * 100) };
    sum += part;
  });
  const percent = Math.round((sum / keys.length) * 100);
  return { percent, breakdown, tier };
};

export const getNextTier = (currentTier) => {
  const key = typeof currentTier === 'string' ? currentTier : (currentTier?.key || 'SILVER');
  const idx = TIER_ORDER.indexOf(key.toUpperCase());
  if (idx < 0) return null;
  const nextKey = TIER_ORDER[Math.min(idx + 1, TIER_ORDER.length - 1)];
  if (!nextKey || nextKey === key.toUpperCase()) return null;
  return { key: nextKey, ...TIERS[nextKey] };
};

export const determineTier = (userStats) => {
  // Find highest tier where user meets or exceeds all requirements
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const key = TIER_ORDER[i];
    const { requirements } = TIERS[key];
    const ok = Object.keys(requirements).every((k) => (userStats[k] ?? 0) >= requirements[k]);
    if (ok) return { key, ...TIERS[key] };
  }
  return { key: 'SILVER', ...TIERS.SILVER };
};

export const darkenColor = (hex, amt = 0.2) => {
  // Simple darken utility: move each channel toward 0 by amt
  const c = hex.replace('#', '');
  if (c.length !== 6) return hex;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const dr = Math.max(0, Math.floor(r * (1 - amt)));
  const dg = Math.max(0, Math.floor(g * (1 - amt)));
  const db = Math.max(0, Math.floor(b * (1 - amt)));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(dr)}${toHex(dg)}${toHex(db)}`;
};

