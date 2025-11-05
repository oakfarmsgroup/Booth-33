import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

/**
 * SkeletonLoader - Animated loading placeholder component
 *
 * @param {string} variant - Type of skeleton: 'text', 'circle', 'rect', 'card', 'post'
 * @param {number} width - Width of skeleton (can be string like '100%' or number)
 * @param {number} height - Height of skeleton
 * @param {object} style - Additional custom styles
 */
export default function SkeletonLoader({ variant = 'rect', width = 100, height = 20, style }) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <Animated.View style={[styles.skeleton, styles.text, { width, height }, { opacity }, style]} />
        );
      case 'circle':
        return (
          <Animated.View
            style={[styles.skeleton, styles.circle, { width, height, borderRadius: width / 2 }, { opacity }, style]}
          />
        );
      case 'rect':
        return (
          <Animated.View style={[styles.skeleton, styles.rect, { width, height }, { opacity }, style]} />
        );
      case 'card':
        return <SkeletonCard opacity={opacity} />;
      case 'post':
        return <SkeletonPost opacity={opacity} />;
      default:
        return (
          <Animated.View style={[styles.skeleton, { width, height }, { opacity }, style]} />
        );
    }
  };

  return renderSkeleton();
}

function SkeletonCard({ opacity }) {
  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCircle} />
        <View style={styles.cardHeaderText}>
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
      </View>
      <View style={styles.cardContent} />
      <View style={styles.cardFooter}>
        <View style={styles.cardButton} />
        <View style={styles.cardButton} />
      </View>
    </Animated.View>
  );
}

function SkeletonPost({ opacity }) {
  return (
    <Animated.View style={[styles.post, { opacity }]}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar} />
        <View style={styles.postHeaderText}>
          <View style={styles.postName} />
          <View style={styles.postTime} />
        </View>
      </View>
      <View style={styles.postContent} />
      <View style={styles.postImage} />
      <View style={styles.postFooter}>
        <View style={styles.postAction} />
        <View style={styles.postAction} />
        <View style={styles.postAction} />
      </View>
    </Animated.View>
  );
}

export function SkeletonList({ count = 5, variant = 'card', gap = 16 }) {
  return (
    <View style={{ gap }}>
      {[...Array(count)].map((_, index) => (
        <SkeletonLoader key={index} variant={variant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    borderRadius: 4,
  },
  circle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  rect: {
    borderRadius: 8,
  },
  // Card Skeleton
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    height: 14,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSubtitle: {
    height: 12,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  cardContent: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardButton: {
    height: 36,
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
  },
  // Post Skeleton
  post: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  postName: {
    height: 14,
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 6,
  },
  postTime: {
    height: 10,
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  postContent: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  postImage: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postAction: {
    height: 28,
    width: '28%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
  },
});
