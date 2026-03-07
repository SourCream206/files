'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  name: string;
  email: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills?: string[];
  targetIndustries?: string[];
  targetCompanies?: string[];
  careerInterests?: string;
  resumeText?: string;
}

interface ParsedResume {
  skills: string[];
  suggestedIndustries: string[];
  suggestedInterests: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState('');
  const [targetIndustries, setTargetIndustries] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.localStorage.getItem('token');
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);

    const loadProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('Failed to load profile');
        }
        const data: Profile = await res.json();
        setProfile(data);
        setSkills((data.skills || []).join(', '));
        setTargetIndustries((data.targetIndustries || []).join(', '));
        setTargetCompanies((data.targetCompanies || []).join(', '));
        setResumeText((data as Profile).resumeText || '');
        setParsed(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...profile,
        skills,
        targetIndustries,
        targetCompanies,
        resumeText: resumeText || undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const updated: Profile = await res.json();
      setProfile(updated);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim() || !token) return;
    setParseLoading(true);
    setParsed(null);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/parse-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText: resumeText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to parse resume');
      setParsed(data);
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume');
    } finally {
      setParseLoading(false);
    }
  };

  const applyParsedToProfile = () => {
    if (!parsed) return;
    setSkills(parsed.skills.join(', '));
    setTargetIndustries(parsed.suggestedIndustries.join(', '));
    setProfile((p) =>
      p ? { ...p, careerInterests: parsed.suggestedInterests.join(', ') } : null,
    );
    setParsed(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center text-xs">
        <span className="loading-pulse text-white/60">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center text-xs">
        <span className="text-white/60">Profile not available.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <header className="border-b border-white/5 bg-[#050507]/95 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            ← Back to dashboard
          </button>
          <div className="text-xs text-white/40 tracking-[0.2em] uppercase">Profile</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#00ff88] tracking-[0.25em] uppercase mb-2">
            YOUR NETWORKING BLUEPRINT
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Professional profile</h1>
          <p className="text-xs text-white/40 max-w-xl">
            Fair Game uses this profile as the knowledge base for all of your career fair and networking strategies.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold mb-3">Personal</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/40 mb-1">Name</label>
                  <input
                    className="input-field"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-white/40 mb-1">Email</label>
                  <input
                    className="input-field"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-white/40 mb-1">University</label>
                  <input
                    className="input-field"
                    value={profile.university || ''}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 mb-1">Major</label>
                    <input
                      className="input-field"
                      value={profile.major || ''}
                      onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 mb-1">Graduation year</label>
                    <input
                      className="input-field"
                      value={profile.graduationYear || ''}
                      onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-3">Links</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/40 mb-1">LinkedIn</label>
                  <input
                    className="input-field"
                    value={profile.linkedin || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-white/40 mb-1">GitHub</label>
                  <input
                    className="input-field"
                    value={profile.github || ''}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-white/40 mb-1">Portfolio</label>
                  <input
                    className="input-field"
                    value={profile.portfolio || ''}
                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="text-xs border border-white/10 rounded-xl p-5 bg-black/20">
            <h2 className="text-sm font-semibold mb-2">Resume</h2>
            <p className="text-white/40 mb-3">
              Paste your resume or bio below. AI will extract skills and suggest target industries and interests.
            </p>
            <textarea
              className="input-field h-32 resize-none mb-3"
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setParsed(null); }}
              placeholder="Paste resume or bio text here..."
            />
            <button
              type="button"
              className="btn-secondary mb-4"
              onClick={handleParseResume}
              disabled={parseLoading || !resumeText.trim()}
            >
              {parseLoading ? 'Parsing with AI...' : 'Parse resume with AI'}
            </button>
            {parsed && (
              <div className="border border-[#00ff88]/20 rounded-lg p-4 bg-[#00ff88]/[0.03] space-y-3">
                <div className="text-[11px] text-[#00ff88] tracking-widest">EXTRACTED — Apply to profile below</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <div className="text-white/40 mb-1">Skills</div>
                    <div className="text-white/70">{parsed.skills.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Suggested industries</div>
                    <div className="text-white/70">{parsed.suggestedIndustries.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Suggested interests</div>
                    <div className="text-white/70">{parsed.suggestedInterests.join(', ')}</div>
                  </div>
                </div>
                <button type="button" className="btn-primary text-[11px] px-3 py-2" onClick={applyParsedToProfile}>
                  Apply to profile
                </button>
              </div>
            )}
          </section>

          <section className="grid md:grid-cols-3 gap-6 text-xs">
            <div className="md:col-span-1">
              <h2 className="text-sm font-semibold mb-3">Skills</h2>
              <p className="text-white/40 mb-3">
                These power all matching for both career fairs and networking recommendations.
              </p>
              <textarea
                className="input-field h-28 resize-none"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, C++, React, Distributed Systems..."
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-3">Target industries</h2>
              <textarea
                className="input-field h-28 resize-none"
                value={targetIndustries}
                onChange={(e) => setTargetIndustries(e.target.value)}
                placeholder="Fintech, AI infrastructure, Robotics..."
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-3">Target companies</h2>
              <textarea
                className="input-field h-28 resize-none"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                placeholder="NVIDIA, Stripe, Palantir..."
              />
            </div>
          </section>

          <section className="text-xs">
            <h2 className="text-sm font-semibold mb-3">Career interests</h2>
            <textarea
              className="input-field h-24 resize-none"
              value={profile.careerInterests || ''}
              onChange={(e) => setProfile({ ...profile, careerInterests: e.target.value })}
              placeholder="What kinds of roles, teams, or problems are you most excited to work on?"
            />
          </section>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="btn-primary px-8" disabled={saving}>
            {saving ? <span className="loading-pulse">SAVING...</span> : 'SAVE PROFILE'}
          </button>
        </form>
      </main>
    </div>
  );
}

