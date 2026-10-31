import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Terms of Service
              </h1>
              <p className="text-xs text-slate-400">Effective Date: October 2026</p>
            </div>
          </div>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Applyra ("Search. Match. Apply. Track."), you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Job Discovery & Legitimate Sources
            </h2>
            <p>
              Applyra links to external job postings and employer career portals. Applyra is not an employer, recruiter, or hiring agency unless explicitly designated. While we strive to index verified opportunities from legitimate career sources, users should verify role information independently before applying.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Honest Resume Matching
            </h2>
            <p>
              Applyra's ATS resume matching engine provides deterministic alignment guidance based on keyword and qualification matches. Applyra explicitly advises users never to fabricate skills or misrepresent their credentials on resumes.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. User Conduct
            </h2>
            <p>
              You agree not to misuse Applyra's infrastructure, attempt unauthorized access to other users' private resume vaults, or upload malicious files or scripts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
