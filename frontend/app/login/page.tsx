'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to login');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('user', JSON.stringify(data.user));
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-white/10 bg-black/40 rounded-2xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#00ff88] text-black flex items-center justify-center text-sm font-black">
              FG
            </div>
            <span className="text-sm font-semibold tracking-[0.25em] text-white/60 uppercase">Fair Game</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-xs text-white/40 mt-1">Sign in to access your networking strategies.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 tracking-widest mb-2">EMAIL</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 tracking-widest mb-2">PASSWORD</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
            {loading ? <span className="loading-pulse">SIGNING IN...</span> : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/40">
          <span>New to Fair Game? </span>
          <Link href="/signup" className="text-[#00ff88] hover:text-white transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

