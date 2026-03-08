'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// CartoDB Dark Matter – matches site theme
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>';

// Green marker icon matching #00ff88
function createMarkerIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #00ff88;
      border: 2px solid #050507;
      box-shadow: 0 0 8px rgba(0,255,136,0.5);
      display: block;
    "></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
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

function MapFitBounds({ events }: { events: MapEvent[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (events.length === 0 || done.current) return;
    const bounds = L.latLngBounds(events.map((e) => [e.lat, e.lng] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
    done.current = true;
  }, [map, events]);
  return null;
}

export default function EventsMap({ events }: { events: MapEvent[] }) {
  const [mounted, setMounted] = useState(false);
  const icon = useMemo(createMarkerIcon, []);
  const mapRef = useRef<L.Map | null>(null);

  // mark when client rendering has started (avoid server/SSR)
  useEffect(() => setMounted(true), []);

  // ensure any leaflet map instance is removed when the component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
        Loading map...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
        No events to show on map.
      </div>
    );
  }

  const center: L.LatLngTuple = events.length
    ? [events[0].lat, events[0].lng]
    : [37.7749, -122.4194];

  return (
    <MapContainer
      // changing the key forces React to tear down any existing container before
      // creating a new one; this helps avoid "Map container is already
      // initialized" errors during StrictMode double-mounts or when props
      // change.
      key={events.length}
      ref={mapRef}        // ← replace whenCreated with this
      center={center}
      zoom={6}
      className="w-full h-full rounded-r-xl [&_.leaflet-container]:bg-[#0a0a0a]"
      style={{ background: '#0a0a0a' }}
      scrollWheelZoom
    >
      <TileLayer url={DARK_TILES} attribution={ATTRIBUTION} />
      <MapFitBounds events={events} />
      {events.map((ev) => (
        <Marker key={ev.id} position={[ev.lat, ev.lng]} icon={icon}>
          <Popup>
            <div className="text-black font-sans text-sm p-1">
              <strong>{ev.name}</strong>
              <br />
              <span className="text-gray-600">{ev.date} · {ev.location}</span>
              {ev.description && (
                <>
                  <br />
                  <span className="text-gray-500">{ev.description}</span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
