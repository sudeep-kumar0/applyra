'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const STATUS_STAGES = [
  'All',
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'HR Round',
  'Offer',
  'Selected',
  'Rejected',
  'Withdrawn',
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeStage, setActiveStage] = useState('All');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/applications');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        Loading application tracker...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Application Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track and organize your job applications across every hiring round.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition self-start"
          >
            <span>Find Jobs to Apply</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Status Pipeline Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {STATUS_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeStage === stage
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Empty State Shell */}
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No tracked applications yet in stage: {activeStage}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            When you browse jobs on Applyra and click "Apply Now", you can choose "Apply & Track" to automatically record the role in your pipeline.
          </p>

          <div className="mt-6">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition dark:bg-white dark:text-slate-900"
            >
              <span>Explore Open Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
