'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl, apiFetch } from '../../lib/api';

interface PersonSummary {
  name: string;
  title: string;
  company: string;
  industry: string;
  summary: string;
}

interface PotentialConnection {
  name: string;
  title: string;
  company: string;
  relevance: string;
}

interface NetworkingAnalysis {
  personSummary: PersonSummary;
  opportunityScore: number;
  priorityRank: 'HIGH' | 'MEDIUM' | 'LOW';
  potentialConnections: PotentialConnection[];
  conversationPrompts: string[];
  networkingStrategy: string;
}

interface AnalysisResponse {
  id: string;
  createdAt: string;
  analysis: NetworkingAnalysis;
  strategy: string;
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-[#00ff88]';
  if (score >= 60) return 'text-yellow-300';
  return 'text-white/50';
}

export default function NetworkingPage() {
  const router = useRouter();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const runAnalysis = async () => {
    if (!linkedinUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const { res, data } = await apiFetch<AnalysisResponse & { message?: string }>(
        apiUrl('/api/networking/analyze'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ linkedinUrl, conversationNotes: notes || undefined }),
        }
      );
      if (!res.ok) throw new Error(data.message || 'Analysis failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze connection');
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUp = async (type: 'linkedin' | 'email') => {
    if (!followUpInput.trim()) return;
    setFollowUp('');
    setFollowUpLoading(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const { res, data } = await apiFetch<{ followUp?: string; message?: string }>(
        apiUrl('/api/generate-followup'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            type,
            conversationNotes: followUpInput,
            person: result
              ? {
                  name: result.analysis.personSummary.name,
                  title: result.analysis.personSummary.title,
                  company: result.analysis.personSummary.company,
                }
              : undefined,
          }),
        }
      );
      if (!res.ok) throw new Error(data.message || 'Failed to generate follow-up');
      setFollowUp(data.followUp ?? '');
    } catch (err: any) {
      setFollowUp(err.message || 'Failed to generate follow-up');
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050507]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-white/30 hover:text-white text-xs tracking-widest transition-colors"
            >
              ← DASHBOARD
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-[#00ff88] text-xs tracking-widest">NETWORKING MODE</span>
          </div>
          <Link href="/dashboard" className="text-[#00ff88] font-bold tracking-tighter">
            FAIR_GAME
          </Link>
        </div>
      </nav>

      <main className="pt-16 max-w-6xl mx-auto px-6 py-10">
        {!result ? (
          <section className="max-w-2xl">
            <div className="text-xs text-white/30 tracking-widest mb-2">// GENERAL NETWORKING</div>
            <h1 className="text-3xl font-black tracking-tight mb-3">ANALYZE A CONNECTION</h1>
            <p className="text-white/30 text-xs mb-4">
              Paste a LinkedIn profile URL. We don&apos;t have access to their real profile, so Fair Game will give you a
              strategy and conversation prompts tailored to your goals—then you open the profile and use what you see.
            </p>
            <p className="text-white/20 text-[11px] mb-8">
              No scraping: we can&apos;t see their name, title, or company. The plan and prompts are based on your profile only.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs text-white/40 tracking-widest mb-2">LINKEDIN PROFILE</label>
                <input
                  className="input-field"
                  placeholder="https://www.linkedin.com/in/example"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 tracking-widest mb-2">
                  CONTEXT / NOTES (optional)
                </label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder='e.g. "Met at a hackathon, interested in infrastructure teams..."'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                className="btn-primary mt-2"
                onClick={runAnalysis}
                disabled={loading || !linkedinUrl.trim()}
              >
                {loading ? <span className="loading-pulse">ANALYZING CONNECTION...</span> : 'GENERATE STRATEGY →'}
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#00ff88] tracking-widest mb-1">// STRATEGY READY</div>
                <h1 className="text-3xl font-black tracking-tight">NETWORKING BLUEPRINT</h1>
                <p className="text-xs text-white/40 mt-1">
                  Use this to drive a focused conversation and plan your follow‑up.
                </p>
              </div>
              <button
                className="btn-secondary text-xs"
                type="button"
                onClick={() => {
                  setResult(null);
                  setFollowUp('');
                  setFollowUpInput('');
                }}
              >
                ← NEW PERSON
              </button>
            </div>

            {/* Summary + score */}
            <div className="grid md:grid-cols-[2fr,1fr] gap-6">
              <div className="border border-white/10 rounded-xl p-5 bg-black/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-white/40 tracking-widest mb-1">TARGET PERSON</div>
                    <div className="text-lg font-bold">
                      {result.analysis.personSummary.name}{' '}
                      <span className="text-white/40 text-sm">
                        · {result.analysis.personSummary.title} @ {result.analysis.personSummary.company}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div
                      className={`text-2xl font-black ${scoreColor(
                        result.analysis.opportunityScore,
                      )}`}
                    >
                      {result.analysis.opportunityScore}
                    </div>
                    <div className="text-white/30 uppercase tracking-widest">OPPORTUNITY</div>
                    <div className="text-[10px] text-white/40 mt-1">
                      Priority: {result.analysis.priorityRank}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {result.analysis.personSummary.summary}
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-5 bg-black/20 text-xs space-y-3">
                <div className="text-white/40 tracking-widest text-[11px]">NETWORKING STRATEGY</div>
                <p className="text-white/60 leading-relaxed">{result.analysis.networkingStrategy}</p>
                <div className="border-t border-white/5 pt-3 text-white/40">
                  <div className="text-[11px] mb-1">HIGH‑LEVEL PLAN</div>
                  <p className="text-white/60 leading-relaxed text-[11px] whitespace-pre-wrap">
                    {result.strategy}
                  </p>
                </div>
              </div>
            </div>

            {/* Opportunities + prompts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-white/10 rounded-xl p-5 bg-black/20 text-xs">
                <div className="text-white/40 tracking-widest text-[11px] mb-3">
                  POSSIBLE USEFUL CONNECTIONS
                </div>
                <div className="space-y-3">
                  {result.analysis.potentialConnections.map((c) => (
                    <div
                      key={`${c.name}-${c.company}`}
                      className="border border-white/10 rounded-lg p-3 bg-black/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-white/80">{c.name}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">
                          {c.company}
                        </div>
                      </div>
                      <div className="text-[11px] text-white/50">{c.title}</div>
                      <div className="text-[11px] text-white/60 mt-1">{c.relevance}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-5 bg-black/20 text-xs">
                <div className="text-white/40 tracking-widest text-[11px] mb-3">
                  CONVERSATION PROMPTS
                </div>
                <ul className="space-y-2">
                  {result.analysis.conversationPrompts.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/60">
                      <span className="text-[#00ff88] mt-0.5 shrink-0">▸</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Follow-up generator */}
            <div className="border border-white/10 rounded-xl p-5 bg-black/20 text-xs">
              <div className="text-white/40 tracking-widest text-[11px] mb-3">
                FOLLOW‑UP GENERATOR
              </div>
              <p className="text-white/40 mb-3">
                After you talk, jot down what you discussed and let Fair Game write the follow‑up for you.
              </p>
              <textarea
                className="input-field h-24 resize-none mb-3"
                placeholder='e.g. "Talked about their path from consulting to product, and infra hiring on their team..."'
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-[11px]"
                  onClick={() => generateFollowUp('linkedin')}
                  disabled={followUpLoading || !followUpInput.trim()}
                >
                  {followUpLoading ? 'GENERATING...' : 'LINKEDIN MESSAGE'}
                </button>
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-[11px]"
                  onClick={() => generateFollowUp('email')}
                  disabled={followUpLoading || !followUpInput.trim()}
                >
                  EMAIL FOLLOW‑UP
                </button>
              </div>

              {followUp && (
                <div className="border border-[#00ff88]/30 rounded-lg p-4 bg-[#00ff88]/[0.03]">
                  <div className="text-[11px] text-[#00ff88] tracking-widest mb-2">
                    GENERATED MESSAGE
                  </div>
                  <pre className="text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed font-mono">
                    {followUp}
                  </pre>
                  <button
                    type="button"
                    className="mt-3 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                    onClick={() => navigator.clipboard?.writeText(followUp)}
                  >
                    COPY TO CLIPBOARD
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

