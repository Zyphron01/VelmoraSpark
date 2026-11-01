/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { I18nProvider } from '@/lib/i18n';
import { SonnerToaster } from '@/components/ui/SonnerToaster';

export const metadata: Metadata = {
  title: 'Velmora Spark — Dream it. Plan it. Celebrate it.',
  description:
    'AI-powered celebration & event-operations platform. P50/P90 catering intelligence, crisis stress-testing, vendor backup radar, and auto-cascading run sheets — built for Indian weddings, college fests, and milestone galas.',
  keywords: ['event planning', 'wedding planner India', 'AI event platform', 'catering calculator', 'vendor management'],
  openGraph: {
    title: 'Velmora Spark',
    description: 'Dream it. Plan it. Celebrate it.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased bg-mandala selection:bg-[var(--primary)] selection:text-white">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <SonnerToaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
