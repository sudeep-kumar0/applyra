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
  ChevronLeft,
  ChevronRight,
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
  // Top tech companies & MNCs with verified active India development centers
  { name: 'InMobi', token: 'inmobi', category: 'Software', isIndia: true },
  { name: 'Groww', token: 'groww', category: 'Finance', isIndia: true },
  { name: 'Databricks', token: 'databricks', category: 'Data', isIndia: true },
  { name: 'MongoDB', token: 'mongodb', category: 'Data', isIndia: true },
  { name: 'Okta', token: 'okta', category: 'Cybersecurity', isIndia: true },
  { name: 'Zscaler', token: 'zscaler', category: 'Cybersecurity', isIndia: true },
  { name: 'Stripe', token: 'stripe', category: 'Finance', isIndia: true },
  { name: 'Rubrik', token: 'rubrik', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Elastic', token: 'elastic', category: 'Data', isIndia: true },
  { name: 'Twilio', token: 'twilio', category: 'Software', isIndia: true },
  { name: 'Toast', token: 'toast', category: 'Software', isIndia: true },
  { name: 'Netskope', token: 'netskope', category: 'Cybersecurity', isIndia: true },
  { name: 'Roblox', token: 'roblox', category: 'Software', isIndia: true },
  { name: 'Datadog', token: 'datadog', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Coinbase', token: 'coinbase', category: 'Software', isIndia: true },
  { name: 'Airbnb', token: 'airbnb', category: 'Software', isIndia: true },
  { name: 'Deliveroo', token: 'deliveroo', category: 'Software', isIndia: true },
  { name: 'Coursera', token: 'coursera', category: 'Software', isIndia: true },
  { name: 'Samsara', token: 'samsara', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Cloudflare', token: 'cloudflare', category: 'DevOps/Cloud', isIndia: true },
  { name: 'LaunchDarkly', token: 'launchdarkly', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Starburst', token: 'starburst', category: 'Data', isIndia: true },
  { name: 'Roku', token: 'roku', category: 'Software', isIndia: true },
  { name: 'Yugabyte', token: 'yugabyte', category: 'Data', isIndia: true },
  { name: 'Figma', token: 'figma', category: 'Software', isIndia: true },
  { name: 'Cockroach Labs', token: 'cockroachlabs', category: 'Data', isIndia: true },
  { name: 'Fastly', token: 'fastly', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Scale AI', token: 'scaleai', category: 'AI/ML', isIndia: true },
  { name: 'Vercel', token: 'vercel', category: 'Software', isIndia: true },
  { name: 'GitLab', token: 'gitlab', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Canonical', token: 'canonical', category: 'DevOps/Cloud', isIndia: true },
];

const WORKDAY_PRESETS = [
  { name: 'Adobe', token: 'adobe', url: 'https://adobe.wd5.myworkdayjobs.com/external_experienced', category: 'Software', isIndia: true },
  { name: 'NVIDIA', token: 'nvidia', url: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite', category: 'AI/ML', isIndia: true },
  { name: 'Salesforce', token: 'salesforce', url: 'https://salesforce.wd12.myworkdayjobs.com/External_Career_Site', category: 'Software', isIndia: true },
  { name: 'Target', token: 'target', url: 'https://target.wd5.myworkdayjobs.com/targetcareers', category: 'Software', isIndia: true },
  { name: 'Mastercard', token: 'mastercard', url: 'https://mastercard.wd1.myworkdayjobs.com/CorporateCareers', category: 'Finance', isIndia: true },
  { name: 'Intel', token: 'intel', url: 'https://intel.wd1.myworkdayjobs.com/External', category: 'Software', isIndia: true },
  { name: 'HP', token: 'hp', url: 'https://hp.wd5.myworkdayjobs.com/ExternalCareerSite', category: 'Software', isIndia: true },
  { name: 'Philips', token: 'philips', url: 'https://philips.wd3.myworkdayjobs.com/jobs-and-careers', category: 'Software', isIndia: true },
  { name: 'Motorola Solutions', token: 'motorolasolutions', url: 'https://motorolasolutions.wd5.myworkdayjobs.com/Careers', category: 'DevOps/Cloud', isIndia: true },
  { name: 'CrowdStrike', token: 'crowdstrike', url: 'https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers', category: 'Cybersecurity', isIndia: true },
  { name: 'PayPal', token: 'paypal', url: 'https://paypal.wd1.myworkdayjobs.com/jobs', category: 'Finance', isIndia: true },
  { name: 'Broadcom', token: 'broadcom', url: 'https://broadcom.wd1.myworkdayjobs.com/External_Career', category: 'DevOps/Cloud', isIndia: true },
  { name: 'Autodesk', token: 'autodesk', url: 'https://autodesk.wd1.myworkdayjobs.com/Ext', category: 'Software', isIndia: true },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, mongoUser, isAdmin, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'add_job' | 'manage_jobs' | 'sources' | 'reports' | 'import_greenhouse' | 'import_workday'>('dashboard');

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
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const adminPageSize = 15;

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
  const [scraperIndiaOnly, setScraperIndiaOnly] = useState<boolean>(true);
  const [batchScraping, setBatchScraping] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);

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
        body: JSON.stringify({ boardToken: scraperBoard.trim(), limit: 3, indiaOnly: scraperIndiaOnly }),
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
          indiaOnly: scraperIndiaOnly,
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


  // Workday Scraper State
  const [workdayUrl, setWorkdayUrl] = useState('adobe');
  const [workdayCompany, setWorkdayCompany] = useState('Adobe');
  const [workdayLimit, setWorkdayLimit] = useState<number>(25);
  const [workdayCategory, setWorkdayCategory] = useState<string>('Auto-Detect');
  const [workdaySyncDeactivations, setWorkdaySyncDeactivations] = useState(true);
  const [workdayLoading, setWorkdayLoading] = useState(false);
  const [workdayPreviewing, setWorkdayPreviewing] = useState(false);
  const [workdayPreview, setWorkdayPreview] = useState<any | null>(null);
  const [workdayResult, setWorkdayResult] = useState<any | null>(null);
  const [workdayIndiaOnly, setWorkdayIndiaOnly] = useState<boolean>(true);
  const [workdayBatchScraping, setWorkdayBatchScraping] = useState<boolean>(false);
  const [workdayBatchResult, setWorkdayBatchResult] = useState<any | null>(null);

  const handlePreviewWorkday = async () => {
    if (!workdayUrl.trim()) {
      showToast('Please enter a Workday career URL or preset name', 'error');
      return;
    }
    setWorkdayPreviewing(true);
    setWorkdayPreview(null);
    try {
      const res = await fetchApi('/admin/scrape/workday/preview', {
        method: 'POST',
        body: JSON.stringify({
          siteUrlOrToken: workdayUrl.trim(),
          limit: 3,
          indiaOnly: workdayIndiaOnly,
        }),
      });
      if (res && res.success) {
        setWorkdayPreview(res);
        if (res.company && !workdayCompany) setWorkdayCompany(res.company);
        showToast(`Fetched ${res.totalFound} jobs from ${res.company}. Showing 3 previews.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to preview Workday jobs', 'error');
    } finally {
      setWorkdayPreviewing(false);
    }
  };

  const handleImportWorkday = async () => {
    if (!workdayUrl.trim()) {
      showToast('Please enter a Workday career URL or preset name', 'error');
      return;
    }
    setWorkdayLoading(true);
    setWorkdayResult(null);
    try {
      const res = await fetchApi('/admin/scrape/workday/import', {
        method: 'POST',
        body: JSON.stringify({
          siteUrlOrToken: workdayUrl.trim(),
          companyName: workdayCompany.trim() || undefined,
          limit: workdayLimit > 0 ? workdayLimit : undefined,
          categoryOverride: workdayCategory !== 'Auto-Detect' ? workdayCategory : undefined,
          syncDeactivations: workdaySyncDeactivations,
          indiaOnly: workdayIndiaOnly,
        }),
      });
      if (res && res.success) {
        setWorkdayResult(res.result);
        showToast(res.message || 'Workday scraping and import completed!');
        loadStats();
        loadJobs(1);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to scrape and import Workday jobs', 'error');
    } finally {
      setWorkdayLoading(false);
    }
  };

  const handleBatchScrapeAllWorkday = async () => {
    if (
      !confirm(
        `Are you sure you want to scrape jobs from all ${WORKDAY_PRESETS.length} registered Workday companies${
          workdayIndiaOnly ? ' (India & Remote Only)' : ''
        }? This parses all enterprise Workday boards and saves matching jobs live into MongoDB.`,
      )
    ) {
      return;
    }
    setWorkdayBatchScraping(true);
    setWorkdayBatchResult(null);
    try {
      const res = await fetchApi('/admin/scrape/workday/scrape-all', {
        method: 'POST',
        body: JSON.stringify({
          indiaOnly: workdayIndiaOnly,
          syncDeactivations: workdaySyncDeactivations,
        }),
      });
      if (res && res.success) {
        setWorkdayBatchResult(res.result);
        showToast(
          `Workday batch scrape complete: +${res.result.totalImported} imported, ${res.result.totalUpdated} updated!`,
        );
        loadStats();
        loadJobs(1);
      } else {
        showToast(res?.message || 'Workday batch scrape finished', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete Workday batch scrape', 'error');
    } finally {
      setWorkdayBatchScraping(false);
    }
  };

  const handleBatchScrapeAll = async () => {
    if (
      !confirm(
        `Are you sure you want to scrape jobs from all ${GREENHOUSE_PRESETS.length} registered companies${
          scraperIndiaOnly ? ' (India & Remote Only)' : ''
        }? This processes all company boards and saves matching jobs live into MongoDB.`,
      )
    ) {
      return;
    }
    setBatchScraping(true);
    setBatchResult(null);
    try {
      const res = await fetchApi('/admin/scrape/greenhouse/scrape-all', {
        method: 'POST',
        body: JSON.stringify({
          indiaOnly: scraperIndiaOnly,
          syncDeactivations: scraperSyncDeactivations,
        }),
      });
      if (res && res.success) {
        setBatchResult(res.result);
        showToast(
          `Batch scrape complete: +${res.result.totalImported} imported, ${res.result.totalUpdated} updated!`,
        );
        loadStats();
        loadJobs(1);
      } else {
        showToast(res?.message || 'Batch scrape encountered issues', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Batch scrape failed', 'error');
    } finally {
      setBatchScraping(false);
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

  // Select all jobs on current page
  const handleSelectAllCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = jobsList.map((j) => j._id).filter(Boolean);
      setSelectedJobIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(jobsList.map((j) => j._id));
      setSelectedJobIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected Jobs
  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the ${selectedJobIds.length} selected job(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await fetchApi('/admin/jobs/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedJobIds }),
      });
      if (res && res.success) {
        showToast(res.message || `Successfully deleted ${selectedJobIds.length} jobs.`);
        setSelectedJobIds([]);
        loadJobs(jobsPage);
        loadStats();
      } else {
        showToast('Failed to delete selected jobs', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete selected jobs', 'error');
    } finally {
      setBulkDeleting(false);
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
            { id: 'import_workday', label: 'Import Workday', icon: <Building2 className="w-4 h-4" /> },
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

            {/* Bulk Action Toolbar */}
            {selectedJobIds.length > 0 && (
              <div className="p-3.5 px-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>
                    {selectedJobIds.length} job{selectedJobIds.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJobIds([])}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {bulkDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete Selected ({selectedJobIds.length})</span>
                  </button>
                </div>
              </div>
            )}

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
                        <th className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={
                              jobsList.length > 0 &&
                              jobsList.every((j) => selectedJobIds.includes(j._id))
                            }
                            onChange={handleSelectAllCurrentPage}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                            title="Select all on this page"
                          />
                        </th>
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
                      {jobsList.map((job) => {
                        const isSelected = selectedJobIds.includes(job._id);
                        return (
                        <tr
                          key={job._id || job.slug}
                          className={`hover:bg-slate-800/40 transition ${
                            isSelected ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectJob(job._id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                            />
                          </td>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Admin Table Pagination */}
              {Math.ceil(jobsTotal / adminPageSize) > 1 && (
                <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Showing <span className="text-white font-semibold">{(jobsPage - 1) * adminPageSize + 1}</span> to{' '}
                    <span className="text-white font-semibold">{Math.min(jobsPage * adminPageSize, jobsTotal)}</span> of{' '}
                    <span className="text-white font-semibold">{jobsTotal}</span> jobs
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => loadJobs(Math.max(jobsPage - 1, 1))}
                      disabled={jobsPage === 1 || loadingJobs}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(jobsTotal / adminPageSize) }, (_, i) => i + 1)
                        .filter((pageNum) => {
                          const totalP = Math.ceil(jobsTotal / adminPageSize);
                          return (
                            pageNum === 1 ||
                            pageNum === totalP ||
                            Math.abs(pageNum - jobsPage) <= 1
                          );
                        })
                        .reduce<(number | string)[]>((acc, pageNum, idx, arr) => {
                          if (idx > 0 && pageNum - arr[idx - 1] > 1) {
                            acc.push('...');
                          }
                          acc.push(pageNum);
                          return acc;
                        }, [])
                        .map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span key={`admin-dots-${idx}`} className="px-2 py-1 text-slate-500">
                                ...
                              </span>
                            );
                          }
                          const pageNum = item as number;
                          const isActive = pageNum === jobsPage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => loadJobs(pageNum)}
                              disabled={loadingJobs}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                                isActive
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => loadJobs(Math.min(jobsPage + 1, Math.ceil(jobsTotal / adminPageSize)))}
                      disabled={jobsPage === Math.ceil(jobsTotal / adminPageSize) || loadingJobs}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

        {/* TAB 6: IMPORT FROM GREENHOUSE */}
        {activeTab === 'import_greenhouse' && (
          <div className="space-y-8">
            {/* DAILY AUTOMATED CRON & BATCH SCRAPER CARD */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Daily Automated Greenhouse Synchronization</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                        Active Cron (02:00 AM)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Scheduled every day at <strong>02:00 AM server time (0 2 * * *)</strong>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Applyra automatically scrapes <strong>all {GREENHOUSE_PRESETS.length} registered companies</strong> with <strong>India & Remote Only</strong> filtering enabled. Jobs located in foreign countries (US, UK, Europe, etc.) or restricted to foreign remotes are automatically filtered out.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{GREENHOUSE_PRESETS.filter((p) => p.isIndia).length} Companies with India Dev Centers</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{GREENHOUSE_PRESETS.filter((p) => !p.isIndia).length} Global Remote Companies</span>
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleBatchScrapeAll}
                  disabled={batchScraping || scraperLoading}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
                >
                  {batchScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Batch Scraping All Boards...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-slate-950" />
                      <span>Sync All {GREENHOUSE_PRESETS.length} Companies Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* BATCH SCRAPE RESULT BANNER */}
            {batchResult && (
              <div className="p-6 md:p-8 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 text-white space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-300">
                        Batch Scrape Completed Across {batchResult.successfulCompanies}/{batchResult.totalCompanies} Companies!
                      </h3>
                      <p className="text-xs text-slate-400">
                        Total job listings found on boards: {batchResult.totalFound} • Filter: {scraperIndiaOnly ? 'India & Remote Only' : 'All Countries'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('manage_jobs');
                      loadJobs(1);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>View All Jobs</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Newly Imported</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">+{batchResult.totalImported}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Updated Existing</span>
                    <span className="text-2xl font-black text-sky-400 font-mono">{batchResult.totalUpdated}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Filtered / Non-India</span>
                    <span className="text-2xl font-black text-slate-400 font-mono">{batchResult.totalSkipped}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Failed Boards</span>
                    <span className="text-2xl font-black text-rose-400 font-mono">{batchResult.failedCompanies}</span>
                  </div>
                </div>
              </div>
            )}
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
                        {p.isIndia && <span title="India Office / Hub" className="text-xs">🇮🇳</span>}
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

              {/* Filter & Sync Toggles */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="indiaOnlyCheck"
                    checked={scraperIndiaOnly}
                    onChange={(e) => setScraperIndiaOnly(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="indiaOnlyCheck" className="text-xs font-bold text-amber-300 select-none cursor-pointer flex items-center gap-1.5">
                    <span>🇮🇳 India & Remote Only</span>
                    <span className="text-[11px] font-normal text-slate-300">(Discards jobs physically located in US, UK, Europe, etc. or restricted to foreign remotes)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pl-6">
                  <input
                    type="checkbox"
                    id="syncDeact"
                    checked={scraperSyncDeactivations}
                    onChange={(e) => setScraperSyncDeactivations(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor="syncDeact" className="text-xs text-slate-400 select-none cursor-pointer">
                    Deactivate closed roles: mark past roles for this company not present in the new feed as inactive.
                  </label>
                </div>
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

                {scraperPreview.sampleJobs?.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      No India or Worldwide Remote jobs found at {scraperPreview.company}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All active openings at this company are currently restricted to foreign territories (such as US, UK, Europe, etc.).
                    </p>
                  </div>
                ) : (
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
                )}
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


        {/* TAB 7: IMPORT FROM WORKDAY */}
        {activeTab === 'import_workday' && (
          <div className="space-y-8">
            {/* DAILY AUTOMATED CRON & BATCH SCRAPER CARD */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Daily Automated Workday Synchronization</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                        Active Cron (03:00 AM)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Scheduled every day at <strong>03:00 AM server time (0 3 * * *)</strong>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Applyra automatically scrapes <strong>all {WORKDAY_PRESETS.length} registered Workday companies</strong> with <strong>India & Remote Only</strong> filtering enabled. Enterprise job boards (Adobe, Nvidia, Salesforce, Target, Intel, Mastercard, etc.) are synchronized with rich job descriptions and skills.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{WORKDAY_PRESETS.length} Verified Enterprise Tech Boards</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>1,500+ Active Roles in India</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleBatchScrapeAllWorkday}
                  disabled={workdayBatchScraping || workdayLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {workdayBatchScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing All Workday Boards...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>Sync All {WORKDAY_PRESETS.length} Workday Companies Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* BATCH RESULT BANNER */}
            {workdayBatchResult && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 text-white space-y-4 animate-in fade-in duration-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Workday Batch Scraping Synchronization Finished
                      </h4>
                      <p className="text-xs text-slate-400">
                        Processed {workdayBatchResult.successfulCompanies} of {workdayBatchResult.totalCompanies} Workday boards
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total on Boards</span>
                    <span className="text-lg font-black text-white font-mono">{workdayBatchResult.totalFound}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Newly Imported</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">+{workdayBatchResult.totalImported}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Updated Existing</span>
                    <span className="text-lg font-black text-sky-400 font-mono">{workdayBatchResult.totalUpdated}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Foreign / Filtered</span>
                    <span className="text-lg font-black text-slate-400 font-mono">{workdayBatchResult.totalSkipped}</span>
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL SINGLE-COMPANY SCRAPER */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span>Import from Workday Career Portals</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Extract live enterprise job postings directly from Workday single-page application APIs with full description and skill extraction.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Workday CXS API
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Quick-Import Presets (Enterprise Companies on Workday):
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKDAY_PRESETS.map((p) => {
                    const isSelected = workdayUrl.toLowerCase() === p.token.toLowerCase() || workdayUrl.toLowerCase() === p.url.toLowerCase();
                    return (
                      <button
                        key={p.token}
                        type="button"
                        onClick={() => {
                          setWorkdayUrl(p.url);
                          setWorkdayCompany(p.name);
                          setWorkdayPreview(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
                        }`}
                      >
                        <span>{p.name}</span>
                        {p.isIndia && <span title="India Office / Hub" className="text-xs">🇮🇳</span>}
                        <span className="text-[10px] opacity-70 font-mono">({p.token})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scraper Configuration Form */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Workday Career URL or Preset Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={workdayUrl}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setWorkdayUrl(val);
                      setWorkdayPreview(null);
                    }}
                    placeholder="e.g. adobe or https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Accepts full Workday portal URL or short preset name (e.g. <span className="text-slate-400">nvidia, adobe, salesforce, target</span>)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Display Name
                  </label>
                  <input
                    type="text"
                    value={workdayCompany}
                    onChange={(e) => setWorkdayCompany(e.target.value)}
                    placeholder="e.g. Adobe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition"
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
                    value={workdayLimit}
                    onChange={(e) => setWorkdayLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-indigo-400 transition"
                  >
                    <option value={10}>10 jobs</option>
                    <option value={25}>25 jobs (Recommended)</option>
                    <option value={50}>50 jobs</option>
                    <option value={100}>100 jobs</option>
                    <option value={0}>All available</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Paginates automatically
                  </p>
                </div>
              </div>

              {/* Filter & Sync Toggles */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="workdayIndiaOnlyCheck"
                    checked={workdayIndiaOnly}
                    onChange={(e) => setWorkdayIndiaOnly(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="workdayIndiaOnlyCheck" className="text-xs font-bold text-indigo-300 select-none cursor-pointer flex items-center gap-1.5">
                    <span>🇮🇳 India & Remote Only</span>
                    <span className="text-[11px] font-normal text-slate-300">(Discards jobs physically located in US, UK, Europe, etc. or restricted to foreign remotes)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pl-6">
                  <input
                    type="checkbox"
                    id="workdaySyncDeact"
                    checked={workdaySyncDeactivations}
                    onChange={(e) => setWorkdaySyncDeactivations(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor="workdaySyncDeact" className="text-xs text-slate-400 select-none cursor-pointer">
                    Deactivate closed roles: mark past roles for this company not present in the new feed as inactive.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePreviewWorkday}
                  disabled={workdayPreviewing || workdayLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {workdayPreviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Test & Preview First 3</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportWorkday}
                  disabled={workdayLoading || workdayPreviewing}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {workdayLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Scraping & Importing from Workday...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Import Workday Jobs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW CARDS */}
            {workdayPreview && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-400" />
                    Preview: Found {workdayPreview.totalFound} jobs at {workdayPreview.company}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing top {workdayPreview.sampleJobs?.length} sample listings (not saved yet)
                  </span>
                </div>

                {workdayPreview.sampleJobs?.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      No India or Worldwide Remote jobs found at {workdayPreview.company}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All active openings at this company are currently restricted to foreign territories.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workdayPreview.sampleJobs?.map((pj: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-white line-clamp-2">{pj.title}</h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
                          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 pt-2 border-t border-slate-800/80"
                        >
                          <span>Official Workday link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* IMPORT SUCCESS RESULT BANNER */}
            {workdayResult && (
              <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-white space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-300">
                        Successfully imported listings from {workdayResult.company}!
                      </h3>
                      <p className="text-xs text-slate-400">
                        Board: {workdayResult.boardToken} • Total on board: {workdayResult.totalFound}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setJobsSearch(workdayResult.company);
                      setActiveTab('manage_jobs');
                      loadJobs(1);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                  >
                    <span>View {workdayResult.company} Jobs</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Newly Added</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">+{workdayResult.imported}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Updated Existing</span>
                    <span className="text-xl font-black text-sky-400 font-mono">{workdayResult.updated}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Deactivated (Closed)</span>
                    <span className="text-xl font-black text-indigo-400 font-mono">{workdayResult.deactivated}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Failed / Skipped</span>
                    <span className="text-xl font-black text-slate-400 font-mono">{workdayResult.skipped}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

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
