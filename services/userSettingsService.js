import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';

/**
 * Get user settings
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function getUserSettings() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If settings don't exist yet, create default settings
      if (error.code === 'PGRST116') {
        const createResult = await createDefaultSettings(user.id);
        if (createResult.success) {
          return { success: true, data: createResult.data, error: null };
        }
        return createResult;
      }
      console.error('Error fetching user settings:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Create default settings for a user
 * @param {string} userId
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
async function createDefaultSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{
        user_id: userId,
        notifications: true,
        email_notifications: true,
        push_notifications: true,
        booking_reminders: true,
        message_notifications: true,
        post_notifications: true,
        public_profile: true,
        show_session_history: true,
        show_followers: true,
        show_following: true,
        allow_messages_from: 'everyone',
        theme: 'dark',
        language: 'en'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in createDefaultSettings:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Update user settings
 * @param {object} settings - Settings object with keys to update
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateUserSettings(settings) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateSetting(key, value) {
  return updateUserSettings({ [key]: value });
}

/**
 * Toggle a boolean setting
 * @param {string} key - Setting key
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function toggleSetting(key) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Get current value
    const currentSettings = await getUserSettings();
    if (!currentSettings.success) {
      return currentSettings;
    }

    const currentValue = currentSettings.data[key];
    const newValue = !currentValue;

    // Update with new value
    return updateSetting(key, newValue);
  } catch (error) {
    console.error('Error in toggleSetting:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Update notification settings
 * @param {object} notificationSettings
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateNotificationSettings(notificationSettings) {
  return updateUserSettings(notificationSettings);
}

/**
 * Update privacy settings
 * @param {object} privacySettings
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updatePrivacySettings(privacySettings) {
  return updateUserSettings(privacySettings);
}

/**
 * Update display settings
 * @param {object} displaySettings
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateDisplaySettings(displaySettings) {
  return updateUserSettings(displaySettings);
}

/**
 * Reset settings to defaults
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function resetSettings() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Delete existing settings
    await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id);

    // Create new default settings
    return createDefaultSettings(user.id);
  } catch (error) {
    console.error('Error in resetSettings:', error);
    return { success: false, error, data: null };
  }
}

export default {
  getUserSettings,
  updateUserSettings,
  updateSetting,
  toggleSetting,
  updateNotificationSettings,
  updatePrivacySettings,
  updateDisplaySettings,
  resetSettings
};
