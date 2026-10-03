'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ContextualAuthModal, { ContextualAuthType } from '@/components/ContextualAuthModal';
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  Sparkles,
  ExternalLink,
  Briefcase,
  X,
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

const FALLBACK_SEED_JOBS: JobListing[] = [
  {
    title: 'Java Full Stack Developer',
    slug: 'java-full-stack-developer-tcs-bengaluru',
    company: 'Tata Consultancy Services',
    location: 'Bengaluru, Karnataka',
    salary: '₹6–10 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Java Developer',
    source: 'Company Careers',
    skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'Docker'],
    description: 'Build enterprise banking solutions with modern Spring Boot microservices and React.',
    originalUrl: 'https://careers.tcs.com',
    postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Frontend React Developer',
    slug: 'frontend-react-developer-swiggy-bengaluru',
    company: 'Swiggy',
    location: 'Bengaluru (Remote Available)',
    salary: '₹12–18 LPA',
    experience: '2-4 years',
    workMode: 'Remote',
    jobType: 'Full-time',
    category: 'Frontend Developer',
    source: 'Company Careers',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    description: 'Develop fast web experiences for millions of daily active consumer orders.',
    originalUrl: 'https://careers.swiggy.com',
    postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Backend Node.js Engineer',
    slug: 'backend-nodejs-engineer-razorpay-bengaluru',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    salary: '₹14–22 LPA',
    experience: '2-5 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Backend Developer',
    source: 'Company Careers',
    skills: ['Node.js', 'NestJS', 'TypeScript', 'MongoDB', 'Docker'],
    description: 'Scale mission-critical payment gateways handling billions of monthly transactions.',
    originalUrl: 'https://razorpay.com',
    postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Software Development Engineer - I (Full Stack)',
    slug: 'sde-1-full-stack-amazon-hyderabad',
    company: 'Amazon',
    location: 'Hyderabad, Telangana',
    salary: '₹16–24 LPA',
    experience: '0-2 years',
    workMode: 'On-site',
    jobType: 'Full-time',
    category: 'Software Engineer',
    source: 'Company Careers',
    skills: ['Java', 'Python', 'AWS', 'React', 'SQL'],
    description: 'Solve real-world cloud logistics problems across distributed high-scale architectures.',
    originalUrl: 'https://amazon.jobs',
    postedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    title: 'QA Automation Engineer',
    slug: 'qa-automation-engineer-wipro-pune',
    company: 'Wipro Technologies',
    location: 'Pune, Maharashtra',
    salary: '₹5–8 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'QA / Testing',
    source: 'Company Careers',
    skills: ['Selenium', 'Java', 'Python', 'API Testing', 'Cypress'],
    description: 'Drive quality assurance and regression test automation for global fintech clients.',
    originalUrl: 'https://careers.wipro.com',
    postedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Data Analyst',
    slug: 'data-analyst-flipkart-bengaluru',
    company: 'Flipkart',
    location: 'Bengaluru, Karnataka',
    salary: '₹7–11 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Data Analyst',
    source: 'Company Careers',
    skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel'],
    description: 'Extract intelligence, uncover consumer trends, and build automated reporting dashboards.',
    originalUrl: 'https://careers.flipkart.com',
    postedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    title: 'Machine Learning Engineering Intern',
    slug: 'machine-learning-engineering-intern-phonepe-bengaluru',
    company: 'PhonePe',
    location: 'Bengaluru, Karnataka',
    salary: '₹45,000 / mo Stipend',
    experience: 'Fresher / Graduate',
    workMode: 'Hybrid',
    jobType: 'Internship',
    category: 'Machine Learning',
    source: 'Company Careers',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'SQL', 'Pandas'],
    description: '6-month internship on transaction fraud models and real-time risk scoring.',
    originalUrl: 'https://careers.phonepe.com',
    postedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
  },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'All');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');
  const [experience, setExperience] = useState('All');
  const [sort, setSort] = useState('recent');

  const [jobs, setJobs] = useState<JobListing[]>(FALLBACK_SEED_JOBS);
  const [loading, setLoading] = useState(false);
  const [savedJobSlugs, setSavedJobSlugs] = useState<string[]>([]);

  // Contextual Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<ContextualAuthType>('save_job');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Fetch jobs from backend REST API with fallback
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (location) query.append('location', location);
        if (category !== 'All') query.append('category', category);
        if (workMode !== 'All') query.append('workMode', workMode);
        if (jobType !== 'All') query.append('jobType', jobType);
        if (experience !== 'All') query.append('experience', experience);
        if (sort) query.append('sort', sort);

        const res = await fetch(`http://localhost:5000/api/v1/jobs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.jobs && data.jobs.length > 0) {
            setJobs(data.jobs);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API fetch error, filtering local seed list:', err);
      }

      // Local fallback filter if backend is not yet populated
      let filtered = [...FALLBACK_SEED_JOBS];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(s) ||
            j.company.toLowerCase().includes(s) ||
            j.skills.some((sk) => sk.toLowerCase().includes(s)),
        );
      }
      if (location) {
        filtered = filtered.filter((j) =>
          j.location.toLowerCase().includes(location.toLowerCase()),
        );
      }
      if (category !== 'All') {
        filtered = filtered.filter((j) => j.category === category);
      }
      if (workMode !== 'All') {
        filtered = filtered.filter((j) => j.workMode === workMode);
      }
      if (jobType !== 'All') {
        filtered = filtered.filter((j) => j.jobType === jobType);
      }
      setJobs(filtered);
      setLoading(false);
    }

    loadJobs();
  }, [search, location, category, workMode, jobType, experience, sort]);

  const handleSaveClick = (job: JobListing) => {
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('save_job');
      setAuthModalOpen(true);
      return;
    }
    setSavedJobSlugs((prev) =>
      prev.includes(job.slug) ? prev.filter((s) => s !== job.slug) : [...prev, job.slug],
    );
  };

  const handleResumeMatchClick = (job: JobListing) => {
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('resume_match');
      setAuthModalOpen(true);
      return;
    }
    alert(`Starting ATS resume match for: ${job.title} at ${job.company}`);
  };

  const handleApplyClick = (job: JobListing) => {
    if (!user) {
      setSelectedJob(job);
      setAuthModalType('apply_track');
      setAuthModalOpen(true);
      return;
    }
    window.open(job.originalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Breadcrumb & Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Open Job Opportunities
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Free public discovery • Direct company links • Transparent requirements
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
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
                  setExperience('All');
                }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Reset
              </button>
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

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="QA / Testing">QA / Testing</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
          </div>
        </div>

        {/* JOB LISTINGS */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
            <span>Showing {jobs.length} open position{jobs.length !== 1 ? 's' : ''}</span>
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
            <div className="p-12 text-center text-slate-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No jobs match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try broadening your search terms or clearing some filters.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isSaved = savedJobSlugs.includes(job.slug);
              return (
                <div
                  key={job.slug}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {job.workMode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {job.jobType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Source: {job.source}
                        </span>
                      </div>

                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        {job.company}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSaveClick(job)}
                      className={`p-2 rounded-xl border transition flex items-center justify-center ${
                        isSaved
                          ? 'bg-brand-50 border-brand-300 text-brand-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title={user ? (isSaved ? 'Job saved' : 'Save job') : 'Login to save job'}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-brand-600' : ''}`} />
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResumeMatchClick(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Check Resume Match</span>
                      </button>

                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5"
                      >
                        Details & Requirements
                      </Link>
                    </div>

                    <button
                      onClick={() => handleApplyClick(job)}
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
        </div>
      </div>

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
