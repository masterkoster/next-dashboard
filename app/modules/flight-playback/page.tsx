'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic import for Leaflet (no SSR)
const FlightPlaybackMap = dynamic(() => import('./FlightPlaybackMap'), { ssr: false });

interface TrackPoint {
  lat: number;
  lng: number;
  alt?: number;
  speed?: number;
  timestamp: string;
}

interface Track {
  id: string;
  name: string;
  date: string;
  aircraft: string;
  totalDistance: number;
  maxAltitude: number;
  maxSpeed: number;
  duration: number;
  createdAt: string;
}

interface FullTrack extends Track {
  trackData: string;
}

function FlightPlaybackContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackId = searchParams.get('id');
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<FullTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    aircraft: '',
    trackData: '[]',
  });

  // Fetch tracks list
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTracks();
    }
  }, [status]);

  // Fetch single track when ID is in URL
  useEffect(() => {
    if (trackId && status === 'authenticated') {
      fetchTrack(trackId);
    }
  }, [trackId, status]);

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/flight-tracks');
      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'PROPLUS_REQUIRED') {
          setError('Pro+ subscription required');
        } else {
          setError(data.error || 'Failed to load tracks');
        }
        return;
      }
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (err) {
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrack = async (id: string) => {
    try {
      const res = await fetch(`/api/flight-tracks?id=${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load track');
        return;
      }
      const data = await res.json();
      setSelectedTrack(data.track);
    } catch (err) {
      setError('Failed to load track');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flight track?')) return;
    
    try {
      const res = await fetch(`/api/flight-tracks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTracks(tracks.filter(t => t.id !== id));
        if (selectedTrack?.id === id) {
          setSelectedTrack(null);
          router.push('/modules/flight-playback');
        }
      }
    } catch (err) {
      alert('Failed to delete track');
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/flight-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to save track');
        return;
      }

      const data = await res.json();
      setShowAddModal(false);
      setAddFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        aircraft: '',
        trackData: '[]',
      });
      // Refresh the track list
      fetchTracks();
      // Navigate to the new track
      router.push(`/modules/flight-playback?id=${data.track.id}`);
    } catch (err) {
      alert('Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get track data as array
  const trackPoints: TrackPoint[] = useMemo(() => {
    if (!selectedTrack?.trackData) return [];
    try {
      return JSON.parse(selectedTrack.trackData);
    } catch {
      return [];
    }
  }, [selectedTrack]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading Flight Playback...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error && !tracks.length) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/pricing" className="text-emerald-400 hover:underline">
            View Pricing →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🛫 Flight Playback</h1>
              <p className="text-slate-400 text-sm">Replay your flights on a map</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Track List */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300">Your Flight Tracks</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add Track
              </button>
            </div>
            
            {tracks.length === 0 ? (
              <p className="text-slate-500 text-sm">No flight tracks saved yet.</p>
            ) : (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTrack?.id === track.id
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                    }`}
                    onClick={() => router.push(`/modules/flight-playback?id=${track.id}`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-medium text-sm">{track.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(track.id); }}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(track.date)} • {track.aircraft}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                      <span>{track.totalDistance} NM</span>
                      <span>{track.maxAltitude} ft</span>
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Map or Empty State */}
        <div className="flex-1 relative">
          {selectedTrack ? (
            <>
              <FlightPlaybackMap 
                points={trackPoints} 
                playing={playing}
                currentPointIndex={currentPointIndex}
                onPlaybackEnd={() => setPlaying(false)}
                onIndexChange={(index) => setCurrentPointIndex(index)}
              />
              
              {/* Playback Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur rounded-lg p-4 flex items-center gap-4 border border-slate-700">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                >
                  {playing ? '⏸' : '▶'}
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>

                <div className="text-sm text-slate-300">
                  Point {currentPointIndex + 1} / {trackPoints.length}
                </div>
                
                {trackPoints[currentPointIndex] && (
                  <div className="text-xs text-slate-400 ml-2">
                    ALT: {trackPoints[currentPointIndex].alt || '--'} ft
                    {' | '}
                    SPD: {trackPoints[currentPointIndex].speed || '--'} kts
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg p-4 border border-slate-700">
                <h3 className="text-white font-semibold mb-2">{selectedTrack.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">Date:</div>
                  <div className="text-white">{formatDate(selectedTrack.date)}</div>
                  <div className="text-slate-400">Aircraft:</div>
                  <div className="text-white">{selectedTrack.aircraft}</div>
                  <div className="text-slate-400">Distance:</div>
                  <div className="text-white">{selectedTrack.totalDistance} NM</div>
                  <div className="text-slate-400">Max Alt:</div>
                  <div className="text-white">{selectedTrack.maxAltitude} ft</div>
                  <div className="text-slate-400">Max Speed:</div>
                  <div className="text-white">{selectedTrack.maxSpeed} kts</div>
                  <div className="text-slate-400">Duration:</div>
                  <div className="text-white">{formatDuration(selectedTrack.duration)}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-4xl mb-4">🗺️</p>
                <p>Select a flight track to view playback</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add Flight Track</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddTrack}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Track Name</label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="e.g., XC to KORD"
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={addFormData.date}
                    onChange={(e) => setAddFormData({ ...addFormData, date: e.target.value })}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Aircraft</label>
                  <input
                    type="text"
                    value={addFormData.aircraft}
                    onChange={(e) => setAddFormData({ ...addFormData, aircraft: e.target.value })}
                    placeholder="e.g., N12345 - C172"
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Track Data (JSON)
                    <span className="text-xs text-slate-500 ml-2">
                      Format: [{"{"}lat, lng, alt, speed, timestamp{"}"}]
                    </span>
                  </label>
                  <textarea
                    value={addFormData.trackData}
                    onChange={(e) => setAddFormData({ ...addFormData, trackData: e.target.value })}
                    placeholder='[{"lat": 41.5, "lng": -81.7, "alt": 3000, "speed": 120, "timestamp": "2024-01-15T10:30:00Z"}]'
                    rows={6}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Paste JSON array of track points with lat, lng, alt (ft), speed (kts), timestamp
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightPlaybackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <FlightPlaybackContent />
    </Suspense>
  );
}
