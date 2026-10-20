'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  Bookmark,
  ArrowRight,
  Briefcase,
  MapPin,
  Globe,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface SavedJob {
  _id: string;
  company: string;
  role: string;
  source: string;
  originalUrl: string;
  status: string;
  createdAt: string;
  jobId?: {
    slug?: string;
    location?: string;
    salary?: string;
    skills?: string[];
    workMode?: string;
    jobType?: string;
  };
}

export default function SavedJobsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/saved-jobs');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchApi('/applications?status=SAVED')
      .then((res) => {
        if (res && res.applications) {
          setSavedJobs(res.applications);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600 mr-2" />
        Loading saved jobs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Loading state */}
        {loading ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading your saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          /* Empty State */
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
        ) : (
          /* Saved Jobs List */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
            </p>
            {savedJobs.map((app) => {
              const job = app.jobId;
              const slug = job?.slug;
              return (
                <div
                  key={app._id}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {app.source || 'Company Career Website'}
                        </span>
                        {job?.workMode && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                            {job.workMode}
                          </span>
                        )}
                        {job?.jobType && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {job.jobType}
                          </span>
                        )}
                      </div>

                      {slug ? (
                        <Link
                          href={`/jobs/${slug}`}
                          className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                        >
                          {app.role}
                        </Link>
                      ) : (
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {app.role}
                        </span>
                      )}
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        {app.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[11px] font-semibold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-teal-600" />
                        Saved
                      </span>
                    </div>
                  </div>

                  {(job?.location || job?.salary) && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                      {job?.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job?.salary && (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {job?.skills && job.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 5).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-[11px] text-slate-400 self-center">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {slug && (
                        <Link
                          href={`/resume?job=${encodeURIComponent(slug)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Check Resume Match</span>
                        </Link>
                      )}
                    </div>

                    <a
                      href={app.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
