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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ATS
  const [jobSlug, setJobSlug] = useState(searchParams.get('job') || '');
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [atsError, setAtsError] = useState('');

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
    async (slug?: string) => {
      const job = slug || jobSlug;
      if (!job.trim()) {
        setAtsError('Please enter a job slug or pick a job below.');
        return;
      }
      setAtsLoading(true);
      setAtsResult(null);
      setAtsError('');
      try {
        const res = await fetchApi(`/resume/ats?job=${encodeURIComponent(job.trim())}`);
        if (res && res.success) {
          setAtsResult(res as AtsResult);
        }
      } catch (err: any) {
        setAtsError(err.message || 'Could not compute ATS match score for this job.');
      } finally {
        setAtsLoading(false);
      }
    },
    [jobSlug],
  );

  // Auto-run ATS if ?job= param is in the URL on initial mount
  useEffect(() => {
    const slug = searchParams.get('job');
    if (slug && user) {
      setJobSlug(slug);
      runAts(slug);
    }
  }, [user, searchParams, runAts]);

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

      // Automatically re-run ATS check for the current job if one is loaded
      if (jobSlug.trim()) {
        runAts(jobSlug.trim());
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDelete = async (fileKey: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeletingKey(fileKey);
    try {
      const encodedKey = encodeURIComponent(fileKey);
      await fetchApi(`/resume/${encodedKey}`, { method: 'DELETE' });
      await loadActiveResumeAndFiles();
      if (jobSlug.trim()) {
        runAts(jobSlug.trim());
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Resume-Driven ATS Matcher
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Resume Management & ATS Engine
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload your actual resume (PDF/DOCX). Our engine reads the text from your resume and matches required skills against any job in real time.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition self-start"
          >
            <span>Browse Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── ACTIVE RESUME BANNER ────────────────────────────────────── */}
        {activeResume?.hasResume ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Active Resume
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Live for ATS Matching
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeResume.fileName}
                </p>
                {activeResume.uploadedAt && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Uploaded on {new Date(activeResume.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition self-start sm:self-auto"
            >
              Upload New Version / Change
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                No resume uploaded yet
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Upload your resume below. Once uploaded, you can check your ATS match score for any job listing with a single click.
              </p>
            </div>
          </div>
        )}

        {/* ── UPLOAD ZONE ─────────────────────────────────────────────── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 rounded-3xl border-2 border-dashed cursor-pointer transition text-center
            ${
              dragOver
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/20'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleInputChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Uploading & parsing resume text...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drop your resume here, or <span className="text-brand-600">click to browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PDF or DOCX · Max 10MB · Automatically extracts skills
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload feedback */}
        {uploadSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}

        {/* ── ATS SCORE ENGINE ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              ATS Job Match Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select or enter a job to check whether the required skills are present in your uploaded resume.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Job slug input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={jobSlug}
                onChange={(e) => setJobSlug(e.target.value)}
                placeholder="Enter job slug, e.g. java-full-stack-developer-tcs-bengaluru"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                onKeyDown={(e) => e.key === 'Enter' && runAts()}
              />
              <button
                onClick={() => runAts()}
                disabled={atsLoading || !jobSlug.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs transition"
              >
                {atsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Check Match
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: You can also click <span className="font-semibold text-slate-700 dark:text-slate-200">"Check Resume Match"</span> on any job card from the{' '}
              <Link href="/jobs" className="underline text-brand-600 dark:text-brand-400">
                Jobs page
              </Link>{' '}
              or{' '}
              <Link href="/saved-jobs" className="underline text-teal-600 dark:text-teal-400">
                Saved Jobs
              </Link>{' '}
              to check it directly.
            </p>

            {atsError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{atsError}</span>
              </div>
            )}

            {atsResult && (
              <div className="space-y-5 pt-2">
                {!atsResult.hasResume ? (
                  <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                          Please Upload Your Resume First
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          You are checking "{atsResult.jobTitle}" at {atsResult.company}. To calculate your real ATS match score, upload your resume PDF in the upload section above.
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                        >
                          Upload Resume Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Score card */}
                    <div
                      className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 ${scoreBg(
                        atsResult.score,
                      )}`}
                    >
                      <div className="flex-shrink-0 text-center">
                        <div
                          className={`text-5xl font-black font-mono ${scoreColor(atsResult.score)}`}
                        >
                          {atsResult.score}%
                        </div>
                        <div className={`text-xs font-bold mt-1 ${scoreColor(atsResult.score)}`}>
                          {atsResult.level} Match
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            Resume: {atsResult.resumeFileName || activeResume?.fileName}
                          </span>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {atsResult.jobTitle}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {atsResult.company}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                          {atsResult.tip}
                        </p>
                      </div>
                    </div>

                    {/* Matched & Missing skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Matched in Resume */}
                      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-4">
                        <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Skills Found in Your Resume ({atsResult.matchedSkills.length})
                        </h3>
                        {atsResult.matchedSkills.length === 0 ? (
                          <p className="text-xs text-slate-400">
                            None of the required skills were detected in your resume text.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing from Resume */}
                      <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 p-4">
                        <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-3">
                          <XCircle className="w-3.5 h-3.5" />
                          Skills Missing from Your Resume ({atsResult.missingSkills.length})
                        </h3>
                        {atsResult.missingSkills.length === 0 ? (
                          <p className="text-xs text-emerald-600 font-medium">
                            Your resume covers all required skills for this role! 🎉
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-[11px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-medium"
                              >
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
        </div>

        {/* ── MY RESUMES LIST ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Uploaded Resume Files
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
              <span className="text-sm">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No resumes uploaded yet. Upload your resume above.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {files.map((f) => (
                <li
                  key={f.fileKey}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {f.name}
                      </p>
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
              ))}
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
