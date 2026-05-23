import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Food Palace — Nigerian Restaurant Ordering',
  description: 'Food Palace is a complete Nigerian restaurant ordering platform built with Next.js, TypeScript, Prisma, and Tailwind CSS.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Food Palace',
    description: 'Order authentic Nigerian cuisine with a modern restaurant experience.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-dark dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
