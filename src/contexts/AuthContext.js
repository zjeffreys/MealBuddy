import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signInWithGoogle } from '../lib/supabaseClient';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const createUserProfile = async (userId) => {
    try {
      const { error } = await supabase.from('user_profiles').insert({ id: userId }, { returning: 'minimal' });
      if (error) throw error;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        await createUserProfile(data.user.id);
      }
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      setError('');
      const data = await signInWithGoogle();
      if (data.user) {
        await createUserProfile(data.user.id);
      }
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError('');
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    googleSignIn,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}