'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, ArrowRight, Briefcase } from 'lucide-react';

export default function SavedJobsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/saved-jobs');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        Loading saved jobs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Saved Jobs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your bookmarked opportunities ready for ATS matching and applications.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition self-start"
          >
            <span>Explore Open Roles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Empty State */}
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No saved jobs in your list yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any job card while browsing to save it here for later.
          </p>

          <div className="mt-6">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition dark:bg-white dark:text-slate-900"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Browse Job Listings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
