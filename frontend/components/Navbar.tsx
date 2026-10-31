'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';



import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { fetchApi } from '@/lib/api';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Bookmark,
  FileText,
  Bell,
  BarChart3,
  Shield,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Check,
  Moon,
  Sun,
} from 'lucide-react';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function Navbar() {
  const { user, mongoUser, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const nextIsDarkMode = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDarkMode);
    setIsDarkMode(nextIsDarkMode);

    try {
      window.localStorage.setItem('applyra-theme', nextIsDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Unable to save the selected color theme:', error);
    }
  };

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const publicNavLinks = [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/#about' },
  ];

  const authNavLinks = [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Applications', href: '/applications' },
    { label: 'Saved Jobs', href: '/saved-jobs' },
    { label: 'Resume & ATS', href: '/resume' },
    { label: 'Job Alerts', href: '/alerts' },
    { label: 'Analytics', href: '/analytics' },
  ];

  const activeLinks = user ? authNavLinks : publicNavLinks;

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        fetchApi('/notifications?limit=15').catch(() => null),
        fetchApi('/notifications/unread-count').catch(() => null),
      ]);

      if (listRes && Array.isArray(listRes.notifications)) {
        setNotifications(listRes.notifications);
      }
      if (countRes && typeof countRes.unreadCount === 'number') {
        setUnreadCount(countRes.unreadCount);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchApi('/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {activeLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {!user ? (
              <>
                <Link
                  href="/admin/login"
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  title="Admin Access Only"
                >
                  Admin Portal
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const opening = !notificationsOpen;
                      setNotificationsOpen(opening);
                      setUserDropdownOpen(false);
                      if (opening && unreadCount > 0) handleMarkAllRead();
                    }}
                    className="relative p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white leading-none shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div
                      onMouseLeave={() => setNotificationsOpen(false)}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Notifications
                          </span>
                          
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet. Activity updates will appear here.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start justify-between gap-3 ${
                                !n.read ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                              }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                                  )}
                                  <h4 className="font-bold text-slate-900 dark:text-white">
                                    {n.title}
                                  </h4>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>


                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link
                          href="/applications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          View Application Tracker →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.email ? user.email[0] : 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link
                        href="/applications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <FileText className="w-4 h-4 mr-2.5 text-slate-400" />
                        Applications
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" />
                        Profile & Skills
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <Shield className="w-4 h-4 mr-2.5" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger & theme toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {user && unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
          {activeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.label}
            </Link>
          ))}

          {!user ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center font-semibold text-white bg-brand-600 rounded-xl"
              >
                Get Started
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Admin Console Login
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-400">
                Signed in as <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                href="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Application Tracker
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Profile & Skills
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-amber-600 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-rose-600 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
