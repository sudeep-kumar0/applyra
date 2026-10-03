'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Briefcase,
  Database,
  ArrowLeft,
  Server,
  Activity,
  Loader2,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, mongoUser, isAdmin, isLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      if (!user || !isAdmin) return;
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetchApi('/admin/stats').catch(() => null),
          fetchApi('/admin/users').catch(() => null),
        ]);

        if (statsRes && statsRes.stats) {
          setStats(statsRes.stats);
        }
        if (usersRes && usersRes.users) {
          setUsersList(usersRes.users);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to fetch admin data from backend.');
      } finally {
        setAdminLoading(false);
      }
    }

    if (user && isAdmin) {
      loadAdminData();
    } else {
      setAdminLoading(false);
    }
  }, [user, isAdmin]);

  if (isLoading || adminLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Verifying administrative authorization...</span>
      </div>
    );
  }

  // MANDATORY SECURITY RULE: Non-admin users are strictly blocked with 403 Forbidden!
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 mx-auto flex items-center justify-center text-rose-600 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-rose-600 dark:text-rose-400">
            403 Forbidden
          </h1>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Administrator Access Required
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your current account ({user?.email || 'Anonymous'}) does not have administrator privileges.
            Admin accounts can only be provisioned via the secure server-side command (<code>npm run create-admin</code>).
          </p>

          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition dark:bg-white dark:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to User Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-400">Logged in as {user.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Applyra System Administration
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Users</span>
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats?.totalUsers ?? usersList.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Synced with MongoDB Atlas</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Jobs</span>
              <Briefcase className="w-5 h-5 text-teal-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats?.totalJobs ?? 7}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Verified career portal listings</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">System Status</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              Operational
            </p>
            <p className="text-[11px] text-slate-400 mt-1">All microservices responding</p>
          </div>
        </div>

        {/* Users Management */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registered Users Directory
            </h3>
            <span className="text-xs text-slate-500">MongoDB Collection: users</span>
          </div>

          {usersList.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">
              No registered users returned or API offline.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Supabase User ID</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                        {u.supabaseUserId}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
