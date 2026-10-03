'use client';

import React from 'react';
import Link from 'next/link';
import { X, Bookmark, FileText, Send, Sparkles, ShieldCheck } from 'lucide-react';

export type ContextualAuthType =
  | 'save_job'
  | 'resume_match'
  | 'apply_track'
  | 'applications'
  | 'alerts'
  | 'analytics'
  | 'profile';

interface ContextualAuthModalProps {
  isOpen: boolean;
  type: ContextualAuthType;
  jobTitle?: string;
  originalUrl?: string;
  onClose: () => void;
  onContinueWithoutTracking?: () => void;
}

export default function ContextualAuthModal({
  isOpen,
  type,
  jobTitle,
  originalUrl,
  onClose,
  onContinueWithoutTracking,
}: ContextualAuthModalProps) {
  if (!isOpen) return null;

  const contentMap: Record<
    ContextualAuthType,
    {
      title: string;
      description: string;
      icon: React.ReactNode;
      primaryActionLabel: string;
      showDirectApplyOption?: boolean;
    }
  > = {
    save_job: {
      title: 'Save this job to your list',
      description: jobTitle
        ? `Create a free Applyra account to save "${jobTitle}" and organize all your prospective roles in one place.`
        : 'Create a free Applyra account to save this job and access it anytime from your dashboard.',
      icon: <Bookmark className="w-8 h-8 text-brand-600" />,
      primaryActionLabel: 'Create Account to Save',
    },
    resume_match: {
      title: 'Check Resume Match',
      description:
        'Create an account to securely upload your resume and get an instant, explainable ATS match score with missing skill analysis.',
      icon: <Sparkles className="w-8 h-8 text-teal-600" />,
      primaryActionLabel: 'Create Account to Match',
    },
    apply_track: {
      title: 'Want Applyra to track this application?',
      description:
        'You can apply directly on the original employer site, or sign in so Applyra can record your application, schedule follow-ups, and track your interview stages.',
      icon: <Send className="w-8 h-8 text-brand-600" />,
      primaryActionLabel: 'Sign In & Track Application',
      showDirectApplyOption: true,
    },
    applications: {
      title: 'Application Tracker',
      description:
        'Track every application from Applied to Interview to Offer. Sign in to view your complete application history.',
      icon: <FileText className="w-8 h-8 text-brand-600" />,
      primaryActionLabel: 'Sign In to View Applications',
    },
    alerts: {
      title: 'Personalized Job Alerts',
      description:
        'Get notified immediately when high-match opportunities in your preferred roles and locations are posted.',
      icon: <Sparkles className="w-8 h-8 text-teal-600" />,
      primaryActionLabel: 'Create Account for Alerts',
    },
    analytics: {
      title: 'Job Search Analytics',
      description:
        'Analyze your application conversion rates, response timelines, and stage progression with actionable insights.',
      icon: <ShieldCheck className="w-8 h-8 text-brand-600" />,
      primaryActionLabel: 'Sign In to View Analytics',
    },
    profile: {
      title: 'Account Required',
      description: 'Sign in to access and update your Applyra profile, skills, and preferences.',
      icon: <ShieldCheck className="w-8 h-8 text-brand-600" />,
      primaryActionLabel: 'Sign In',
    },
  };

  const content = contentMap[type] || contentMap.save_job;

  const handleDirectApply = () => {
    onClose();
    if (onContinueWithoutTracking) {
      onContinueWithoutTracking();
    } else if (originalUrl) {
      window.open(originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 mx-auto flex items-center justify-center mb-5">
          {content.icon}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {content.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
          {content.description}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/signup"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition"
          >
            {content.primaryActionLabel}
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition"
          >
            Already have an account? Sign In
          </Link>

          {/* Direct apply option for anonymous users on apply click */}
          {content.showDirectApplyOption && (
            <button
              onClick={handleDirectApply}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Continue directly to employer application ↗
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-1"
          >
            Continue Browsing Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
