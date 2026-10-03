'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ResumePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/resume');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        Loading resume manager...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private Encrypted Storage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Resume Management & ATS Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store multiple tailored resumes in your private Supabase Storage vault for instant ATS matching.
          </p>
        </div>

        {/* Storage Architecture Guarantee Card */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Supabase Storage Configuration: Private Bucket
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                Your resume files are securely stored in the private <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-brand-600">resumes</code> bucket. Files are never publicly exposed, and downloads are secured with temporary signed URLs.
              </p>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bucket: resumes (Active)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Access: Private (Non-public)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supported: PDF, DOCX (Max 10MB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload & Multiple Version Shell */}
        <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ready for Phase 2 Resume Ingestion
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            In Phase 2, you will be able to upload multiple tailored versions (e.g. <code>Resume_Java.pdf</code>, <code>Resume_FullStack.pdf</code>) with automated text parsing and deterministic ATS scoring.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition"
            >
              <span>Explore Jobs & Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              Update Profile Skills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
