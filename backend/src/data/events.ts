/**
 * Sample career fair and networking events with coordinates for the Cold Connect map.
 * In production you could replace this with Eventbrite API, or geocode user's city via Nominatim
 * and filter events by location.
 */
export interface MapEvent {
  id: string;
  name: string;
  type: 'career_fair' | 'networking' | 'workshop';
  date: string;
  location: string;
  lat: number;
  lng: number;
  description?: string;
}

export const SAMPLE_EVENTS: MapEvent[] = [
  {
    id: '1',
    name: 'Tech Career Fair 2025',
    type: 'career_fair',
    date: '2025-04-12',
    location: 'San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    description: 'Annual tech career fair with 100+ companies.',
  },
  {
    id: '2',
    name: 'Engineering Networking Night',
    type: 'networking',
    date: '2025-03-28',
    location: 'San Francisco, CA',
    lat: 37.7849,
    lng: -122.4094,
    description: 'Evening networking for software engineers.',
  },
  {
    id: '3',
    name: 'Startup Career Expo',
    type: 'career_fair',
    date: '2025-04-05',
    location: 'San Jose, CA',
    lat: 37.3382,
    lng: -121.8863,
    description: 'Startups and scale-ups hiring interns.',
  },
  {
    id: '4',
    name: 'Women in Tech Meetup',
    type: 'networking',
    date: '2025-03-15',
    location: 'Oakland, CA',
    lat: 37.8044,
    lng: -122.2712,
    description: 'Networking and mentorship event.',
  },
  {
    id: '5',
    name: 'University Career Fair',
    type: 'career_fair',
    date: '2025-04-20',
    location: 'Berkeley, CA',
    lat: 37.8715,
    lng: -122.273,
    description: 'Campus-wide employer fair.',
  },
  {
    id: '6',
    name: 'AI & ML Career Panel',
    type: 'workshop',
    date: '2025-03-22',
    location: 'Palo Alto, CA',
    lat: 37.4419,
    lng: -122.143,
    description: 'Panel and networking with AI industry folks.',
  },
  {
    id: '7',
    name: 'Fintech Networking Happy Hour',
    type: 'networking',
    date: '2025-04-02',
    location: 'New York, NY',
    lat: 40.7128,
    lng: -74.006,
    description: 'Informal networking in fintech.',
  },
  {
    id: '8',
    name: 'NYC Tech Internship Fair',
    type: 'career_fair',
    date: '2025-04-18',
    location: 'New York, NY',
    lat: 40.7589,
    lng: -73.9851,
    description: 'Internship-focused tech fair.',
  },
  {
    id: '9',
    name: 'Boston Tech Career Fair',
    type: 'career_fair',
    date: '2025-04-10',
    location: 'Boston, MA',
    lat: 42.3601,
    lng: -71.0589,
    description: 'New England tech employers.',
  },
  {
    id: '10',
    name: 'Seattle Startup Demo Day',
    type: 'networking',
    date: '2025-03-30',
    location: 'Seattle, WA',
    lat: 47.6062,
    lng: -122.3321,
    description: 'Startup demos and recruiter tables.',
  },
];
