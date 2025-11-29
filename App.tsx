import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import authService from './src/services/authService';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator isAuthenticated={!!user} />
    </NavigationContainer>
  );
}
