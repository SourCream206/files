'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
  university?: string;
  major?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const raw = window.localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, [router]);

  const cards = [
    {
      title: 'Career Fair Strategy',
      description: 'Paste the company list for any event and let Fair Game rank, route, and brief you for every booth.',
      href: '/career-fair',
      badge: 'CAREER FAIRS',
    },
    {
      title: 'General Networking',
      description:
        'Paste a LinkedIn profile and get opportunity scoring, conversation prompts, and a follow-up plan in seconds.',
      href: '/networking',
      badge: 'LINKEDIN / 1:1',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white font-mono">
      {/* Top bar */}
      <nav className="border-b border-white/5 bg-[#050507]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00ff88] text-black flex items-center justify-center text-sm font-black">
              FG
            </div>
            <div>
              <div className="text-xs tracking-[0.25em] text-white/40 uppercase">Fair Game</div>
              <div className="text-[10px] text-white/30">AI networking co-pilot</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/profile" className="hover:text-white transition-colors">
              Profile
            </Link>
            {user && (
              <span className="hidden sm:inline text-white/60">
                {user.name} {user.major ? `· ${user.major}` : ''}
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-10">
          <div className="text-xs text-[#00ff88] tracking-[0.25em] uppercase mb-3">
            YOUR NETWORKING CONTROL ROOM
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Choose your next move,
            <br />
            <span className="text-white/40">then let the AI handle the planning.</span>
          </h1>
          <p className="text-xs text-white/40 max-w-xl">
            Use Fair Game as your co-pilot for both chaotic career fairs and targeted one‑on‑one outreach.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group border border-white/10 bg-[#050507] rounded-xl p-6 hover:border-[#00ff88]/60 hover:bg-[#050507]/80 transition-colors flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] text-white/40 uppercase mb-3">
                  <span className="px-2 py-0.5 border border-white/15 rounded-full">{card.badge}</span>
                  <span>FAIR GAME MODE</span>
                </div>
                <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                <p className="text-xs text-white/50 leading-relaxed">{card.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/40">
                <span className="group-hover:text-[#00ff88] transition-colors">OPEN WORKSPACE</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

