import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400">Last updated: October 2026 • Applyra Platform</p>
            </div>
          </div>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Our Core Privacy Principle
            </h2>
            <p>
              Applyra is committed to protecting your career data and job search privacy. We do not sell your personal data or resume files to third-party advertisers, data brokers, or marketing networks.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Private Resume Storage
            </h2>
            <p>
              Your uploaded resume documents are stored in private Supabase Storage buckets under the <code>resumes</code> vault. They are never publicly indexed or accessible by search engine bots. Files are accessed only by your authenticated account via time-limited cryptographic signed URLs.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. No Automated Credential Scraping
            </h2>
            <p>
              Applyra does not ask for or store passwords to your third-party job board accounts (LinkedIn, Naukri, Indeed, etc.). When you choose to apply for a role, we redirect you directly to the verified employer portal where you retain complete control over your application.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Authentication & Security
            </h2>
            <p>
              Authentication is provided securely by Supabase Auth with industry-standard JWT encryption and mandatory email verification. Passwords are never stored in our application database (MongoDB Atlas).
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5. Account Deletion
            </h2>
            <p>
              You have the right to request full deletion of your account, profile, resume files, and application records at any time through our settings or contact support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
