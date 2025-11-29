import { supabase } from '../config/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  monthly_budget?: number;
}

class AuthService {
  // Register new user
  async register(email: string, password: string, displayName: string) {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Registration failed');

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          display_name: displayName,
          created_at: new Date().toISOString(),
          monthly_budget: 0,
        });

      if (profileError) throw profileError;

      return authData.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  }

  // Get user profile from database
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
