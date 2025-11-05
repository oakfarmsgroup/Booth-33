import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReviews } from '../contexts/ReviewsContext';
import { useToast } from '../contexts/ToastContext';

export default function ReviewModal({ visible, onClose, sessionId, sessionName, sessionType }) {
  const { submitReview } = useReviews();
  const { showSuccess, showError } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert(
        'No Comment',
        'Are you sure you want to submit without a comment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit Anyway',
            onPress: () => {
              submitReviewAndClose();
            },
          },
        ]
      );
      return;
    }

    submitReviewAndClose();
  };

  const submitReviewAndClose = () => {
    submitReview({
      sessionId,
      sessionName,
      sessionType,
      rating,
      comment,
      timestamp: new Date(),
    });

    showSuccess(`Thank you for your ${rating}-star review!`);

    // Reset form
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            onPressIn={() => setHoveredStar(star)}
            onPressOut={() => setHoveredStar(0)}
            style={styles.starButton}
          >
            <Text
              style={[
                styles.star,
                (star <= rating || star <= hoveredStar) && styles.starActive,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rate Your Session</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Session Info */}
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionIcon}>
                {sessionType === 'music' ? '🎵' : '🎙️'}
              </Text>
              <Text style={styles.sessionName} numberOfLines={2}>
                {sessionName}
              </Text>
              <Text style={styles.sessionType}>
                {sessionType === 'music' ? 'Music Session' : 'Podcast Session'}
              </Text>
            </View>

            {/* Star Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Your Rating</Text>
              {renderStars()}
              <Text style={[styles.ratingLabel, rating > 0 && styles.ratingLabelActive]}>
                {getRatingLabel()}
              </Text>
            </View>

            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Your Review (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience with the studio..."
                placeholderTextColor="#666"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length} / 500</Text>
            </View>

            {/* Quick Tags */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>Quick Tags (Coming Soon)</Text>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Great Equipment</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Professional</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Clean Studio</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Helpful Staff</Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>Submit Review</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setRating(0);
                setComment('');
                onClose();
              }}
            >
              <Text style={styles.skipText}>Maybe Later</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
    fontWeight: '300',
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sessionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sessionType: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 6,
  },
  star: {
    fontSize: 48,
    color: '#333',
  },
  starActive: {
    color: '#F59E0B',
    textShadowColor: '#F59E0B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
  ratingLabelActive: {
    color: '#F59E0B',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    opacity: 0.5,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  submitButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
