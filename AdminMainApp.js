import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import AdminOverviewScreen from './admin/AdminOverviewScreen';
import AdminBookingsScreen from './admin/AdminBookingsScreen';
import AdminContentScreen from './admin/AdminContentScreen';
import AdminEventsScreen from './admin/AdminEventsScreen';
import AdminSettingsScreen from './admin/AdminSettingsScreen';
import AdminUsersScreen from './admin/AdminUsersScreen';
import { BookingsProvider } from './contexts/BookingsContext';
import { CreditsProvider } from './contexts/CreditsContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { SearchProvider } from './contexts/SearchContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ReviewsProvider } from './contexts/ReviewsContext';
import { RewardsProvider } from './contexts/RewardsContext';

const Tab = createBottomTabNavigator();

export default function AdminMainApp({ onLogout }) {
  return (
    <BookingsProvider>
      <CreditsProvider>
        <PaymentProvider>
          <NotificationsProvider>
            <MessagingProvider>
              <SearchProvider>
                <ProfileProvider>
                  <ReviewsProvider>
                    <RewardsProvider>
                      <NavigationContainer independent={true}>
                        <Tab.Navigator
                          screenOptions={{
                            headerShown: false,
                            tabBarStyle: {
                              backgroundColor: '#0F0F0F',
                              borderTopColor: 'rgba(245, 158, 11, 0.3)',
                              borderTopWidth: 1,
                              height: 85,
                              paddingBottom: 10,
                              paddingTop: 10,
                            },
                            tabBarActiveTintColor: '#F59E0B',
                            tabBarInactiveTintColor: '#666',
                            tabBarLabelStyle: {
                              fontSize: 12,
                              fontWeight: '600',
                              marginTop: 4,
                            },
                          }}
                        >
                          <Tab.Screen
                            name="Overview"
                            component={AdminOverviewScreen}
                            options={{ tabBarIcon: () => <AdminTabIcon emoji={'📊'} /> }}
                          />
                          <Tab.Screen
                            name="Bookings"
                            component={AdminBookingsScreen}
                            options={{ tabBarIcon: () => <AdminTabIcon emoji={'📅'} /> }}
                          />
                          <Tab.Screen
                            name="Content"
                            component={AdminContentScreen}
                            options={{ tabBarIcon: () => <AdminTabIcon emoji={'📝'} /> }}
                          />
                          <Tab.Screen
                            name="Events"
                            component={AdminEventsScreen}
                            options={{ tabBarIcon: () => <AdminTabIcon emoji={'🎉'} /> }}
                          />
                          <Tab.Screen
                            name="Users"
                            component={AdminUsersScreen}
                            options={{ tabBarIcon: () => <AdminTabIcon emoji={'👥'} /> }}
                          />
                          <Tab.Screen name="Settings" options={{ tabBarIcon: () => <AdminTabIcon emoji={'⚙️'} /> }}>
                            {() => <AdminSettingsScreen onLogout={onLogout} />}
                          </Tab.Screen>
                        </Tab.Navigator>
                      </NavigationContainer>
                    </RewardsProvider>
                  </ReviewsProvider>
                </ProfileProvider>
              </SearchProvider>
            </MessagingProvider>
          </NotificationsProvider>
        </PaymentProvider>
      </CreditsProvider>
    </BookingsProvider>
  );
}

function AdminTabIcon({ emoji }) {
  return <Text style={{ fontSize: 28 }}>{emoji}</Text>;
}
