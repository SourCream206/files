'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono overflow-x-hidden">
      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,136,0.04), transparent 70%)`,
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[#00ff88] font-bold text-lg tracking-tighter">FAIR_GAME</span>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-white transition-colors">
              How It Works
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 bg-[#00ff88] text-black text-sm font-bold hover:bg-[#00cc70] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-14">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00ff88]/30 text-[#00ff88] text-xs mb-8 tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse"></span>
            AI-POWERED NETWORKING INTELLIGENCE
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black leading-none tracking-tighter mb-6">
            <span className="block text-white">TURN</span>
            <span className="block text-white">NETWORKING</span>
            <span className="block relative">
              <span className="text-[#00ff88]">INTO</span>
              <span className="text-white"> STRATEGY</span>
              <span className="absolute -top-2 right-0 text-xs text-white/20 font-normal tracking-widest hidden lg:block">
                v2.0
              </span>
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Stop wandering career fairs. Stop sending generic LinkedIn messages. Fair Game analyzes your profile and
            generates precision networking strategies that actually open doors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group px-8 py-4 bg-[#00ff88] text-black font-bold text-sm tracking-widest hover:bg-white transition-all duration-200 flex items-center gap-3"
            >
              START STRATEGIZING
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a
              href="#how"
              className="px-8 py-4 border border-white/20 text-white/70 font-normal text-sm tracking-widest hover:border-white/40 hover:text-white transition-all duration-200"
            >
              SEE HOW IT WORKS
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-white/5 pt-12">
            {[
              { n: '10x', label: 'More strategic conversations' },
              { n: '3min', label: 'To generate full fair strategy' },
              { n: '100%', label: 'AI-powered analysis' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-2xl font-black text-[#00ff88]">{s.n}</div>
                <div className="text-white/30 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-xs tracking-widest">
          <span>SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-xs text-[#00ff88] tracking-widest mb-4">// CAPABILITIES</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">
            THREE WEAPONS.
            <br />
            <span className="text-white/30">INFINITE ADVANTAGE.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                num: '01',
                title: 'Career Fair Strategy',
                desc: 'Input the companies attending any career fair. Our AI ranks them by fit, optimizes your route, and generates tailored talking points for every booth.',
                tags: ['Company Ranking', 'Route Optimization', 'Talking Points'],
                icon: '⬡',
              },
              {
                num: '02',
                title: 'Networking Intelligence',
                desc: 'Paste a LinkedIn URL and instantly understand who they know, what opportunities they unlock, and exactly how to start a conversation that matters.',
                tags: ['Connection Mapping', 'Opportunity Scoring', 'Icebreakers'],
                icon: '◈',
              },
              {
                num: '03',
                title: 'AI Follow-Ups',
                desc: 'Tell us what you talked about. Get a perfect follow-up email or LinkedIn message — personalized, professional, and ready to send in seconds.',
                tags: ['Email Generation', 'LinkedIn Messages', 'Personal Touch'],
                icon: '◎',
              },
            ].map((f) => (
              <div key={f.num} className="bg-[#0a0a0a] p-8 hover:bg-[#111] transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <span className="text-4xl text-white/10 font-black">{f.num}</span>
                  <span className="text-2xl text-[#00ff88] opacity-60 group-hover:opacity-100 transition-opacity">
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 border border-white/10 text-white/30 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-xs text-[#00ff88] tracking-widest mb-4">// PROCESS</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">
            FOUR STEPS TO
            <br />
            <span className="text-white/30">CAREER MOMENTUM.</span>
          </h2>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-white/10 z-0" />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '01', title: 'Create Profile', desc: 'Add your skills, major, target companies, and career interests.' },
                {
                  step: '02',
                  title: 'Upload Resume',
                  desc: 'Connect your LinkedIn, GitHub, and portfolio to give AI full context.',
                },
                {
                  step: '03',
                  title: 'Generate Strategy',
                  desc: 'Input a career fair or LinkedIn profile and get your personalized game plan.',
                },
                {
                  step: '04',
                  title: 'Execute & Follow Up',
                  desc: 'Use real-time talking points and send perfect follow-ups after every interaction.',
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-16 h-16 border border-white/10 bg-[#0a0a0a] mx-auto mb-6 flex items-center justify-center">
                    <span className="text-[#00ff88] font-black text-sm">{s.step}</span>
                  </div>
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-white/30 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="border border-[#00ff88]/20 p-12 md:p-20 bg-[#00ff88]/[0.02]">
            <div className="text-xs text-[#00ff88] tracking-widest mb-6">// GET STARTED</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              STOP LEAVING
              <br />
              <span className="text-[#00ff88]">OPPORTUNITIES</span>
              <br />
              ON THE TABLE.
            </h2>
            <p className="text-white/30 mb-10 text-lg">Free to start. No credit card required.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#00ff88] text-black font-black text-sm tracking-widest hover:bg-white transition-all duration-200"
            >
              CREATE FREE ACCOUNT →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[#00ff88] font-bold">FAIR_GAME</span>
          <span className="text-white/20 text-xs">AI-powered networking strategy</span>
        </div>
      </footer>
    </div>
  );
}

