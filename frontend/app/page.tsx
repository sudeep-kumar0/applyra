'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Send,
  BarChart3,
  BellRing,
  Building2,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (locationQuery.trim()) params.append('location', locationQuery.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  const faqs = [
    {
      q: 'Do I need to sign up to browse and search jobs?',
      a: 'No! Applyra is free and publicly accessible. You can browse, search, filter, and view detailed job listings without creating an account.',
    },
    {
      q: 'Does Applyra automatically submit applications on my behalf?',
      a: 'Never. Applyra never automates form submissions or asks for your third-party credentials. When you click "Apply Now", you are directed to the official employer portal or authorized source where you have 100% control over your application.',
    },
    {
      q: 'How does the ATS Resume Match score work?',
      a: 'Applyra uses a transparent, deterministic scoring engine based on required skills (30%), keywords (20%), experience (20%), education (10%), projects (10%), and structure (10%). We never generate random scores and only provide honest, actionable recommendations.',
    },
    {
      q: 'How are my resume files stored and protected?',
      a: 'Your resume files are stored in private Supabase Storage buckets. They are never public, never indexed by search engines, and can only be accessed by you through time-limited signed URLs.',
    },
    {
      q: 'What is the "Did You Apply?" confirmation prompt?',
      a: 'After you click "Apply Now" to visit an employer portal and return to Applyra, we ask if you submitted your application. If you did, Applyra records the role, date, and source into your Application Tracker so you never lose track of a follow-up.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100/80 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Search. Match. Apply. Track.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Your entire job search.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                One place.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Discover jobs from verified career portals, match your resume with explainable ATS scoring,
              apply directly on the original employer website, and track every application from one dashboard.
            </p>

            {/* Public Quick Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-10 p-2 sm:p-3 bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
                <Search className="w-5 h-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill (e.g. Java, React)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <div className="flex-1 flex items-center px-3 py-2">
                <MapPin className="w-5 h-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City or 'Remote'..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Find Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Explore All Jobs ↗
              </Link>
              {!user ? (
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-sm text-slate-800 dark:text-slate-200 transition"
                >
                  Create Free Account
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950 font-medium text-sm text-brand-700 dark:text-brand-300 transition"
                >
                  Go to Dashboard →
                </Link>
              )}
            </div>

            {/* Trust points */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No login required to search
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified employer career portals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Deterministic ATS score
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HOW APPLYRA WORKS */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              The Applyra Loop
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Discover → Search → Match → Improve → Apply → Track → Analyze
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
              Say goodbye to juggling 15 open browser tabs, lost spreadsheets, and mysterious ATS rejection black holes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
              <span className="text-3xl font-black text-brand-600/20 dark:text-brand-400/20 absolute top-4 right-4">
                01
              </span>
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Discover & Search
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Search verified job listings aggregated from legitimate company portals and employer feeds with multi-criteria filters.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
              <span className="text-3xl font-black text-teal-600/20 dark:text-teal-400/20 absolute top-4 right-4">
                02
              </span>
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Match & Improve
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Check deterministic ATS alignment against role requirements. Spot missing skills and clear, truthful resume recommendations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-600/20 dark:text-indigo-400/20 absolute top-4 right-4">
                03
              </span>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Official Direct Apply
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Redirect directly to the verified employer site without middlemen, automated credential risks, or fake submissions.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
              <span className="text-3xl font-black text-sky-600/20 dark:text-sky-400/20 absolute top-4 right-4">
                04
              </span>
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Track & Analyze
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Manage status from Applied → Assessment → Interview → Offer. Monitor conversion metrics across application channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURE SHOWCASE (Unified Search & Live Preview) */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Unified Job Search
              </span>
              <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Verified Opportunities
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Explore real listings available now. No login needed to inspect details.
              </p>
            </div>
            <Link
              href="/jobs"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 group"
            >
              <span>View all open roles</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Sample Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-2">
                    Hybrid • Full-time
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Java Full Stack Developer
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Tata Consultancy Services
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 text-sm">
                  TCS
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bengaluru, Karnataka</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>₹6–10 LPA • 1-3 years exp</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Source: Company Careers</span>
                <Link
                  href="/jobs/java-full-stack-developer-tcs-bengaluru"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
                    Remote • Full-time
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Frontend React Developer
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Swiggy Consumer Tech
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center font-bold text-orange-600 text-sm">
                  SWG
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bengaluru (Remote Available)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>₹12–18 LPA • 2-4 years exp</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Source: Company Careers</span>
                <Link
                  href="/jobs/frontend-react-developer-swiggy-bengaluru"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 mb-2">
                    Hybrid • Full-time
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Backend Node.js Engineer
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Razorpay Payments
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center font-bold text-blue-600 text-sm">
                  RZP
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bengaluru, Karnataka</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>₹14–22 LPA • 2-5 years exp</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Source: Company Careers</span>
                <Link
                  href="/jobs/backend-nodejs-engineer-razorpay-bengaluru"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ATS & RESUME MATCH PREVIEW */}
      <section id="resume-matching" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Honest ATS Evaluation
              </span>
              <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                No random magic numbers. Deterministic, explainable matching.
              </h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Most platforms display arbitrary percentages that leave applicants confused. Applyra breaks down your exact alignment across weighted categories:
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Required & Preferred Skills</span>
                  <span className="font-mono font-bold text-brand-600">30% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Industry & Role Keywords</span>
                  <span className="font-mono font-bold text-brand-600">20% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Experience & Tenure Alignment</span>
                  <span className="font-mono font-bold text-brand-600">20% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Education, Projects & Formatting Structure</span>
                  <span className="font-mono font-bold text-brand-600">30% Weight</span>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Analysis for</p>
                  <h4 className="text-base font-bold text-white">Java Full Stack Developer</h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-teal-400">87%</span>
                  <p className="text-[10px] text-teal-200/70">Overall Match</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Skills Alignment</span>
                    <span className="text-teal-400 font-bold">92%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-teal-400 w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Keyword Density</span>
                    <span className="text-teal-400 font-bold">84%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-teal-400 w-[84%]" />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-emerald-400 mb-2">Matched Skills (6)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Java', 'Spring Boot', 'SQL', 'REST API', 'React', 'Git'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-rose-400 mb-2">Missing Skills to Consider</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Docker', 'AWS', 'Kubernetes'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-rose-950/80 text-rose-300 border border-rose-800">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: WHY APPLYRA */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Why Applyra
            </span>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for real job seekers who value time and privacy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Zero Forced Login Walls
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse, search, and view job details completely free without handing over your email on step one. Authenticate only when saving or tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Private Resume Storage
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Resumes are locked inside private Supabase buckets. No public URLs, no unauthorized downloads, and strict user isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4">
                <Send className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Official Direct Applications
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We send you directly to official company career pages. No risky browser bot scraping or automated credential requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Got Questions?
            </span>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to streamline your entire job search?
          </h2>
          <p className="mt-4 text-brand-100 text-base max-w-xl mx-auto">
            Discover roles from top companies, evaluate your resume match, and track your applications seamlessly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jobs"
              className="px-8 py-3.5 rounded-xl bg-white text-brand-600 hover:bg-brand-50 font-bold text-sm shadow-lg transition"
            >
              Start Browsing Jobs
            </Link>
            {!user && (
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white border border-white/20 font-semibold text-sm transition"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
