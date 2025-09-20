import React, { createContext, useContext, useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = getSupabaseClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        });
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10238d4d/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create account' };
      }

      // After successful signup, sign in the user
      return await signIn(email, password);
    } catch (error) {
      return { error: 'An unexpected error occurred during signup' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { error: 'Not authenticated' };
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-10238d4d/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to update profile' };
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        user_metadata: { ...prev.user_metadata, name }
      } : null);

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}