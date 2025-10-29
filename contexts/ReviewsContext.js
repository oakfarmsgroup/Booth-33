import React, { createContext, useContext, useState } from 'react';

const ReviewsContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider = ({ children }) => {
  // Reviews database
  const [reviews, setReviews] = useState([
    {
      id: 'review_1',
      bookingId: 'book_1',
      reviewerId: 'current_user',
      reviewerName: 'You',
      reviewerAvatar: require('../assets/images/Artist.png'),
      revieweeId: 'user_2',
      revieweeName: 'Mike Soundz',
      type: 'session', // 'session' or 'collaboration'

      // Overall rating
      overallRating: 5,

      // Category ratings
      ratings: {
        professionalism: 5,
        quality: 5,
        communication: 5,
        value: 4,
        punctuality: 5,
      },

      // Review content
      title: 'Amazing session with Mike!',
      content: 'Mike is an incredibly talented producer. The beat he crafted for my track exceeded all expectations. Professional setup, great communication, and delivered exactly what I was looking for. Highly recommend!',

      // Review metadata
      date: new Date(2025, 9, 15),
      helpfulCount: 12,
      reportCount: 0,
      response: null, // Reviewee can respond

      // Verification
      verified: true, // Verified booking completion

      // Moderation
      flagged: false,
      approved: true,
    },
    {
      id: 'review_2',
      bookingId: 'book_2',
      reviewerId: 'user_3',
      reviewerName: 'Sarah J',
      reviewerAvatar: require('../assets/images/Artist.png'),
      revieweeId: 'user_2',
      revieweeName: 'Mike Soundz',
      type: 'session',

      overallRating: 5,

      ratings: {
        professionalism: 5,
        quality: 5,
        communication: 5,
        value: 5,
        punctuality: 5,
      },

      title: 'Best producer in the city!',
      content: 'Mike has an incredible ear for detail. He took my rough ideas and turned them into polished tracks. The studio equipment is top-notch and he made me feel comfortable throughout the entire session.',

      date: new Date(2025, 9, 10),
      helpfulCount: 8,
      reportCount: 0,
      response: {
        text: 'Thanks Sarah! It was a pleasure working with you. Looking forward to our next session!',
        date: new Date(2025, 9, 11),
      },

      verified: true,
      flagged: false,
      approved: true,
    },
    {
      id: 'review_3',
      bookingId: 'book_3',
      reviewerId: 'user_4',
      reviewerName: 'Jay Beats',
      reviewerAvatar: require('../assets/images/Artist.png'),
      revieweeId: 'user_1',
      revieweeName: 'Alex Rivera',
      type: 'collaboration',

      overallRating: 4,

      ratings: {
        professionalism: 4,
        quality: 5,
        communication: 4,
        creativity: 5,
        reliability: 4,
      },

      title: 'Great collaboration experience',
      content: 'Alex brought amazing guitar work to our electronic track. Really creative approach and open to feedback. Only minor issue was response time could be quicker, but the final product was worth the wait.',

      date: new Date(2025, 9, 8),
      helpfulCount: 5,
      reportCount: 0,
      response: null,

      verified: true,
      flagged: false,
      approved: true,
    },
    {
      id: 'review_4',
      bookingId: 'book_4',
      reviewerId: 'user_5',
      reviewerName: 'Lisa Chen',
      reviewerAvatar: require('../assets/images/Artist.png'),
      revieweeId: 'user_3',
      revieweeName: 'Sarah J',
      type: 'session',

      overallRating: 5,

      ratings: {
        professionalism: 5,
        quality: 5,
        communication: 5,
        value: 5,
        punctuality: 5,
      },

      title: 'Incredible vocals and vibes',
      content: 'Sarah has such a beautiful voice and really understood the emotion I wanted to convey. She was patient with multiple takes and gave great suggestions for harmonies. Will definitely book again!',

      date: new Date(2025, 9, 5),
      helpfulCount: 15,
      reportCount: 0,
      response: {
        text: 'Thank you Lisa! Your songwriting is amazing. Can\'t wait to work together again! 💕',
        date: new Date(2025, 9, 6),
      },

      verified: true,
      flagged: false,
      approved: true,
    },
  ]);

  // Pending reviews (bookings that need reviews)
  const [pendingReviews, setPendingReviews] = useState([
    {
      bookingId: 'book_5',
      revieweeId: 'user_4',
      revieweeName: 'Jay Beats',
      bookingDate: new Date(2025, 9, 20),
      sessionType: 'DJ Mix Session',
    },
  ]);

  // Add a new review
  const addReview = (reviewData) => {
    const newReview = {
      id: `review_${Date.now()}`,
      reviewerId: 'current_user',
      reviewerName: 'You',
      reviewerAvatar: require('../assets/images/Artist.png'),
      date: new Date(),
      helpfulCount: 0,
      reportCount: 0,
      response: null,
      verified: true,
      flagged: false,
      approved: true,
      ...reviewData,
    };

    setReviews([newReview, ...reviews]);

    // Remove from pending reviews
    setPendingReviews(pendingReviews.filter(pr => pr.bookingId !== reviewData.bookingId));

    return newReview;
  };

  // Get reviews for a specific user (reviewee)
  const getReviewsForUser = (userId) => {
    return reviews.filter(review => review.revieweeId === userId && review.approved);
  };

  // Get reviews by a specific user (reviewer)
  const getReviewsByUser = (userId) => {
    return reviews.filter(review => review.reviewerId === userId);
  };

  // Calculate average rating for a user
  const getAverageRating = (userId) => {
    const userReviews = getReviewsForUser(userId);

    if (userReviews.length === 0) return 0;

    const sum = userReviews.reduce((acc, review) => acc + review.overallRating, 0);
    return (sum / userReviews.length).toFixed(1);
  };

  // Get rating breakdown (count of each star rating)
  const getRatingBreakdown = (userId) => {
    const userReviews = getReviewsForUser(userId);

    const breakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    userReviews.forEach(review => {
      breakdown[review.overallRating]++;
    });

    return breakdown;
  };

  // Get category averages for a user
  const getCategoryAverages = (userId) => {
    const userReviews = getReviewsForUser(userId);

    if (userReviews.length === 0) return null;

    const categories = {};
    const counts = {};

    userReviews.forEach(review => {
      Object.entries(review.ratings).forEach(([category, rating]) => {
        if (!categories[category]) {
          categories[category] = 0;
          counts[category] = 0;
        }
        categories[category] += rating;
        counts[category]++;
      });
    });

    const averages = {};
    Object.keys(categories).forEach(category => {
      averages[category] = (categories[category] / counts[category]).toFixed(1);
    });

    return averages;
  };

  // Mark review as helpful
  const markHelpful = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpfulCount: review.helpfulCount + 1,
        };
      }
      return review;
    }));
  };

  // Report review
  const reportReview = (reviewId, reason) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          reportCount: review.reportCount + 1,
          flagged: review.reportCount + 1 >= 3, // Auto-flag after 3 reports
        };
      }
      return review;
    }));
  };

  // Add response to review (for reviewee)
  const addResponse = (reviewId, responseText) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          response: {
            text: responseText,
            date: new Date(),
          },
        };
      }
      return review;
    }));
  };

  // Get pending reviews for current user
  const getPendingReviews = () => {
    return pendingReviews;
  };

  // Check if user has reviewed a booking
  const hasReviewedBooking = (bookingId) => {
    return reviews.some(review =>
      review.bookingId === bookingId &&
      review.reviewerId === 'current_user'
    );
  };

  // Get review stats for a user
  const getReviewStats = (userId) => {
    const userReviews = getReviewsForUser(userId);

    return {
      totalReviews: userReviews.length,
      averageRating: parseFloat(getAverageRating(userId)),
      ratingBreakdown: getRatingBreakdown(userId),
      categoryAverages: getCategoryAverages(userId),
      verifiedReviews: userReviews.filter(r => r.verified).length,
      respondedReviews: userReviews.filter(r => r.response).length,
    };
  };

  // Admin functions
  const approveReview = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return { ...review, approved: true, flagged: false };
      }
      return review;
    }));
  };

  const deleteReview = (reviewId) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
  };

  const getFlaggedReviews = () => {
    return reviews.filter(review => review.flagged);
  };

  const value = {
    reviews,
    pendingReviews,
    addReview,
    getReviewsForUser,
    getReviewsByUser,
    getAverageRating,
    getRatingBreakdown,
    getCategoryAverages,
    markHelpful,
    reportReview,
    addResponse,
    getPendingReviews,
    hasReviewedBooking,
    getReviewStats,
    approveReview,
    deleteReview,
    getFlaggedReviews,
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};
