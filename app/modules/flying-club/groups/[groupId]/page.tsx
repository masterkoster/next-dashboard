'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  description: string | null;
  dryRate: number | null;
  wetRate: number | null;
  customRates: string | null;
  ownerId: string;
  members: Member[];
  aircraft: Aircraft[];
  bookings?: any[];
}

interface Member {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Aircraft {
  id: string;
  nNumber: string | null;
  nickname: string | null;
  customName: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  totalTachHours: number | null;
  totalHobbsHours: number | null;
  registrationType: string | null;
  hasInsurance: boolean | null;
  maxPassengers: number | null;
  hourlyRate: number | null;
  aircraftNotes: string | null;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'aircraft' | 'bookings' | 'logs' | 'members'>('overview');

  useEffect(() => {
    // Get current user info from session
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data?.user?.email) {
        fetch('/api/users/me').then(r => r.json()).then(userData => {
          setCurrentUserId(userData.id);
        });
      }
    });

    fetch(`/api/groups/${params.groupId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load group');
        return res.json();
      })
      .then(setGroup)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.groupId]);

  const getUserRole = () => {
    if (!group || !currentUserId) return null;
    const member = group.members.find((m: Member) => m.userId === currentUserId);
    return member?.role || null;
  };

  const isAdmin = getUserRole() === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-slate-400">{error || 'Group not found'}</p>
          <button
            onClick={() => router.push('/modules/flying-club')}
            className="mt-6 text-sky-400 hover:underline"
          >
            ← Back to Flying Club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/modules/flying-club')}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to Groups
        </button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400">{group.name}</h1>
            {group.description && (
              <p className="text-slate-400 mt-1">{group.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${isAdmin ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-300'}`}>
              {getUserRole()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Aircraft</div>
            <div className="text-2xl font-bold">{group.aircraft.length}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Members</div>
            <div className="text-2xl font-bold">{group.members.length}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Dry Rate</div>
            <div className="text-2xl font-bold">${group.dryRate || '—'}/hr</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Wet Rate</div>
            <div className="text-2xl font-bold">${group.wetRate || '—'}/hr</div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-700 mb-6">
          {(['overview', 'aircraft', 'bookings', 'logs', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('aircraft')}
                  className="w-full text-left px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  + Add Aircraft
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="w-full text-left px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  📅 Book a Flight
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="w-full text-left px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  ✈️ Log Flight Time
                </button>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Recent Members</h3>
              <div className="space-y-3">
                {group.members.slice(0, 5).map((member: Member) => (
                  <div key={member.userId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{member.user.name || member.user.email}</div>
                      <div className="text-sm text-slate-400">{member.user.email}</div>
                    </div>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aircraft' && (
          <AircraftTab groupId={group.id} aircraft={group.aircraft} isAdmin={isAdmin} />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab groupId={group.id} aircraft={group.aircraft} canBook={!!getUserRole()} />
        )}

        {activeTab === 'logs' && (
          <LogsTab groupId={group.id} aircraft={group.aircraft} bookings={group.bookings} canLog={!!getUserRole()} />
        )}

        {activeTab === 'members' && (
          <MembersTab 
            groupId={group.id} 
            members={group.members} 
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}

function AircraftTab({ groupId, aircraft, isAdmin }: { groupId: string; aircraft: Aircraft[]; isAdmin: boolean }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nNumber: '',
    nickname: '',
    customName: '',
    make: '',
    model: '',
    year: '',
    totalTachHours: '',
    totalHobbsHours: '',
    registrationType: 'Standard',
    hasInsurance: false,
    maxPassengers: '4',
    hourlyRate: '',
    aircraftNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(aircraft);

  // Sync local list when prop changes
  useEffect(() => {
    setList(aircraft);
  }, [aircraft]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/aircraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nNumber: formData.nNumber || null,
          nickname: formData.nickname || null,
          customName: formData.customName || null,
          make: formData.make || null,
          model: formData.model || null,
          year: formData.year ? parseInt(formData.year) : null,
          totalTachHours: formData.totalTachHours ? parseFloat(formData.totalTachHours) : null,
          totalHobbsHours: formData.totalHobbsHours ? parseFloat(formData.totalHobbsHours) : null,
          registrationType: formData.registrationType || null,
          hasInsurance: formData.hasInsurance,
          maxPassengers: formData.maxPassengers ? parseInt(formData.maxPassengers) : null,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          notes: formData.aircraftNotes || null,
        }),
      });
      if (res.ok) {
        const newAircraft = await res.json();
        setList([...list, newAircraft]);
        setShowAddForm(false);
        setFormData({
          nNumber: '',
          nickname: '',
          customName: '',
          make: '',
          model: '',
          year: '',
          totalTachHours: '',
          totalHobbsHours: '',
          registrationType: 'Standard',
          hasInsurance: false,
          maxPassengers: '4',
          hourlyRate: '',
          aircraftNotes: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this aircraft?')) return;
    const res = await fetch(`/api/groups/${groupId}/aircraft/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setList(list.filter((a: Aircraft) => a.id !== id));
    }
  };

  return (
    <div>
      {isAdmin && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Aircraft
        </button>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Aircraft</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="N-Number (e.g., N123AB)"
              value={formData.nNumber}
              onChange={(e) => setFormData({ ...formData, nNumber: e.target.value.toUpperCase() })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Nickname (optional)"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Custom Name"
              value={formData.customName}
              onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Hourly Rate ($)"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Make (e.g., Cessna)"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Model (e.g., 172S)"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Total Tach Hours"
              value={formData.totalTachHours}
              onChange={(e) => setFormData({ ...formData, totalTachHours: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Total Hobbs Hours"
              value={formData.totalHobbsHours}
              onChange={(e) => setFormData({ ...formData, totalHobbsHours: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <select
              value={formData.registrationType}
              onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            >
              <option value="Standard">Standard</option>
              <option value="Experimental">Experimental</option>
              <option value="Light Sport">Light Sport</option>
              <option value="Ultralight">Ultralight</option>
            </select>
            <input
              type="number"
              placeholder="Max Passengers"
              value={formData.maxPassengers}
              onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasInsurance"
                checked={formData.hasInsurance}
                onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="hasInsurance" className="text-slate-300">Has Insurance</label>
            </div>
            <textarea
              placeholder="Notes"
              value={formData.aircraftNotes}
              onChange={(e) => setFormData({ ...formData, aircraftNotes: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 col-span-2 h-20"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-500 rounded-lg disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Aircraft'}
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No aircraft yet. Add one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((ac: Aircraft) => (
            <div key={ac.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{ac.nNumber || 'Custom'}</div>
                  <div className="text-slate-400">{ac.nickname || ac.customName || 'Unnamed'}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(ac.id)} className="text-red-400 hover:text-red-300">×</button>
                )}
              </div>
              <div className="mt-2 text-sm text-slate-400 space-y-1">
                {ac.make && <div>{ac.make} {ac.model} {ac.year}</div>}
                {ac.totalTachHours !== null && <div>Tach: {Number(ac.totalTachHours).toFixed(1)} hrs</div>}
                {ac.totalHobbsHours !== null && <div>Hobbs: {Number(ac.totalHobbsHours).toFixed(1)} hrs</div>}
                {ac.hourlyRate && <div className="text-sky-400 font-medium">${Number(ac.hourlyRate).toFixed(0)}/hr</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingsTab({ groupId, aircraft, canBook }: { groupId: string; aircraft: Aircraft[]; canBook: boolean }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ aircraftId: '', date: '', startTime: '', endTime: '', purpose: '' });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch(`/api/groups/${groupId}/bookings`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = new Date(`${formData.date}T${formData.startTime}`);
    const endTime = new Date(`${formData.date}T${formData.endTime}`);
    
    const res = await fetch(`/api/groups/${groupId}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aircraftId: formData.aircraftId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose: formData.purpose,
      }),
    });
    
    if (res.ok) {
      const newBooking = await res.json();
      setBookings([...bookings, newBooking]);
      setShowForm(false);
      setFormData({ aircraftId: '', date: '', startTime: '', endTime: '', purpose: '' });
    }
  };

  const quickDates = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { label: 'Next Week', date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] },
  ];

  const timeSlots = [
    { label: 'Morning (8AM)', start: '08:00', end: '12:00' },
    { label: 'Afternoon (12PM)', start: '12:00', end: '17:00' },
    { label: 'Evening (5PM)', start: '17:00', end: '20:00' },
    { label: 'Full Day', start: '08:00', end: '18:00' },
  ];

  if (loading) return <div className="text-center py-12">Loading bookings...</div>;

  return (
    <div>
      {canBook && !showForm && (
        <button onClick={() => setShowForm(true)} className="mb-4 bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
          + New Booking
        </button>
      )}

      {showForm && (
        <form onSubmit={handleBook} className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Booking</h3>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.aircraftId}
              onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            >
              <option value="">Select Aircraft</option>
              {aircraft.map((ac: Aircraft) => (
                <option key={ac.id} value={ac.id}>{ac.nNumber || ac.customName || ac.id}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.date}
                min={today}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 flex-1"
                required
              />
            </div>
            
            <div className="col-span-2">
              <div className="text-sm text-slate-400 mb-2">Quick Select Date:</div>
              <div className="flex gap-2 flex-wrap">
                {quickDates.map((qd) => (
                  <button
                    key={qd.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, date: qd.date })}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      formData.date === qd.date 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-sm text-slate-400 mb-2">Quick Select Time:</div>
              <div className="flex gap-2 flex-wrap">
                {timeSlots.map((ts) => (
                  <button
                    key={ts.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, startTime: ts.start, endTime: ts.end })}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      formData.startTime === ts.start 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="time"
              placeholder="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            <input
              type="time"
              placeholder="End Time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="Purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 rounded-lg">Book</button>
          </div>
        </form>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No bookings yet.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {new Date(booking.startTime).toLocaleDateString()} •{' '}
                  {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-slate-400 text-sm">{booking.purpose || 'No purpose specified'}</div>
              </div>
              <span className="text-sky-400">{booking.aircraft?.nNumber || booking.aircraft?.customName || 'Aircraft'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogsTab({ groupId, aircraft, bookings, canLog }: { groupId: string; aircraft: Aircraft[]; bookings?: any[]; canLog: boolean }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    bookingId: '', 
    aircraftId: '', 
    date: '', 
    tachStart: '', 
    tachEnd: '',
    hobbsStart: '', 
    hobbsEnd: '', 
    notes: '',
    maintenanceDescription: '',
    maintenanceNotes: ''
  });

  // Get bookings for this group
  const groupBookings = bookings?.filter((b: any) => new Date(b.endTime) < new Date()) || [];
  
  // Get unique aircraft from bookings
  const aircraftWithBookings = [...new Set(groupBookings.map((b: any) => b.aircraftId))];
  
  // Filter bookings to only show completed ones (past end time)
  const completedBookings = groupBookings.filter((b: any) => new Date(b.endTime) < new Date());

  useEffect(() => {
    fetch(`/api/groups/${groupId}/logs`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(e => {
        console.error('Error loading logs:', e);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleBookingSelect = (bookingId: string) => {
    const booking = completedBookings.find((b: any) => b.id === bookingId);
    if (booking) {
      setFormData({
        ...formData,
        bookingId,
        aircraftId: booking.aircraftId,
        date: new Date(booking.startTime).toISOString().split('T')[0],
        notes: booking.purpose || '',
      });
    }
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/groups/${groupId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aircraftId: formData.aircraftId,
        date: formData.date,
        tachStart: formData.tachStart ? parseFloat(formData.tachStart) : null,
        tachEnd: formData.tachEnd ? parseFloat(formData.tachEnd) : null,
        hobbsStart: formData.hobbsStart ? parseFloat(formData.hobbsStart) : null,
        hobbsEnd: formData.hobbsEnd ? parseFloat(formData.hobbsEnd) : null,
        notes: formData.notes,
        maintenance: formData.maintenanceDescription ? {
          description: formData.maintenanceDescription,
          notes: formData.maintenanceNotes
        } : null,
      }),
    });
    
    if (res.ok) {
      const newLog = await res.json();
      setLogs([...logs, newLog]);
      setShowForm(false);
      setFormData({ 
        bookingId: '',
        aircraftId: '', 
        date: '', 
        tachStart: '', 
        tachEnd: '',
        hobbsStart: '', 
        hobbsEnd: '', 
        notes: '',
        maintenanceDescription: '',
        maintenanceNotes: ''
      });
    }
  };

  if (loading) return <div className="text-center py-12">Loading flight logs...</div>;

  return (
    <div>
      {canLog && !showForm && (
        <button onClick={() => setShowForm(true)} className="mb-4 bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
          + Log Flight
        </button>
      )}

      {showForm && (
        <form onSubmit={handleLog} className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Log Flight Time</h3>
          <div className="grid grid-cols-2 gap-4">
            {completedBookings.length > 0 ? (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Booking (optional - pre-fills details)</label>
                  <select
                    value={formData.bookingId}
                    onChange={(e) => handleBookingSelect(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    <option value="">-- Select a past booking --</option>
                    {completedBookings.map((booking: any) => (
                      <option key={booking.id} value={booking.id}>
                        {new Date(booking.startTime).toLocaleDateString()} - {booking.aircraft?.nNumber || booking.aircraft?.customName || 'Aircraft'} - {booking.purpose || 'Flight'}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
            
            <select
              value={formData.aircraftId}
              onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value, bookingId: '' })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            >
              <option value="">Select Aircraft</option>
              {aircraft.map((ac: Aircraft) => (
                <option key={ac.id} value={ac.id}>{ac.nNumber || ac.customName || ac.id}</option>
              ))}
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            <div className="col-span-2 text-sm text-slate-400 font-medium">Tach Times</div>
            <input
              type="number"
              step="0.1"
              placeholder="Tach Start"
              value={formData.tachStart}
              onChange={(e) => setFormData({ ...formData, tachStart: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Tach End"
              value={formData.tachEnd}
              onChange={(e) => setFormData({ ...formData, tachEnd: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <div className="col-span-2 text-sm text-slate-400 font-medium">Hobbs Times</div>
            <input
              type="number"
              step="0.1"
              placeholder="Hobbs Start"
              value={formData.hobbsStart}
              onChange={(e) => setFormData({ ...formData, hobbsStart: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Hobbs End"
              value={formData.hobbsEnd}
              onChange={(e) => setFormData({ ...formData, hobbsEnd: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 col-span-2"
            />
            <div className="col-span-2 border-t border-slate-600 pt-4 mt-2">
              <div className="text-sm text-orange-400 font-medium mb-2">🚨 Report Maintenance Issue</div>
              <input
                type="text"
                placeholder="Description (e.g., Flat tire, Oil leak)"
                value={formData.maintenanceDescription}
                onChange={(e) => setFormData({ ...formData, maintenanceDescription: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 mb-2"
              />
              <input
                type="text"
                placeholder="Additional notes"
                value={formData.maintenanceNotes}
                onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 rounded-lg">Log Flight</button>
          </div>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No flight logs yet.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {new Date(log.date).toLocaleDateString()} • {log.aircraft?.nNumber || log.aircraft?.customName || 'Aircraft'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Tach: {log.tachTime ? Number(log.tachTime).toFixed(1) : '—'} hrs • Hobbs: {log.hobbsTime ? Number(log.hobbsTime).toFixed(1) : '—'} hrs
                    {log.calculatedCost && <span className="ml-2 text-sky-400">• ${Number(log.calculatedCost).toFixed(2)}</span>}
                  </div>
                  {log.notes && <div className="text-slate-500 text-sm mt-1">{log.notes}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersTab({ groupId, members, isAdmin, currentUserId }: { 
  groupId: string; 
  members: Member[]; 
  isAdmin: boolean;
  currentUserId: string | null;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteLink(`${window.location.origin}/modules/flying-club/groups/${groupId}/join?token=${data.token}`);
      }
    } finally {
      setInviting(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    const res = await fetch(`/api/groups/${groupId}/members?memberId=${currentUserId}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      router.push('/modules/flying-club');
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to leave group');
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Invite Members</h3>
          {!inviteLink ? (
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              >
                <option value="VIEWER">Viewer</option>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit" disabled={inviting} className="bg-sky-500 px-4 py-2 rounded-lg disabled:opacity-50">
                {inviting ? 'Sending...' : 'Invite'}
              </button>
            </form>
          ) : (
            <div>
              <p className="text-green-400 mb-2">Invite sent! Share this link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                  className="bg-slate-600 px-4 py-2 rounded-lg"
                >
                  Copy
                </button>
                <button
                  onClick={() => { setInviteLink(null); setInviteEmail(''); }}
                  className="bg-slate-600 px-4 py-2 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {members.map((member: Member) => (
          <div key={member.userId} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex justify-between items-center">
            <div>
              <div className="font-medium">{member.user.name || member.user.email}</div>
              <div className="text-slate-400 text-sm">{member.user.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded ${
                member.role === 'ADMIN' ? 'bg-sky-500/20 text-sky-400' :
                member.role === 'MEMBER' ? 'bg-green-500/20 text-green-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {member.role}
              </span>
              {member.userId === currentUserId && !isAdmin && (
                <button
                  onClick={handleLeaveGroup}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Leave
                </button>
              )}
              {member.userId === currentUserId && (
                <span className="text-xs text-slate-500">(You)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
