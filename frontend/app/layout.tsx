import type { Metadata } from 'next';
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
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('applyra-theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
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
