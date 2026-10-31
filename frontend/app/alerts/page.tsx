'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import ContextualAuthModal, { ContextualAuthType } from '@/components/ContextualAuthModal';
import DidYouApplyModal from '@/components/DidYouApplyModal';
import {
  Sparkles,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Globe,
  Loader2,
  TrendingUp,
  Zap,
  Star,
  Check,
  RefreshCw,
} from 'lucide-react';

interface JobListing {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  workMode: string;
  jobType: string;
  category: string;
  source: string;
  skills: string[];
  description: string;
  originalUrl: string;
  postedAt: string;
}

interface ScoredJob extends JobListing {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  isLocationMatch: boolean;
  tier: 'best' | 'good' | 'you_may_like';
}

export default function MatchedForYouPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobSlugs, setSavedJobSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'best' | 'you_may_like'>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<ContextualAuthType>('save_job');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/alerts');
    }
  }, [user, isLoading, router]);

  // Load saved job slugs
  useEffect(() => {
    if (!user) return;
    fetchApi('/applications?status=SAVED')
      .then((res) => {
        if (res && res.applications) {
          const slugs = res.applications
            .map((a: any) => (a.jobId && a.jobId.slug ? a.jobId.slug : null))
            .filter(Boolean);
          setSavedJobSlugs(slugs);
        }
      })
      .catch(() => {});
  }, [user]);

  // Fetch verified active jobs
  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/jobs?limit=50');
      if (res && Array.isArray(res.jobs)) {
        setAllJobs(res.jobs);
      }
    } catch (err) {
      console.warn('Failed to fetch jobs for matching:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  // Profile preferences
  const userSkills = useMemo(() => {
    return (profile?.skills || []).map((s) => s.trim().toLowerCase());
  }, [profile?.skills]);

  const preferredLocations = useMemo(() => {
    return (profile?.preferredLocations || ['All India']).map((l) => l.trim().toLowerCase());
  }, [profile?.preferredLocations]);

  const hasAllIndia = preferredLocations.some((l) => l.includes('all india'));

  // Check if profile is incomplete
  const isProfileIncomplete = useMemo(() => {
    const hasSkills = userSkills.length > 0;
    const hasLocation = (profile?.location && profile.location.trim().length > 0) || (profile?.preferredLocations && profile.preferredLocations.length > 0);
    return !hasSkills || !hasLocation;
  }, [userSkills, profile?.location, profile?.preferredLocations]);

  // Score & categorize every job against candidate's profile
  const scoredJobs = useMemo<ScoredJob[]>(() => {
    if (!allJobs.length) return [];

    return allJobs
      .map((job) => {
        const jobSkills = job.skills || [];
        const matchedSkills: string[] = [];
        const missingSkills: string[] = [];

        jobSkills.forEach((skill) => {
          const sLower = skill.toLowerCase();
          const isMatch = userSkills.some(
            (u) => u === sLower || u.includes(sLower) || sLower.includes(u)
          );
          if (isMatch) {
            matchedSkills.push(skill);
          } else {
            missingSkills.push(skill);
          }
        });

        const totalSkills = Math.max(1, jobSkills.length);
        const matchPercentage = Math.round((matchedSkills.length / totalSkills) * 100);

        // Location Fit Check
        const jobLocLower = (job.location || '').toLowerCase();
        const isRemote = jobLocLower.includes('remote') || (job.workMode || '').toLowerCase().includes('remote');

        const isLocationMatch =
          hasAllIndia ||
          isRemote ||
          preferredLocations.some((pref) => jobLocLower.includes(pref));

        // Tier Determination:
        // 1. 'best' = 50%+ skill match AND preferred location (or remote)
        // 2. 'good' = 25%-49% skill match AND preferred location
        // 3. 'you_may_like' = at least 1 skill match (any location, including outside preferred cities)
        let tier: 'best' | 'good' | 'you_may_like' = 'you_may_like';

        if (matchedSkills.length >= 2 && isLocationMatch && matchPercentage >= 50) {
          tier = 'best';
        } else if (matchedSkills.length >= 1 && isLocationMatch) {
          tier = 'good';
        } else if (matchedSkills.length >= 1) {
          // ANY location with at least 1 skill match
          tier = 'you_may_like';
        }

        return {
          ...job,
          matchedSkills,
          missingSkills,
          matchPercentage,
          isLocationMatch,
          tier,
        };
      })
      .filter((job) => {
        // If user has skills, prioritize jobs with at least 1 matched skill
        if (userSkills.length > 0) {
          return job.matchedSkills.length > 0;
        }
        return true; // if no skills set yet, show all verified jobs
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [allJobs, userSkills, preferredLocations, hasAllIndia]);

  // Tab Filtering
  const filteredJobs = useMemo(() => {
    let result = scoredJobs;

    if (remoteOnly) {
      result = result.filter(
        (j) =>
          (j.workMode && j.workMode.toLowerCase() === 'remote') ||
          (j.location && j.location.toLowerCase().includes('remote'))
      );
    }

    if (activeTab === 'best') {
      result = result.filter((j) => j.tier === 'best' || j.tier === 'good');
    } else if (activeTab === 'you_may_like') {
      result = result.filter((j) => j.tier === 'you_may_like');
    }

    return result;
  }, [scoredJobs, activeTab, remoteOnly]);

  const bestCount = scoredJobs.filter((j) => j.tier === 'best' || j.tier === 'good').length;
  const youMayLikeCount = scoredJobs.filter((j) => j.tier === 'you_may_like').length;

  // Save Job Handler
  const handleSaveClick = async (job: JobListing) => {
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('save_job');
      setAuthModalOpen(true);
      return;
    }
    const jobId = job._id || job.slug;
    const isAlreadySaved = savedJobSlugs.includes(job.slug);
    if (isAlreadySaved) {
      setSavedJobSlugs((prev) => prev.filter((s) => s !== job.slug));
      return;
    }
    setSavedJobSlugs((prev) => [...prev, job.slug]);
    try {
      await fetchApi('/applications/click', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch {
      setSavedJobSlugs((prev) => prev.filter((s) => s !== job.slug));
    }
  };

  // Apply Click Handler
  const handleApplyClick = async (job: JobListing) => {
    if (!job.originalUrl) {
      alert('Original application link is not available for this role.');
      return;
    }
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('apply_track');
      setAuthModalOpen(true);
      return;
    }

    try {
      await fetchApi('/applications/click', {
        method: 'POST',
        body: JSON.stringify({ jobId: job._id || job.slug }),
      });
    } catch {}

    window.open(job.originalUrl, '_blank', 'noopener,noreferrer');
    setApplyModalJob(job);
    setApplyModalOpen(true);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-600" />
        <span>Loading your personalized matches...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Matched for You
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personalized job feed ranked by your skills ({userSkills.length}) and target locations ({profile?.preferredLocations?.join(', ') || 'All India'}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit Preferences</span>
            </Link>
            <button
              onClick={loadJobs}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              title="Refresh job matches"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INCOMPLETE PROFILE REMINDER BANNER */}
        {isProfileIncomplete && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Your profile preferences are incomplete!
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Update your preferred cities, experience level, and core skills in your Profile to unlock 100% accurate, high-matching jobs.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition flex-shrink-0"
            >
              <span>Update Profile & Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* STATS & FILTER TABS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Matches</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 font-mono">
                {scoredJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('best')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'best'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Best Matches (Target Location)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-800 text-teal-100 font-mono">
                {bestCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('you_may_like')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'you_may_like'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>You May Also Like (Any Location)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-800 text-indigo-100 font-mono">
                {youMayLikeCount}
              </span>
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <span className="font-semibold">Remote Positions Only</span>
          </label>
        </div>

        {/* JOB CARDS LIST */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            <span>Finding opportunities that match your skillset...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching jobs found in this category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Try adding more skills in your Profile or selecting &ldquo;All India&rdquo; to broaden your match pipeline.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition"
              >
                Add Skills in Profile
              </Link>
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              >
                Browse All Open Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobSlugs.includes(job.slug);
              const detailsLink = `/jobs/${job.slug}`;

              return (
                <div
                  key={job.slug}
                  onClick={() => router.push(detailsLink)}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group/card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        {/* MATCH TIER BADGE */}
                        {job.tier === 'best' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            <Star className="w-3 h-3 fill-teal-500 text-teal-500" />
                            <span>{job.matchPercentage}% Best Match</span>
                          </span>
                        ) : job.tier === 'good' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span>{job.matchPercentage}% Strong Fit</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>You May Like • {job.matchedSkills.length} Skill Match</span>
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {job.workMode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {job.jobType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          via {job.source}
                        </span>
                      </div>

                      {/* Title & Company */}
                      <Link
                        href={detailsLink}
                        onClick={(e) => e.stopPropagation()}
                        className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 group-hover/card:text-brand-600 dark:group-hover/card:text-brand-400 transition"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        {job.company}
                      </p>
                    </div>

                    {/* Bookmark Save */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveClick(job);
                      }}
                      className={`p-2 rounded-xl border transition flex items-center justify-center flex-shrink-0 self-start ${
                        isSaved
                          ? 'bg-brand-50/80 border-brand-200 text-brand-600 dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      title={isSaved ? 'Job saved' : 'Save job'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 dark:fill-brand-400' : ''}`} />
                    </button>
                  </div>

                  {/* Location & Experience Row */}
                  <div className="mt-3.5 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className={job.isLocationMatch ? 'font-semibold text-slate-800 dark:text-slate-200' : ''}>
                        {job.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* SKILLS COMPARISON BADGES (GREEN CHECK vs GREY CIRCLE) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Skills:</span>

                      {/* Matching skills (highlighted in emerald green) */}
                      {job.matchedSkills.map((sk) => (
                        <span
                          key={`match-${sk}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        >
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{sk}</span>
                        </span>
                      ))}

                      {/* Missing skills (subtle grey) */}
                      {job.missingSkills.slice(0, 4).map((sk) => (
                        <span
                          key={`missing-${sk}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                          <span>{sk}</span>
                        </span>
                      ))}

                      {job.missingSkills.length > 4 && (
                        <span className="text-[11px] text-slate-400 self-center">
                          +{job.missingSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/resume?job=${encodeURIComponent(job.slug)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>ATS Match Breakdown</span>
                      </Link>

                      <Link
                        href={detailsLink}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
                      >
                        <span>Full Description</span>
                      </Link>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyClick(job);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      <span>Apply on Employer Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contextual Auth Modal */}
      <ContextualAuthModal
        isOpen={authModalOpen}
        type={authModalType}
        jobTitle={selectedJob?.title}
        originalUrl={selectedJob?.originalUrl}
        onClose={() => setAuthModalOpen(false)}
        onContinueWithoutTracking={() => {
          if (selectedJob?.originalUrl) {
            window.open(selectedJob.originalUrl, '_blank', 'noopener,noreferrer');
          }
        }}
      />

      {/* Did You Apply? Confirmation Modal */}
      <DidYouApplyModal
        isOpen={applyModalOpen}
        job={applyModalJob}
        onClose={() => setApplyModalOpen(false)}
        onConfirmed={() => {}}
      />
    </div>
  );
}
