'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchApi } from '@/lib/api';
import Logo from '@/components/Logo';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Sign in via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setErrorMsg(error?.message || 'Invalid administrator email or password.');
        setLoading(false);
        return;
      }

      // 2. Sync and verify admin role in MongoDB
      const syncRes = await fetchApi('/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const isUserAdmin = Boolean(
        syncRes?.user?.is_admin === true ||
        syncRes?.user?.is_Admin === true ||
        syncRes?.user?.isAdmin === true ||
        syncRes?.user?.role === 'ADMIN',
      );

      if (!syncRes || !syncRes.user || !isUserAdmin) {
        // Not an administrator: sign out immediately
        await supabase.auth.signOut();
        setErrorMsg(
          'Access Denied: This account is not authorized as an administrator. Admin console access is restricted.',
        );
        setLoading(false);
        return;
      }

      // 3. User is verified ADMIN: navigate to Admin Panel
      router.push('/admin');
    } catch (err: any) {
      await supabase.auth.signOut().catch(() => {});
      setErrorMsg(err.message || 'Authentication failed. Please verify admin credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800/90 rounded-3xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            Restricted Access
          </span>
          <h1 className="text-2xl font-black text-white">Applyra Admin Console</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with your authorized administrator credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@applyra.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <span>
              Sign-in is exclusively for provisioned administrators. No public admin registration exists.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700/60 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Applyra Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
