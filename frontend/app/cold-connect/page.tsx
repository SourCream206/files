'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiUrl, apiFetch } from '../../lib/api';

// Map with CartoDB dark theme; load only on client (Leaflet uses window)
const EventsMap = dynamic(() => import('./EventsMap'), { ssr: false });

interface Internship {
  title: string;
  company: string;
  matchReason: string;
  searchHint: string;
}

interface Person {
  role: string;
  industry: string;
  whyConnect: string;
  linkedinSearchHint: string;
}

interface MapEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  description?: string;
}

interface ColdConnectData {
  internships: Internship[];
  peopleToConnect: Person[];
  events: MapEvent[];
}

export default function ColdConnectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ColdConnectData | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const { res, data: json } = await apiFetch<ColdConnectData>(apiUrl('/api/cold-connect'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('Failed to load Cold Connect data');
        }
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center text-xs">
        <span className="loading-pulse text-white/60">Loading Cold Connect...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center text-xs">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'No data'}</p>
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { internships, peopleToConnect, events } = data;

  return (
    <div className="min-h-screen bg-[#050507] text-white font-mono">
      <nav className="border-b border-white/5 bg-[#050507]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Back to dashboard
          </Link>
          <div className="text-xs text-[#00ff88] tracking-[0.2em] uppercase">Cold Connect</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-10">
          <div className="text-xs text-[#00ff88] tracking-[0.25em] uppercase mb-2">
            BASED ON YOUR RESUME
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Internships, connections & events
          </h1>
          <p className="text-xs text-white/40 max-w-xl">
            Matched to your profile: roles to apply to, people to find on LinkedIn, and nearby career fairs and networking events.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Internships */}
          <section className="border border-white/10 rounded-xl p-6 bg-black/20">
            <h2 className="text-sm font-bold text-[#00ff88] tracking-widest uppercase mb-4">
              Matched internship positions
            </h2>
            <ul className="space-y-4">
              {internships.length === 0 ? (
                <li className="text-xs text-white/40">Add skills and interests in your Profile to get matches.</li>
              ) : (
                internships.map((job, i) => (
                  <li key={i} className="border-l-2 border-white/10 pl-4 py-1">
                    <div className="font-semibold text-sm">{job.title} · {job.company}</div>
                    <div className="text-xs text-white/50 mt-1">{job.matchReason}</div>
                    <div className="text-[11px] text-white/30 mt-1">
                      Search: “{job.searchHint}”
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* People to connect */}
          <section className="border border-white/10 rounded-xl p-6 bg-black/20">
            <h2 className="text-sm font-bold text-[#00ff88] tracking-widest uppercase mb-4">
              People to connect on LinkedIn
            </h2>
            <ul className="space-y-4">
              {peopleToConnect.length === 0 ? (
                <li className="text-xs text-white/40">Complete your profile to get connection suggestions.</li>
              ) : (
                peopleToConnect.map((person, i) => (
                  <li key={i} className="border-l-2 border-white/10 pl-4 py-1">
                    <div className="font-semibold text-sm">{person.role} · {person.industry}</div>
                    <div className="text-xs text-white/50 mt-1">{person.whyConnect}</div>
                    <a
                      href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(person.linkedinSearchHint)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-[11px] text-[#00ff88] hover:underline"
                    >
                      Search LinkedIn: “{person.linkedinSearchHint}” →
                    </a>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* Events + Map */}
        <section className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
          <h2 className="text-sm font-bold text-[#00ff88] tracking-widest uppercase p-6 pb-2">
            Nearby career fairs & networking events
          </h2>
          <p className="text-xs text-white/40 px-6 pb-4">
            Event locations on the map. Click a marker for details.
          </p>
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-1 p-4 md:p-6 max-h-[400px] overflow-y-auto space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="text-xs border border-white/5 rounded-lg p-3 hover:border-white/15 transition-colors"
                >
                  <div className="font-semibold text-white/90">{ev.name}</div>
                  <div className="text-white/40 mt-0.5">
                    {ev.date} · {ev.location}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded border border-white/15 text-[10px] text-white/50">
                    {ev.type.replace('_', ' ')}
                  </span>
                  {ev.description && (
                    <div className="text-white/40 mt-1.5">{ev.description}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="md:col-span-2 h-[400px] min-h-[300px] bg-[#0a0a0a]">
              <EventsMap events={events} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
