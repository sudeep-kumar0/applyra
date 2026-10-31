'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import ContextualAuthModal, { ContextualAuthType } from '@/components/ContextualAuthModal';
import DidYouApplyModal from '@/components/DidYouApplyModal';
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  Sparkles,
  ExternalLink,
  Briefcase,
  X,
  Globe,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface JobListing {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  company: string;
  companyLogo?: string;
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

const DATE_POSTED_OPTIONS = [
  { label: 'Anytime', value: 'All' },
  { label: 'Past 24 Hours', value: '24h' },
  { label: 'Past Week (7 Days)', value: 'week' },
  { label: 'Past Month (30 Days)', value: 'month' },
];

function formatDatePosted(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks === 1) return '1w ago';
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths === 1) return '1mo ago';
  return `${diffMonths}mo ago`;
}

function CompanyLogoAvatar({
  company,
  logo,
  size = 'md',
}: {
  company: string;
  logo?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [logo]);

  const words = (company || '?').trim().split(/\s+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else {
    initials = (company || '?').slice(0, 2).toUpperCase();
  }

  const charCodeSum = (company || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-violet-600 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-600 to-blue-600',
  ];
  const bgGradient = gradients[charCodeSum % gradients.length];

  const dimClasses =
    size === 'sm'
      ? 'w-10 h-10 min-w-[2.5rem] text-xs rounded-xl'
      : size === 'lg'
      ? 'w-14 h-14 min-w-[3.5rem] text-base rounded-2xl'
      : 'w-12 h-12 min-w-[3rem] text-sm rounded-xl';

  const cleanLogo = logo && typeof logo === 'string' && logo.trim().length > 0 ? logo.trim() : null;

  if (cleanLogo && !imageError) {
    return (
      <div
        className={`${dimClasses} p-1.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex items-center justify-center flex-shrink-0 overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanLogo}
          alt={`${company} logo`}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${dimClasses} bg-gradient-to-br ${bgGradient} text-white font-bold flex items-center justify-center flex-shrink-0 shadow-xs select-none`}
      title={company}
    >
      <span>{initials}</span>
    </div>
  );
}

const CATEGORIES = [
  'All',
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
  'All',
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Foundit',
  'Apna',
  'Workday',
  'Company Career Website',
  'Other',
];

const FALLBACK_SEED_JOBS: JobListing[] = [
  {
    title: 'Java Full Stack Developer',
    slug: 'java-full-stack-developer-tcs-bengaluru',
    company: 'Tata Consultancy Services',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/tata-consultancy-services-logo.svg',
    location: 'Bengaluru, Karnataka',
    salary: '₹6–10 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Software',
    source: 'Company Career Website',
    skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'Docker'],
    description: 'Build enterprise banking solutions with modern Spring Boot microservices and React.',
    originalUrl: 'https://careers.tcs.com',
    postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Frontend React Developer',
    slug: 'frontend-react-developer-swiggy-bengaluru',
    company: 'Swiggy',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/swiggy-1.svg',
    location: 'Bengaluru (Remote Available)',
    salary: '₹12–18 LPA',
    experience: '2-4 years',
    workMode: 'Remote',
    jobType: 'Full-time',
    category: 'Software',
    source: 'LinkedIn',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    description: 'Develop fast web experiences for millions of daily active consumer orders.',
    originalUrl: 'https://careers.swiggy.com',
    postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Backend Node.js Engineer',
    slug: 'backend-nodejs-engineer-razorpay-bengaluru',
    company: 'Razorpay',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/razorpay.svg',
    location: 'Bengaluru, Karnataka',
    salary: '₹14–22 LPA',
    experience: '2-5 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Software',
    source: 'Naukri',
    skills: ['Node.js', 'NestJS', 'TypeScript', 'MongoDB', 'Docker'],
    description: 'Scale mission-critical payment gateways handling billions of monthly transactions.',
    originalUrl: 'https://razorpay.com',
    postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Cloud DevOps Engineer',
    slug: 'cloud-devops-engineer-flipkart-bengaluru',
    company: 'Flipkart',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/flipkart.svg',
    location: 'Bengaluru, Karnataka',
    salary: '₹15–24 LPA',
    experience: '2-5 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'DevOps/Cloud',
    source: 'Indeed',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker'],
    description: 'Design and manage large-scale e-commerce cloud infrastructure and deployment pipelines.',
    originalUrl: 'https://careers.flipkart.com',
    postedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    title: 'QA Automation Engineer',
    slug: 'qa-automation-engineer-wipro-pune',
    company: 'Wipro Technologies',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/wipro-logo.svg',
    location: 'Pune, Maharashtra',
    salary: '₹5–8 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'QA/Testing',
    source: 'Foundit',
    skills: ['Selenium', 'Java', 'Python', 'API Testing', 'Cypress'],
    description: 'Drive quality assurance and regression test automation for global fintech clients.',
    originalUrl: 'https://careers.wipro.com',
    postedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Data Analyst',
    slug: 'data-analyst-phonepe-bengaluru',
    company: 'PhonePe',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/phonepe-1.svg',
    location: 'Bengaluru, Karnataka',
    salary: '₹7–11 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Data',
    source: 'Apna',
    skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel'],
    description: 'Extract intelligence, uncover consumer trends, and build automated reporting dashboards.',
    originalUrl: 'https://careers.phonepe.com',
    postedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Machine Learning Engineering Intern',
    slug: 'machine-learning-engineering-intern-zomato-gurugram',
    company: 'Zomato',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/zomato-1.svg',
    location: 'Gurugram, Haryana',
    salary: '₹40,000 / mo Stipend',
    experience: 'Fresher / Graduate',
    workMode: 'Hybrid',
    jobType: 'Internship',
    category: 'AI/ML',
    source: 'Workday',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'SQL', 'Pandas'],
    description: '6-month internship on recommendation engines and delivery time prediction models.',
    originalUrl: 'https://zomato.com/careers',
    postedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
  },
];

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Initialize filter state from URL query parameters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'All');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');
  const [sourceFilter, setSourceFilter] = useState(searchParams.get('source') || 'All');
  const [datePosted, setDatePosted] = useState<string>(searchParams.get('datePosted') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const pageSize = 12;

  const [jobs, setJobs] = useState<JobListing[]>(FALLBACK_SEED_JOBS);
  const [loading, setLoading] = useState(false);
  const [savedJobSlugs, setSavedJobSlugs] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load saved job slugs from backend when user logs in
  useEffect(() => {
    if (!user) return;
    fetchApi('/applications?status=SAVED')
      .then((res) => {
        if (res && res.applications) {
          const slugs = res.applications
            .map((a: any) => (a.jobId && a.jobId.slug) ? a.jobId.slug : null)
            .filter(Boolean);
          setSavedJobSlugs(slugs);
        }
      })
      .catch(() => {});
  }, [user]);

  // Apply & Track Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<ContextualAuthType>('save_job');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);

  // Sync state to URL Query Parameters so Back Button preserves exact search state
  const syncParamsToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (location.trim()) params.set('location', location.trim());
    if (category !== 'All') params.set('category', category);
    if (workMode !== 'All') params.set('workMode', workMode);
    if (jobType !== 'All') params.set('jobType', jobType);
    if (sourceFilter !== 'All') params.set('source', sourceFilter);
    if (datePosted !== 'All') params.set('datePosted', datePosted);
    if (sort !== 'recent') params.set('sort', sort);
    if (currentPage > 1) params.set('page', String(currentPage));

    const queryString = params.toString();
    const newPath = queryString ? `/jobs?${queryString}` : '/jobs';
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newPath);
    }
  }, [search, location, category, workMode, jobType, sourceFilter, datePosted, sort, currentPage]);

  useEffect(() => {
    syncParamsToUrl();
  }, [syncParamsToUrl]);

  // When any filter/search changes (but NOT currentPage), reset to page 1
  const prevFiltersRef = React.useRef({ search, location, category, workMode, jobType, sourceFilter, datePosted, sort });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.search !== search ||
      prev.location !== location ||
      prev.category !== category ||
      prev.workMode !== workMode ||
      prev.jobType !== jobType ||
      prev.sourceFilter !== sourceFilter ||
      prev.datePosted !== datePosted ||
      prev.sort !== sort;

    if (filtersChanged) {
      prevFiltersRef.current = { search, location, category, workMode, jobType, sourceFilter, datePosted, sort };
      setCurrentPage(1);
    }
  }, [search, location, category, workMode, jobType, sourceFilter, datePosted, sort]);

  // Fetch jobs from backend REST API with fallback to local seed data
  useEffect(() => {
    let isCancelled = false;

    async function loadJobs() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search.trim()) query.append('search', search.trim());
        if (location.trim()) query.append('location', location.trim());
        if (category !== 'All') query.append('category', category);
        if (workMode !== 'All') query.append('workMode', workMode);
        if (jobType !== 'All') query.append('jobType', jobType);
        if (sourceFilter !== 'All') query.append('source', sourceFilter);
        if (datePosted !== 'All') query.append('datePosted', datePosted);
        if (sort) query.append('sort', sort);
        query.append('page', String(currentPage));
        query.append('limit', String(pageSize));

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/jobs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data && Array.isArray(data.jobs)) {
            setJobs(data.jobs);
            setTotalJobs(data.total !== undefined ? data.total : data.jobs.length);
            setTotalPages(data.totalPages || Math.ceil((data.total || data.jobs.length) / pageSize) || 1);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend jobs fetch failed, filtering local fallback seed list:', err);
      }

      if (isCancelled) return;

      // Local fallback filter if backend is unreachable or has no items matching
      let filtered = [...FALLBACK_SEED_JOBS];
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(s) ||
            j.company.toLowerCase().includes(s) ||
            j.skills.some((sk) => sk.toLowerCase().includes(s)),
        );
      }
      if (location.trim()) {
        filtered = filtered.filter((j) =>
          j.location.toLowerCase().includes(location.toLowerCase()),
        );
      }
      if (category !== 'All') {
        filtered = filtered.filter(
          (j) => j.category.toLowerCase() === category.toLowerCase(),
        );
      }
      if (workMode !== 'All') {
        filtered = filtered.filter((j) => j.workMode.toLowerCase() === workMode.toLowerCase());
      }
      if (jobType !== 'All') {
        filtered = filtered.filter((j) => j.jobType.toLowerCase() === jobType.toLowerCase());
      }
      if (datePosted !== 'All') {
        const now = Date.now();
        const msThreshold =
          datePosted === '24h'
            ? 24 * 3600 * 1000
            : datePosted === 'week'
            ? 7 * 24 * 3600 * 1000
            : datePosted === 'month'
            ? 30 * 24 * 3600 * 1000
            : 0;
        if (msThreshold > 0) {
          filtered = filtered.filter((j) => {
            const t = new Date(j.postedAt).getTime();
            return !isNaN(t) && now - t <= msThreshold;
          });
        }
      }
      if (sourceFilter !== 'All') {
        filtered = filtered.filter(
          (j) => j.source.toLowerCase() === sourceFilter.toLowerCase(),
        );
      }
      const totalFiltered = filtered.length;
      const startIdx = (currentPage - 1) * pageSize;
      const paginatedFallback = filtered.slice(startIdx, startIdx + pageSize);
      setJobs(paginatedFallback);
      setTotalJobs(totalFiltered);
      setTotalPages(Math.ceil(totalFiltered / pageSize) || 1);
      setLoading(false);
    }

    loadJobs();

    return () => {
      isCancelled = true;
    };
  }, [search, location, category, workMode, jobType, sourceFilter, datePosted, sort, currentPage]);

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
      // Optimistically remove from saved (UI only — no unsave endpoint yet)
      setSavedJobSlugs((prev) => prev.filter((s) => s !== job.slug));
      return;
    }
    // Optimistically mark as saved in UI
    setSavedJobSlugs((prev) => [...prev, job.slug]);
    try {
      await fetchApi('/applications/click', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch (err) {
      // Revert if failed
      setSavedJobSlugs((prev) => prev.filter((s) => s !== job.slug));
      console.warn('Could not save job:', err);
    }
  };

  const handleResumeMatchClick = (job: JobListing) => {
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('resume_match');
      setAuthModalOpen(true);
      return;
    }
    router.push(`/resume?job=${encodeURIComponent(job.slug)}`);
  };

  const handleApplyClick = async (job: JobListing) => {
    if (!job.originalUrl) {
      alert('Original application link is not available for this role.');
      return;
    }

    // If unauthenticated: open contextual auth modal
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('apply_track');
      setAuthModalOpen(true);
      return;
    }

    // Authenticated apply flow:
    // 1. Record apply attempt in MongoDB via background click tracking
    try {
      await fetchApi('/applications/click', {
        method: 'POST',
        body: JSON.stringify({ jobId: job._id || job.slug }),
      });
    } catch (err) {
      console.warn('Could not record apply click to MongoDB:', err);
    }

    // 2. Open official external job link in a new tab
    window.open(job.originalUrl, '_blank', 'noopener,noreferrer');

    // 3. Prompt user with "Did you apply for this job?" modal
    setApplyModalJob(job);
    setApplyModalOpen(true);
  };

  const currentQueryString = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (location.trim()) params.set('location', location.trim());
    if (category !== 'All') params.set('category', category);
    if (workMode !== 'All') params.set('workMode', workMode);
    if (jobType !== 'All') params.set('jobType', jobType);
    if (sourceFilter !== 'All') params.set('source', sourceFilter);
    if (sort !== 'recent') params.set('sort', sort);
    return params.toString();
  };

  const sourceBadgeColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900';
      case 'naukri':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900';
      case 'indeed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900';
      case 'foundit':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900';
      case 'apna':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900';
      case 'workday':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Breadcrumb & Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Open Job Opportunities
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Free public discovery • Direct company links • Transparent requirements & sources
        </p>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title, skill, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Location (e.g. Bengaluru, Remote)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {location && (
            <button onClick={() => setLocation('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm transition"
        >
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filters</span>
          {((category !== 'All' ? 1 : 0) +
            (workMode !== 'All' ? 1 : 0) +
            (jobType !== 'All' ? 1 : 0) +
            (sourceFilter !== 'All' ? 1 : 0) +
            (datePosted !== 'All' ? 1 : 0)) > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">
              {(category !== 'All' ? 1 : 0) +
            (workMode !== 'All' ? 1 : 0) +
            (jobType !== 'All' ? 1 : 0) +
            (sourceFilter !== 'All' ? 1 : 0) +
            (datePosted !== 'All' ? 1 : 0)}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              showMobileFilters ? 'rotate-180' : ''
            }`}
          />
        </button>

        {((category !== 'All' ? 1 : 0) +
            (workMode !== 'All' ? 1 : 0) +
            (jobType !== 'All' ? 1 : 0) +
            (sourceFilter !== 'All' ? 1 : 0) +
            (datePosted !== 'All' ? 1 : 0)) > 0 && (
          <button
            onClick={() => {
              setCategory('All');
              setWorkMode('All');
              setJobType('All');
              setSourceFilter('All');
              setDatePosted('All');
              setCurrentPage(1);
            }}
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className={`lg:col-span-1 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600" />
                Filters
              </span>
              <button
                onClick={() => {
                  setCategory('All');
                  setWorkMode('All');
                  setJobType('All');
                  setSourceFilter('All');
                  setDatePosted('All');
                  setSearch('');
                  setLocation('');
                  setCurrentPage(1);
                }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Category Dropdown (All 18 Categories) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Job Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories (18)' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Source Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Job Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src === 'All' ? 'All Sources' : src}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Posted Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span>Date Posted</span>
                {datePosted !== 'All' && (
                  <button
                    onClick={() => setDatePosted('All')}
                    className="text-[11px] font-normal text-brand-600 dark:text-brand-400 hover:underline lowercase"
                  >
                    clear
                  </button>
                )}
              </label>
              <div className="space-y-1.5 text-xs">
                {DATE_POSTED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDatePosted(opt.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      datePosted === opt.value
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Work Mode
              </label>
              <div className="space-y-1.5 text-xs">
                {['All', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setWorkMode(mode)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      workMode === mode
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Job Type
              </label>
              <div className="space-y-1.5 text-xs">
                {['All', 'Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setJobType(type)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      jobType === type
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Done button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="lg:hidden w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
            >
              Done / View Jobs
            </button>
          </div>
        </div>

        {/* JOB LISTINGS */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Filter Shortcut Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Quick:
            </span>
            <button
              onClick={() => setDatePosted((prev) => (prev === 'week' ? 'All' : 'week'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                datePosted === 'week'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>⚡ Past Week (7 Days)</span>
              {datePosted === 'week' && <X className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setDatePosted((prev) => (prev === '24h' ? 'All' : '24h'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                datePosted === '24h'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Past 24 Hours</span>
              {datePosted === '24h' && <X className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setWorkMode((prev) => (prev === 'Remote' ? 'All' : 'Remote'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                workMode === 'Remote'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>🌐 Remote</span>
              {workMode === 'Remote' && <X className="w-3 h-3" />}
            </button>

            {(category !== 'All' || workMode !== 'All' || jobType !== 'All' || sourceFilter !== 'All' || datePosted !== 'All') && (
              <button
                onClick={() => {
                  setCategory('All');
                  setWorkMode('All');
                  setJobType('All');
                  setSourceFilter('All');
                  setDatePosted('All');
                  setCurrentPage(1);
                }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
            <span>
              {totalJobs > 0
                ? (
                    totalPages > 1
                      ? <>Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalJobs)}</strong> of <strong>{totalJobs}</strong> job{totalJobs !== 1 ? 's' : ''}</>
                      : <><strong>{totalJobs}</strong> job{totalJobs !== 1 ? 's' : ''} found</>
                  )
                : 'No jobs found'
              }
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="recent">Most Recent</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading open jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No jobs match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try broadening your search terms or clearing some filters.</p>
              <button
                onClick={() => {
                  setCategory('All');
                  setWorkMode('All');
                  setJobType('All');
                  setSourceFilter('All');
                  setSearch('');
                  setLocation('');
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            jobs.map((job) => {
              const isSaved = savedJobSlugs.includes(job.slug);
              const qString = currentQueryString();
              const detailsLink = qString ? `/jobs/${job.slug}?${qString}` : `/jobs/${job.slug}`;

              return (
                <div
                  key={job.slug}
                  onClick={() => router.push(detailsLink)}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group/card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <CompanyLogoAvatar company={job.company} logo={job.companyLogo || (job as any).logo} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Source Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${sourceBadgeColor(
                            job.source,
                          )} flex items-center gap-1`}
                        >
                          <Globe className="w-3 h-3" />
                          Source: {job.source || 'Company Career Website'}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {job.workMode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {job.jobType}
                        </span>
                        {job.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {job.category}
                          </span>
                        )}
                      </div>

                      <Link
                        href={detailsLink}
                        onClick={(e) => e.stopPropagation()}
                        className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 group-hover/card:text-brand-600 dark:group-hover/card:text-brand-400 transition"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        {job.company}
                      </p>
                    </div>
                  </div>

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
                      title={user ? (isSaved ? 'Job saved' : 'Save job') : 'Login to save job'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 dark:fill-brand-400' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <span>{job.salary}</span>
                    </div>
                    {job.postedAt && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Posted {formatDatePosted(job.postedAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills?.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills?.length > 5 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResumeMatchClick(job);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Check Resume Match</span>
                      </button>

                      <Link
                        href={detailsLink}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white transition group/btn"
                      >
                        <span>Details & Requirements</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyClick(job);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, totalJobs)}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalJobs}</span> jobs
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
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
                          <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-slate-400">
                            ...
                          </span>
                        );
                      }
                      const pageNum = item as number;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
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
        onConfirmed={() => {
          // Application successfully saved and confirmed as APPLIED in MongoDB
        }}
      />
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading open jobs...</div>}>
        <JobsContent />
      </Suspense>
    </div>
  );
}
