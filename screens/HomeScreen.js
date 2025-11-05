import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Animated, RefreshControl, Pressable, Share, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AudioPlayer from '../components/AudioPlayer';
import { useAudio } from '../contexts/AudioContext';
import { useBookings } from '../contexts/BookingsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useMessaging } from '../contexts/MessagingContext';
import { useSearch } from '../contexts/SearchContext';
import { useProfile } from '../contexts/ProfileContext';
import { useReviews } from '../contexts/ReviewsContext';
import { useRewards } from '../contexts/RewardsContext';
import { useTier } from '../contexts/TierContext';
import { darkenColor } from '../data/tierSystem';

// Purple Glowing Loading Spinner Component
function LoadingSpinner() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation animation
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false, // Changed to false to avoid conflicts
      })
    );

    // Pulsing glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );

    rotation.start();
    glow.start();

    return () => {
      rotation.stop();
      glow.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.9],
  });

  return (
    <View style={styles.loadingSpinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate }],
            shadowRadius,
            shadowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.spinnerGradient}
        />
      </Animated.View>
    </View>
  );
}

// Skeleton Post Component with Shimmer Animation
function SkeletonPost() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.postCard}>
      {/* Header Skeleton */}
      <View style={styles.postHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Animated.View style={[styles.skeletonText, { width: 120, opacity }]} />
          <Animated.View style={[styles.skeletonText, { width: 80, marginTop: 6, opacity }]} />
        </View>
      </View>

      {/* Caption Skeleton */}
      <Animated.View style={[styles.skeletonText, { width: '90%', marginBottom: 6, opacity }]} />
      <Animated.View style={[styles.skeletonText, { width: '70%', marginBottom: 12, opacity }]} />

      {/* Audio Container Skeleton */}
      <Animated.View style={[styles.skeletonAudio, { opacity }]} />

      {/* Actions Skeleton */}
      <View style={[styles.actions, { marginTop: 12 }]}>
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
    </View>
  );
}

