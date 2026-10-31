'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Shield,
  RefreshCw,
  AlertCircle,
  Download,
  FileCheck,
  Briefcase,
  Layers,
  ArrowLeft,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';

interface ResumeFile {
  name: string;
  fileKey: string;
  signedUrl: string | null;
  size: number;
  createdAt: string;
}

interface ActiveResume {
  hasResume: boolean;
  fileName: string;
  fileKey: string;
  uploadedAt: string | null;
}

interface AtsResult {
  hasResume: boolean;
  resumeFileName?: string;
  score: number;
  level: string;
  jobTitle: string;
  company: string;
  jobSlug: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  tip: string;
}

// Benchmark profiles for direct navbar visitors
interface RoleBenchmark {
  id: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
}

const BENCHMARK_ROLES: RoleBenchmark[] = [
  {
    id: 'software-engineer',
    title: 'Software Developer / SDE',
    category: 'Core Engineering',
    description: 'General full-cycle software engineering, OOP, algorithms, and system design.',
    skills: ['Java', 'Python', 'C++', 'Data Structures', 'OOP', 'SQL', 'Git', 'REST APIs', 'Docker'],
  },
  {
    id: 'mern-developer',
    title: 'MERN / Full Stack Developer',
    category: 'Web Development',
    description: 'Modern JavaScript/TypeScript web apps with React, Node.js, Express, and MongoDB.',
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Express', 'MongoDB', 'REST APIs', 'HTML', 'CSS', 'Git'],
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI / Machine Learning Engineer',
    category: 'Data & AI',
    description: 'Model development, deep learning frameworks, NLP, LLMs, and Python data pipelines.',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'SQL', 'Pandas', 'AWS'],
  },
  {
    id: 'backend-engineer',
    title: 'Backend Engineer',
    category: 'Server & Cloud',
    description: 'Scalable microservices, distributed systems, caching, message queues, and cloud infrastructure.',
    skills: ['Java', 'Spring Boot', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Microservices', 'AWS', 'CI/CD'],
  },
  {
    id: 'frontend-engineer',
    title: 'Frontend React Engineer',
    category: 'Web Development',
    description: 'Performant web interfaces, state management, responsive designs, and client performance.',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux', 'HTML', 'CSS', 'Web Performance'],
  },
  {
    id: 'cloud-devops-engineer',
    title: 'DevOps & Cloud Engineer',
    category: 'Infrastructure',
    description: 'CI/CD automation, Kubernetes container orchestration, infrastructure as code, and cloud monitoring.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Git', 'Terraform', 'Python', 'Bash'],
  },
];

function ResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const [activeResume, setActiveResume] = useState<ActiveResume | null>(null);
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ATS for specific job
  const jobSlugParam = searchParams.get('job') || '';
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [atsError, setAtsError] = useState('');

  // General Benchmark Selected Role
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('software-engineer');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/resume');
    }
  }, [user, isLoading, router]);

  const loadActiveResumeAndFiles = useCallback(async () => {
    if (!user) return;
    setLoadingFiles(true);
    try {
      const [activeRes, listRes] = await Promise.all([
        fetchApi('/resume/active').catch(() => null),
        fetchApi('/resume/list').catch(() => null),
      ]);

      if (activeRes && activeRes.success) {
        setActiveResume({
          hasResume: !!activeRes.hasResume,
          fileName: activeRes.fileName || '',
          fileKey: activeRes.fileKey || '',
          uploadedAt: activeRes.uploadedAt || null,
        });
      }

      if (listRes && listRes.files) {
        setFiles(listRes.files);
      }
    } catch {
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadActiveResumeAndFiles();
  }, [user, loadActiveResumeAndFiles]);

  const runAts = useCallback(
    async (slug: string) => {
      if (!slug.trim()) return;
      setAtsLoading(true);
      setAtsResult(null);
      setAtsError('');
      try {
        const res = await fetchApi(`/resume/ats?job=${encodeURIComponent(slug.trim())}`);
        if (res && res.success) {
          setAtsResult(res as AtsResult);
        }
      } catch (err: any) {
        setAtsError(err.message || 'Could not compute ATS match score for this job.');
      } finally {
        setAtsLoading(false);
      }
    },
    [],
  );

  // Auto-run ATS if ?job= param is present in URL
  useEffect(() => {
    if (jobSlugParam && user) {
      runAts(jobSlugParam);
    } else {
      setAtsResult(null);
    }
  }, [user, jobSlugParam, runAts]);

  const handleFileUpload = async (file: File) => {
    setUploadError('');
    setUploadSuccess('');
    if (!file) return;

    const isPdfOrDoc =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx');

    if (!isPdfOrDoc) {
      setUploadError('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: sessionData } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiBase}/resume/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }

      const data = await res.json();
      setUploadSuccess(`"${data.fileName}" uploaded & parsed! Active resume updated.`);
      await loadActiveResumeAndFiles();

      if (jobSlugParam) {
        runAts(jobSlugParam);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDelete = async (fileKey: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeletingKey(fileKey);
    try {
      const encodedKey = encodeURIComponent(fileKey);
      await fetchApi(`/resume/${encodedKey}`, { method: 'DELETE' });
      await loadActiveResumeAndFiles();
      if (jobSlugParam) {
        runAts(jobSlugParam);
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeletingKey(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const scoreColor = (score: number) =>
    score >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 60
        ? 'text-blue-600 dark:text-blue-400'
        : score >= 40
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400';

  const scoreBg = (score: number) =>
    score >= 80
      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
      : score >= 60
        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
        : score >= 40
          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600 mr-2" />
        Loading resume manager...
      </div>
    );
  }

  const selectedBenchmark =
    BENCHMARK_ROLES.find((r) => r.id === selectedBenchmarkId) || BENCHMARK_ROLES[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                ATS Engine & Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Resume & ATS Matcher
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect your ATS readiness across industry roles and evaluate direct job fit in real time.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition self-start"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore Jobs</span>
          </Link>
        </div>

        {/* ── SLEEK ACTIVE RESUME BAR (Compact - No giant empty dropzone) ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activeResume?.hasResume
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {activeResume?.hasResume ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active Resume
                  </span>
                  {activeResume?.hasResume && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Live for ATS
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {activeResume?.hasResume ? activeResume.fileName : 'No resume uploaded yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeResume?.hasResume && activeResume.uploadedAt
                    ? `Uploaded on ${new Date(activeResume.uploadedAt).toLocaleDateString()}`
                    : 'PDF or DOCX (Max 10MB) — parsed automatically'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading & Parsing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{activeResume?.hasResume ? 'Replace / Upload New' : 'Upload Resume'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
          {uploadSuccess && (
            <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* ── CASE 1: SPECIFIC JOB ATS MATCH VIEW (When ?job= is passed) ── */}
        {jobSlugParam ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/resume')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to General Roles & Overview</span>
              </button>

              <Link
                href={`/jobs/${jobSlugParam}`}
                className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Job Listing</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {atsLoading && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Scanning your resume against this job...
                </p>
                <p className="text-xs text-slate-400 mt-1">Comparing required skills and keywords</p>
              </div>
            )}

            {atsError && (
              <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">ATS Check Failed</p>
                  <p className="text-xs mt-1">{atsError}</p>
                </div>
              </div>
            )}

            {atsResult && !atsLoading && (
              <div className="space-y-6">
                {!atsResult.hasResume ? (
                  <div className="p-8 rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-center max-w-lg mx-auto">
                    <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                      Resume Required for ATS Scoring
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                      You are inspecting <strong>{atsResult.jobTitle}</strong> at <strong>{atsResult.company}</strong>. Upload your resume above to calculate your exact match score.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow transition"
                    >
                      Upload Resume Now
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Main Score Hero Card */}
                    <div
                      className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${scoreBg(
                        atsResult.score,
                      )}`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="flex-shrink-0">
                          <div
                            className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${scoreColor(
                              atsResult.score,
                            )}`}
                          >
                            {atsResult.score}%
                          </div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 ${scoreColor(
                              atsResult.score,
                            )} bg-white/70 dark:bg-slate-900/70 border border-current`}
                          >
                            {atsResult.level} Match
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              Target Role
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {atsResult.jobTitle}
                          </h2>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {atsResult.company}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                            {atsResult.tip}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                        <Link
                          href={`/jobs/${jobSlugParam}`}
                          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold text-center shadow transition"
                        >
                          View Job Details & Apply
                        </Link>
                      </div>
                    </div>

                    {/* Matched vs Missing Skills Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Matched in Resume */}
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800/70 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-950 mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Skills Found in Your Resume ({atsResult.matchedSkills.length})
                          </h3>
                        </div>

                        {atsResult.matchedSkills.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3">
                            None of this job's required skills were detected in your resume text.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {atsResult.matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing from Resume */}
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-800/70 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950 mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Skills Missing from Your Resume ({atsResult.missingSkills.length})
                          </h3>
                        </div>

                        {atsResult.missingSkills.length === 0 ? (
                          <div className="py-3 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Your resume covers all required skills for this role! 🎉
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {atsResult.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5"
                              >
                                <XCircle className="w-3 h-3 text-rose-500" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── CASE 2: GENERAL ATS BENCHMARK DASHBOARD (Navbar Direct Visit) ── */
          <div className="space-y-6">
            {/* Header info card */}
            <div className="p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-600 rounded-3xl text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                    General Role Benchmark
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-2">
                    Industry Role ATS Benchmark
                  </h2>
                  <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                    Compare your active resume against industry-standard requirements for core tech roles. Select a role below to see how competitive your resume is.
                  </p>
                </div>

                <Link
                  href="/jobs"
                  className="px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-slate-100 text-xs font-bold shadow transition self-start md:self-auto flex-shrink-0 flex items-center gap-1.5"
                >
                  <span>Match Against Live Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Role benchmark selector tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {BENCHMARK_ROLES.map((r) => {
                const isSelected = selectedBenchmarkId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedBenchmarkId(r.id)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/70 dark:border-brand-500 dark:text-brand-300 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                      {r.category}
                    </span>
                    <p className="text-xs font-bold mt-1 line-clamp-1">{r.title}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected benchmark inspection card */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      {selectedBenchmark.category}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedBenchmark.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    {selectedBenchmark.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedBenchmark.skills.length} Standard Requirements
                  </span>
                </div>
              </div>

              {/* Benchmark skill checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Essential Industry Skills for this Role:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBenchmark.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  Ready to test your resume against real, live openings with hiring companies?
                </span>
                <Link
                  href="/jobs"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Explore Open Positions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── UPLOADED RESUMES LIST (Compact Vault Table) ─────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Uploaded Resume Vault
            </h2>
            <button
              onClick={loadActiveResumeAndFiles}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingFiles ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading vault files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No resumes uploaded yet. Click <strong>Upload Resume</strong> above to start.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {files.map((f) => {
                const isActive = activeResume?.fileKey === f.fileKey;
                return (
                  <li
                    key={f.fileKey}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {f.name}
                          </p>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formatSize(f.size)} ·{' '}
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.signedUrl && (
                        <a
                          href={f.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(f.fileKey)}
                        disabled={deletingKey === f.fileKey}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                        title="Delete"
                      >
                        {deletingKey === f.fileKey ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600 mr-2" />
          Loading...
        </div>
      }
    >
      <ResumeContent />
    </Suspense>
  );
}
