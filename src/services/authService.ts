import { supabase } from '../config/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
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
      
      // Ensure user profile exists in users table
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }
      
      return data.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Ensure user profile exists in users table
  async ensureUserProfile(user: User): Promise<void> {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user profile:', checkError);
        return;
      }

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            display_name: user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            monthly_budget: 0,
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error: any) {
      console.error('Error ensuring user profile:', error);
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
        .maybeSingle();

      if (error) throw error;
      
      // If no profile exists, create one
      if (!data) {
        const user = await this.getCurrentUser();
        if (user) {
          await this.ensureUserProfile(user);
          // Try to fetch again
          const { data: newData, error: newError } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .maybeSingle();
          
          if (newError) throw newError;
          return newData as UserProfile;
        }
        return null;
      }
      
      return data as UserProfile;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw new Error(error.message);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure profile exists before updating
      await this.ensureUserProfile(user);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to update profile');
      return data as UserProfile;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Upload avatar
  async uploadAvatar(uri: string): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create file name
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with avatar URL
      await this.updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Delete user profile (cascade will delete related data)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Sign out
      await this.logout();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
