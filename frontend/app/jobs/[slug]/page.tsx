'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ContextualAuthModal, { ContextualAuthType } from '@/components/ContextualAuthModal';
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
} from 'lucide-react';

interface JobDetail {
  title: string;
  slug: string;
  company: string;
  description: string;
  responsibilities: string[];
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
    category: 'Java Developer',
    source: 'Company Careers',
    originalUrl: 'https://careers.tcs.com/jobs/java-fullstack-dev-blr',
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
    category: 'Frontend Developer',
    source: 'Company Careers',
    originalUrl: 'https://careers.swiggy.com/jobs/frontend-engineer-react',
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
    category: 'Backend Developer',
    source: 'Company Careers',
    originalUrl: 'https://razorpay.com/jobs/backend-engineer-node',
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Contextual auth state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<ContextualAuthType>('save_job');

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/jobs/${slug}`);
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
          company: 'Partner Enterprise',
          location: 'Bengaluru / Remote',
          salary: 'Competitive Salary',
          experience: '1-3 years',
          workMode: 'Hybrid',
          jobType: 'Full-time',
          category: 'Software Engineering',
          source: 'Company Careers',
          originalUrl: 'https://careers.google.com',
          postedAt: 'Recently',
          description:
            'Exciting opportunity to build resilient software systems and modern web applications.',
          responsibilities: [
            'Develop core software features and scalable APIs',
            'Collaborate with product and design teams',
            'Maintain high code quality through automated testing',
          ],
          skills: ['TypeScript', 'Node.js', 'React', 'Git', 'SQL'],
          preferredSkills: ['Cloud Infrastructure', 'Docker'],
          qualifications: ["Bachelor's degree or equivalent technical experience"],
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
    alert(`Checking resume match for ${job?.title}`);
  };

  const handleApply = () => {
    if (!user) {
      setAuthModalType('apply_track');
      setAuthModalOpen(true);
      return;
    }
    if (job?.originalUrl) {
      window.open(job.originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center text-slate-500">
        Loading job listing...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-16 text-center">
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <Link href="/jobs" className="mt-4 inline-block text-brand-600">
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs Search</span>
        </Link>

        {/* Hero Card */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {job.workMode}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {job.jobType}
                </span>
                <span className="text-xs text-slate-400">
                  Source: <strong className="text-slate-600 dark:text-slate-300">{job.source}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {job.title}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-slate-600 dark:text-slate-300 text-base font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
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
              </div>
            </div>

            {/* Action Buttons Column */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
              <button
                onClick={handleApply}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-4 h-4" />
              </button>

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
                    ? 'bg-brand-50 border-brand-300 text-brand-600 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600' : ''}`} />
                <span>{isSaved ? 'Saved to Profile' : 'Save Job'}</span>
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
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
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
                {job.skills.map((skill) => (
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
                Applyra directs you directly to the verified employer portal. No automated form scripts or credential requests.
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
    </div>
  );
}
