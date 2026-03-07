'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major: '',
    graduationYear: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '',
    careerInterests: '',
    targetCompanies: '',
    targetIndustries: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        university: form.university || undefined,
        major: form.major || undefined,
        graduationYear: form.graduationYear || undefined,
        linkedin: form.linkedin || undefined,
        github: form.github || undefined,
        portfolio: form.portfolio || undefined,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        careerInterests: form.careerInterests || undefined,
        targetCompanies: form.targetCompanies || undefined,
        targetIndustries: form.targetIndustries || undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create account');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('user', JSON.stringify(data.user));
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl border border-white/10 bg-black/40 rounded-2xl p-8 shadow-xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00ff88] text-black flex items-center justify-center text-sm font-black">
                FG
              </div>
              <div>
                <div className="text-xs tracking-[0.25em] text-white/50 uppercase">Fair Game</div>
                <div className="text-sm text-white/40">AI networking co-pilot</div>
              </div>
            </div>
            <Link href="/login" className="text-xs text-white/40 hover:text-white transition-colors">
              Already have an account?
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-xs text-white/40 mt-1">
            We&apos;ll use this profile to power your career fair and networking strategies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">NAME *</label>
              <input
                required
                className="input-field"
                placeholder="Alex Chen"
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">EMAIL *</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">PASSWORD *</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">UNIVERSITY</label>
              <input
                className="input-field"
                placeholder="University of Waterloo"
                value={form.university}
                onChange={handleChange('university')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">MAJOR</label>
              <input
                className="input-field"
                placeholder="Computer Science"
                value={form.major}
                onChange={handleChange('major')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">GRADUATION YEAR</label>
              <input
                className="input-field"
                placeholder="2026"
                value={form.graduationYear}
                onChange={handleChange('graduationYear')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">LINKEDIN</label>
              <input
                className="input-field"
                placeholder="linkedin.com/in/you"
                value={form.linkedin}
                onChange={handleChange('linkedin')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">GITHUB</label>
              <input
                className="input-field"
                placeholder="github.com/you"
                value={form.github}
                onChange={handleChange('github')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">PORTFOLIO</label>
              <input
                className="input-field"
                placeholder="your-site.com"
                value={form.portfolio}
                onChange={handleChange('portfolio')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">
                SKILLS (comma separated)
              </label>
              <textarea
                className="input-field h-20 resize-none"
                placeholder="Python, C++, React, Distributed Systems"
                value={form.skills}
                onChange={handleChange('skills')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">CAREER INTERESTS</label>
              <textarea
                className="input-field h-20 resize-none"
                placeholder="AI infrastructure, developer tools, distributed systems..."
                value={form.careerInterests}
                onChange={handleChange('careerInterests')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">
                TARGET COMPANIES (comma separated)
              </label>
              <textarea
                className="input-field h-16 resize-none"
                placeholder="NVIDIA, Stripe, Palantir..."
                value={form.targetCompanies}
                onChange={handleChange('targetCompanies')}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 tracking-widest mb-2">
                TARGET INDUSTRIES (comma separated)
              </label>
              <textarea
                className="input-field h-16 resize-none"
                placeholder="Fintech, AI, Robotics..."
                value={form.targetIndustries}
                onChange={handleChange('targetIndustries')}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <span className="loading-pulse">CREATING ACCOUNT...</span> : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}

