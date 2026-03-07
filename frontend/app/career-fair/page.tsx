'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompanyResult {
  rank: number;
  company: string;
  score: number;
  description: string;
  roles: string[];
  talkingPoints: string[];
  suggestedQuestions: string[];
  followUpTemplate?: string;
}

interface AnalysisResult {
  rankedCompanies: CompanyResult[];
  recommendedRoute: string[];
  strategy: string;
}

export default function CareerFairPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState('');
  const [fairUrl, setFairUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'company'>('strategy');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const fetchCompaniesFromUrl = async () => {
    if (!fairUrl.trim()) return;
    setUrlLoading(true);
    setUrlMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/career-fair/extract-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ url: fairUrl.trim() }),
      });
      const data = await res.json();
      if (data.success && data.companies?.length) {
        setCompanies(data.companies.join('\n'));
        setUrlMessage(data.message || `Found ${data.companies.length} companies.`);
      } else {
        setUrlMessage(data.message || 'No companies found. Enter them manually below.');
      }
    } catch (e: any) {
      setUrlMessage(e.message || 'Could not fetch link. Enter companies manually below.');
    } finally {
      setUrlLoading(false);
    }
  };

  const analyze = async () => {
    if (!companies.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const companyList = companies.split('\n').map((c) => c.trim()).filter(Boolean);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/career-fair/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ companies: companyList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed');
      setResult(data);
      setActiveTab('strategy');
    } catch (e: any) {
      alert(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUp = async (company: string) => {
    if (!followUpInput.trim()) return;
    setFollowUpLoading(true);
    setFollowUp('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/generate-followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ company, conversationNotes: followUpInput, type: 'career_fair' }),
      });
      const data = await res.json();
      setFollowUp(data.followUp);
    } catch {
      setFollowUp('Failed to generate follow-up. Please try again.');
    } finally {
      setFollowUpLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-[#00ff88]' : score >= 60 ? 'text-yellow-400' : 'text-white/40';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-white/30 hover:text-white text-xs tracking-widest transition-colors"
            >
              ← DASHBOARD
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-[#00ff88] text-xs tracking-widest">CAREER FAIR MODE</span>
          </div>
          <Link href="/dashboard" className="text-[#00ff88] font-bold tracking-tighter">
            FAIR_GAME
          </Link>
        </div>
      </nav>

      <div className="pt-14 max-w-7xl mx-auto px-6 py-12">
        {!result ? (
          /* Input State */
          <div className="max-w-2xl">
            <div className="text-xs text-white/30 tracking-widest mb-2">// CAREER FAIR STRATEGY</div>
            <h1 className="text-4xl font-black tracking-tight mb-3">ANALYZE YOUR FAIR</h1>
            <p className="text-white/30 text-sm mb-6">Add a link to the career fair page to auto-fill companies, or enter them manually. One per line.</p>

            <div className="mb-6">
              <label className="text-xs text-white/30 tracking-widest block mb-3">CAREER FAIR PAGE LINK</label>
              <div className="flex gap-2 flex-wrap">
                <input
                  className="input-field flex-1 min-w-[200px]"
                  placeholder="https://university.edu/career-fair-2025"
                  value={fairUrl}
                  onChange={(e) => { setFairUrl(e.target.value); setUrlMessage(null); }}
                />
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap"
                  onClick={fetchCompaniesFromUrl}
                  disabled={urlLoading || !fairUrl.trim()}
                >
                  {urlLoading ? 'Fetching...' : 'Fetch companies from link'}
                </button>
              </div>
              {urlMessage && (
                <p className={`text-xs mt-2 ${urlMessage.includes('Found') ? 'text-[#00ff88]' : 'text-white/50'}`}>
                  {urlMessage}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="text-xs text-white/30 tracking-widest block mb-3">COMPANY LIST</label>
              <textarea
                className="input-field h-64 resize-none leading-relaxed"
                placeholder={'Google\nNvidia\nMicrosoft\nStripe\nPalantir\nOpenAI'}
                value={companies}
                onChange={(e) => setCompanies(e.target.value)}
              />
              <div className="text-white/20 text-xs mt-2">
                {companies.split('\n').filter(Boolean).length} companies entered
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                className="text-xs border border-white/10 px-3 py-1.5 text-white/30 hover:text-white hover:border-white/30 transition-all"
                onClick={() =>
                  setCompanies('Google\nNvidia\nMicrosoft\nStripe\nPalantir\nMeta\nApple\nOpenAI\nDeloitte\nAmazon')
                }
              >
                + LOAD EXAMPLE
              </button>
            </div>

            {user && (
              <div className="border border-white/5 p-4 bg-[#0d0d0d] mb-8 text-xs text-white/30">
                <div className="text-white/50 mb-2">AI WILL MATCH BASED ON YOUR PROFILE:</div>
                <div>
                  Skills:{' '}
                  {user.skills?.slice(0, 4).join(', ') || 'None set'}
                  {user.skills?.length > 4 ? ` +${user.skills.length - 4} more` : ''}
                </div>
                <div>Industries: {user.targetIndustries?.slice(0, 3).join(', ') || 'Not specified'}</div>
              </div>
            )}

            <button className="btn-primary" onClick={analyze} disabled={loading || !companies.trim()}>
              {loading ? <span className="loading-pulse">ANALYZING COMPANIES...</span> : 'GENERATE STRATEGY →'}
            </button>
          </div>
        ) : (
          /* Results State */
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="text-xs text-[#00ff88] tracking-widest mb-1">// STRATEGY READY</div>
                <h1 className="text-3xl font-black tracking-tight">YOUR GAME PLAN</h1>
              </div>
              <button
                className="btn-secondary text-xs"
                onClick={() => {
                  setResult(null);
                  setSelectedCompany(null);
                }}
              >
                ← NEW ANALYSIS
              </button>
            </div>

            {/* Tabs */}
            {selectedCompany && (
              <div className="flex gap-0 border border-white/10 w-fit mb-8">
                <button
                  onClick={() => setActiveTab('strategy')}
                  className={`px-5 py-2 text-xs tracking-widest transition-colors ${
                    activeTab === 'strategy' ? 'bg-[#00ff88] text-black font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  STRATEGY
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`px-5 py-2 text-xs tracking-widest transition-colors ${
                    activeTab === 'company' ? 'bg-[#00ff88] text-black font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  COMPANY INTEL
                </button>
              </div>
            )}

            {(!selectedCompany || activeTab === 'strategy') && (
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Priority ranking */}
                <div className="lg:col-span-2">
                  <div className="text-xs text-white/30 tracking-widest mb-4">PRIORITY RANKING</div>
                  <div className="space-y-2">
                    {result.rankedCompanies.map((c, i) => (
                      <button
                        key={c.company}
                        onClick={() => {
                          setSelectedCompany(c);
                          setActiveTab('company');
                          setFollowUpInput('');
                          setFollowUp('');
                        }}
                        className="w-full text-left border border-white/8 p-4 bg-[#0d0d0d] hover:border-[#00ff88]/40 hover:bg-[#00ff88]/[0.02] transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-8 h-8 flex items-center justify-center text-xs font-black text-black"
                            style={{
                              background:
                                i === 0
                                  ? '#00ff88'
                                  : i === 1
                                  ? 'rgba(0,255,136,0.5)'
                                  : i === 2
                                  ? 'rgba(0,255,136,0.25)'
                                  : 'rgba(255,255,255,0.08)',
                            }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{c.company}</div>
                            <div className="text-white/30 text-xs truncate">{c.roles?.slice(0, 2).join(' · ')}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-lg font-black ${scoreColor(c.score)}`}>{c.score}</div>
                            <div className="text-white/20 text-xs">FIT SCORE</div>
                          </div>
                          <div className="text-white/20 group-hover:text-[#00ff88] transition-colors text-sm">→</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route + Strategy sidebar */}
                <div className="space-y-4">
                  <div className="border border-white/8 p-5 bg-[#0d0d0d]">
                    <div className="text-xs text-white/30 tracking-widest mb-4">OPTIMAL ROUTE</div>
                    <div className="space-y-2">
                      {result.recommendedRoute.map((company, i) => (
                        <div key={company} className="flex items-center gap-3 text-sm">
                          <div className="text-[#00ff88] text-xs font-bold w-12 shrink-0">STOP {i + 1}</div>
                          <div className="flex-1 text-white/70">→ {company}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/8 p-5 bg-[#0d0d0d]">
                    <div className="text-xs text-white/30 tracking-widest mb-3">OVERALL STRATEGY</div>
                    <p className="text-white/50 text-xs leading-relaxed">{result.strategy}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Company detail view */}
            {selectedCompany && activeTab === 'company' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-[#00ff88]/20 p-6 bg-[#00ff88]/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-black">{selectedCompany.company}</h2>
                      <div className={`text-2xl font-black ${scoreColor(selectedCompany.score)}`}>
                        {selectedCompany.score}/100
                      </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed mb-4">{selectedCompany.description}</p>
                    <div>
                      <div className="text-xs text-white/20 tracking-widest mb-2">HIRING FOR</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.roles?.map((r) => (
                          <span key={r} className="px-2 py-0.5 border border-white/10 text-white/40 text-xs">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/8 p-5 bg-[#0d0d0d]">
                    <div className="text-xs text-white/30 tracking-widest mb-3">TALKING POINTS</div>
                    <ul className="space-y-2">
                      {selectedCompany.talkingPoints?.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                          <span className="text-[#00ff88] mt-0.5 shrink-0">▸</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-white/8 p-5 bg-[#0d0d0d]">
                    <div className="text-xs text-white/30 tracking-widest mb-3">SUGGESTED QUESTIONS</div>
                    <ul className="space-y-2">
                      {selectedCompany.suggestedQuestions?.map((q, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                          <span className="text-[#00ff88] mt-0.5 shrink-0">?</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Follow-up generator */}
                <div className="border border-white/8 p-6 bg-[#0d0d0d] h-fit">
                  <div className="text-xs text-white/30 tracking-widest mb-4">FOLLOW-UP GENERATOR</div>
                  <p className="text-white/30 text-xs mb-4">
                    After speaking with the recruiter, briefly describe what you talked about:
                  </p>
                  <textarea
                    className="input-field h-24 resize-none mb-4"
                    placeholder={`e.g. "Discussed AI infrastructure team, internship openings for summer, and my distributed systems project..."`}
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                  />
                  <button
                    className="btn-primary w-full justify-center mb-6"
                    onClick={() => generateFollowUp(selectedCompany.company)}
                    disabled={followUpLoading || !followUpInput.trim()}
                  >
                    {followUpLoading ? <span className="loading-pulse">GENERATING...</span> : 'GENERATE FOLLOW-UP →'}
                  </button>

                  {followUp && (
                    <div className="border border-[#00ff88]/20 p-4 bg-[#00ff88]/[0.02]">
                      <div className="text-xs text-[#00ff88] tracking-widest mb-3">GENERATED MESSAGE</div>
                      <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                        {followUp}
                      </pre>
                      <button
                        className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors"
                        onClick={() => navigator.clipboard.writeText(followUp)}
                      >
                        COPY TO CLIPBOARD
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

