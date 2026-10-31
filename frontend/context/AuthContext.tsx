'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchApi } from '@/lib/api';

export interface MongoUser {
  id: string;
  supabaseUserId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_admin?: boolean;
  is_Admin?: boolean;
  isAdmin?: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  userId?: string;
  fullName: string;
  profilePhoto?: string;
  headline?: string;
  location?: string;
  phone?: string;
  skills: string[];
  preferredLocations?: string[];
  preferredWorkMode?: string;
  experienceLevel?: string;
  experience: any[];
  education: any[];
  bio?: string;
  profileCompletion: number;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  resumeKey?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  mongoUser: MongoUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncWithMongo = async (token: string, fallbackUser?: SupabaseUser | null) => {
    try {
      const response = await fetchApi('/auth/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.user) {
        setMongoUser(response.user);
        setProfile(response.profile);
      }
    } catch (err) {
      console.warn('Could not sync user with MongoDB API:', err);
      // Fallback in case backend is offline during early frontend dev
      if (fallbackUser) {
        setMongoUser({
          id: fallbackUser.id,
          supabaseUserId: fallbackUser.id,
          email: fallbackUser.email || '',
          role: 'USER',
          is_admin: false,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetchApi('/profile');
      if (res && res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        syncWithMongo(session.access_token, session.user);
      }
      setIsLoading(false);
    });

    // Listen to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.access_token) {
        await syncWithMongo(session.access_token, session.user);
      } else {
        setMongoUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    return res;
  };

  const signup = async (email: string, password: string, fullName: string) => {
    // MANDATORY RULE: Role is ALWAYS USER. No admin registration allowed from frontend.
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return res;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMongoUser(null);
    setProfile(null);
  };

  const isAdmin = Boolean(
    mongoUser?.is_admin === true ||
    mongoUser?.is_Admin === true ||
    mongoUser?.isAdmin === true ||
    mongoUser?.role === 'ADMIN'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        mongoUser,
        profile,
        session,
        isLoading,
        isAdmin,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
