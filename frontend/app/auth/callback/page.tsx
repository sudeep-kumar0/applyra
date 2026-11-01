'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchApi } from '@/lib/api';
import Logo from '@/components/Logo';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRedirect = searchParams.get('redirect') || '/dashboard';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function handleAuthCallback() {
      try {
        // Check for error in query params (e.g. user denied consent or provider error)
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (error) {
          setErrorMsg(errorDescription || error || 'Authentication was cancelled or failed.');
          return;
        }

        // 1. Check if PKCE code needs exchanging
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('Code exchange warning:', exchangeError);
          }
        }

        // 2. Fetch active session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // If session is still resolving from URL hash, wait for onAuthStateChange
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (newSession && !isCancelled) {
                authListener.subscription.unsubscribe();
                try {
                  await fetchApi('/auth/sync', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${newSession.access_token}` },
                  });
                } catch (e) {
                  console.warn('Error syncing OAuth user:', e);
                }
                router.replace(targetRedirect);
              }
            },
          );

          // Safety timeout after 6 seconds
          setTimeout(() => {
            if (!isCancelled) {
              setErrorMsg('Session could not be established. Please try signing in again.');
            }
          }, 6000);
          return;
        }

        // 3. Sync user with MongoDB
        try {
          await fetchApi('/auth/sync', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        } catch (e) {
          console.warn('Error syncing OAuth user with MongoDB:', e);
        }

        // 4. Redirect to target destination
        if (!isCancelled) {
          router.replace(targetRedirect);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [router, searchParams, targetRedirect]);

  if (errorMsg) {
    return (
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 mx-auto flex items-center justify-center text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Failed</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{errorMsg}</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-sm hover:bg-brand-700 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
      <div className="inline-block mb-2">
        <Logo size="lg" />
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Completing sign in...
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Setting up your personalized profile and workspace.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<div className="text-slate-500 text-sm">Authenticating...</div>}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}

