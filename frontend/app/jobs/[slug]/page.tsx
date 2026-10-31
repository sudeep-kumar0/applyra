'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import ContextualAuthModal, { ContextualAuthType } from '@/components/ContextualAuthModal';
import DidYouApplyModal from '@/components/DidYouApplyModal';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Share2,
} from 'lucide-react';

interface JobDetail {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  company: string;
  companyLogo?: string;
  description: string;
  responsibilities?: string[];
  skills: string[];
  preferredSkills?: string[];
  qualifications?: string[];
  location: string;
  salary: string;
  experience: string;
  workMode: string;
  jobType: string;
  category: string;
  source: string;
  originalUrl: string;
  postedAt: string;
}

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

const FALLBACK_JOBS_MAP: Record<string, JobDetail> = {
  'java-full-stack-developer-tcs-bengaluru': {
    title: 'Java Full Stack Developer',
    slug: 'java-full-stack-developer-tcs-bengaluru',
    company: 'Tata Consultancy Services',
    location: 'Bengaluru, Karnataka',
    salary: '₹6–10 LPA',
    experience: '1-3 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Software',
    source: 'Company Career Website',
    originalUrl: 'https://careers.tcs.com',
    postedAt: '2 hours ago',
    description:
      'We are seeking a talented Java Full Stack Developer to build enterprise banking solutions. You will work with modern Spring Boot microservices, Angular/React interfaces, and cloud-native architectures.',
    responsibilities: [
      'Design and develop high-scale microservices using Java 17 and Spring Boot',
      'Build responsive frontend components using React and TypeScript',
      'Collaborate with product and cross-functional engineering squads',
      'Write unit, integration, and contract tests with JUnit and Mockito',
      'Participate in agile sprints, code reviews, and CI/CD automation',
    ],
    skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'REST API'],
    preferredSkills: ['Kafka', 'Kubernetes', 'AWS', 'Redis'],
    qualifications: [
      "Bachelor's degree in Computer Science, Information Technology, or equivalent",
      'Hands-on experience with Java and modern JavaScript frameworks',
    ],
  },
  'frontend-react-developer-swiggy-bengaluru': {
    title: 'Frontend React Developer',
    slug: 'frontend-react-developer-swiggy-bengaluru',
    company: 'Swiggy',
    location: 'Bengaluru (Remote Available)',
    salary: '₹12–18 LPA',
    experience: '2-4 years',
    workMode: 'Remote',
    jobType: 'Full-time',
    category: 'Software',
    source: 'LinkedIn',
    originalUrl: 'https://careers.swiggy.com',
    postedAt: '5 hours ago',
    description:
      'Join Swiggy Consumer Engineering team to create ultra-fast, delightful web experiences for millions of daily active users ordering food and groceries.',
    responsibilities: [
      'Develop state-of-the-art web applications with Next.js, React, and Tailwind CSS',
      'Optimize client-side performance, Core Web Vitals, and bundle sizes',
      'Integrate complex REST and GraphQL endpoints with seamless caching',
      'Partner closely with UI/UX designers to translate Figma into pixel-perfect code',
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'JavaScript'],
    preferredSkills: ['GraphQL', 'Web Performance', 'Cypress', 'PWA'],
    qualifications: [
      'Strong mastery of modern JavaScript/TypeScript and React ecosystem',
      'Proven track record of building performant web applications',
    ],
  },
  'backend-nodejs-engineer-razorpay-bengaluru': {
    title: 'Backend Node.js Engineer',
    slug: 'backend-nodejs-engineer-razorpay-bengaluru',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    salary: '₹14–22 LPA',
    experience: '2-5 years',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    category: 'Software',
    source: 'Naukri',
    originalUrl: 'https://razorpay.com',
    postedAt: '12 hours ago',
    description:
      'Scale Razorpay payment gateway infrastructure. Design low-latency financial systems handling billions of transactions per month with 99.999% uptime.',
    responsibilities: [
      'Architect, build, and maintain mission-critical payment APIs using Node.js and NestJS',
      'Design resilient database schemas in PostgreSQL and MongoDB Atlas',
      'Implement high-throughput event processing pipelines with Apache Kafka',
      'Ensure strict security compliance and PCI-DSS requirements',
    ],
    skills: ['Node.js', 'NestJS', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker'],
    preferredSkills: ['Kafka', 'AWS', 'Microservices', 'Distributed Systems'],
    qualifications: [
      'Solid understanding of asynchronous programming, concurrency, and distributed systems',
      'Experience in API security, rate limiting, and authentication protocols',
    ],
  },
};

function JobDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Contextual auth state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<ContextualAuthType>('save_job');

  // Did you apply modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/jobs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.job) {
            setJob(data.job);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback item:', err);
      }

      if (FALLBACK_JOBS_MAP[slug]) {
        setJob(FALLBACK_JOBS_MAP[slug]);
      } else {
        // Generic fallback for any other slug
        setJob({
          title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          slug,
          company: 'Verified Partner Employer',
          location: 'Bengaluru / Remote',
          salary: '₹8–16 LPA',
          experience: '1-3 years',
          workMode: 'Hybrid',
          jobType: 'Full-time',
          category: 'Software',
          source: 'Company Career Website',
          originalUrl: 'https://careers.google.com',
          postedAt: 'Recently',
          description:
            'Exciting opportunity to build resilient software systems and modern web applications with cutting-edge technologies.',
          responsibilities: [
            'Develop core software features and scalable cloud services',
            'Collaborate with product and design teams in high-paced agile sprints',
            'Maintain high code quality through automated testing and continuous integration',
          ],
          skills: ['TypeScript', 'Node.js', 'React', 'Git', 'SQL', 'Docker'],
          preferredSkills: ['Cloud Infrastructure', 'Microservices'],
          qualifications: ["Bachelor's degree or equivalent technical experience in computer science or related field"],
        });
      }
      setLoading(false);
    }

    if (slug) loadJob();
  }, [slug]);

  const handleSave = () => {
    if (!user) {
      setAuthModalType('save_job');
      setAuthModalOpen(true);
      return;
    }
    setIsSaved(!isSaved);
  };

  const handleResumeMatch = () => {
    if (!user) {
      setAuthModalType('resume_match');
      setAuthModalOpen(true);
      return;
    }
    router.push(`/resume?job=${encodeURIComponent(job?.slug || '')}`);
  };

  const handleApply = async () => {
    if (!job?.originalUrl || !job.originalUrl.startsWith('http')) {
      alert('Unable to proceed: Original application URL is invalid or missing.');
      return;
    }

    if (!user) {
      setAuthModalType('apply_track');
      setAuthModalOpen(true);
      return;
    }

    // Authenticated apply flow:
    // 1. Record apply attempt in MongoDB via click tracking
    try {
      await fetchApi('/applications/click', {
        method: 'POST',
        body: JSON.stringify({ jobId: job._id || job.slug }),
      });
    } catch (err) {
      console.warn('Could not record apply click to MongoDB:', err);
    }

    // 2. Open official external application link in a new tab
    window.open(job.originalUrl, '_blank', 'noopener,noreferrer');

    // 3. Prompt user with "Did you apply for this job?" modal
    setApplyModalOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Back button preserves search query params
  const handleBackToSearch = () => {
    const q = searchParams.toString();
    if (q) {
      router.push(`/jobs?${q}`);
    } else {
      router.back();
    }
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

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center text-slate-500">
        Loading job listing details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested listing may have expired or been removed.</p>
        <button
          onClick={handleBackToSearch}
          className="mt-4 inline-block text-brand-600 hover:underline text-sm font-semibold"
        >
          ← Back to all jobs
        </button>
      </div>
    );
  }

  const isUrlValid = Boolean(job.originalUrl && job.originalUrl.startsWith('http'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation preserving search parameters */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToSearch}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs Search</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              <CompanyLogoAvatar company={job.company} logo={job.companyLogo || (job as any).logo} size="lg" />
              <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {/* Prominent Source Badge */}
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${sourceBadgeColor(
                    job.source,
                  )} flex items-center gap-1.5`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Source: {job.source || 'Company Career Website'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {job.workMode}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {job.jobType}
                </span>
                {job.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {job.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-base font-semibold">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.experience}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {job.salary}
                </span>
                {job.postedAt && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {formatDatePosted(job.postedAt)}
                  </span>
                )}
              </div>
            </div>
            </div>

            {/* Action Buttons Column */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[220px]">
              {isUrlValid ? (
                <button
                  onClick={handleApply}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
                >
                  <span>Apply on {job.source || 'Official Site'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Original link unavailable</span>
                </div>
              )}

              <button
                onClick={handleResumeMatch}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold text-xs hover:bg-teal-100 transition"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Check Resume Match</span>
              </button>

              <button
                onClick={handleSave}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition ${
                  isSaved
                    ? 'bg-brand-50/80 border-brand-200 text-brand-600 font-semibold dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 dark:fill-brand-400' : ''}`} />
                <span>{isSaved ? 'Saved to Pipeline' : 'Save Job'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                About the Role
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-brand-600 font-bold mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications && job.qualifications.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Qualifications & Requirements
                  </h3>
                  <ul className="space-y-2">
                    {job.qualifications.map((q, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="space-y-6">
            {/* Skills Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-100 dark:border-brand-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Preferred Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map((ps) => (
                      <span
                        key={ps}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {ps}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Source & Security Note */}
            <div className="p-6 bg-slate-100/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Legitimate Source Guarantee</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Applyra provides direct links to verified job portals ({job.source || 'Company Portal'}). We never request confidential passwords or perform unauthorized automated form submissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Auth Modal */}
      <ContextualAuthModal
        isOpen={authModalOpen}
        type={authModalType}
        jobTitle={job.title}
        originalUrl={job.originalUrl}
        onClose={() => setAuthModalOpen(false)}
        onContinueWithoutTracking={() => {
          if (job?.originalUrl) {
            window.open(job.originalUrl, '_blank', 'noopener,noreferrer');
          }
        }}
      />

      {/* Did You Apply? Confirmation Modal */}
      <DidYouApplyModal
        isOpen={applyModalOpen}
        job={job}
        onClose={() => setApplyModalOpen(false)}
        onConfirmed={() => {
          // Application successfully saved and confirmed as APPLIED in MongoDB
        }}
      />
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 text-center text-slate-500">Loading job details...</div>}>
      <JobDetailContent />
    </Suspense>
  );
}
