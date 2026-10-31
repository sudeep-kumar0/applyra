import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="applyraGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="applyraGrad2" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Background soft shield */}
      <rect width="40" height="40" rx="10" fill="url(#applyraGrad1)" />
      {/* Dynamic Geometric 'A' with career compass node */}
      <path
        d="M20 8L31 29H24.5L20 19.5L15.5 29H9L20 8Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Compass / Application target node */}
      <circle cx="20" cy="22" r="3.2" fill="#0D9488" />
      <circle cx="20" cy="22" r="1.6" fill="white" />
    </svg>
  );
}

export default function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-xl' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  if (variant === 'icon') {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`}>
        <LogoIcon className={currentSize.icon} />
      </Link>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${className}`}>
      <LogoIcon className={currentSize.icon} />
      <span className={`font-extrabold ${currentSize.text} text-slate-900 dark:text-white tracking-tight`}>
        Apply<span className="text-brand-600 dark:text-brand-400">ra</span>
      </span>
    </Link>
  );
}
