import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Applyra — Search. Match. Apply. Track.',
  description:
    'Your entire job search. One place. Discover verified jobs, check explainable ATS resume match, apply on employer portals, and track every application from one unified dashboard.',
  keywords: [
    'Job search',
    'Application tracker',
    'Resume ATS match',
    'Tech jobs',
    'Software engineer jobs',
    'Remote jobs',
  ],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('applyra-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle(
                  'dark',
                  savedTheme ? savedTheme === 'dark' : prefersDark,
                );
              } catch (error) {
                console.error('Unable to load the saved color theme:', error);
                document.documentElement.classList.toggle(
                  'dark',
                  window.matchMedia('(prefers-color-scheme: dark)').matches,
                );
              }
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
