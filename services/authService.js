import { supabase } from '../config/supabase';

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */

// Sign up with email and password
export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (error) {
    console.error('Get session error:', error);
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: error.message };
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'booth33://reset-password',
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: error.message };
  }
};

// Update password
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: error.message };
  }
};

// Update user profile
export const updateProfile = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with OAuth (Google, Apple, etc.)
export const signInWithOAuth = async (provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`OAuth ${provider} sign in error:`, error);
    return { success: false, error: error.message };
  }
};

// Verify OTP (for email verification or 2FA)
export const verifyOTP = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: error.message };
  }
};

// Refresh session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  requestPasswordReset,
  updatePassword,
  updateProfile,
  signInWithOAuth,
  verifyOTP,
  refreshSession,
};
