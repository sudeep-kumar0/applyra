'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  FileText,
  PlusCircle,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Building2,
  Globe,
  Tag,
  Clock,
  Check,
  X,
  RefreshCw,
  Download,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'Software',
  'IT Support',
  'Technical Support',
  'QA/Testing',
  'Data',
  'AI/ML',
  'DevOps/Cloud',
  'Cybersecurity',
  'Finance',
  'HR',
  'Sales',
  'Marketing',
  'Operations',
  'Customer Support',
  'Internships',
  'Apprenticeships',
  'Fresher/Graduate',
  'Trainee',
  'Other',
];

const SOURCES = [
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Foundit',
  'Apna',
  'Workday',
  'Company Career Website',
  'Other',
];


const GREENHOUSE_PRESETS = [
  { name: 'Cloudflare', token: 'cloudflare', category: 'DevOps/Cloud' },
  { name: 'GitLab', token: 'gitlab', category: 'DevOps/Cloud' },
  { name: 'Figma', token: 'figma', category: 'Software' },
  { name: 'Reddit', token: 'reddit', category: 'Software' },
  { name: 'Brex', token: 'brex', category: 'Finance' },
  { name: 'Datadog', token: 'datadog', category: 'DevOps/Cloud' },
  { name: 'Gusto', token: 'gusto', category: 'HR' },
  { name: 'DoorDash', token: 'doordash', category: 'Software' },
  { name: 'Coinbase', token: 'coinbase', category: 'Software' },
  { name: 'Vercel', token: 'vercel', category: 'Software' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, mongoUser, isAdmin, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'add_job' | 'manage_jobs' | 'sources' | 'reports' | 'import_greenhouse'>('dashboard');

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Manage jobs state
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsSearch, setJobsSearch] = useState('');
  const [jobsSourceFilter, setJobsSourceFilter] = useState('All');
  const [jobsStatusFilter, setJobsStatusFilter] = useState('All');
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Edit Job Modal state
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Notification / Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    experience: '1-3 years',
    salary: '₹6–10 LPA',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    category: 'Software',
    skills: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    originalUrl: '',
    postedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    source: 'LinkedIn',
  });
  const [submittingJob, setSubmittingJob] = useState(false);

  // Notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth Redirect check
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, router]);


  // Greenhouse Scraper State
  const [scraperBoard, setScraperBoard] = useState('cloudflare');
  const [scraperCompany, setScraperCompany] = useState('Cloudflare');
  const [scraperLimit, setScraperLimit] = useState<number>(25);
  const [scraperCategory, setScraperCategory] = useState<string>('Auto-Detect');
  const [scraperSyncDeactivations, setScraperSyncDeactivations] = useState(true);
  const [scraperLoading, setScraperLoading] = useState(false);
  const [scraperPreviewing, setScraperPreviewing] = useState(false);
  const [scraperPreview, setScraperPreview] = useState<any | null>(null);
  const [scraperResult, setScraperResult] = useState<any | null>(null);

  const handlePreviewGreenhouse = async () => {
    if (!scraperBoard.trim()) {
      showToast('Please enter a Greenhouse board token or URL', 'error');
      return;
    }
    setScraperPreviewing(true);
    setScraperPreview(null);
    try {
      const res = await fetchApi('/admin/scrape/greenhouse/preview', {
        method: 'POST',
        body: JSON.stringify({ boardToken: scraperBoard.trim(), limit: 3 }),
      });
      if (res && res.success) {
        setScraperPreview(res);
        if (res.company && !scraperCompany) setScraperCompany(res.company);
        showToast(`Fetched ${res.totalFound} jobs from ${res.company}. Showing 3 previews.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to preview Greenhouse jobs', 'error');
    } finally {
      setScraperPreviewing(false);
    }
  };

  const handleImportGreenhouse = async () => {
    if (!scraperBoard.trim()) {
      showToast('Please enter a Greenhouse board token or URL', 'error');
      return;
    }
    setScraperLoading(true);
    setScraperResult(null);
    try {
      const res = await fetchApi('/admin/scrape/greenhouse/import', {
        method: 'POST',
        body: JSON.stringify({
          boardToken: scraperBoard.trim(),
          companyName: scraperCompany.trim() || undefined,
          limit: scraperLimit > 0 ? scraperLimit : undefined,
          categoryOverride: scraperCategory !== 'Auto-Detect' ? scraperCategory : undefined,
          syncDeactivations: scraperSyncDeactivations,
        }),
      });
      if (res && res.success) {
        setScraperResult(res.result);
        showToast(res.message || 'Scraping and import completed!');
        loadStats();
        loadJobs(1);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to scrape and import jobs', 'error');
    } finally {
      setScraperLoading(false);
    }
  };

  // Load Dashboard Stats
  const loadStats = async () => {
    if (!user || !isAdmin) return;
    setLoadingStats(true);
    try {
      const res = await fetchApi('/admin/stats');
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.warn('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Jobs Table
  const loadJobs = async (page = 1) => {
    if (!user || !isAdmin) return;
    setLoadingJobs(true);
    try {
      const query = new URLSearchParams();
      query.append('page', String(page));
      query.append('limit', '15');
      if (jobsSearch.trim()) query.append('search', jobsSearch.trim());
      if (jobsSourceFilter !== 'All') query.append('source', jobsSourceFilter);
      if (jobsStatusFilter !== 'All') query.append('status', jobsStatusFilter);

      const res = await fetchApi(`/admin/jobs?${query.toString()}`);
      if (res && res.jobs) {
        setJobsList(res.jobs);
        setJobsTotal(res.total || 0);
        setJobsPage(page);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch jobs', 'error');
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadStats();
      loadJobs(1);
    }
  }, [user, isAdmin]);

  // Handle Add Job Submit
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.originalUrl) {
      showToast('Please fill all required fields, including original URL', 'error');
      return;
    }

    setSubmittingJob(true);
    try {
      const res = await fetchApi('/admin/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob),
      });

      if (res && res.success) {
        showToast(`Job "${newJob.title}" posted successfully! Immediately visible publicly.`);
        // Reset form
        setNewJob({
          title: '',
          company: '',
          location: '',
          experience: '1-3 years',
          salary: '₹6–10 LPA',
          jobType: 'Full-time',
          workMode: 'Hybrid',
          category: 'Software',
          skills: '',
          description: '',
          responsibilities: '',
          qualifications: '',
          originalUrl: '',
          postedAt: new Date().toISOString().split('T')[0],
          expiresAt: '',
          source: 'LinkedIn',
        });
        loadStats();
        loadJobs(1);
        setActiveTab('manage_jobs');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to post job listing', 'error');
    } finally {
      setSubmittingJob(false);
    }
  };

  // Toggle Job Active/Inactive
  const handleToggleStatus = async (jobId: string) => {
    try {
      const res = await fetchApi(`/admin/jobs/${jobId}/status`, {
        method: 'PATCH',
      });
      if (res && res.success) {
        showToast(res.message);
        loadJobs(jobsPage);
        loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update job status', 'error');
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetchApi(`/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (res && res.success) {
        showToast(`Job "${title}" deleted successfully.`);
        loadJobs(jobsPage);
        loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete job', 'error');
    }
  };

  // Save Edit Job
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setEditSaving(true);
    try {
      const res = await fetchApi(`/admin/jobs/${editingJob._id}`, {
        method: 'PUT',
        body: JSON.stringify(editingJob),
      });

      if (res && res.success) {
        showToast('Job listing updated successfully!');
        setEditingJob(null);
        loadJobs(jobsPage);
        loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update job', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-900 text-white">
        <Loader2 className="w-6 h-6 animate-spin mr-3 text-amber-500" />
        <span>Authenticating administrator session...</span>
      </div>
    );
  }

  // 403 Forbidden for non-admin users
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="max-w-md w-full p-8 bg-slate-800 rounded-3xl border border-rose-900/60 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-rose-400">403 Forbidden</h1>
          <h2 className="text-base font-bold text-white mt-1">Administrator Privileges Required</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Your current account ({user?.email || 'Anonymous'}) does not have administrator privileges.
            Admin accounts can only be provisioned via terminal/server-side command.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
            >
              Sign In with Admin Account
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Return to User Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="text-sm font-black text-white flex items-center gap-1.5">
                  Applyra <span className="text-amber-400 font-mono text-xs">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Logged in as {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/jobs"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
              >
                <span>View Public Jobs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Exit to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pb-4 mb-8 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
            { id: 'add_job', label: 'Add Job', icon: <PlusCircle className="w-4 h-4" /> },
            { id: 'manage_jobs', label: `Manage Jobs (${jobsTotal})`, icon: <Briefcase className="w-4 h-4" /> },
            { id: 'import_greenhouse', label: 'Import Greenhouse', icon: <Download className="w-4 h-4" /> },
            { id: 'sources', label: 'Job Sources', icon: <Globe className="w-4 h-4" /> },
            { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'manage_jobs') loadJobs(1);
                if (tab.id === 'dashboard') loadStats();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Active Jobs</span>
                  <Briefcase className="w-5 h-5 text-teal-400" />
                </div>
                <p className="mt-3 text-3xl font-black text-white font-mono">
                  {stats?.activeJobs ?? '...'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Live on public Applyra portal</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Total Jobs</span>
                  <Layers className="w-5 h-5 text-brand-400" />
                </div>
                <p className="mt-3 text-3xl font-black text-white font-mono">
                  {stats?.totalJobs ?? '...'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Includes active and inactive</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Total Applications</span>
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <p className="mt-3 text-3xl font-black text-white font-mono">
                  {stats?.totalApplications ?? '0'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Tracked across user pipelines</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                  <span>Registered Users</span>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="mt-3 text-3xl font-black text-white font-mono">
                  {stats?.totalUsers ?? '...'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">MongoDB Atlas synced users</p>
              </div>
            </div>

            {/* Quick Actions & Sources Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Active Sources Overview</h3>
                  <button
                    onClick={() => setActiveTab('sources')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View All Sources →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {stats?.sources?.map((s: any) => (
                    <div
                      key={s.source}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80"
                    >
                      <p className="text-[11px] font-medium text-slate-400 truncate">{s.source}</p>
                      <p className="text-lg font-bold text-white mt-1">{s.count} jobs</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Quick Job Poster</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Manually add verified opportunities from LinkedIn, Naukri, Indeed, or official career portals.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('add_job')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post New Job Listing</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD JOB FORM */}
        {activeTab === 'add_job' && (
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Post New Job Listing</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter verified job details. The job will immediately appear on Applyra's public search and detail pages.
              </p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Senior Java Backend Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    placeholder="e.g. Google India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka (or Remote)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Salary / Compensation
                  </label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g. ₹12–18 LPA or Competitive"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    placeholder="e.g. 1-3 years"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Source Platform *
                  </label>
                  <select
                    value={newJob.source}
                    onChange={(e) => setNewJob({ ...newJob, source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Work Mode
                  </label>
                  <select
                    value={newJob.workMode}
                    onChange={(e) => setNewJob({ ...newJob, workMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Job Type
                  </label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Original Application URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newJob.originalUrl}
                    onChange={(e) => setNewJob({ ...newJob, originalUrl: e.target.value })}
                    placeholder="https://linkedin.com/jobs/view/... or employer link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Required Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  placeholder="e.g. Java, Spring Boot, React, Docker, PostgreSQL, REST API"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Job Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Comprehensive description of the position, team, and mandate..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Key Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newJob.responsibilities}
                  onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })}
                  placeholder="Design and build resilient cloud APIs&#10;Collaborate with product and UX design squads&#10;Write unit and integration tests"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Requirements & Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newJob.qualifications}
                  onChange={(e) => setNewJob({ ...newJob, qualifications: e.target.value })}
                  placeholder="B.Tech/B.E. or equivalent experience in Computer Science&#10;Strong problem-solving and clean coding standards"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submittingJob}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  {submittingJob ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Publishing Job...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Publish Job Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE JOBS */}
        {activeTab === 'manage_jobs' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="w-full md:w-80 flex items-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search jobs by title or company..."
                  value={jobsSearch}
                  onChange={(e) => setJobsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadJobs(1)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={jobsSourceFilter}
                  onChange={(e) => {
                    setJobsSourceFilter(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Sources</option>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={jobsStatusFilter}
                  onChange={(e) => {
                    setJobsStatusFilter(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button
                  onClick={() => loadJobs(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                <button
                  onClick={() => setActiveTab('add_job')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Job</span>
                </button>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
              {loadingJobs ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                  <span>Loading jobs directory...</span>
                </div>
              ) : jobsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No jobs found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/60">
                        <th className="py-3.5 px-4">Title & Slug</th>
                        <th className="py-3.5 px-4">Company & Location</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Source</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Posted</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {jobsList.map((job) => (
                        <tr key={job._id || job.slug} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <Link
                              href={`/jobs/${job.slug}`}
                              target="_blank"
                              className="hover:text-amber-400 transition flex items-center gap-1.5"
                            >
                              <span>{job.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </Link>
                            <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[200px]">
                              {job.slug}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="font-medium text-white block">{job.company}</span>
                            <span className="text-[11px] text-slate-400">{job.location}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                              {job.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Source: {job.source}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(job._id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                job.isActive
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(job.postedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingJob({ ...job })}
                                title="Edit Job"
                                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id, job.title)}
                                title="Delete Job"
                                className="p-1.5 rounded-lg border border-slate-700 hover:bg-rose-950/60 text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: JOB SOURCES OVERVIEW */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">Supported Job Aggregation Sources</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Applyra displays jobs originating from verified employer career portals and authorized networks. Direct links and attribution are maintained on every listing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SOURCES.map((src) => {
                const count = stats?.sources?.find((s: any) => s.source === src)?.count || 0;
                return (
                  <div
                    key={src}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{src}</h4>
                      <p className="text-2xl font-black text-amber-400 font-mono mt-1">{count} jobs</p>
                    </div>
                    <button
                      onClick={() => {
                        setJobsSourceFilter(src);
                        setActiveTab('manage_jobs');
                        loadJobs(1);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white transition"
                    >
                      Filter jobs from {src} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS */}
        {activeTab === 'reports' && (
          <div className="p-12 bg-slate-900 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">All Job Reports Clean</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No expired, broken, or suspicious listings reported by job seekers at this time. All published opportunities have valid verified links.
            </p>
          </div>
        )}
      </div>


        {/* TAB 6: IMPORT FROM GREENHOUSE */}
        {activeTab === 'import_greenhouse' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Download className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg font-bold text-white">Greenhouse Direct Career Portal Scraper</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Import verified job postings directly from any company using Greenhouse ATS. Applyra automatically cleans descriptions, extracts responsibilities & qualifications, detects salary and work modes, and tags relevant engineering skills.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Zero Ban Risk (Public API)
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Quick-Import Presets (Popular Tech Companies):
                </label>
                <div className="flex flex-wrap gap-2">
                  {GREENHOUSE_PRESETS.map((p) => {
                    const isSelected = scraperBoard.toLowerCase() === p.token.toLowerCase();
                    return (
                      <button
                        key={p.token}
                        type="button"
                        onClick={() => {
                          setScraperBoard(p.token);
                          setScraperCompany(p.name);
                          setScraperPreview(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] opacity-70 font-mono">({p.token})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scraper Configuration Form */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Greenhouse Board Token or URL <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={scraperBoard}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setScraperBoard(val);
                      setScraperPreview(null);
                    }}
                    placeholder="e.g. cloudflare or figma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Found in boards.greenhouse.io/<span className="text-slate-400">board_token</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Display Name
                  </label>
                  <input
                    type="text"
                    value={scraperCompany}
                    onChange={(e) => setScraperCompany(e.target.value)}
                    placeholder="e.g. Cloudflare"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-detected if left blank
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Job Import Limit
                  </label>
                  <select
                    value={scraperLimit}
                    onChange={(e) => setScraperLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs focus:outline-none focus:border-amber-400 transition"
                  >
                    <option value={10}>Top 10 listings</option>
                    <option value={25}>Top 25 listings</option>
                    <option value={50}>Top 50 listings</option>
                    <option value={100}>Top 100 listings</option>
                    <option value={0}>All Available listings</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Limit the number of roles saved
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category Override
                  </label>
                  <select
                    value={scraperCategory}
                    onChange={(e) => setScraperCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs focus:outline-none focus:border-amber-400 transition"
                  >
                    <option value="Auto-Detect">Auto-Detect per Role</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-categorizes by department & title
                  </p>
                </div>
              </div>

              {/* Sync Deactivations Toggle */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncDeact"
                  checked={scraperSyncDeactivations}
                  onChange={(e) => setScraperSyncDeactivations(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                />
                <label htmlFor="syncDeact" className="text-xs text-slate-400 select-none cursor-pointer">
                  Deactivate closed roles: mark past roles for this company not present in the new feed as inactive.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePreviewGreenhouse}
                  disabled={scraperPreviewing || scraperLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {scraperPreviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Test & Preview First 3</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportGreenhouse}
                  disabled={scraperLoading || scraperPreviewing}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {scraperLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Scraping & Importing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Start Live Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW CARDS */}
            {scraperPreview && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    Preview: Found {scraperPreview.totalFound} jobs at {scraperPreview.company}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing top {scraperPreview.sampleJobs?.length} sample listings (not saved yet)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scraperPreview.sampleJobs?.map((pj: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white line-clamp-2">{pj.title}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {pj.workMode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{pj.company}</span>
                          <span className="text-slate-600">•</span>
                          <span>{pj.location}</span>
                        </p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>Category: <strong className="text-slate-200">{pj.category}</strong></span>
                          <span>Salary: <strong className="text-slate-200">{pj.salary}</strong></span>
                        </div>

                        {pj.skills && pj.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {pj.skills.slice(0, 5).map((sk: string) => (
                              <span
                                key={sk}
                                className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <a
                        href={pj.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-2 border-t border-slate-800/80"
                      >
                        <span>Official Greenhouse link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IMPORT SUCCESS RESULT BANNER */}
            {scraperResult && (
              <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-white space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-300">
                        Successfully imported listings from {scraperResult.company}!
                      </h3>
                      <p className="text-xs text-slate-400">
                        Board: {scraperResult.boardToken} • Total on board: {scraperResult.totalFound}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setJobsSearch(scraperResult.company);
                      setActiveTab('manage_jobs');
                      loadJobs(1);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                  >
                    <span>View {scraperResult.company} Jobs</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Newly Added</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">+{scraperResult.imported}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Updated Existing</span>
                    <span className="text-xl font-black text-sky-400 font-mono">{scraperResult.updated}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Deactivated (Closed)</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{scraperResult.deactivated}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Failed / Skipped</span>
                    <span className="text-xl font-black text-slate-400 font-mono">{scraperResult.skipped}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Edit Job Listing</h3>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Source</label>
                  <select
                    value={editingJob.source}
                    onChange={(e) => setEditingJob({ ...editingJob, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingJob.category}
                    onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={editingJob.workMode}
                    onChange={(e) => setEditingJob({ ...editingJob, workMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Original URL</label>
                <input
                  type="url"
                  required
                  value={editingJob.originalUrl}
                  onChange={(e) => setEditingJob({ ...editingJob, originalUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
