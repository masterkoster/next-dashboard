'use client';

import { useState, useEffect } from 'react';

// Demo profiles for demo mode
const demoProfiles = [
  {
    id: 'demo-profile-1',
    userId: 'demo-user-1',
    availability: 'Weekends, Evenings',
    flightInterests: 'Cross Country,IFR,Night',
    homeAirport: 'KORD',
    experienceLevel: 'Private PPL',
    bio: 'Instrument rated pilot with 200 hours. Love cross-country flights and exploring new airports.',
    lookingFor: 'Weekend XC partner',
    city: 'Chicago',
    state: 'IL',
    latitude: 41.8781,
    longitude: -87.6298,
    isActive: true,
    user: { name: 'Mike Chen', email: 'mike@demo.com' }
  },
  {
    id: 'demo-profile-2',
    userId: 'demo-user-2',
    availability: 'Weekends',
    flightInterests: 'Sightseeing,Training',
    homeAirport: 'KMDW',
    experienceLevel: 'Student Pilot',
    bio: 'Working on my PPL. Looking for a mentor or flight buddy!',
    lookingFor: 'CFI or experienced pilot for mentorship',
    city: 'Chicago',
    state: 'IL',
    latitude: 41.7868,
    longitude: -87.6082,
    isActive: true,
    user: { name: 'Sarah Williams', email: 'sarah.w@demo.com' }
  },
  {
    id: 'demo-profile-3',
    userId: 'demo-user-3',
    availability: 'Flexible',
    flightInterests: 'Mountain,Coastal',
    homeAirport: 'KSFO',
    experienceLevel: 'Commercial',
    bio: 'Commercial pilot, 1500 hours. Love scenic flights along the coast and mountains.',
    lookingFor: 'Adventure flying partner',
    city: 'San Francisco',
    state: 'CA',
    latitude: 37.7749,
    longitude: -122.4194,
    isActive: true,
    user: { name: 'James Rodriguez', email: 'james@demo.com' }
  },
];

