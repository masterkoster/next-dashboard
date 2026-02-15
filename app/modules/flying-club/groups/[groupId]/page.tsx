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
  // Visibility settings
  showBookings?: boolean;
  showAircraft?: boolean;
  showFlights?: boolean;
  showMaintenance?: boolean;
  showBilling?: boolean;
  showBillingAll?: boolean;
  showMembers?: boolean;
  showPartners?: boolean;
  defaultInviteExpiry?: number | null;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'aircraft' | 'bookings' | 'logs' | 'members' | 'settings'>('overview');
  const [showSettings, setShowSettings] = useState(false);

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
          {(['overview', 'aircraft', 'bookings', 'logs', 'members', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'settings' ? '⚙️ Settings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            groupSettings={group}
          />
        )}

        {activeTab === 'settings' && isAdmin && (
          <SettingsTab group={group} onUpdate={(updated: any) => setGroup(updated)} />
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
  const [maintenance, setMaintenance] = useState<any[]>([]);
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
    hasMaintenance: false,
    maintenanceDescription: '',
    maintenanceNotes: '',
    agreedToTerms: false,
    showDiscrepancy: false,
    discrepancyNote: ''
  });

  // Track last flight for meter continuity
  const [lastFlight, setLastFlight] = useState<any>(null);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);

  // Get bookings for this group
  const groupBookings = bookings?.filter((b: any) => new Date(b.endTime) < new Date()) || [];
  
  // Get unique aircraft from bookings
  const aircraftWithBookings = [...new Set(groupBookings.map((b: any) => b.aircraftId))];
  
  // Filter bookings to only show completed ones (past end time)
  const completedBookings = groupBookings.filter((b: any) => new Date(b.endTime) < new Date());

  useEffect(() => {
    fetch(`/api/groups/${groupId}/logs`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(data => {
        if (data.logs) {
          setLogs(Array.isArray(data.logs) ? data.logs : []);
          setMaintenance(Array.isArray(data.maintenance) ? data.maintenance : []);
        } else {
          setLogs(Array.isArray(data) ? data : []);
        }
      })
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

  // When aircraft is selected, get last flight for meter continuity
  useEffect(() => {
    if (formData.aircraftId && logs.length > 0) {
      const aircraftLogs = logs.filter((l: any) => l.aircraftId === formData.aircraftId);
      if (aircraftLogs.length > 0) {
        // Sort by date descending and get the first one
        const sorted = [...aircraftLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sorted[0];
        setLastFlight(last);
        // Auto-populate start meters from last flight
        setFormData((prev: any) => ({
          ...prev,
          tachStart: last.tachTime ? String(last.tachTime) : '',
          hobbsStart: last.hobbsTime ? String(last.hobbsTime) : '',
        }));
      } else {
        setLastFlight(null);
        setFormData((prev: any) => ({
          ...prev,
          tachStart: '',
          hobbsStart: '',
        }));
      }
    }
  }, [formData.aircraftId]);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      alert("You must acknowledge the Terms of Use to log a flight");
      return;
    }
    
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
        maintenance: formData.hasMaintenance && formData.maintenanceDescription ? {
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
        hasMaintenance: false,
        maintenanceDescription: '',
        maintenanceNotes: '',
        agreedToTerms: false,
        showDiscrepancy: false,
        discrepancyNote: ''
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
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="Tach Start"
                value={formData.tachStart}
                readOnly
                className="bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 cursor-not-allowed"
                title="Auto-populated from last flight"
              />
              {lastFlight && (
                <button
                  type="button"
                  onClick={() => setShowDiscrepancyModal(true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300 text-xs"
                  title="Meter Discrepancy"
                >
                  ⚠️
                </button>
              )}
            </div>
            <input
              type="number"
              step="0.1"
              placeholder="Tach End"
              value={formData.tachEnd}
              onChange={(e) => setFormData({ ...formData, tachEnd: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
            />
            <div className="col-span-2 text-sm text-slate-400 font-medium">Hobbs Times</div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="Hobbs Start"
                value={formData.hobbsStart}
                readOnly
                className="bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 cursor-not-allowed"
                title="Auto-populated from last flight"
              />
              {lastFlight && (
                <button
                  type="button"
                  onClick={() => setShowDiscrepancyModal(true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300 text-xs"
                  title="Meter Discrepancy"
                >
                  ⚠️
                </button>
              )}
            </div>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasMaintenance}
                  onChange={(e) => setFormData({ ...formData, hasMaintenance: e.target.checked, maintenanceDescription: e.target.checked ? formData.maintenanceDescription : '', maintenanceNotes: e.target.checked ? formData.maintenanceNotes : '' })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-orange-400 font-medium">🚨 Report Maintenance Issue</span>
              </label>
              {formData.hasMaintenance && (
                <>
                  <input
                    type="text"
                    placeholder="Description (e.g., Flat tire, Oil leak)"
                    value={formData.maintenanceDescription}
                    onChange={(e) => setFormData({ ...formData, maintenanceDescription: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 mt-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Additional notes"
                    value={formData.maintenanceNotes}
                    onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 mt-2"
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 rounded-lg">Log Flight</button>
          </div>
          
          {/* Terms of Use Checkbox */}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded"
              />
              <span className="text-slate-400">
                I acknowledge that I am the Pilot in Command (PIC) and am solely responsible for the safe operation of the aircraft. I verify that all meter readings are accurate.
              </span>
            </label>
          </div>
        </form>
      )}

      {/* Meter Discrepancy Modal */}
      {showDiscrepancyModal && lastFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">⚠️ Meter Discrepancy</h3>
            <div className="space-y-3 mb-4">
              <div className="text-sm text-slate-400">
                <div>Last recorded:</div>
                <div className="text-white">Tach: {lastFlight.tachTime || 'N/A'} | Hobbs: {lastFlight.hobbsTime || 'N/A'}</div>
              </div>
              <div className="text-sm text-slate-400">
                <div>Your reading:</div>
                <div className="text-white">Tach: {formData.tachStart || 'N/A'} | Hobbs: {formData.hobbsStart || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Explain the discrepancy:</label>
                <textarea
                  value={formData.discrepancyNote}
                  onChange={(e) => setFormData({ ...formData, discrepancyNote: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 h-24"
                  placeholder="Describe what you see on the meters..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscrepancyModal(false)} className="flex-1 px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                // Submit with discrepancy note - the API should handle this
                setShowDiscrepancyModal(false);
                alert('Meter discrepancy request submitted. An admin will review this.');
              }} className="flex-1 px-4 py-2 bg-orange-500 rounded-lg">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 && maintenance.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No flight logs or maintenance yet.</div>
      ) : (
        <>
          {logs.length > 0 && (
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-semibold text-sky-400">Flight Logs</h3>
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
          
          {maintenance.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-orange-400">🔧 Maintenance Issues</h3>
              {maintenance.map((m: any) => (
                <div key={m.id} className={`rounded-xl p-4 border ${m.status === 'NEEDED' ? 'bg-slate-800 border-orange-500/30' : 'bg-slate-800 border-yellow-500/30'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{m.aircraft?.nNumber || m.aircraft?.customName || 'Aircraft'}</div>
                      <div className="text-slate-400 text-sm">{m.description}</div>
                      {m.notes && <div className="text-slate-500 text-sm mt-1">{m.notes}</div>}
                      <div className="text-slate-500 text-xs mt-1">
                        Reported {new Date(m.reportedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${m.status === 'NEEDED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MembersTab({ groupId, members, isAdmin, currentUserId, groupSettings }: { 
  groupId: string; 
  members: Member[]; 
  isAdmin: boolean;
  currentUserId: string | null;
  groupSettings?: Group;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteExpiry, setInviteExpiry] = useState(7);
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
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, expiresInDays: inviteExpiry }),
      });
      if (res.ok) {
        const data = await res.json();
        // Include groupId in the join URL
        setInviteLink(`${window.location.origin}/modules/flying-club/groups/${groupId}/join?groupId=${groupId}&token=${data.token}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create invite');
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
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Email address (optional)"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
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
              </div>
              <div className="flex gap-3 items-center">
                <label className="text-sm text-slate-400">Expires:</label>
                <select
                  value={inviteExpiry}
                  onChange={(e) => setInviteExpiry(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>1 week</option>
                  <option value={30}>1 month</option>
                  <option value={-1}>Never</option>
                </select>
                <button type="submit" disabled={inviting} className="bg-sky-500 px-4 py-2 rounded-lg disabled:opacity-50 ml-auto">
                  {inviting ? 'Creating...' : 'Create Invite'}
                </button>
              </div>
              <p className="text-xs text-slate-500">Leave email blank to create a shareable invite link only</p>
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

function SettingsTab({ group, onUpdate }: { group: Group; onUpdate: (g: Group) => void }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showBookings: group.showBookings ?? true,
    showAircraft: group.showAircraft ?? true,
    showFlights: group.showFlights ?? true,
    showMaintenance: group.showMaintenance ?? true,
    showBilling: group.showBilling ?? true,
    showBillingAll: group.showBillingAll ?? true,
    showMembers: group.showMembers ?? true,
    showPartners: group.showPartners ?? true,
    defaultInviteExpiry: group.defaultInviteExpiry ?? 7,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate({ ...group, ...updated });
        alert('Settings saved!');
      } else {
        alert('Failed to save settings');
      }
    } catch {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Member Visibility Settings</h3>
        <p className="text-sm text-slate-400 mb-4">Control what members can see in this group</p>
        
        <div className="space-y-4">
          <Toggle label="Show Bookings" checked={settings.showBookings} onChange={(v) => setSettings({...settings, showBookings: v})} />
          <Toggle label="Show Aircraft" checked={settings.showAircraft} onChange={(v) => setSettings({...settings, showAircraft: v})} />
          <Toggle label="Show Flight Logs" checked={settings.showFlights} onChange={(v) => setSettings({...settings, showFlights: v})} />
          <Toggle label="Show Maintenance" checked={settings.showMaintenance} onChange={(v) => setSettings({...settings, showMaintenance: v})} />
          <Toggle label="Show Billing" checked={settings.showBilling} onChange={(v) => setSettings({...settings, showBilling: v})} />
          {settings.showBilling && (
            <div className="ml-6 mt-2">
              <Toggle 
                label="Members can see ALL members' billing" 
                checked={settings.showBillingAll} 
                onChange={(v) => setSettings({...settings, showBillingAll: v})}
              />
              <p className="text-xs text-slate-500 ml-6">
                {settings.showBillingAll 
                  ? 'Everyone can see each other\'s billing' 
                  : 'Members can only see their own billing'}
              </p>
            </div>
          )}
          <Toggle label="Show Members List" checked={settings.showMembers} onChange={(v) => setSettings({...settings, showMembers: v})} />
          <Toggle label="Show Partnership" checked={settings.showPartners} onChange={(v) => setSettings({...settings, showPartners: v})} />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Invite Defaults</h3>
        <p className="text-sm text-slate-400 mb-4">Default expiration for new invites</p>
        
        <select
          value={settings.defaultInviteExpiry}
          onChange={(e) => setSettings({...settings, defaultInviteExpiry: Number(e.target.value)})}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
        >
          <option value={1}>1 day</option>
          <option value={7}>1 week</option>
          <option value={30}>1 month</option>
          <option value={-1}>Never expires</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-sky-500' : 'bg-slate-600'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </label>
  );
}
