import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fair Game — AI Networking Strategy',
  description: 'AI-powered networking co-pilot for students and early-career professionals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}