export default function PartnershipPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [filters, setFilters] = useState({ airport: '', state: '', experience: '' });
  const [mapProfiles, setMapProfiles] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [formData, setFormData] = useState({
    availability: '',
    flightInterests: '',
    homeAirport: '',
    experienceLevel: '',
    bio: '',
    lookingFor: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (!data?.user) {
          // Not logged in - use demo mode
          setIsDemoMode(true);
          setProfiles(demoProfiles);
          setMapProfiles(demoProfiles.filter((p: any) => p.latitude && p.longitude));
          setLoading(false);
        } else {
          // Logged in - load real data
          loadProfiles();
          loadMyProfile();
        }
      })
      .catch(() => {
        setIsDemoMode(true);
        setProfiles(demoProfiles);
        setMapProfiles(demoProfiles.filter((p: any) => p.latitude && p.longitude));
        setLoading(false);
      });
  }, [filters]);

  const loadProfiles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.airport) params.set('airport', filters.airport);
    if (filters.state) params.set('state', filters.state);
    if (filters.experience) params.set('experience', filters.experience);

    try {
      const res = await fetch(`/api/partnership?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        setMapProfiles(data.filter((p: any) => p.latitude && p.longitude));
      }
    } catch (e) {
      console.error('Error loading profiles:', e);
    }
    setLoading(false);
  };

  const loadMyProfile = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const userData = await res.json();
        const profileRes = await fetch('/api/partnership');
        if (profileRes.ok) {
          const allProfiles = await profileRes.json();
          const mine = allProfiles.find((p: any) => p.userId === userData.id);
          if (mine) {
            setMyProfile(mine);
            setFormData({
              availability: mine.availability || '',
              flightInterests: mine.flightInterests || '',
              homeAirport: mine.homeAirport || '',
              experienceLevel: mine.experienceLevel || '',
              bio: mine.bio || '',
              lookingFor: mine.lookingFor || '',
              city: mine.city || '',
              state: mine.state || ''
            });
          }
        }
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMyProfile(data);
        setShowEditForm(false);
        loadProfiles();
      } else {
        alert('Error: ' + (data.error || data.details || 'Failed to save'));
      }
    } catch (e) {
      console.error('Error saving profile:', e);
      alert('Error saving profile: ' + e);
    }
  };

  const experienceLevels = ['Student Pilot', 'Private PPL', 'Commercial', 'ATP', 'CFI', 'CFII', 'MEI'];
  const interestOptions = ['Cross Country', 'IFR', 'VFR', 'Sightseeing', 'Training', 'Night', 'Mountain', 'Coastal'];
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  // Filter profiles based on filters
  const filteredProfiles = profiles.filter((profile: any) => {
    if (filters.airport && profile.homeAirport !== filters.airport) return false;
    if (filters.state && profile.state !== filters.state) return false;
    if (filters.experience && profile.experienceLevel !== filters.experience) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🤝 Flying Partner Marketplace</h1>
            <p className="text-slate-400">Find other pilots in your area to fly with</p>
            {isDemoMode && (
              <span className="inline-block mt-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                Demo Mode - Sign in to create your profile
              </span>
            )}
          </div>
          {!isDemoMode && (
            <button
              onClick={() => { loadMyProfile(); setShowEditForm(true); }}
              className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium"
            >
              {myProfile ? '✏️ Edit My Profile' : '➕ Create Profile'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Home Airport</label>
              <input
                type="text"
                placeholder="e.g., KORD"
                value={filters.airport}
                onChange={(e) => setFilters({ ...filters, airport: e.target.value.toUpperCase() })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Levels</option>
                {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Map View */}
        {mapProfiles.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-medium">🗺️ Pilot Locations</h3>
              <p className="text-xs text-slate-400">{mapProfiles.length} pilots on map</p>
            </div>
            <div className="h-[300px] bg-slate-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-slate-400 text-sm">Interactive Map</p>
                  <p className="text-slate-500 text-xs">{mapProfiles.length} pilots near you</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {mapProfiles.slice(0, 6).map((p: any, i: number) => (
                      <div key={i} className="bg-slate-800 px-3 py-1 rounded-full text-xs">
                        {p.city}, {p.state} ✈️ {p.homeAirport}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Cards */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">🤝</div>
            <p>No pilots found matching your criteria</p>
            <p className="text-sm mt-2">Be the first to create a profile!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile: any) => (
              <div key={profile.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-lg">{profile.user?.name || 'Anonymous Pilot'}</div>
                    <div className="text-sky-400 text-sm">
                      📍 {profile.city}, {profile.state}
                    </div>
                  </div>
                  <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded">
                    {profile.experienceLevel}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  {profile.homeAirport && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>✈️</span> Home: <span className="font-mono">{profile.homeAirport}</span>
                    </div>
                  )}
                  {profile.availability && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>📅</span> {profile.availability}
                    </div>
                  )}
                  {profile.flightInterests && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <span>🎯</span> 
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {profile.flightInterests.split(',').map((interest: string, i: number) => (
                          <span key={i} className="text-xs bg-slate-700 px-2 py-0.5 rounded">{interest.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {profile.bio && (
                  <div className="mt-3 text-sm text-slate-400 italic">
                    "{profile.bio}"
                  </div>
                )}
                
                {profile.lookingFor && (
                  <div className="mt-3 text-xs text-slate-500">
                    Looking for: {profile.lookingFor}
                  </div>
                )}
                
                {!isDemoMode && (
                  <button className="mt-4 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm transition-colors">
                    📧 Contact
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {myProfile ? 'Edit Your Profile' : 'Create Your Profile'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                      placeholder="Chicago"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Home Airport (ICAO)</label>
                  <input
                    type="text"
                    value={formData.homeAirport}
                    onChange={(e) => setFormData({ ...formData, homeAirport: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 uppercase font-mono"
                    placeholder="KORD"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                  >
                    <option value="">Select</option>
                    {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    placeholder="Weekends, Evenings"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Flight Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const current = formData.flightInterests.split(',').map(s => s.trim()).filter(Boolean);
                          if (current.includes(interest)) {
                            setFormData({ ...formData, flightInterests: current.filter(i => i !== interest).join(', ') });
                          } else {
                            setFormData({ ...formData, flightInterests: [...current, interest].join(', ') });
                          }
                        }}
                        className={`text-xs px-3 py-1 rounded-full ${
                          formData.flightInterests.includes(interest)
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 h-20"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Looking For</label>
                  <input
                    type="text"
                    value={formData.lookingFor}
                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    placeholder="Weekend XC partner, IFR currency partner..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-500 rounded-lg font-medium"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
