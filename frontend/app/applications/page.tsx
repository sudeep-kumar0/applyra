'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Filter,
  ArrowRight,
  ExternalLink,
  Building2,
  Globe,
  Loader2,
  Edit2,
  Check,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'HR_ROUND'
  | 'OFFER'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

const STATUS_OPTIONS: { label: string; value: ApplicationStatus; color: string }[] = [
  { label: 'Saved', value: 'SAVED', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { label: 'Applied', value: 'APPLIED', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { label: 'Assessment', value: 'ASSESSMENT', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { label: 'Interview', value: 'INTERVIEW', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { label: 'HR Round', value: 'HR_ROUND', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  { label: 'Offer', value: 'OFFER', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { label: 'Selected', value: 'SELECTED', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
  { label: 'Rejected', value: 'REJECTED', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  { label: 'Withdrawn', value: 'WITHDRAWN', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
];

const STAGES = [
  'All',
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'HR_ROUND',
  'OFFER',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

interface ApplicationItem {
  _id: string;
  company: string;
  role: string;
  source: string;
  originalUrl: string;
  status: ApplicationStatus;
  appliedAt?: string | null;
  clickedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [activeStage, setActiveStage] = useState('All');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Load applications and stats from backend
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const appUrl = activeStage === 'All' ? '/applications' : `/applications?status=${activeStage}`;
      const [appRes, statsRes] = await Promise.all([
        fetchApi(appUrl),
        fetchApi('/applications/stats'),
      ]);

      if (appRes && appRes.applications) {
        setApplications(appRes.applications);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.warn('Could not load applications from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeStage]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/applications');
    } else if (user) {
      loadData();
    }
  }, [user, isLoading, router, loadData]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      const res = await fetchApi(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res && res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app)),
        );
        // Refresh stats
        const statsRes = await fetchApi('/applications/stats');
        if (statsRes && statsRes.stats) setStats(statsRes.stats);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNote = async (appId: string) => {
    try {
      const app = applications.find((a) => a._id === appId);
      if (!app) return;
      await fetchApi(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: app.status, notes: noteText }),
      });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, notes: noteText } : a)),
      );
      setEditingNoteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mr-2" />
        <span>Loading your application pipeline...</span>
      </div>
    );
  }

  const filteredApplications = applications.filter((app) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      app.company.toLowerCase().includes(term) ||
      app.role.toLowerCase().includes(term) ||
      app.source?.toLowerCase().includes(term)
    );
  });

  const getStageCount = (stage: string) => {
    if (!stats) return 0;
    if (stage === 'All') return stats.total || 0;
    if (stage === 'SAVED') return stats.saved || 0;
    if (stage === 'APPLIED') return stats.applied || 0;
    if (stage === 'ASSESSMENT') return stats.assessment || 0;
    if (stage === 'INTERVIEW' || stage === 'HR_ROUND') return stats.interview || 0;
    if (stage === 'OFFER' || stage === 'SELECTED') return stats.offers || 0;
    if (stage === 'REJECTED' || stage === 'WITHDRAWN') return stats.rejected || 0;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Application Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track and advance your job applications across every recruitment round in real-time.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition self-start"
          >
            <span>Explore Jobs to Apply</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Stats Summary Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold block">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.total || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold block">Saved</span>
              <span className="text-xl font-black text-slate-600 dark:text-slate-300 font-mono">{stats.saved || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900 bg-blue-50/30 shadow-sm">
              <span className="text-[11px] text-blue-600 font-semibold block">Applied</span>
              <span className="text-xl font-black text-blue-700 dark:text-blue-400 font-mono">{stats.applied || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900 bg-purple-50/30 shadow-sm">
              <span className="text-[11px] text-purple-600 font-semibold block">Assessments</span>
              <span className="text-xl font-black text-purple-700 dark:text-purple-400 font-mono">{stats.assessment || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 bg-amber-50/30 shadow-sm">
              <span className="text-[11px] text-amber-600 font-semibold block">Interviews</span>
              <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">{stats.interview || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 shadow-sm">
              <span className="text-[11px] text-emerald-600 font-semibold block">Offers</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{stats.offers || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-semibold block">Archived</span>
              <span className="text-xl font-black text-slate-500 font-mono">{stats.rejected || 0}</span>
            </div>
          </div>
        )}

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Status Pipeline Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {STAGES.map((stage) => {
              const count = getStageCount(stage);
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeStage === stage
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{stage === 'All' ? 'All Roles' : stage.replace('_', ' ')}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeStage === stage
                          ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search in Applications */}
          <div className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search in applications..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <span>Loading pipeline records...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No applications in stage: {activeStage === 'All' ? 'All' : activeStage.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              When you browse jobs on Applyra and click "Apply Now", your application is recorded here so you can update progress across each hiring stage.
            </p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition dark:bg-white dark:text-slate-900"
              >
                <span>Explore Open Roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const currentStatusOpt = STATUS_OPTIONS.find((s) => s.value === app.status);
              const isEditingNote = editingNoteId === app._id;

              return (
                <div
                  key={app._id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Role & Company Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Source Tag */}
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Source: {app.source || 'Company Portal'}
                        </span>

                        {app.appliedAt ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Saved / Clicked: {new Date(app.clickedAt || app.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {app.role}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.company}</span>
                      </div>
                    </div>

                    {/* Stage Status Dropdown & Original Link */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Selector */}
                      <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Hiring Stage
                        </label>
                        <select
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value as ApplicationStatus)}
                          className={`text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer transition ${
                            currentStatusOpt?.color || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Direct External Link */}
                      {app.originalUrl && (
                        <div className="pt-3.5">
                          <a
                            href={app.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
                          >
                            <span>Job Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 text-xs">
                    {isEditingNote ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="e.g. Round 1 interview scheduled on Thursday..."
                          className="flex-1 px-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveNote(app._id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Notes:</span>
                        <span>{app.notes || 'No notes added yet.'}</span>
                        <button
                          onClick={() => {
                            setEditingNoteId(app._id);
                            setNoteText(app.notes || '');
                          }}
                          className="text-slate-400 hover:text-brand-600 transition p-1"
                          title="Edit note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
