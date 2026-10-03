'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Calendar,
  Sparkles,
  Bookmark,
  Award,
  XCircle,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Clock,
  Briefcase,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, mongoUser, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          <span className="text-sm font-medium">Loading your Applyra dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      count: 0,
      icon: <FileText className="w-5 h-5 text-brand-600" />,
      bg: 'bg-brand-50 dark:bg-brand-950/60',
      border: 'border-brand-100 dark:border-brand-900',
    },
    {
      title: 'Active Interviews',
      count: 0,
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'border-amber-100 dark:border-amber-900',
    },
    {
      title: 'Assessments',
      count: 0,
      icon: <Clock className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-100 dark:border-purple-900',
    },
    {
      title: 'Offers & Selected',
      count: 0,
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-100 dark:border-emerald-900',
    },
    {
      title: 'Archived / Rejected',
      count: 0,
      icon: <XCircle className="w-5 h-5 text-slate-500" />,
      bg: 'bg-slate-50 dark:bg-slate-800/60',
      border: 'border-slate-200 dark:border-slate-700',
    },
    {
      title: 'Saved Jobs',
      count: 0,
      icon: <Bookmark className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      border: 'border-teal-100 dark:border-teal-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Personal Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Welcome back{profile?.fullName ? `, ${profile.fullName}` : ''}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Signed in with {user.email} • Account Role: <strong className="text-brand-600 font-bold">{mongoUser?.role || 'USER'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${card.border} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg}`}>{card.icon}</div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {card.count}
              </p>
            </div>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Panel */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Quick Job-Search Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/jobs"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                        Search Jobs
                      </h4>
                      <p className="text-[11px] text-slate-500">Filter open opportunities</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/resume"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                        Resume & ATS
                      </h4>
                      <p className="text-[11px] text-slate-500">Manage versions & matches</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/applications"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                        Application Tracker
                      </h4>
                      <p className="text-[11px] text-slate-500">Organize active stages</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/saved-jobs"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                        Saved Roles
                      </h4>
                      <p className="text-[11px] text-slate-500">Review bookmarked jobs</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recommended Jobs Shell */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recommended Opportunities
                </h3>
                <Link href="/jobs" className="text-xs text-brand-600 hover:underline">
                  Browse all →
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Complete your profile skills to unlock personalized role matching and automated alerts.
                </p>
                <Link
                  href="/profile"
                  className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-brand-600 hover:bg-slate-50"
                >
                  Update Profile Skills
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Completion & Storage status */}
          <div className="space-y-6">
            {/* Profile Completion Box */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Profile Readiness
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Completion Status</span>
                <span className="font-bold text-brand-600">{profile?.profileCompletion || 20}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-teal-500"
                  style={{ width: `${profile?.profileCompletion || 20}%` }}
                />
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Supabase Auth Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>MongoDB User Record Synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
                    +
                  </span>
                  <span>Add preferred roles & experience</span>
                </div>
              </div>
            </div>

            {/* Supabase Storage Private Status */}
            <div className="p-6 bg-slate-100/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                🔒 Private Resume Vault
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Bucket: <code className="text-brand-600">resumes</code> (Private Supabase Storage). Files are encrypted and only accessible by your account.
              </p>
              <Link
                href="/resume"
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline block pt-1"
              >
                Go to Resume Management →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
