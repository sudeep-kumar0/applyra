'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  User,
  Briefcase,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Camera,
  Trash2,
  FileText,
  UploadCloud,
  Check,
  Globe,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

const LOCATION_OPTIONS = [
  'All India',
  'Remote',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Delhi / NCR',
  'Kolkata',
  'Noida / Gurugram',
];

const EXPERIENCE_OPTIONS = [
  { value: 'Fresher', label: 'Fresher / Student (0–1 years)' },
  { value: '1-3 years', label: '1–3 years (Junior / Mid)' },
  { value: '3-5 years', label: '3–5 years (Mid-Senior)' },
  { value: '5+ years', label: '5+ years (Senior / Lead)' },
];

const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Tailwind CSS',
  'Next.js',
  'Git',
  'REST API',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, refreshProfile, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [preferredWorkMode, setPreferredWorkMode] = useState('Any');
  const [experienceLevel, setExperienceLevel] = useState('1-3 years');
  const [preferredLocations, setPreferredLocations] = useState<string[]>(['All India']);

  // Resume state
  const [activeResume, setActiveResume] = useState<{
    hasResume: boolean;
    fileName: string;
    uploadedAt: string | null;
  } | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isLoading, router]);

  // Load existing profile values
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setHeadline(profile.headline || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setProfilePhoto(profile.profilePhoto || '');
      setSkills(profile.skills || []);
      setPreferredWorkMode(profile.preferredWorkMode || 'Any');
      setExperienceLevel(profile.experienceLevel || '1-3 years');
      setPreferredLocations(
        profile.preferredLocations && profile.preferredLocations.length > 0
          ? profile.preferredLocations
          : ['All India']
      );
      if (profile.resumeFileName) {
        setActiveResume({
          hasResume: true,
          fileName: profile.resumeFileName,
          uploadedAt: profile.resumeUploadedAt || null,
        });
      }
    }
  }, [profile]);

  // Check active resume from backend
  useEffect(() => {
    if (user) {
      fetchApi('/resume/active')
        .then((res) => {
          if (res && res.success && res.hasResume) {
            setActiveResume({
              hasResume: true,
              fileName: res.fileName || 'Uploaded Resume',
              uploadedAt: res.uploadedAt || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Photo handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, or WebP).' });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Photo must be under 3MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result);
        setStatusMessage({ type: 'success', text: 'Photo selected! Click "Save Profile" to apply changes.' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    setStatusMessage({ type: 'success', text: 'Photo removed. Click "Save Profile" to apply changes.' });
  };

  // Resume Upload Handler
  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdfOrDoc =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx');

    if (!isPdfOrDoc) {
      setResumeStatus({ type: 'error', text: 'Only PDF and DOCX files are supported.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeStatus({ type: 'error', text: 'Resume file must be under 10MB.' });
      return;
    }

    setUploadingResume(true);
    setResumeStatus(null);

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
        throw new Error(err.message || 'Resume upload failed');
      }

      const data = await res.json();
      setResumeStatus({ type: 'success', text: `"${data.fileName}" uploaded & active for matching!` });
      setActiveResume({
        hasResume: true,
        fileName: data.fileName,
        uploadedAt: new Date().toISOString(),
      });

      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        setSkills((prev) => Array.from(new Set([...prev, ...data.skills])));
      }

      await refreshProfile();
    } catch (err: any) {
      setResumeStatus({ type: 'error', text: err.message || 'Failed to upload resume. Please try again.' });
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  // Skill handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || skillInput).trim();
    if (target && !skills.some((s) => s.toLowerCase() === target.toLowerCase())) {
      setSkills([...skills, target]);
      if (!skillToAdd) setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Location Toggle Handler
  const toggleLocation = (loc: string) => {
    if (loc === 'All India') {
      if (preferredLocations.includes('All India')) {
        setPreferredLocations([]);
      } else {
        setPreferredLocations(['All India']);
      }
      return;
    }

    // If selecting specific city, remove 'All India'
    let updated = preferredLocations.filter((l) => l !== 'All India');
    if (updated.includes(loc)) {
      updated = updated.filter((l) => l !== loc);
    } else {
      updated.push(loc);
    }

    if (updated.length === 0) {
      updated = ['All India'];
    }
    setPreferredLocations(updated);
  };

  // Save full profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          headline,
          location,
          phone,
          bio,
          profilePhoto,
          skills,
          preferredWorkMode,
          experienceLevel,
          preferredLocations,
        }),
      });

      await refreshProfile();
      setStatusMessage({ type: 'success', text: 'Profile & preferences updated successfully! Your matches are now synced.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  const userInitial = fullName ? fullName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Profile & Career Preferences
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your photo, resume, skills, and target locations power your <strong>Matched for You</strong> job feed.
            </p>
          </div>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800 transition"
          >
            <span>View Matched Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* CARD 1: PHOTO & BASIC DETAILS */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Profile Photo & Personal Info
            </h2>

            {/* Photo Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden shadow-md border-2 border-white dark:border-slate-750">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  title="Upload profile photo"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition border-2 border-white dark:border-slate-900"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
                  >
                    Upload Photo
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Visible in your Navbar, application submissions, and company views. Supports PNG, JPG (under 3MB).
                </p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Java Full Stack Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Current City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Professional Bio / Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your technical background, domain experience, and key strengths..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* CARD 2: RESUME VAULT */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Resume Vault (Auto-Skill Extraction)
              </h2>
              <Link
                href="/resume"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>Full Resume ATS Vault</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Upload your official resume. We extract your skills automatically to match verified openings across India.
            </p>

            {resumeStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  resumeStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {resumeStatus.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                )}
                <span>{resumeStatus.text}</span>
              </div>
            )}

            {/* Active Resume Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeResume?.fileName || 'No resume uploaded yet'}
                    </span>
                    {activeResume?.hasResume && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active for Matching
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeResume?.uploadedAt
                      ? `Last updated: ${new Date(activeResume.uploadedAt).toLocaleDateString()}`
                      : 'Upload a PDF/DOCX to activate instant matching.'}
                  </p>
                </div>
              </div>

              <div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleResumeFileSelect}
                />
                <button
                  type="button"
                  disabled={uploadingResume}
                  onClick={() => resumeInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {uploadingResume ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Parsing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{activeResume?.hasResume ? 'Replace Resume' : 'Upload Resume'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: TARGET LOCATIONS (MULTI-SELECT) */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Target Locations (Preferred Cities)
            </h2>
            <p className="text-xs text-slate-500">
              Select one or more cities you want to work in. If you select <strong>All India</strong>, opportunities from everywhere in India will be matched.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {LOCATION_OPTIONS.map((loc) => {
                const isSelected = preferredLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-rose-600" />}
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Currently selected:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {preferredLocations.join(', ') || 'All India'}
              </span>
            </p>
          </div>

          {/* CARD 4: EXPERIENCE LEVEL & WORK MODE */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Experience Level
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Used to filter matching openings so you see roles designed for your level of seniority.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      experienceLevel === opt.value
                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={opt.value}
                      checked={experienceLevel === opt.value}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Work Mode Preference
              </label>
              <div className="flex flex-wrap gap-2.5">
                {['Any', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPreferredWorkMode(mode)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      preferredWorkMode === mode
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 5: TECHNICAL SKILLS (MERGED WITH RESUME) */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Technical Skills (ATS & Job Matching)
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              These skills (combined with your uploaded resume) are used to rank matches. You can add newly learned skills here anytime.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type skill (e.g. Docker, Kafka, Next.js) and press Enter..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs dark:bg-white dark:text-slate-900 transition"
              >
                Add Skill
              </button>
            </div>

            {/* Quick Add Suggestion Pills */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Quick add popular in-demand skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter((s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase()))
                  .slice(0, 8)
                  .map((pskill) => (
                    <button
                      key={pskill}
                      type="button"
                      onClick={() => handleAddSkill(pskill)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-teal-950 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      + {pskill}
                    </button>
                  ))}
              </div>
            </div>

            {/* Active Skills List */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Your Active Skills ({skills.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-brand-400 hover:text-brand-700 ml-1 text-xs"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">
                    No skills added yet. Add at least 2–3 skills for personalized matches!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON BAR */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/alerts"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Skip to Matched for You →
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile & Preferences...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
