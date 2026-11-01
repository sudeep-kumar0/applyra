'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup';
  redirectTo?: string;
  onError?: (msg: string) => void;
}

export default function SocialAuthButtons({
  mode = 'signin',
  redirectTo = '/dashboard',
  onError,
}: SocialAuthButtonsProps) {
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithOAuth('google', redirectTo);
      if (error) {
        console.error('Google OAuth error:', error);
        if (onError) {
          if (
            error.message?.includes('not enabled') ||
            error.message?.includes('Unsupported provider')
          ) {
            onError(
              'Google sign-in is not yet enabled in your Supabase project. Please configure Google in your Supabase Dashboard under Authentication -> Providers.',
            );
          } else {
            onError(error.message || 'Failed to sign in with Google.');
          }
        }
        setLoading(false);
      }
    } catch (err: any) {
      console.error('OAuth trigger error:', err);
      if (onError) {
        onError(err.message || 'An unexpected error occurred during Google sign-in.');
      }
      setLoading(false);
    }
  };

  const actionText = mode === 'signup' ? 'Sign up' : 'Continue';

  return (
    <div className="space-y-3">
      {/* Google Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleOAuth}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-xs transition hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{actionText} with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 absolute">
          Or continue with email
        </span>
      </div>
    </div>
  );
}
