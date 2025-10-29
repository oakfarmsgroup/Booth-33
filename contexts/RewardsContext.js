import React, { createContext, useContext, useState } from 'react';

const RewardsContext = createContext();

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

export const RewardsProvider = ({ children }) => {
  // User's reward status
  const [userRewards, setUserRewards] = useState({
    // User identification
    userId: 'current_user',
    referralCode: 'BOOTH33-CHRIS',

    // Tier system
    currentTier: 'silver', // 'bronze', 'silver', 'gold', 'platinum'
    tierProgress: 45, // Progress to next tier (0-100%)

    // Points and credits
    totalPoints: 1250,
    lifetimeCreditsEarned: 150,
    availableRewards: 3, // Unclaimed rewards

    // Activity stats
    totalBookings: 7,
    totalReferrals: 3,
    successfulReferrals: 2, // Referrals who completed a booking
    reviewsWritten: 2,
    eventsAttended: 4,

    // Streaks
    currentLoginStreak: 5,
    longestLoginStreak: 12,
    currentBookingStreak: 2, // Consecutive weeks with bookings

    // Join date for calculating member duration
    joinDate: new Date(2025, 5, 15),
  });

  // Reward tiers with benefits
  const rewardTiers = {
    bronze: {
      name: 'Bronze',
      icon: '🥉',
      color: '#CD7F32',
      pointsRequired: 0,
      benefits: [
        '5% discount on bookings',
        'Welcome bonus: 10 free credits',
        'Access to community events',
      ],
    },
    silver: {
      name: 'Silver',
      icon: '🥈',
      color: '#C0C0C0',
      pointsRequired: 500,
      benefits: [
        '10% discount on bookings',
        'Priority customer support',
        'Early access to new features',
        'Monthly bonus: 5 credits',
      ],
    },
    gold: {
      name: 'Gold',
      icon: '🥇',
      color: '#FFD700',
      pointsRequired: 2000,
      benefits: [
        '15% discount on bookings',
        'VIP badge on profile',
        'Exclusive gold-tier events',
        'Monthly bonus: 15 credits',
        'Priority booking slots',
      ],
    },
    platinum: {
      name: 'Platinum',
      icon: '💎',
      color: '#E5E4E2',
      pointsRequired: 5000,
      benefits: [
        '25% discount on bookings',
        'Platinum badge on profile',
        'Direct line to studio manager',
        'Monthly bonus: 30 credits',
        'Guaranteed booking availability',
        'Free session every 10 bookings',
      ],
    },
  };

  // Milestones users can achieve
  const [milestones, setMilestones] = useState([
    {
      id: 'milestone_1',
      title: 'First Booking',
      description: 'Complete your first studio session',
      icon: '🎯',
      reward: { type: 'credits', amount: 10 },
      requirement: { type: 'bookings', count: 1 },
      completed: true,
      completedDate: new Date(2025, 6, 1),
      claimed: true,
    },
    {
      id: 'milestone_2',
      title: 'Studio Regular',
      description: 'Complete 5 studio bookings',
      icon: '🎵',
      reward: { type: 'credits', amount: 25 },
      requirement: { type: 'bookings', count: 5 },
      completed: true,
      completedDate: new Date(2025, 8, 15),
      claimed: true,
    },
    {
      id: 'milestone_3',
      title: 'Studio Expert',
      description: 'Complete 10 studio bookings',
      icon: '🏆',
      reward: { type: 'credits', amount: 50, tierBoost: true },
      requirement: { type: 'bookings', count: 10 },
      completed: false,
      completedDate: null,
      claimed: false,
      progress: 70, // 7/10 bookings
    },
    {
      id: 'milestone_4',
      title: 'First Referral',
      description: 'Refer your first friend to Booth 33',
      icon: '🤝',
      reward: { type: 'credits', amount: 20 },
      requirement: { type: 'referrals', count: 1 },
      completed: true,
      completedDate: new Date(2025, 7, 10),
      claimed: true,
    },
    {
      id: 'milestone_5',
      title: 'Community Builder',
      description: 'Successfully refer 5 friends who complete bookings',
      icon: '🌟',
      reward: { type: 'credits', amount: 100, tierBoost: true },
      requirement: { type: 'successfulReferrals', count: 5 },
      completed: false,
      completedDate: null,
      claimed: false,
      progress: 40, // 2/5 successful referrals
    },
    {
      id: 'milestone_6',
      title: 'Helpful Reviewer',
      description: 'Write 5 verified reviews',
      icon: '⭐',
      reward: { type: 'credits', amount: 15 },
      requirement: { type: 'reviews', count: 5 },
      completed: false,
      completedDate: null,
      claimed: false,
      progress: 40, // 2/5 reviews
    },
    {
      id: 'milestone_7',
      title: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      icon: '🔥',
      reward: { type: 'credits', amount: 30 },
      requirement: { type: 'loginStreak', count: 30 },
      completed: false,
      completedDate: null,
      claimed: false,
      progress: 16.7, // 5/30 days
    },
    {
      id: 'milestone_8',
      title: 'Event Enthusiast',
      description: 'Attend 10 studio events',
      icon: '🎉',
      reward: { type: 'credits', amount: 40 },
      requirement: { type: 'events', count: 10 },
      completed: false,
      completedDate: null,
      claimed: false,
      progress: 40, // 4/10 events
    },
  ]);

  // Referral history
  const [referrals, setReferrals] = useState([
    {
      id: 'ref_1',
      referredUserId: 'user_10',
      referredUserName: 'Alex Martinez',
      referredUserAvatar: require('../assets/images/Artist.png'),
      dateReferred: new Date(2025, 7, 10),
      status: 'completed', // 'pending', 'completed', 'expired'
      rewardEarned: 20, // Credits earned from this referral
      referralCompleted: true, // Did they complete a booking?
      completionDate: new Date(2025, 7, 15),
    },
    {
      id: 'ref_2',
      referredUserId: 'user_11',
      referredUserName: 'Jordan Lee',
      referredUserAvatar: require('../assets/images/Artist.png'),
      dateReferred: new Date(2025, 8, 5),
      status: 'completed',
      rewardEarned: 20,
      referralCompleted: true,
      completionDate: new Date(2025, 8, 12),
    },
    {
      id: 'ref_3',
      referredUserId: 'user_12',
      referredUserName: 'Sam Rivera',
      referredUserAvatar: require('../assets/images/Artist.png'),
      dateReferred: new Date(2025, 9, 20),
      status: 'pending',
      rewardEarned: 0,
      referralCompleted: false,
      completionDate: null,
    },
  ]);

  // Recent rewards history
  const [rewardsHistory, setRewardsHistory] = useState([
    {
      id: 'reward_1',
      type: 'milestone',
      title: 'Studio Regular Milestone',
      creditsEarned: 25,
      date: new Date(2025, 8, 15),
      icon: '🎵',
    },
    {
      id: 'reward_2',
      type: 'referral',
      title: 'Referral Bonus - Jordan Lee',
      creditsEarned: 20,
      date: new Date(2025, 8, 12),
      icon: '🤝',
    },
    {
      id: 'reward_3',
      type: 'streak',
      title: '5-Day Login Streak',
      creditsEarned: 5,
      date: new Date(2025, 9, 22),
      icon: '🔥',
    },
    {
      id: 'reward_4',
      type: 'tier_bonus',
      title: 'Silver Tier Monthly Bonus',
      creditsEarned: 5,
      date: new Date(2025, 9, 1),
      icon: '🥈',
    },
  ]);

  // Generate shareable referral link
  const getReferralLink = () => {
    return `https://booth33.com/join?ref=${userRewards.referralCode}`;
  };

  // Get current tier info
  const getCurrentTier = () => {
    return rewardTiers[userRewards.currentTier];
  };

  // Get next tier info
  const getNextTier = () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(userRewards.currentTier);

    if (currentIndex === tiers.length - 1) {
      return null; // Already at max tier
    }

    return rewardTiers[tiers[currentIndex + 1]];
  };

  // Calculate points needed for next tier
  const getPointsToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 0;

    return nextTier.pointsRequired - userRewards.totalPoints;
  };

  // Claim a milestone reward
  const claimMilestone = (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId);

    if (!milestone || !milestone.completed || milestone.claimed) {
      return { success: false, message: 'Reward not available' };
    }

    // Update milestone as claimed
    setMilestones(milestones.map(m =>
      m.id === milestoneId ? { ...m, claimed: true } : m
    ));

    // Add credits to user
    const creditsEarned = milestone.reward.amount;

    // Add to rewards history
    const newReward = {
      id: `reward_${Date.now()}`,
      type: 'milestone',
      title: milestone.title,
      creditsEarned: creditsEarned,
      date: new Date(),
      icon: milestone.icon,
    };

    setRewardsHistory([newReward, ...rewardsHistory]);

    // Update user stats
    setUserRewards({
      ...userRewards,
      lifetimeCreditsEarned: userRewards.lifetimeCreditsEarned + creditsEarned,
      availableRewards: userRewards.availableRewards - 1,
    });

    return {
      success: true,
      creditsEarned,
      message: `Claimed ${creditsEarned} credits!`,
    };
  };

  // Track a new referral
  const addReferral = (referredUserName) => {
    const newReferral = {
      id: `ref_${Date.now()}`,
      referredUserId: `user_${Date.now()}`,
      referredUserName: referredUserName,
      referredUserAvatar: require('../assets/images/Artist.png'),
      dateReferred: new Date(),
      status: 'pending',
      rewardEarned: 0,
      referralCompleted: false,
      completionDate: null,
    };

    setReferrals([newReferral, ...referrals]);

    setUserRewards({
      ...userRewards,
      totalReferrals: userRewards.totalReferrals + 1,
    });

    return newReferral;
  };

  // Complete a referral (when referred user completes first booking)
  const completeReferral = (referralId) => {
    const referral = referrals.find(r => r.id === referralId);

    if (!referral || referral.status === 'completed') {
      return { success: false };
    }

    const rewardAmount = 20; // Credits for successful referral

    setReferrals(referrals.map(r =>
      r.id === referralId
        ? {
            ...r,
            status: 'completed',
            rewardEarned: rewardAmount,
            referralCompleted: true,
            completionDate: new Date(),
          }
        : r
    ));

    // Add to rewards history
    const newReward = {
      id: `reward_${Date.now()}`,
      type: 'referral',
      title: `Referral Bonus - ${referral.referredUserName}`,
      creditsEarned: rewardAmount,
      date: new Date(),
      icon: '🤝',
    };

    setRewardsHistory([newReward, ...rewardsHistory]);

    setUserRewards({
      ...userRewards,
      successfulReferrals: userRewards.successfulReferrals + 1,
      lifetimeCreditsEarned: userRewards.lifetimeCreditsEarned + rewardAmount,
      totalPoints: userRewards.totalPoints + 100, // Points for referral
    });

    return {
      success: true,
      creditsEarned: rewardAmount,
    };
  };

  // Update login streak
  const updateLoginStreak = () => {
    const newStreak = userRewards.currentLoginStreak + 1;

    setUserRewards({
      ...userRewards,
      currentLoginStreak: newStreak,
      longestLoginStreak: Math.max(newStreak, userRewards.longestLoginStreak),
    });

    // Award streak bonuses
    if (newStreak % 7 === 0) {
      // Weekly streak bonus
      const bonusCredits = 5;

      const newReward = {
        id: `reward_${Date.now()}`,
        type: 'streak',
        title: `${newStreak}-Day Login Streak`,
        creditsEarned: bonusCredits,
        date: new Date(),
        icon: '🔥',
      };

      setRewardsHistory([newReward, ...rewardsHistory]);

      setUserRewards(prev => ({
        ...prev,
        lifetimeCreditsEarned: prev.lifetimeCreditsEarned + bonusCredits,
      }));
    }
  };

  // Get unclaimed milestones
  const getUnclaimedMilestones = () => {
    return milestones.filter(m => m.completed && !m.claimed);
  };

  // Get available milestones (not yet completed)
  const getAvailableMilestones = () => {
    return milestones.filter(m => !m.completed);
  };

  // Get completed milestones
  const getCompletedMilestones = () => {
    return milestones.filter(m => m.completed && m.claimed);
  };

  // Calculate total potential rewards
  const getTotalPotentialRewards = () => {
    return milestones
      .filter(m => !m.completed)
      .reduce((sum, m) => sum + m.reward.amount, 0);
  };

  const value = {
    userRewards,
    rewardTiers,
    milestones,
    referrals,
    rewardsHistory,
    getReferralLink,
    getCurrentTier,
    getNextTier,
    getPointsToNextTier,
    claimMilestone,
    addReferral,
    completeReferral,
    updateLoginStreak,
    getUnclaimedMilestones,
    getAvailableMilestones,
    getCompletedMilestones,
    getTotalPotentialRewards,
  };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
};
