import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project configuration
// Get these values from Supabase Dashboard -> Project Settings -> API
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Validate that environment variables are set
if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn(
    '⚠️  Supabase credentials not configured!\n' +
    'Please create a .env file with your Supabase credentials:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'See SUPABASE_SETUP.md for instructions.'
  );
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