// Comments Modal Component
function CommentsModal({ visible, onClose, postId, initialCommentCount, onCommentAdded }) {
  const [commentText, setCommentText] = useState('');

  // Initialize comments based on whether it's a demo post or new event
  const [comments, setComments] = useState(
    postId === 1 || postId === 2 ? [
      {
        id: 1,
        user: 'Sarah J',
        text: 'This is fire! 🔥',
        timestamp: '1h ago',
        likes: 12,
        liked: false,
        replies: [
          {
            id: 11,
            user: 'Mike Soundz',
            text: 'Thanks! Appreciate it 🙏',
            timestamp: '45m ago',
            likes: 3,
            liked: false,
          },
        ],
        showReplies: false,
      },
    {
      id: 2,
      user: 'DJ Cool',
      text: 'Beat is crazy! What DAW you using?',
      timestamp: '2h ago',
      likes: 8,
      liked: false,
      replies: [],
      showReplies: false,
    },
    {
      id: 3,
      user: 'Producer Pro',
      text: 'The mixing is on point 🎧',
      timestamp: '3h ago',
      likes: 15,
      liked: false,
      replies: [
        {
          id: 31,
          user: 'Mike Soundz',
          text: 'Thank you! Spent a lot of time on it',
          timestamp: '2h ago',
          likes: 5,
          liked: false,
        },
        {
          id: 32,
          user: 'Audio Engineer',
          text: 'Yeah the stereo imaging is perfect',
          timestamp: '1h ago',
          likes: 2,
          liked: false,
        },
      ],
      showReplies: false,
    },
    ] : [] // Empty comments for event posts and new posts
  );
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedComments, setLikedComments] = useState(new Set());

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  const newLiked = !reply.liked;
                  return {
                    ...reply,
                    liked: newLiked,
                    likes: newLiked ? reply.likes + 1 : reply.likes - 1,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        })
      );
    } else {
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === commentId) {
            const newLiked = !comment.liked;
            return {
              ...comment,
              liked: newLiked,
              likes: newLiked ? comment.likes + 1 : comment.likes - 1,
            };
          }
          return comment;
        })
      );
    }
  };

  const toggleReplies = (commentId) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, showReplies: !comment.showReplies }
          : comment
      )
    );
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    if (replyingTo) {
      // Add reply
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === replyingTo.id) {
            return {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now(),
                  user: 'You',
                  text: commentText,
                  timestamp: 'Just now',
                  likes: 0,
                  liked: false,
                },
              ],
              showReplies: true,
            };
          }
          return comment;
        })
      );

      // Notify parent component that a reply (comment) was added
      if (onCommentAdded && postId) {
        onCommentAdded(postId);
      }
    } else {
      // Add new comment
      setComments([
        {
          id: Date.now(),
          user: 'You',
          text: commentText,
          timestamp: 'Just now',
          likes: 0,
          liked: false,
          replies: [],
          showReplies: false,
        },
        ...comments,
      ]);

      // Notify parent component that a comment was added
      if (onCommentAdded && postId) {
        onCommentAdded(postId);
      }
    }

    setCommentText('');
    setReplyingTo(null);
  };

  const renderComment = (comment, isReply = false, parentId = null) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{comment.user[0]}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{comment.user}</Text>
          <Text style={styles.commentTime}>{comment.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            onPress={() => handleLikeComment(comment.id, isReply, parentId)}
            style={styles.commentAction}
          >
            <Text style={styles.commentActionText}>
              {comment.liked ? '❤️' : '🤍'} {comment.likes}
            </Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity
              onPress={() => setReplyingTo(comment)}
              style={styles.commentAction}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.commentsModalOverlay}>
        <View style={styles.commentsModalContent}>
          {/* Header */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.commentsClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.map(comment => (
              <View key={comment.id}>
                {renderComment(comment)}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <TouchableOpacity
                    onPress={() => toggleReplies(comment.id)}
                    style={styles.viewRepliesButton}
                  >
                    <Text style={styles.viewRepliesText}>
                      {comment.showReplies ? '−' : '+'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </Text>
                  </TouchableOpacity>
                )}

                {comment.showReplies && comment.replies.map(reply => renderComment(reply, true, comment.id))}
              </View>
            ))}
          </ScrollView>

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            {replyingTo && (
              <View style={styles.replyingToBar}>
                <Text style={styles.replyingToText}>Replying to {replyingTo.user}</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text style={styles.cancelReply}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : 'Add a comment...'}
                placeholderTextColor="#666"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                disabled={!commentText.trim()}
              >
                <Text style={styles.sendButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const { playTrack, addToQueue, clearQueue, playFromQueue, currentTrack, isPlaying, togglePlayPause } = useAudio();
  const { events, rsvpToEvent, isUserRSVPd } = useBookings();
  const { notifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { conversations, getTotalUnreadCount, sendMessage, markConversationAsRead, deleteConversation, getRecentConversations } = useMessaging();
  const { searchAll, recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch, getTrendingTracks, getPopularUsers, getUpcomingEvents } = useSearch();
  const { getProfile, toggleFollow } = useProfile();
  const { getReviewsForUser, getAverageRating, getRatingBreakdown, getReviewStats, markHelpful } = useReviews();
  const { userRewards, rewardTiers, milestones, referrals, rewardsHistory, getReferralLink, getPointsToNextTier, claimMilestone, getUnclaimedMilestones } = useRewards();
  const { currentTier, nextTier } = useTier();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [postType, setPostType] = useState('audio'); // 'audio' or 'text'
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [postReactions, setPostReactions] = useState({}); // { postId: emoji }
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // postId or null
  const [showCommentsModal, setShowCommentsModal] = useState(null); // postId or null
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'tracks', 'users', 'events'
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardsTab, setRewardsTab] = useState('overview'); // 'overview', 'milestones', 'referrals', 'history'

  // Posts state - initialize with existing posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Mike Soundz',
      avatar: require('../assets/images/Artist.png'),
      time: '2 hours ago',
      caption: 'Just dropped a new track! 🔥 Let me know what you think',
      audioFile: 'New_Track_Mix.mp3',
      audioIcon: '🎵',
      likeCount: 234,
      commentCount: 12,
    },
    {
      id: 2,
      user: 'Podcast Jay',
      avatar: require('../assets/images/Artist_Locs.png'),
      time: '5 hours ago',
      caption: 'New episode out now! Talking about the music industry 🎤',
      audioFile: 'Episode_12.mp3',
      audioIcon: '🎙️',
      likeCount: 189,
      commentCount: 34,
    },
  ]);

  // Track comment counts separately to allow updates without re-rendering posts
  const [postCommentCounts, setPostCommentCounts] = useState({});

  // Combine posts with events (auto-post events to feed)
  const combinedFeed = useMemo(() => {
    const eventPosts = events
      .filter(event => event.autoPostToFeed)
      .map(event => ({
        id: event.id,
        user: 'Booth 33 Studio',
        avatar: require('../assets/images/Artist.png'), // Studio avatar
        time: new Date(event.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        caption: `${event.name} - ${event.description || 'Join us for this special event!'}`,
        eventDetails: event,
        isEvent: true,
        likeCount: event.currentAttendees || 0,
        commentCount: postCommentCounts[event.id] || 0,
      }));

    // Map posts with updated comment counts
    const postsWithCounts = posts.map(post => ({
      ...post,
      commentCount: postCommentCounts[post.id] !== undefined ? postCommentCounts[post.id] : post.commentCount,
    }));

    // Combine and sort by creation time (events first, then posts)
    return [...eventPosts, ...postsWithCounts].sort((a, b) => {
      const timeA = a.isEvent ? new Date(a.eventDetails.createdAt) : 0;
      const timeB = b.isEvent ? new Date(b.eventDetails.createdAt) : 0;
      return timeB - timeA;
    });
  }, [posts, events, postCommentCounts]);

  // Animation refs for like buttons - make dynamic
  const likeAnimations = useRef({}).current;

  // Initialize animations for all posts whenever combinedFeed changes
  useEffect(() => {
    combinedFeed.forEach(post => {
      if (!likeAnimations[post.id]) {
        likeAnimations[post.id] = new Animated.Value(1);
      }
    });
  }, [combinedFeed, likeAnimations]);

  const handleSelectFile = () => {
    // Will add real file picker later
    const mockFile = {
      name: 'My_New_Track.mp3',
      duration: '3:24',
      size: '7.2 MB',
    };
    setSelectedFile(mockFile);
  };

  const handleCreatePost = () => {
    if (!postCaption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    if (postType === 'audio' && !selectedFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    // Create new post object
    const newPost = {
      id: Date.now(), // Simple ID generation
      user: 'You',
      avatar: require('../assets/images/Artist.png'), // Default avatar
      time: 'Just now',
      caption: postCaption,
      audioFile: selectedFile ? selectedFile.name : null,
      audioIcon: postType === 'audio' ? '🎵' : null,
      likeCount: 0,
      commentCount: 0,
    };

    // Add post to beginning of feed
    setPosts(prevPosts => [newPost, ...prevPosts]);

    // Show success
    Alert.alert('Success!', 'Your post has been created!');

    // Reset form
    setPostCaption('');
    setSelectedFile(null);
    setShowCreateModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new posts
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Available reaction emojis
  const reactionEmojis = ['❤️', '🔥', '💯', '👏', '🤯', '🫠', '🥶'];

  const animateLikeButton = (postId) => {
    const animation = likeAnimations[postId];

    if (!animation) return; // Safety check

    // Sequence: scale up with glow, then back down
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: false, // Changed to false to support shadow animations
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false, // Changed to false to support shadow animations
      }),
    ]).start();
  };

  const handleLike = (postId, emoji = '❤️') => {
    animateLikeButton(postId);

    const newLiked = new Set(likedPosts);
    const newReactions = { ...postReactions };

    if (newLiked.has(postId) && newReactions[postId] === emoji) {
      // Unlike if same emoji clicked
      newLiked.delete(postId);
      delete newReactions[postId];
    } else {
      // Like with new emoji
      newLiked.add(postId);
      newReactions[postId] = emoji;
    }

    setLikedPosts(newLiked);
    setPostReactions(newReactions);
    setShowEmojiPicker(null); // Close picker
  };

  const handleLongPressLike = (postId) => {
    setShowEmojiPicker(postId);
  };

  const handleShare = async (post) => {
    try {
      const shareMessage = post.isEvent
        ? `Check out this event at Booth 33 Studio: ${post.eventDetails.name}\n\n${post.eventDetails.description}\n\nDate: ${new Date(post.eventDetails.date).toLocaleDateString()}\nTime: ${post.eventDetails.timeSlot}`
        : `Check out ${post.user}'s post on Booth 33!\n\n${post.caption}`;

      await Share.share({
        message: shareMessage,
        title: post.isEvent ? post.eventDetails.name : 'Booth 33 Post',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleCommentAdded = (postId) => {
    setPostCommentCounts(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  };

  const handlePlayTrack = async (track) => {
    // First play the track
    await playTrack(track);

    // Then set up the queue with all audio posts
    const audioPosts = posts.filter(post => post.audioFile);
    const tracks = audioPosts.map(post => ({
      id: post.id,
      name: post.audioFile,
      audioFile: post.audioFile,
      user: post.user,
      durationMillis: 180000,
    }));

    // Add all tracks to queue
    clearQueue();
    addToQueue(tracks);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BOOTH 33</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowNotificationsModal(true)}
            >
              <Text style={styles.icon}>🔔</Text>
              {getUnreadCount() > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowMessagesModal(true)}
            >
              <Text style={styles.icon}>💬</Text>
              {getTotalUnreadCount() > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {getTotalUnreadCount() > 9 ? '9+' : getTotalUnreadCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowRewardsModal(true)}
            >
              <Text style={styles.icon}>{currentTier.emoji}</Text>
              {userRewards.availableRewards > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {userRewards.availableRewards}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Spinner - positioned at top center when refreshing */}
        {refreshing && <LoadingSpinner />}

        {/* Feed */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false} // Hide native spinner, we'll use custom one
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6', '#EC4899']}
            />
          }
        >
            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome Back! 🎙️</Text>
              <Text style={styles.welcomeText}>Discover new music and podcasts from the community</Text>
            </View>

          {/* Show skeleton posts when refreshing */}
          {refreshing ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : combinedFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎵</Text>
              <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
              <Text style={styles.emptyStateText}>
                Be the first to share! Tap the + button to create a post and share your music with the community.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowCreateModal(true)}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyStateButtonGradient}
                >
                  <Text style={styles.emptyStateButtonText}>Create First Post</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Dynamic Posts from state (includes events) */}
              {combinedFeed.map(post => (
              <View key={post.id} style={styles.postCardContainer}>
              {/* Event posts with gold gradient border */}
              {post.isEvent ? (
                <LinearGradient
                  colors={['#F59E0B', '#FBBF24', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventPostGradientBorder}
                >
                  <View style={styles.eventPostCard}>
                    {/* Event Badge */}
                    <View style={styles.eventPostBadge}>
                      <Text style={styles.eventPostBadgeText}>🎉 STUDIO EVENT</Text>
                    </View>

                    <View style={styles.postHeader}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={post.avatar}
                          style={styles.avatar}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.postHeaderText}>
                        <Text style={styles.username}>{post.user}</Text>
                        <Text style={styles.postTime}>{post.time}</Text>
                      </View>
                    </View>

                    <Text style={styles.postCaption}>{post.caption}</Text>

                    {/* Event Details Card */}
                    <View style={styles.eventDetailsCard}>
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>📅 Date</Text>
                        <Text style={styles.eventDetailValue}>
                          {new Date(post.eventDetails.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>🕐 Time</Text>
                        <Text style={styles.eventDetailValue}>{post.eventDetails.timeSlot}</Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>👥 Attendees</Text>
                        <Text style={styles.eventDetailValue}>
                          {post.eventDetails.currentAttendees} / {post.eventDetails.maxAttendees}
                        </Text>
                      </View>
                    </View>

                    {/* RSVP Button */}
                    {isUserRSVPd(post.eventDetails.id) ? (
                      <View style={styles.rsvpdButton}>
                        <Text style={styles.rsvpdButtonText}>✓ You're Going!</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          if (post.eventDetails.currentAttendees < post.eventDetails.maxAttendees) {
                            rsvpToEvent(post.eventDetails.id);
                            Alert.alert(
                              'RSVP Confirmed!',
                              `You're all set for ${post.eventDetails.name}!`,
                              [{ text: 'Got it!' }]
                            );
                          } else {
                            Alert.alert('Event Full', 'This event has reached maximum capacity.');
                          }
                        }}
                      >
                        <LinearGradient
                          colors={['#F59E0B', '#FBBF24']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.eventRSVPButton}
                        >
                          <Text style={styles.eventRSVPButtonText}>
                            {post.eventDetails.currentAttendees >= post.eventDetails.maxAttendees ? 'EVENT FULL' : 'RSVP NOW'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                      <View>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleLike(post.id, postReactions[post.id] || '❤️')}
                          onLongPress={() => handleLongPressLike(post.id)}
                          delayLongPress={500}
                        >
                          <Animated.View style={{
                            transform: [{ scale: likeAnimations[post.id] || 1 }],
                            shadowColor: likedPosts.has(post.id) ? '#F59E0B' : 'transparent',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 15,
                          }}>
                            <Text style={[
                              styles.actionIcon,
                              likedPosts.has(post.id) && styles.likedIcon
                            ]}>
                              {likedPosts.has(post.id) ? (postReactions[post.id] || '❤️') : '🤍'}
                            </Text>
                          </Animated.View>
                          <Text style={styles.actionText}>
                            {likedPosts.has(post.id) ? post.likeCount + 1 : post.likeCount}
                          </Text>
                        </Pressable>

                        {showEmojiPicker === post.id && (
                          <Modal
                            visible={true}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowEmojiPicker(null)}
                          >
                            <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(null)}>
                              <View style={styles.emojiPickerOverlay}>
                                <TouchableWithoutFeedback onPress={() => {}}>
                                  <View style={styles.emojiPickerPopup}>
                                    <View style={styles.emojiPickerWrapper}>
                                      <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.emojiPickerContainer}
                                      >
                                        {reactionEmojis.map((emoji, index) => (
                                          <TouchableOpacity
                                            key={index}
                                            onPress={() => handleLike(post.id, emoji)}
                                            style={styles.emojiOption}
                                          >
                                            <Text style={styles.emojiOptionText}>{emoji}</Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                    </View>
                                  </View>
                                </TouchableWithoutFeedback>
                              </View>
                            </TouchableWithoutFeedback>
                          </Modal>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowCommentsModal(post.id)}
                      >
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionText}>{post.commentCount}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleShare(post)}
                      >
                        <Text style={styles.actionIcon}>🔗</Text>
                        <Text style={styles.actionText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={post.avatar}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.postHeaderText}>
                    <Text style={styles.username}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                </View>

                <Text style={styles.postCaption}>{post.caption}</Text>

                {/* Audio Player */}
                {post.audioFile && (
                  <AudioPlayer
                    track={{
                      id: post.id,
                      name: post.audioFile,
                      audioFile: post.audioFile,
                      user: post.user,
                      durationMillis: 180000, // 3 minutes default
                    }}
                    compact={true}
                    onPlay={handlePlayTrack}
                  />
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  <View>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleLike(post.id, postReactions[post.id] || '❤️')}
                      onLongPress={() => handleLongPressLike(post.id)}
                      delayLongPress={500}
                    >
                      <Animated.View style={{
                        transform: [{ scale: likeAnimations[post.id] || 1 }],
                        shadowColor: likedPosts.has(post.id) ? '#EC4899' : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: likeAnimations[post.id] ? likeAnimations[post.id].interpolate({
                          inputRange: [1, 1.4],
                          outputRange: [0, 20],
                        }) : 0,
                      }}>
                        <Text style={[
                          styles.actionIcon,
                          likedPosts.has(post.id) && styles.likedIcon
                        ]}>
                          {likedPosts.has(post.id) ? (postReactions[post.id] || '❤️') : '🤍'}
                        </Text>
                      </Animated.View>
                      <Text style={styles.actionText}>
                        {likedPosts.has(post.id) ? post.likeCount + 1 : post.likeCount}
                      </Text>
                    </Pressable>

                    {/* Emoji Picker Popup positioned near like button */}
                    {showEmojiPicker === post.id && (
                      <Modal
                        visible={true}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowEmojiPicker(null)}
                      >
                        <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(null)}>
                          <View style={styles.emojiPickerOverlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                              <View style={styles.emojiPickerPopup}>
                                <View style={styles.emojiPickerWrapper}>
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.emojiPickerContainer}
                                  >
                                    {reactionEmojis.map((emoji, index) => (
                                      <TouchableOpacity
                                        key={index}
                                        onPress={() => handleLike(post.id, emoji)}
                                        style={styles.emojiOption}
                                      >
                                        <Text style={styles.emojiOptionText}>{emoji}</Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowCommentsModal(post.id)}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>{post.commentCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(post)}
                  >
                    <Text style={styles.actionIcon}>🔗</Text>
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
              )}
              </View>
              ))}
            </>
          )}

          {/* Spacer for bottom tab bar */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Comments Modal */}
        <CommentsModal
          visible={showCommentsModal !== null}
          onClose={() => setShowCommentsModal(null)}
          postId={showCommentsModal}
          initialCommentCount={showCommentsModal === 1 ? 12 : 34}
          onCommentAdded={handleCommentAdded}
        />

        {/* Notifications Modal */}
        <Modal
          visible={showNotificationsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotificationsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notificationsModalContent}>
              {/* Header */}
              <View style={styles.notificationsHeader}>
                <Text style={styles.notificationsTitle}>Notifications</Text>
                <View style={styles.notificationsHeaderActions}>
                  {getUnreadCount() > 0 && (
                    <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadButton}>
                      <Text style={styles.markAllReadText}>Mark All Read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                    <Text style={styles.notificationsClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notifications List */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.notificationsList}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.read && styles.notificationItemUnread,
                      ]}
                      onPress={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationIconContainer}>
                          <Text style={styles.notificationIcon}>
                            {notification.type === 'booking_reminder' && '📅'}
                            {notification.type === 'booking_approved' && '✓'}
                            {notification.type === 'booking_rejected' && '✕'}
                            {notification.type === 'event_reminder' && '🎉'}
                            {notification.type === 'credits_granted' && '💳'}
                            {notification.type === 'payment_success' && '✓'}
                            {notification.type === 'payment_failed' && '⚠️'}
                            {notification.type === 'refund' && '💰'}
                            {notification.type === 'social_follow' && '👤'}
                            {notification.type === 'social_comment' && '💬'}
                            {notification.type === 'social_like' && '❤️'}
                          </Text>
                        </View>
                        <View style={styles.notificationText}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          <Text style={styles.notificationMessage}>{notification.message}</Text>
                          <Text style={styles.notificationTime}>
                            {new Date(notification.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        style={styles.deleteNotificationButton}
                      >
                        <Text style={styles.deleteNotificationText}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noNotifications}>
                    <Text style={styles.noNotificationsEmoji}>🔔</Text>
                    <Text style={styles.noNotificationsText}>No notifications yet</Text>
                    <Text style={styles.noNotificationsSubtext}>
                      We'll notify you about bookings, events, and more
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Messages Modal (Inbox) */}
        <Modal
          visible={showMessagesModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMessagesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notificationsModalContent}>
              {/* Header */}
              <View style={styles.notificationsHeader}>
                <Text style={styles.notificationsTitle}>Messages</Text>
                <TouchableOpacity onPress={() => setShowMessagesModal(false)}>
                  <Text style={styles.notificationsClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Conversations List */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.notificationsList}>
                {getRecentConversations().length > 0 ? (
                  getRecentConversations().map((conversation) => (
                    <TouchableOpacity
                      key={conversation.id}
                      style={[
                        styles.conversationItem,
                        conversation.unreadCount > 0 && styles.conversationItemUnread,
                      ]}
                      onPress={() => {
                        setSelectedConversation(conversation);
                        setShowMessagesModal(false);
                        setShowChatModal(true);
                        if (conversation.unreadCount > 0) {
                          markConversationAsRead(conversation.id);
                        }
                      }}
                    >
                      <Image source={conversation.userAvatar} style={styles.conversationAvatar} />
                      <View style={styles.conversationContent}>
                        <View style={styles.conversationHeader}>
                          <Text style={styles.conversationName}>{conversation.userName}</Text>
                          <Text style={styles.conversationTime}>
                            {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View style={styles.conversationMessageRow}>
                          <Text
                            style={[
                              styles.conversationLastMessage,
                              conversation.unreadCount > 0 && styles.conversationLastMessageUnread,
                            ]}
                            numberOfLines={1}
                          >
                            {conversation.lastMessage}
                          </Text>
                          {conversation.unreadCount > 0 && (
                            <View style={styles.conversationUnreadBadge}>
                              <Text style={styles.conversationUnreadText}>
                                {conversation.unreadCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Delete Conversation',
                            `Delete conversation with ${conversation.userName}?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => deleteConversation(conversation.id),
                              },
                            ]
                          );
                        }}
                        style={styles.deleteConversationButton}
                      >
                        <Text style={styles.deleteNotificationText}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noNotifications}>
                    <Text style={styles.noNotificationsEmoji}>💬</Text>
                    <Text style={styles.noNotificationsText}>No messages yet</Text>
                    <Text style={styles.noNotificationsSubtext}>
                      Start a conversation with other artists in the community
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Chat Modal (Conversation) */}
        <Modal
          visible={showChatModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowChatModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.chatModalContent}>
              {/* Chat Header */}
              {selectedConversation && (
                <View style={styles.chatHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowChatModal(false);
                      setShowMessagesModal(true);
                    }}
                    style={styles.chatBackButton}
                  >
                    <Text style={styles.chatBackText}>‹</Text>
                  </TouchableOpacity>
                  <Image source={selectedConversation.userAvatar} style={styles.chatAvatar} />
                  <Text style={styles.chatUserName}>{selectedConversation.userName}</Text>
                  <TouchableOpacity onPress={() => setShowChatModal(false)}>
                    <Text style={styles.notificationsClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Messages List */}
              {selectedConversation && (
                <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
                  {selectedConversation.messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.chatBubble,
                        message.senderId === 'current_user'
                          ? styles.chatBubbleSent
                          : styles.chatBubbleReceived,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chatBubbleText,
                          message.senderId === 'current_user' && styles.chatBubbleTextSent,
                        ]}
                      >
                        {message.text}
                      </Text>
                      <Text
                        style={[
                          styles.chatBubbleTime,
                          message.senderId === 'current_user' && styles.chatBubbleTimeSent,
                        ]}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Message Input */}
              {selectedConversation && (
                <View style={styles.chatInputContainer}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#666"
                    multiline
                    value={postCaption}
                    onChangeText={setPostCaption}
                  />
                  <TouchableOpacity
                    style={styles.chatSendButton}
                    onPress={() => {
                      if (postCaption.trim()) {
                        sendMessage(selectedConversation.id, postCaption.trim());
                        setPostCaption('');
                      }
                    }}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#EC4899']}
                      style={styles.chatSendGradient}
                    >
                      <Text style={styles.chatSendText}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Post Modal */}
        <Modal
          visible={showCreateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={handleCreatePost}>
                  <Text style={styles.modalPost}>Post</Text>
                </TouchableOpacity>
              </View>

              {/* Post Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeButton, postType === 'audio' && styles.typeButtonActive]}
                  onPress={() => setPostType('audio')}
                >
                  <Text style={[styles.typeButtonText, postType === 'audio' && styles.typeButtonTextActive]}>
                    🎵 Audio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, postType === 'text' && styles.typeButtonActive]}
                  onPress={() => setPostType('text')}
                >
                  <Text style={[styles.typeButtonText, postType === 'text' && styles.typeButtonTextActive]}>
                    💬 Text Only
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Caption Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Caption</Text>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="What's on your mind?"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    value={postCaption}
                    onChangeText={setPostCaption}
                    textAlignVertical="top"
                  />
                </View>

                {/* File Attachment (Audio type only) */}
                {postType === 'audio' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Audio File</Text>
                    {selectedFile ? (
                      <View style={styles.filePreview}>
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileIcon}>🎵</Text>
                          <View style={styles.fileDetails}>
                            <Text style={styles.fileName}>{selectedFile.name}</Text>
                            <Text style={styles.fileMeta}>
                              {selectedFile.duration} • {selectedFile.size}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                          <Text style={styles.removeFile}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.uploadButton}
                        onPress={handleSelectFile}
                      >
                        <Text style={styles.uploadIcon}>📁</Text>
                        <Text style={styles.uploadText}>Select Audio File</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Post Button */}
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={handleCreatePost}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createPostGradient}
                  >
                    <Text style={styles.createPostText}>CREATE POST</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSearchModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.searchModalContent}>
              {/* Header with Close Button */}
              <View style={styles.searchHeader}>
                <Text style={styles.searchTitle}>Search</Text>
                <TouchableOpacity onPress={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  setSearchFilter('all');
                }}>
                  <Text style={styles.searchClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchInputIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tracks, artists, events..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                  onSubmitEditing={() => {
                    if (searchQuery.trim()) {
                      addRecentSearch(searchQuery);
                    }
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.searchClearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs */}
              <View style={styles.searchFilterTabs}>
                <TouchableOpacity
                  style={[styles.searchFilterTab, searchFilter === 'all' && styles.searchFilterTabActive]}
                  onPress={() => setSearchFilter('all')}
                >
                  <Text style={[styles.searchFilterTabText, searchFilter === 'all' && styles.searchFilterTabTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.searchFilterTab, searchFilter === 'tracks' && styles.searchFilterTabActive]}
                  onPress={() => setSearchFilter('tracks')}
                >
                  <Text style={[styles.searchFilterTabText, searchFilter === 'tracks' && styles.searchFilterTabTextActive]}>
                    Tracks
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.searchFilterTab, searchFilter === 'users' && styles.searchFilterTabActive]}
                  onPress={() => setSearchFilter('users')}
                >
                  <Text style={[styles.searchFilterTabText, searchFilter === 'users' && styles.searchFilterTabTextActive]}>
                    Users
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.searchFilterTab, searchFilter === 'events' && styles.searchFilterTabActive]}
                  onPress={() => setSearchFilter('events')}
                >
                  <Text style={[styles.searchFilterTabText, searchFilter === 'events' && styles.searchFilterTabTextActive]}>
                    Events
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search Results or Default Content */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.searchResults}>
                {searchQuery.trim() ? (
                  // Show Search Results
                  (() => {
                    const results = searchAll(searchQuery);
                    const tracksToShow = searchFilter === 'all' || searchFilter === 'tracks' ? results.tracks : [];
                    const usersToShow = searchFilter === 'all' || searchFilter === 'users' ? results.users : [];
                    const eventsToShow = searchFilter === 'all' || searchFilter === 'events' ? results.events : [];
                    const hasResults = tracksToShow.length > 0 || usersToShow.length > 0 || eventsToShow.length > 0;

                    if (!hasResults) {
                      return (
                        <View style={styles.searchEmptyState}>
                          <Text style={styles.searchEmptyIcon}>🔍</Text>
                          <Text style={styles.searchEmptyText}>No results found</Text>
                          <Text style={styles.searchEmptySubtext}>Try searching for something else</Text>
                        </View>
                      );
                    }

                    return (
                      <>
                        {/* Tracks Results */}
                        {tracksToShow.length > 0 && (
                          <View style={styles.searchSection}>
                            <Text style={styles.searchSectionTitle}>
                              Tracks {searchFilter === 'all' && `(${tracksToShow.length})`}
                            </Text>
                            {tracksToShow.map((track) => (
                              <TouchableOpacity
                                key={track.id}
                                style={styles.searchResultItem}
                                onPress={() => {
                                  setShowSearchModal(false);
                                  // Could integrate with audio player here
                                  Alert.alert('Track', `Play: ${track.title} by ${track.artist}`);
                                }}
                              >
                                <View style={styles.searchResultIcon}>
                                  <Text style={styles.searchResultIconText}>🎵</Text>
                                </View>
                                <View style={styles.searchResultInfo}>
                                  <Text style={styles.searchResultTitle}>{track.title}</Text>
                                  <Text style={styles.searchResultSubtitle}>{track.artist} • {track.genre}</Text>
                                </View>
                                <Text style={styles.searchResultMeta}>{track.plays.toLocaleString()} plays</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        {/* Users Results */}
                        {usersToShow.length > 0 && (
                          <View style={styles.searchSection}>
                            <Text style={styles.searchSectionTitle}>
                              Users {searchFilter === 'all' && `(${usersToShow.length})`}
                            </Text>
                            {usersToShow.map((user) => (
                              <TouchableOpacity
                                key={user.id}
                                style={styles.searchResultItem}
                                onPress={() => {
                                  setShowSearchModal(false);
                                  setSelectedProfileId(`user_${user.id}`);
                                  setShowProfileModal(true);
                                }}
                              >
                                <View style={styles.searchResultIcon}>
                                  <Text style={styles.searchResultIconText}>👤</Text>
                                </View>
                                <View style={styles.searchResultInfo}>
                                  <Text style={styles.searchResultTitle}>{user.name}</Text>
                                  <Text style={styles.searchResultSubtitle}>{user.username} • {user.genre}</Text>
                                </View>
                                <Text style={styles.searchResultMeta}>{user.followers.toLocaleString()} followers</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        {/* Events Results */}
                        {eventsToShow.length > 0 && (
                          <View style={styles.searchSection}>
                            <Text style={styles.searchSectionTitle}>
                              Events {searchFilter === 'all' && `(${eventsToShow.length})`}
                            </Text>
                            {eventsToShow.map((event) => (
                              <TouchableOpacity
                                key={event.id}
                                style={styles.searchResultItem}
                                onPress={() => {
                                  setShowSearchModal(false);
                                  Alert.alert('Event', `View event: ${event.name}`);
                                }}
                              >
                                <View style={styles.searchResultIcon}>
                                  <Text style={styles.searchResultIconText}>🎉</Text>
                                </View>
                                <View style={styles.searchResultInfo}>
                                  <Text style={styles.searchResultTitle}>{event.name}</Text>
                                  <Text style={styles.searchResultSubtitle}>
                                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.type.replace('-', ' ')}
                                  </Text>
                                </View>
                                <Text style={styles.searchResultMeta}>{event.attendees} attending</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </>
                    );
                  })()
                ) : (
                  // Show Default Content (Recent Searches and Trending)
                  <>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <View style={styles.searchSection}>
                        <View style={styles.searchSectionHeader}>
                          <Text style={styles.searchSectionTitle}>Recent Searches</Text>
                          <TouchableOpacity onPress={clearRecentSearches}>
                            <Text style={styles.searchClearAllText}>Clear All</Text>
                          </TouchableOpacity>
                        </View>
                        {recentSearches.map((search, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.recentSearchItem}
                            onPress={() => setSearchQuery(search)}
                          >
                            <Text style={styles.recentSearchIcon}>🕐</Text>
                            <Text style={styles.recentSearchText}>{search}</Text>
                            <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                              <Text style={styles.recentSearchRemove}>✕</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Trending Tracks */}
                    <View style={styles.searchSection}>
                      <Text style={styles.searchSectionTitle}>Trending Tracks</Text>
                      {getTrendingTracks().map((track) => (
                        <TouchableOpacity
                          key={track.id}
                          style={styles.searchResultItem}
                          onPress={() => {
                            setShowSearchModal(false);
                            Alert.alert('Track', `Play: ${track.title} by ${track.artist}`);
                          }}
                        >
                          <View style={styles.searchResultIcon}>
                            <Text style={styles.searchResultIconText}>🔥</Text>
                          </View>
                          <View style={styles.searchResultInfo}>
                            <Text style={styles.searchResultTitle}>{track.title}</Text>
                            <Text style={styles.searchResultSubtitle}>{track.artist}</Text>
                          </View>
                          <Text style={styles.searchResultMeta}>{track.plays.toLocaleString()} plays</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Popular Users */}
                    <View style={styles.searchSection}>
                      <Text style={styles.searchSectionTitle}>Popular Users</Text>
                      {getPopularUsers().map((user) => (
                        <TouchableOpacity
                          key={user.id}
                          style={styles.searchResultItem}
                          onPress={() => {
                            setShowSearchModal(false);
                            setSelectedProfileId(`user_${user.id}`);
                            setShowProfileModal(true);
                          }}
                        >
                          <View style={styles.searchResultIcon}>
                            <Text style={styles.searchResultIconText}>⭐</Text>
                          </View>
                          <View style={styles.searchResultInfo}>
                            <Text style={styles.searchResultTitle}>{user.name}</Text>
                            <Text style={styles.searchResultSubtitle}>{user.genre}</Text>
                          </View>
                          <Text style={styles.searchResultMeta}>{user.followers.toLocaleString()} followers</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Upcoming Events */}
                    <View style={styles.searchSection}>
                      <Text style={styles.searchSectionTitle}>Upcoming Events</Text>
                      {getUpcomingEvents().map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          style={styles.searchResultItem}
                          onPress={() => {
                            setShowSearchModal(false);
                            Alert.alert('Event', `View event: ${event.name}`);
                          }}
                        >
                          <View style={styles.searchResultIcon}>
                            <Text style={styles.searchResultIconText}>📅</Text>
                          </View>
                          <View style={styles.searchResultInfo}>
                            <Text style={styles.searchResultTitle}>{event.name}</Text>
                            <Text style={styles.searchResultSubtitle}>
                              {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                          <Text style={styles.searchResultMeta}>{event.attendees} attending</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* User Profile Modal */}
        <Modal
          visible={showProfileModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowProfileModal(false)}
        >
          {selectedProfileId && (() => {
            const profile = getProfile(selectedProfileId);
            if (!profile) return null;

            return (
              <View style={styles.modalOverlay}>
                <View style={styles.profileModalContent}>
                  {/* Header */}
                  <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                      <Text style={styles.profileBackButton}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.profileHeaderTitle}>{profile.username}</Text>
                    <View style={{ width: 32 }} />
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Profile Info */}
                    <View style={styles.profileInfo}>
                      <Image source={profile.avatar} style={styles.profileAvatar} />
                      <View style={styles.profileNameRow}>
                        <Text style={styles.profileName}>{profile.name}</Text>
                        {profile.verified && <Text style={styles.profileVerifiedBadge}>✓</Text>}
                      </View>
                      <Text style={styles.profileUsername}>{profile.username}</Text>
                      <Text style={styles.profileBio}>{profile.bio}</Text>

                      <View style={styles.profileMetaRow}>
                        <Text style={styles.profileMetaItem}>📍 {profile.location}</Text>
                        <Text style={styles.profileMetaItem}>🎵 {profile.genre}</Text>
                      </View>

                      {/* Stats */}
                      <View style={styles.profileStatsRow}>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatValue}>{profile.followers.toLocaleString()}</Text>
                          <Text style={styles.profileStatLabel}>Followers</Text>
                        </View>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatValue}>{profile.following.toLocaleString()}</Text>
                          <Text style={styles.profileStatLabel}>Following</Text>
                        </View>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatValue}>{profile.stats.totalTracks}</Text>
                          <Text style={styles.profileStatLabel}>Tracks</Text>
                        </View>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatValue}>{profile.stats.totalCollaborations}</Text>
                          <Text style={styles.profileStatLabel}>Collabs</Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.profileActionsRow}>
                        <TouchableOpacity
                          style={[styles.profileActionButton, styles.profileFollowButton]}
                          onPress={() => toggleFollow(profile.id)}
                        >
                          <LinearGradient
                            colors={profile.isFollowing ? ['#374151', '#1F2937'] : ['#8B5CF6', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.profileActionGradient}
                          >
                            <Text style={styles.profileActionText}>
                              {profile.isFollowing ? 'Following' : 'Follow'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.profileActionButton}
                          onPress={() => {
                            setShowProfileModal(false);
                            // Could open messages here
                            Alert.alert('Message', `Send message to ${profile.name}`);
                          }}
                        >
                          <View style={styles.profileMessageButton}>
                            <Text style={styles.profileMessageIcon}>💬</Text>
                            <Text style={styles.profileMessageText}>Message</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {/* Social Links */}
                      {profile.socialLinks && (
                        <View style={styles.profileSocialLinks}>
                          {profile.socialLinks.instagram && (
                            <TouchableOpacity style={styles.profileSocialLink}>
                              <Text style={styles.profileSocialIcon}>📷</Text>
                              <Text style={styles.profileSocialText}>{profile.socialLinks.instagram}</Text>
                            </TouchableOpacity>
                          )}
                          {profile.socialLinks.soundcloud && (
                            <TouchableOpacity style={styles.profileSocialLink}>
                              <Text style={styles.profileSocialIcon}>☁️</Text>
                              <Text style={styles.profileSocialText}>{profile.socialLinks.soundcloud}</Text>
                            </TouchableOpacity>
                          )}
                          {profile.socialLinks.spotify && (
                            <TouchableOpacity style={styles.profileSocialLink}>
                              <Text style={styles.profileSocialIcon}>🎵</Text>
                              <Text style={styles.profileSocialText}>{profile.socialLinks.spotify}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Portfolio Section */}
                    <View style={styles.profilePortfolioSection}>
                      <Text style={styles.profileSectionTitle}>Portfolio</Text>
                      {profile.portfolio.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.profilePortfolioItem}>
                          <View style={styles.profilePortfolioIcon}>
                            <Text style={styles.profilePortfolioIconText}>{item.thumbnail}</Text>
                          </View>
                          <View style={styles.profilePortfolioInfo}>
                            <Text style={styles.profilePortfolioTitle}>{item.title}</Text>
                            <Text style={styles.profilePortfolioDescription}>{item.description}</Text>
                            <View style={styles.profilePortfolioMeta}>
                              <Text style={styles.profilePortfolioMetaText}>
                                {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Text>
                              {item.plays && (
                                <Text style={styles.profilePortfolioMetaText}>• {item.plays.toLocaleString()} plays</Text>
                              )}
                              {item.views && (
                                <Text style={styles.profilePortfolioMetaText}>• {item.views.toLocaleString()} views</Text>
                              )}
                              {item.likes && (
                                <Text style={styles.profilePortfolioMetaText}>• {item.likes} ❤️</Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.profileActivitySection}>
                      <Text style={styles.profileSectionTitle}>Recent Activity</Text>
                      {profile.recentActivity.map((activity, index) => (
                        <View key={index} style={styles.profileActivityItem}>
                          <Text style={styles.profileActivityIcon}>
                            {activity.type === 'track_upload' && '🎵'}
                            {activity.type === 'booking' && '📅'}
                            {activity.type === 'collaboration' && '🤝'}
                            {activity.type === 'event' && '🎉'}
                          </Text>
                          <View style={styles.profileActivityInfo}>
                            <Text style={styles.profileActivityText}>{activity.content}</Text>
                            <Text style={styles.profileActivityDate}>
                              {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Reviews Section */}
                    {(() => {
                      const reviews = getReviewsForUser(profile.id);
                      const reviewStats = getReviewStats(profile.id);
                      const avgRating = parseFloat(getAverageRating(profile.id));
                      const ratingBreakdown = getRatingBreakdown(profile.id);

                      return (
                        <View style={styles.profileReviewsSection}>
                          <Text style={styles.profileSectionTitle}>Reviews & Ratings</Text>

                          {/* Rating Summary */}
                          {reviewStats.totalReviews > 0 ? (
                            <>
                              <View style={styles.reviewSummary}>
                                <View style={styles.reviewAverageContainer}>
                                  <Text style={styles.reviewAverageNumber}>{avgRating.toFixed(1)}</Text>
                                  <View style={styles.reviewStarsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Text key={star} style={styles.reviewStar}>
                                        {star <= Math.round(avgRating) ? '⭐' : '☆'}
                                      </Text>
                                    ))}
                                  </View>
                                  <Text style={styles.reviewCount}>
                                    Based on {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
                                  </Text>
                                </View>

                                {/* Rating Breakdown */}
                                <View style={styles.reviewBreakdown}>
                                  {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingBreakdown[star] || 0;
                                    const percentage = reviewStats.totalReviews > 0
                                      ? (count / reviewStats.totalReviews) * 100
                                      : 0;

                                    return (
                                      <View key={star} style={styles.reviewBreakdownRow}>
                                        <Text style={styles.reviewBreakdownStar}>{star}★</Text>
                                        <View style={styles.reviewBreakdownBar}>
                                          <View
                                            style={[
                                              styles.reviewBreakdownBarFill,
                                              { width: `${percentage}%` }
                                            ]}
                                          />
                                        </View>
                                        <Text style={styles.reviewBreakdownCount}>{count}</Text>
                                      </View>
                                    );
                                  })}
                                </View>
                              </View>

                              {/* Individual Reviews */}
                              <View style={styles.reviewsList}>
                                {reviews.map((review) => (
                                  <View key={review.id} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                      <Image source={review.reviewerAvatar} style={styles.reviewerAvatar} />
                                      <View style={styles.reviewerInfo}>
                                        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                                        <View style={styles.reviewItemStars}>
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Text key={star} style={styles.reviewItemStar}>
                                              {star <= review.overallRating ? '⭐' : '☆'}
                                            </Text>
                                          ))}
                                        </View>
                                      </View>
                                      <Text style={styles.reviewDate}>
                                        {review.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </Text>
                                    </View>

                                    {review.title && (
                                      <Text style={styles.reviewTitle}>{review.title}</Text>
                                    )}

                                    <Text style={styles.reviewContent}>{review.content}</Text>

                                    {/* Review Actions */}
                                    <View style={styles.reviewActions}>
                                      <TouchableOpacity
                                        style={styles.reviewHelpfulButton}
                                        onPress={() => markHelpful(review.id)}
                                      >
                                        <Text style={styles.reviewHelpfulIcon}>👍</Text>
                                        <Text style={styles.reviewHelpfulText}>
                                          Helpful ({review.helpfulCount})
                                        </Text>
                                      </TouchableOpacity>
                                      {review.verified && (
                                        <View style={styles.reviewVerifiedBadge}>
                                          <Text style={styles.reviewVerifiedIcon}>✓</Text>
                                          <Text style={styles.reviewVerifiedText}>Verified</Text>
                                        </View>
                                      )}
                                    </View>

                                    {/* Response */}
                                    {review.response && (
                                      <View style={styles.reviewResponse}>
                                        <Text style={styles.reviewResponseLabel}>
                                          Response from {profile.name}:
                                        </Text>
                                        <Text style={styles.reviewResponseText}>{review.response.text}</Text>
                                        <Text style={styles.reviewResponseDate}>
                                          {review.response.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                ))}
                              </View>
                            </>
                          ) : (
                            <View style={styles.reviewsEmptyState}>
                              <Text style={styles.reviewsEmptyIcon}>⭐</Text>
                              <Text style={styles.reviewsEmptyText}>No reviews yet</Text>
                              <Text style={styles.reviewsEmptySubtext}>
                                Be the first to work with {profile.name}!
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })()}
                  </ScrollView>
                </View>
              </View>
            );
          })()}
        </Modal>

        {/* Rewards & Referrals Modal */}
        <Modal
          visible={showRewardsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRewardsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.rewardsModalContent}>
              {/* Header */}
              <View style={styles.rewardsHeader}>
                <Text style={styles.rewardsTitle}>Rewards & Tier</Text>
                <TouchableOpacity onPress={() => setShowRewardsModal(false)}>
                  <Text style={styles.rewardsClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={styles.rewardsTabs}>
                <TouchableOpacity
                  style={[styles.rewardsTab, rewardsTab === 'overview' && styles.rewardsTabActive]}
                  onPress={() => setRewardsTab('overview')}
                >
                  <Text style={[styles.rewardsTabText, rewardsTab === 'overview' && styles.rewardsTabTextActive]}>
                    Overview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rewardsTab, rewardsTab === 'milestones' && styles.rewardsTabActive]}
                  onPress={() => setRewardsTab('milestones')}
                >
                  <Text style={[styles.rewardsTabText, rewardsTab === 'milestones' && styles.rewardsTabTextActive]}>
                    Milestones
                  </Text>
                  {getUnclaimedMilestones().length > 0 && (
                    <View style={styles.rewardsTabBadge}>
                      <Text style={styles.rewardsTabBadgeText}>{getUnclaimedMilestones().length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rewardsTab, rewardsTab === 'referrals' && styles.rewardsTabActive]}
                  onPress={() => setRewardsTab('referrals')}
                >
                  <Text style={[styles.rewardsTabText, rewardsTab === 'referrals' && styles.rewardsTabTextActive]}>
                    Refer
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.rewardsContent}>
                {/* Overview Tab */}
                {rewardsTab === 'overview' && (
                  <View>
                    {/* Current Tier Card */}
                    <View style={styles.tierCard}>
                      <Text style={styles.tierCardTitle}>Your Tier</Text>
                      <View style={styles.tierDisplay}>
                        <Text style={styles.tierIcon}>{currentTier.emoji}</Text>
                        <Text style={styles.tierName}>{currentTier.name}</Text>
                      </View>

                      {/* Progress to Next Tier */}
                      {nextTier && (
                        <View style={styles.tierProgressContainer}>
                          <View style={styles.tierProgressHeader}>
                            <Text style={styles.tierProgressText}>
                              {getPointsToNextTier()} points to {nextTier.name}
                            </Text>
                            <Text style={styles.tierProgressPercent}>{userRewards.tierProgress}%</Text>
                          </View>
                          <View style={styles.tierProgressBar}>
                            <LinearGradient
                              colors={['#8B5CF6', '#EC4899']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[styles.tierProgressFill, { width: `${userRewards.tierProgress}%` }]}
                            />
                          </View>
                        </View>
                      )}

                      {/* Current Tier Benefits */}
                      <Text style={styles.tierBenefitsTitle}>Your Benefits:</Text>
                      {currentTier.benefits.map((benefit, index) => (
                        <View key={index} style={styles.tierBenefit}>
                          <Text style={styles.tierBenefitIcon}>✓</Text>
                          <Text style={styles.tierBenefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userRewards.totalPoints}</Text>
                        <Text style={styles.statLabel}>Total Points</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userRewards.lifetimeCreditsEarned}</Text>
                        <Text style={styles.statLabel}>Credits Earned</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userRewards.successfulReferrals}</Text>
                        <Text style={styles.statLabel}>Referrals</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userRewards.currentLoginStreak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                      </View>
                    </View>

                    {/* Recent Rewards */}
                    <View style={styles.recentRewardsSection}>
                      <Text style={styles.sectionTitle}>Recent Rewards</Text>
                      {rewardsHistory.slice(0, 5).map((reward) => (
                        <View key={reward.id} style={styles.rewardHistoryItem}>
                          <Text style={styles.rewardHistoryIcon}>{reward.icon}</Text>
                          <View style={styles.rewardHistoryInfo}>
                            <Text style={styles.rewardHistoryTitle}>{reward.title}</Text>
                            <Text style={styles.rewardHistoryDate}>
                              {reward.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                          <Text style={styles.rewardHistoryCredits}>+{reward.creditsEarned}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Milestones Tab */}
                {rewardsTab === 'milestones' && (
                  <View>
                    {/* Unclaimed Milestones */}
                    {getUnclaimedMilestones().length > 0 && (
                      <View style={styles.milestonesSection}>
                        <Text style={styles.sectionTitle}>🎁 Ready to Claim!</Text>
                        {getUnclaimedMilestones().map((milestone) => (
                          <View key={milestone.id} style={styles.milestoneCard}>
                            <View style={styles.milestoneHeader}>
                              <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                              <View style={styles.milestoneInfo}>
                                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={styles.claimButton}
                              onPress={() => {
                                const result = claimMilestone(milestone.id);
                                if (result.success) {
                                  Alert.alert('Reward Claimed!', result.message);
                                }
                              }}
                            >
                              <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.claimGradient}
                              >
                                <Text style={styles.claimButtonText}>
                                  Claim {milestone.reward.amount} Credits
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* In Progress Milestones */}
                    <View style={styles.milestonesSection}>
                      <Text style={styles.sectionTitle}>In Progress</Text>
                      {milestones
                        .filter(m => !m.completed)
                        .map((milestone) => (
                          <View key={milestone.id} style={styles.milestoneCard}>
                            <View style={styles.milestoneHeader}>
                              <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                              <View style={styles.milestoneInfo}>
                                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                                <Text style={styles.milestoneReward}>
                                  Reward: {milestone.reward.amount} credits
                                </Text>
                              </View>
                            </View>
                            {milestone.progress !== undefined && (
                              <View style={styles.milestoneProgressContainer}>
                                <Text style={styles.milestoneProgressText}>{milestone.progress}% Complete</Text>
                                <View style={styles.milestoneProgressBar}>
                                  <View
                                    style={[styles.milestoneProgressFill, { width: `${milestone.progress}%` }]}
                                  />
                                </View>
                              </View>
                            )}
                          </View>
                        ))}
                    </View>

                    {/* Completed Milestones */}
                    <View style={styles.milestonesSection}>
                      <Text style={styles.sectionTitle}>Completed</Text>
                      {milestones
                        .filter(m => m.completed && m.claimed)
                        .map((milestone) => (
                          <View key={milestone.id} style={[styles.milestoneCard, styles.milestoneCardCompleted]}>
                            <View style={styles.milestoneHeader}>
                              <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                              <View style={styles.milestoneInfo}>
                                <Text style={[styles.milestoneTitle, styles.milestoneCompleted]}>
                                  {milestone.title}
                                </Text>
                                <Text style={styles.milestoneCompletedDate}>
                                  Completed {milestone.completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                              </View>
                              <Text style={styles.milestoneCompletedCheck}>✓</Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  </View>
                )}

                {/* Referrals Tab */}
                {rewardsTab === 'referrals' && (
                  <View>
                    {/* Referral Link Section */}
                    <View style={styles.referralLinkCard}>
                      <Text style={styles.referralLinkTitle}>Your Referral Code</Text>
                      <Text style={styles.referralCode}>{userRewards.referralCode}</Text>
                      <Text style={styles.referralLinkSubtitle}>Share your link and earn 20 credits for each friend who books!</Text>

                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => {
                          Share.share({
                            message: `Join me on Booth 33 Studio! Use my referral code ${userRewards.referralCode} and we both get 20 credits. ${getReferralLink()}`,
                            title: 'Join Booth 33 Studio',
                          });
                        }}
                      >
                        <LinearGradient
                          colors={['#8B5CF6', '#EC4899']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.shareGradient}
                        >
                          <Text style={styles.shareButtonText}>📤 Share Link</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>

                    {/* Referral Stats */}
                    <View style={styles.referralStats}>
                      <View style={styles.referralStatItem}>
                        <Text style={styles.referralStatValue}>{userRewards.totalReferrals}</Text>
                        <Text style={styles.referralStatLabel}>Total Invited</Text>
                      </View>
                      <View style={styles.referralStatDivider} />
                      <View style={styles.referralStatItem}>
                        <Text style={styles.referralStatValue}>{userRewards.successfulReferrals}</Text>
                        <Text style={styles.referralStatLabel}>Successful</Text>
                      </View>
                      <View style={styles.referralStatDivider} />
                      <View style={styles.referralStatItem}>
                        <Text style={styles.referralStatValue}>{userRewards.successfulReferrals * 20}</Text>
                        <Text style={styles.referralStatLabel}>Credits Earned</Text>
                      </View>
                    </View>

                    {/* Referral History */}
                    <View style={styles.referralHistorySection}>
                      <Text style={styles.sectionTitle}>Your Referrals</Text>
                      {referrals.map((referral) => (
                        <View key={referral.id} style={styles.referralItem}>
                          <Image source={referral.referredUserAvatar} style={styles.referralAvatar} />
                          <View style={styles.referralInfo}>
                            <Text style={styles.referralName}>{referral.referredUserName}</Text>
                            <Text style={styles.referralDate}>
                              {referral.dateReferred.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                          {referral.status === 'completed' ? (
                            <View style={styles.referralStatusCompleted}>
                              <Text style={styles.referralStatusIcon}>✓</Text>
                              <Text style={styles.referralStatusText}>+{referral.rewardEarned}</Text>
                            </View>
                          ) : (
                            <View style={styles.referralStatusPending}>
                              <Text style={styles.referralStatusPendingText}>Pending</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C4B5FD',
    letterSpacing: 8,
    textTransform: 'uppercase',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  tierBadge: {
    marginLeft: 'auto',
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tierBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tierBadgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  tierBadgeText: {
    color: '#0F0F0F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    marginLeft: 15,
  },
  icon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#EC4899',
  },
  postCardContainer: {
    position: 'relative',
  },
  postOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postCaption: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  audioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  audioText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  likedIcon: {
    transform: [{ scale: 1.2 }],
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  // Create Post Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalPost: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
  },
  uploadButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  filePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
    color: '#666',
  },
  removeFile: {
    fontSize: 24,
    color: '#EF4444',
    marginLeft: 12,
  },
  createPostButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
  },
  createPostGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  // Emoji Picker Popup (positioned near like button)
  emojiPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emojiPickerPopup: {
    zIndex: 9999,
  },
  emojiPickerWrapper: {
    width: 310,
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderRadius: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  emojiOption: {
    padding: 10,
    marginHorizontal: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionText: {
    fontSize: 28,
  },
  // Loading Spinner Styles
  loadingSpinnerContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  spinnerGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  // Skeleton Styles
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  skeletonText: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  skeletonAudio: {
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 12,
  },
  skeletonButton: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  // Comments Modal Styles
  commentsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  commentsModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  commentsClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '600',
  },
  commentsList: {
    flexGrow: 1,
    maxHeight: 500,
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  replyItem: {
    marginLeft: 48,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(139, 92, 246, 0.3)',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  viewRepliesButton: {
    marginLeft: 48,
    marginBottom: 12,
  },
  viewRepliesText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  commentInputContainer: {
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  cancelReply: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Event Post Styles
  eventPostGradientBorder: {
    padding: 3,
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  eventPostCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 13,
    padding: 16,
    position: 'relative',
  },
  eventPostBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  eventPostBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  eventDetailsCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailLabel: {
    fontSize: 13,
    color: '#FBBF24',
    fontWeight: '600',
  },
  eventDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventRSVPButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  eventRSVPButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  rsvpdButton: {
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    marginBottom: 12,
  },
  rsvpdButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  // Notifications Styles
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0F0F',
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notificationsModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    marginTop: 'auto',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notificationsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  notificationsClose: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationItemUnread: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginLeft: 12,
  },
  deleteNotificationButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteNotificationText: {
    fontSize: 16,
    color: '#666',
  },
  noNotifications: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noNotificationsEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noNotificationsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noNotificationsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Messaging Styles
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationItemUnread: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  conversationMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  conversationLastMessageUnread: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  conversationUnreadBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  conversationUnreadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteConversationButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Chat Modal Styles
  chatModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '95%',
    marginTop: 'auto',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  chatBackButton: {
    marginRight: 12,
  },
  chatBackText: {
    fontSize: 32,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  chatBubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  chatBubbleReceived: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  chatBubbleTextSent: {
    color: '#FFFFFF',
  },
  chatBubbleTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chatBubbleTimeSent: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 12,
  },
  chatSendButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  chatSendGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Search Modal Styles
  searchModalContent: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    height: '95%',
    marginTop: 'auto',
    borderTopWidth: 2,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchClose: {
    fontSize: 32,
    color: '#666',
    fontWeight: '300',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  searchInputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchClearIcon: {
    fontSize: 18,
    color: '#666',
    paddingLeft: 8,
  },
  searchFilterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  searchFilterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  searchFilterTabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  searchFilterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  searchFilterTabTextActive: {
    color: '#8B5CF6',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  searchClearAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  searchResultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultIconText: {
    fontSize: 24,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  searchResultMeta: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  searchEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  searchEmptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  searchEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  searchEmptySubtext: {
    fontSize: 14,
    color: '#555',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 8,
  },
  recentSearchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recentSearchRemove: {
    fontSize: 18,
    color: '#666',
    paddingLeft: 12,
  },

  // Profile Modal Styles
  profileModalContent: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingBottom: 40,
    height: '95%',
    marginTop: 'auto',
    borderTopWidth: 2,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  profileBackButton: {
    fontSize: 40,
    color: '#8B5CF6',
    fontWeight: '300',
    width: 32,
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileInfo: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  profileVerifiedBadge: {
    fontSize: 20,
    color: '#8B5CF6',
  },
  profileUsername: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  profileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  profileMetaItem: {
    fontSize: 14,
    color: '#888',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#888',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  profileActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileFollowButton: {
    flex: 2,
  },
  profileActionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  profileMessageIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  profileMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  profileSocialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileSocialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  profileSocialIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  profileSocialText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  profilePortfolioSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  profileSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  profilePortfolioItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  profilePortfolioIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profilePortfolioIconText: {
    fontSize: 28,
  },
  profilePortfolioInfo: {
    flex: 1,
  },
  profilePortfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profilePortfolioDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  profilePortfolioMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profilePortfolioMetaText: {
    fontSize: 12,
    color: '#666',
  },
  profileActivitySection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  profileActivityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  profileActivityInfo: {
    flex: 1,
  },
  profileActivityText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileActivityDate: {
    fontSize: 12,
    color: '#888',
  },

  // Reviews & Ratings Styles
  profileReviewsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  reviewSummary: {
    marginBottom: 24,
  },
  reviewAverageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewAverageNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reviewStarsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewStar: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  reviewCount: {
    fontSize: 14,
    color: '#888',
  },
  reviewBreakdown: {
    marginTop: 12,
  },
  reviewBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewBreakdownStar: {
    fontSize: 14,
    color: '#FFFFFF',
    width: 30,
  },
  reviewBreakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  reviewBreakdownBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  reviewBreakdownCount: {
    fontSize: 14,
    color: '#888',
    width: 30,
    textAlign: 'right',
  },
  reviewsList: {
    marginTop: 24,
  },
  reviewItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reviewItemStars: {
    flexDirection: 'row',
  },
  reviewItemStar: {
    fontSize: 14,
    marginRight: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reviewHelpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  reviewHelpfulIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  reviewHelpfulText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  reviewVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  reviewVerifiedIcon: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 4,
  },
  reviewVerifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  reviewResponse: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  reviewResponseLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  reviewResponseText: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    marginBottom: 6,
  },
  reviewResponseDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewsEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  reviewsEmptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  reviewsEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  reviewsEmptySubtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },

  // Rewards Modal Styles
  rewardsModalContent: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  rewardsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rewardsClose: {
    fontSize: 28,
    color: '#888',
    fontWeight: '300',
  },
  rewardsTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  rewardsTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  rewardsTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  rewardsTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  rewardsTabTextActive: {
    color: '#8B5CF6',
  },
  rewardsTabBadge: {
    position: 'absolute',
    top: 8,
    right: '30%',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  rewardsTabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Tier Card Styles
  tierCard: {
    margin: 24,
    padding: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 72,
    marginBottom: 12,
  },
  tierName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  tierProgressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  tierProgressLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
    textAlign: 'center',
  },
  tierProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  tierBenefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  tierBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  tierBenefitIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 8,
  },
  tierBenefitText: {
    fontSize: 15,
    color: '#CCCCCC',
  },

  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    margin: '1%',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },

  // Recent Rewards Section
  recentRewardsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  recentRewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  rewardHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  rewardHistoryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  rewardHistoryInfo: {
    flex: 1,
  },
  rewardHistoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardHistoryDate: {
    fontSize: 13,
    color: '#888',
  },
  rewardHistoryCredits: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },

  // Milestones Section
  milestonesSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  milestonesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  milestoneCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    marginBottom: 12,
  },
  milestoneReward: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 12,
  },
  claimButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  claimGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  milestoneProgressContainer: {
    marginTop: 12,
  },
  milestoneProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  milestoneProgressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
  },
  milestoneCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneCompletedIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  milestoneCompletedText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  milestoneCompletedCheck: {
    fontSize: 24,
    color: '#10B981',
  },

  // Referral Link Card
  referralLinkCard: {
    margin: 24,
    padding: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  referralLinkTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  referralLinkSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  referralCode: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 2,
    marginBottom: 24,
  },
  shareButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  shareGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Referral Stats
  referralStats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  referralStatItem: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },

  // Referral History
  referralHistorySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  referralHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  referralAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 13,
    color: '#888',
  },
  referralStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  referralStatusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  referralStatusCompletedIcon: {
    fontSize: 14,
    color: '#10B981',
    marginRight: 4,
  },
  referralStatusCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  referralStatusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  referralStatusPendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
