import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import BookScreen from './screens/BookScreen';
import LibraryScreen from './screens/LibraryScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AudioProvider } from './contexts/AudioContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { SessionsProvider } from './contexts/SessionsContext';
import { CreditsProvider } from './contexts/CreditsContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { SearchProvider } from './contexts/SearchContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ReviewsProvider } from './contexts/ReviewsContext';
import { RewardsProvider } from './contexts/RewardsContext';
import { TierProvider } from './contexts/TierContext';
import { SMSProvider } from './contexts/SMSContext';
import MiniPlayer from './components/MiniPlayer';

const Tab = createBottomTabNavigator();

export default function MainApp({ onLogout }) {
  return (
    <AudioProvider>
      <BookingsProvider>
        <SessionsProvider>
          <CreditsProvider>
            <PaymentProvider>
              <SMSProvider>
                <NotificationsProvider>
                  <MessagingProvider>
                    <SearchProvider>
                      <ProfileProvider>
                        <ReviewsProvider>
                          <RewardsProvider>
                            <TierProvider>
                          <NavigationContainer independent={true}>
                          <View style={{ flex: 1 }}>
                            <Tab.Navigator
                              screenOptions={{
                                headerShown: false,
                                tabBarStyle: {
                                  backgroundColor: '#0F0F0F',
                                  borderTopColor: 'rgba(139, 92, 246, 0.3)',
                                  borderTopWidth: 1,
                                  height: 85,
                                  paddingBottom: 10,
                                  paddingTop: 10,
                                },
                                tabBarActiveTintColor: '#8B5CF6',
                                tabBarInactiveTintColor: '#666',
                                tabBarLabelStyle: {
                                  fontSize: 12,
                                  fontWeight: '600',
                                  marginTop: 4,
                                },
                              }}
                            >
                              <Tab.Screen
                                name="Home"
                                component={HomeScreen}
                                options={{
                                  tabBarIcon: () => <TabIcon emoji={'🏠'} />,
                                }}
                              />
                              <Tab.Screen
                                name="Book"
                                component={BookScreen}
                                options={{
                                  tabBarIcon: () => <TabIcon emoji={'📅'} />,
                                }}
                              />
                              <Tab.Screen
                                name="Library"
                                component={LibraryScreen}
                                options={{
                                  tabBarIcon: () => <TabIcon emoji={'🎵'} />,
                                }}
                              />
                              <Tab.Screen name="Profile" options={{ tabBarIcon: () => <TabIcon emoji={'👤'} /> }}>
                                {() => <ProfileScreen onLogout={onLogout} />}
                              </Tab.Screen>
                            </Tab.Navigator>

                            {/* MiniPlayer persists across all screens */}
                            <MiniPlayer />
                          </View>
                          </NavigationContainer>
                            </TierProvider>
                          </RewardsProvider>
                        </ReviewsProvider>
                      </ProfileProvider>
                    </SearchProvider>
                  </MessagingProvider>
                </NotificationsProvider>
              </SMSProvider>
            </PaymentProvider>
          </CreditsProvider>
        </SessionsProvider>
      </BookingsProvider>
    </AudioProvider>
  );
}

// Custom Tab Icon Component
function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 28 }}>{emoji}</Text>;
}
