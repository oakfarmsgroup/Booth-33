import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessaging } from '../contexts/MessagingContext';

export default function ChatScreen({ conversation, onBackPress }) {
  const { sendMessage, markConversationAsRead, getConversation } = useMessaging();
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef(null);

  // Get fresh conversation data
  const currentConversation = getConversation(conversation.id);

  useEffect(() => {
    // Mark conversation as read when opening
    markConversationAsRead(conversation.id);

    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentConversation?.messages.length]);

  const handleSendMessage = () => {
    if (messageText.trim().length === 0) return;

    sendMessage(conversation.id, messageText.trim());
    setMessageText('');

    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const messages = currentConversation?.messages || conversation.messages || [];

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image source={conversation.userAvatar} style={styles.headerAvatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{conversation.userName}</Text>
                <Text style={styles.headerStatus}>Active now</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.infoButton}>
              <Text style={styles.infoButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💬</Text>
                <Text style={styles.emptyStateText}>
                  Start a conversation with {conversation.userName}
                </Text>
              </View>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === 'current_user';
                const showDate =
                  index === 0 ||
                  new Date(messages[index - 1].timestamp).toDateString() !==
                    new Date(message.timestamp).toDateString();

                return (
                  <View key={message.id}>
                    {showDate && (
                      <View style={styles.dateDivider}>
                        <View style={styles.dateDividerLine} />
                        <Text style={styles.dateDividerText}>
                          {new Date(message.timestamp).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <View style={styles.dateDividerLine} />
                      </View>
                    )}

                    <View
                      style={[
                        styles.messageRow,
                        isCurrentUser ? styles.messageRowRight : styles.messageRowLeft,
                      ]}
                    >
                      {!isCurrentUser && (
                        <Image source={conversation.userAvatar} style={styles.messageAvatar} />
                      )}

                      <View
                        style={[
                          styles.messageBubble,
                          isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
                          ]}
                        >
                          {message.text}
                        </Text>
                        <Text
                          style={[
                            styles.messageTime,
                            isCurrentUser ? styles.messageTimeRight : styles.messageTimeLeft,
                          ]}
                        >
                          {formatMessageTime(message.timestamp)}
                        </Text>
                      </View>

                      {isCurrentUser && <View style={styles.messageSpacer} />}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachButtonText}>📎</Text>
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, messageText.trim().length === 0 && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={messageText.trim().length === 0}
            >
              <LinearGradient
                colors={
                  messageText.trim().length > 0 ? ['#8B5CF6', '#EC4899'] : ['#333', '#222']
                }
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
  },
  infoButtonText: {
    fontSize: 24,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  dateDividerText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 12,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  messageSpacer: {
    width: 40,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageBubbleLeft: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextLeft: {
    color: '#FFFFFF',
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageTimeLeft: {
    color: '#888',
  },
  messageTimeRight: {
    color: '#CCC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  attachButton: {
    padding: 10,
    marginBottom: 4,
  },
  attachButtonText: {
    fontSize: 20,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
