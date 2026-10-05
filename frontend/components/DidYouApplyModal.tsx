'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Clock, ExternalLink, Loader2, FileCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface JobData {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  company: string;
  source?: string;
  originalUrl?: string;
}

interface DidYouApplyModalProps {
  isOpen: boolean;
  job: JobData | null;
  onClose: () => void;
  onConfirmed?: () => void;
}

export default function DidYouApplyModal({
  isOpen,
  job,
  onClose,
  onConfirmed,
}: DidYouApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !job) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const jobId = job._id || job.id || job.slug;
      await fetchApi('/applications/confirm', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          notes: notes.trim(),
        }),
      });

      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        setNotes('');
        if (onConfirmed) onConfirmed();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to confirm application:', err);
      setErrorMsg(err.message || 'Failed to update application status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotYet = () => {
    setNotes('');
    setErrorMsg('');
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleNotYet}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Application Recorded!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              "{job.title}" has been moved to your Applied pipeline. You can track future interview stages in your tracker.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 border border-brand-100 dark:border-brand-900 text-brand-600 dark:text-brand-400 flex-shrink-0 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Track Your Progress
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Did you apply for this job?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We opened the official job posting for <strong className="text-slate-700 dark:text-slate-200">{job.title}</strong> at <strong className="text-slate-700 dark:text-slate-200">{job.company}</strong> in a new tab.
                </p>
              </div>
            </div>

            {job.source && (
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500">Official Source</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{job.source}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Application Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Applied with resume v2, referral from John, or direct portal submit..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Yes, I Applied</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNotYet}
                disabled={submitting}
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Not Yet / Still Reviewing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
