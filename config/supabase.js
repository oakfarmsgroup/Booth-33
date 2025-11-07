import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hpzgthczonihcghxorxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwemd0aGN6b25paGNnaHhvcnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTIyOTgsImV4cCI6MjA3NzkyODI5OH0.AC02nYKhejgPusW6hR2AhmwQlA4iCC7f9edfSff6Z6k';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in config/supabase.js');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'api',
  },
  auth: {
    // Store session in AsyncStorage for React Native
    storage: null, // Will be configured with AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export default supabase;
