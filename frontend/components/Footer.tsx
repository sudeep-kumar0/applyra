import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 lg:py-16 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Search. Match. Apply. Track.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Your entire job search in one place. Discover opportunities from legitimate company portals,
              check resume ATS match deterministically, and organize every stage of your career journey.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ● 100% Free Public Job Discovery
              </span>
            </div>
          </div>

          {/* Job Discovery */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Job Discovery
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Java+Developer" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Java Developer Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Frontend+Developer" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Frontend & React Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Backend+Developer" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Backend & Node.js Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?workMode=Remote" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Remote Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  How Applyra Works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Unified Search
                </Link>
              </li>
              <li>
                <Link href="/#resume-matching" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  ATS Match Engine
                </Link>
              </li>
              <li>
                <Link href="/#application-tracking" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Security & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#security" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Private Storage
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Applyra. All rights reserved. Built for professional job seekers.</p>
          <p className="mt-2 md:mt-0">
            Never scrape blindly • No fake credentials • Honest deterministic ATS matching
          </p>
        </div>
      </div>
    </footer>
  );
}
