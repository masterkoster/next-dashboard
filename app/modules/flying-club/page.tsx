'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string | null;
  dryRate: number | null;
  wetRate: number | null;
  aircraft?: Aircraft[];
  role?: string;
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

interface Booking {
  id: string;
  aircraftId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string | null;
  aircraft: Aircraft;
  groupName: string;
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FlyingClubPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'aircraft' | 'flights' | 'maintenance' | 'billing' | 'members' | 'status'>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [userGroups, setUserGroups] = useState<{ group: Group; role: string; members: Member[] }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [groupsRes, bookingsRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/groups/all-bookings')
      ]);
      
      const groupsData = groupsRes.ok ? await groupsRes.json() : [];
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
      
      setGroups(groupsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getBookingsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return bookings.filter(booking => {
      if (selectedGroup !== 'all' && booking.groupName !== selectedGroup) return false;
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleBookingHover = (booking: Booking, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredBooking(booking);
  };

  const filteredBookings = selectedGroup === 'all' 
    ? bookings 
    : bookings.filter(b => b.groupName === selectedGroup);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // If no groups, show create group prompt
  if (groups.length === 0) {
    return (
      <NoGroupsPage />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          {(['dashboard', 'bookings', 'aircraft', 'flights', 'status', 'maintenance', 'billing', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'dashboard' && '📊 '}
              {tab === 'bookings' && '📅 '}
              {tab === 'aircraft' && '✈️ '}
              {tab === 'flights' && '🛫 '}
              {tab === 'status' && '📋 '}
              {tab === 'maintenance' && '🔧 '}
              {tab === 'billing' && '💰 '}
              {tab === 'members' && '👥 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sky-400">Flying Club</h1>
            <p className="text-slate-400">Book flights and track your group&apos;s schedule</p>
          </div>
          <div className="flex gap-3">
            {groups.length > 1 && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.name}>{group.name}</option>
                ))}
              </select>
            )}
            <Link
              href="/modules/flying-club/groups/new"
              className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + New Group
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
        {/* Calendar */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 bg-slate-750 border-b border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-700">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] border-b border-r border-slate-700 p-2 ${
                  day ? 'hover:bg-slate-750' : 'bg-slate-800/50'
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium mb-1">{day}</div>
                    <div className="space-y-1">
                      {getBookingsForDay(day).map(booking => (
                        <div
                          key={booking.id}
                          onMouseEnter={(e) => handleBookingHover(booking, e)}
                          onMouseLeave={() => setHoveredBooking(null)}
                          className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded truncate cursor-pointer hover:bg-sky-500/30 transition-colors"
                        >
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {booking.aircraft.nNumber || booking.aircraft.customName || 'Aircraft'}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredBooking && (
          <div
            className="fixed z-50 bg-slate-700 text-white text-sm rounded-lg shadow-xl p-3 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 10,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold">{hoveredBooking.groupName}</div>
            <div className="text-sky-400">
              {hoveredBooking.aircraft.nNumber} - {hoveredBooking.aircraft.customName || hoveredBooking.aircraft.nickname || 'Aircraft'}
            </div>
            <div className="text-slate-300 text-xs mt-1">
              {new Date(hoveredBooking.startTime).toLocaleString()} - {new Date(hoveredBooking.endTime).toLocaleTimeString()}
            </div>
            {hoveredBooking.purpose && (
              <div className="text-slate-400 text-xs">{hoveredBooking.purpose}</div>
            )}
          </div>
        )}

        {/* Upcoming Bookings */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Flights</h3>
          <div className="space-y-2">
            {filteredBookings
              .filter(b => new Date(b.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 5)
              .map(booking => (
                <div key={booking.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{booking.groupName}</div>
                    <div className="text-sky-400">{booking.aircraft.nNumber} - {booking.aircraft.customName || booking.aircraft.nickname}</div>
                    <div className="text-slate-400 text-sm">
                      {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Link
                    href={`/modules/flying-club/groups/${groups.find(g => g.name === booking.groupName)?.id}`}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    View →
                  </Link>
                </div>
              ))}
            {filteredBookings.filter(b => new Date(b.startTime) > new Date()).length === 0 && (
              <div className="text-slate-400 text-center py-8">No upcoming flights</div>
            )}
          </div>
        </div>
        </>
        )}

        {activeTab === 'bookings' && (
          <BookingsList bookings={filteredBookings} groups={groups} />
        )}

        {activeTab === 'aircraft' && (
          <AircraftList groups={groups} />
        )}

        {activeTab === 'flights' && (
          <FlightsList groups={groups} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceList groups={groups} />
        )}

        {activeTab === 'status' && (
          <AircraftStatus groups={groups} />
        )}

        {activeTab === 'billing' && (
          <BillingView groups={groups} />
        )}

        {activeTab === 'members' && (
          <MembersList groups={groups} />
        )}
      </div>
    </div>
  );
}

function BookingsList({ bookings, groups }: { bookings: Booking[]; groups: Group[] }) {
  const router = useRouter();
  
  const getGroupId = (groupName: string) => {
    const group = groups.find(g => g.name === groupName);
    return group?.id;
  };

  const pastBookings = bookings.filter(b => new Date(b.endTime) < new Date()).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const upcomingBookings = bookings.filter(b => new Date(b.endTime) >= new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Link href="/modules/flying-club/groups/new" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
          + New Booking
        </Link>
      </div>

      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-sky-400">Upcoming</h3>
          <div className="space-y-3">
            {upcomingBookings.map(booking => (
              <div 
                key={booking.id} 
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-sky-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{booking.groupName}</div>
                    <div className="text-sky-400">{booking.aircraft.nNumber} - {booking.aircraft.customName || booking.aircraft.nickname}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      {new Date(booking.startTime).toLocaleDateString()} • {' '}
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                      {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {booking.purpose && <div className="text-slate-500 text-sm mt-1">{booking.purpose}</div>}
                  </div>
                  <button
                    onClick={() => router.push(`/modules/flying-club/groups/${getGroupId(booking.groupName)}`)}
                    className="text-sky-400 hover:text-sky-300 text-sm"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-slate-400">Past</h3>
          <div className="space-y-3">
            {pastBookings.map(booking => (
              <div key={booking.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 opacity-60">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{booking.groupName}</div>
                    <div className="text-slate-400">{booking.aircraft.nNumber} - {booking.aircraft.customName || booking.aircraft.nickname}</div>
                    <div className="text-slate-500 text-sm">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/modules/flying-club/groups/${getGroupId(booking.groupName)}`)}
                    className="text-slate-400 hover:text-slate-300 text-sm"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">📅</div>
          <p>No bookings yet</p>
        </div>
      )}
    </div>
  );
}

function AircraftList({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [allAircraft, setAllAircraft] = useState<{ aircraft: any; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAircraft = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }
      const data: { aircraft: any; groupName: string }[] = [];
      for (const group of groups) {
        if (!group?.id) continue;
        try {
          const res = await fetch(`/api/groups/${group.id}/aircraft`);
          if (res.ok) {
            const aircraft = await res.json();
            if (Array.isArray(aircraft)) {
              aircraft.forEach((ac: any) => data.push({ aircraft: ac, groupName: group.name }));
            }
          }
        } catch (e) {
          console.error('Error loading aircraft:', e);
        }
      }
      setAllAircraft(data);
      setLoading(false);
    };
    loadAircraft();
  }, [groups]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Aircraft</h2>
        <Link href="/modules/flying-club/groups/new" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
          + Add Aircraft
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAircraft.map(({ aircraft, groupName }) => (
          <div key={aircraft.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-sky-500 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-lg">{aircraft.nNumber || 'Custom'}</div>
                <div className="text-slate-400">{aircraft.customName || aircraft.nickname || 'Unnamed'}</div>
              </div>
              <button
                onClick={() => router.push(`/modules/flying-club/groups/${groups.find(g => g.name === groupName)?.id}`)}
                className="text-sky-400 hover:text-sky-300 text-sm"
              >
                →
              </button>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              {aircraft.make && <div>{aircraft.make} {aircraft.model} {aircraft.year}</div>}
              {aircraft.totalTachHours && <div>Tach: {Number(aircraft.totalTachHours).toFixed(1)} hrs</div>}
              {aircraft.totalHobbsHours && <div>Hobbs: {Number(aircraft.totalHobbsHours).toFixed(1)} hrs</div>}
              {aircraft.hourlyRate && <div className="text-sky-400">${Number(aircraft.hourlyRate)}/hr</div>}
            </div>
          </div>
        ))}
      </div>

      {allAircraft.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">✈️</div>
          <p>No aircraft yet</p>
        </div>
      )}
    </div>
  );
}

function FlightsList({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [allLogs, setAllLogs] = useState<{ log: any; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterAircraft, setFilterAircraft] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }
      const data: { log: any; groupName: string }[] = [];
      for (const group of groups) {
        if (!group?.id) continue;
        try {
          const res = await fetch(`/api/groups/${group.id}/logs`);
          if (res.ok) {
            const logs = await res.json();
            if (Array.isArray(logs)) {
              logs.forEach((log: any) => data.push({ log, groupName: group.name }));
            }
          }
        } catch (e) {
          console.error('Error loading logs:', e);
        }
      }
      const validLogs = data.filter(item => item.log?.date);
      setAllLogs(validLogs.sort((a, b) => new Date(b.log.date).getTime() - new Date(a.log.date).getTime()));
      setLoading(false);
    };
    loadLogs();
  }, [groups]);

  const filteredLogs = allLogs.filter(({ log, groupName }) => {
    if (filterUser) {
      const userName = log.user?.name || log.user?.email || '';
      if (!userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
    }
    if (filterAircraft) {
      const aircraftId = log.aircraft?.id || '';
      if (aircraftId !== filterAircraft) return false;
    }
    if (filterDateFrom) {
      const logDate = new Date(log.date).toISOString().split('T')[0];
      if (logDate < filterDateFrom) return false;
    }
    if (filterDateTo) {
      const logDate = new Date(log.date).toISOString().split('T')[0];
      if (logDate > filterDateTo) return false;
    }
    return true;
  });

  const uniqueUsers = Array.from(new Set(allLogs.map(l => l.log.user?.name || l.log.user?.email).filter(Boolean)));
  const uniqueAircraft = allLogs
    .filter(l => l.log.aircraft?.id)
    .map(l => l.log.aircraft)
    .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Flight Logs</h2>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Pilot</label>
            <input
              type="text"
              placeholder="Search pilot..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Aircraft</label>
            <select
              value={filterAircraft}
              onChange={(e) => setFilterAircraft(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Aircraft</option>
              {uniqueAircraft.map(ac => (
                <option key={ac.id} value={ac.id}>{ac.nNumber || ac.customName || ac.nickname || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        {(filterUser || filterAircraft || filterDateFrom || filterDateTo) && (
          <div className="mt-3 flex gap-2">
            <span className="text-xs text-slate-400">
              Showing {filteredLogs.length} of {allLogs.length} logs
            </span>
            <button
              onClick={() => { setFilterUser(''); setFilterAircraft(''); setFilterDateFrom(''); setFilterDateTo(''); }}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">🛫</div>
          <p>{allLogs.length === 0 ? 'No flight logs yet' : 'No logs match your filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(({ log, groupName }) => (
            <div key={log.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">
                    {new Date(log.date).toLocaleDateString()} • {log.aircraft?.nNumber || log.aircraft?.customName || 'Aircraft'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {groupName} • 
                    Tach: {log.tachTime ? Number(log.tachTime).toFixed(1) : '—'} hrs • 
                    Hobbs: {log.hobbsTime ? Number(log.hobbsTime).toFixed(1) : '—'} hrs
                    {log.calculatedCost && <span className="ml-2 text-sky-400">• ${Number(log.calculatedCost).toFixed(2)}</span>}
                  </div>
                  {log.notes && <div className="text-slate-500 text-sm mt-1">{log.notes}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{log.user?.name || log.user?.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersList({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [allMembers, setAllMembers] = useState<{ member: any; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }
      const data: { member: any; groupName: string }[] = [];
      for (const group of groups) {
        if (!group?.id) continue;
        try {
          const res = await fetch(`/api/groups/${group.id}/members`);
          if (res.ok) {
            const members = await res.json();
            if (Array.isArray(members)) {
              members.forEach((m: any) => data.push({ member: m, groupName: group.name }));
            }
          }
        } catch (e) {
          console.error('Error loading members:', e);
        }
      }
      setAllMembers(data);
      setLoading(false);
    };
    loadMembers();
  }, [groups]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  // Group members by email
  const membersByEmail: Record<string, { member: any; groups: string[] }> = {};
  allMembers.forEach(({ member, groupName }) => {
    const email = member.user.email;
    if (!membersByEmail[email]) {
      membersByEmail[email] = { member, groups: [] };
    }
    membersByEmail[email].groups.push(groupName);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Members</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(membersByEmail).map(([email, { member, groups }]) => (
          <div key={email} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="font-medium">{member.user.name || email}</div>
            <div className="text-slate-400 text-sm">{email}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {groups.map(g => (
                <span key={g} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded">{g}</span>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-2">{member.role}</div>
          </div>
        ))}
      </div>

      {allMembers.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">👥</div>
          <p>No members yet</p>
        </div>
      )}
    </div>
  );
}

function MaintenanceList({ groups }: { groups: Group[] }) {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [formData, setFormData] = useState({ aircraftId: '', description: '', notes: '' });

  useEffect(() => {
    fetch('/api/maintenance')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || err.details || 'Failed to load');
        }
        return res.json();
      })
      .then(data => {
        console.log('Maintenance data:', data);
        setMaintenance(Array.isArray(data) ? data : []);
      })
      .catch(e => {
        console.error('Maintenance load error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const userGroups = groups?.filter((g: any) => g.role === 'ADMIN' || g.role === 'MEMBER') || [];
  
  const selectedGroup = userGroups.find((g: any) => g.id === selectedGroupId);
  const groupAircraft = selectedGroupId ? (selectedGroup?.aircraft || []) : userGroups.flatMap((g: any) => g.aircraft || []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        groupId: selectedGroupId,
      }),
    });
    if (res.ok) {
      setShowAddForm(false);
      setFormData({ aircraftId: '', description: '', notes: '' });
      setSelectedGroupId('');
      const reloadRes = await fetch('/api/maintenance');
      if (reloadRes.ok) {
        setMaintenance(await reloadRes.json());
      }
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Failed to submit'));
    }
  };

  const userGroupIds = userGroups.map((g: any) => g.id);
  let filteredMaintenance = maintenance.filter((m: any) => {
    return m.groupId && userGroupIds.includes(m.groupId);
  });
  
  if (selectedGroupId) {
    filteredMaintenance = filteredMaintenance.filter((m: any) => m.groupId === selectedGroupId);
  }
  if (selectedAircraftId) {
    filteredMaintenance = filteredMaintenance.filter((m: any) => m.aircraftId === selectedAircraftId);
  }
  
  const needed = filteredMaintenance.filter((m: any) => m.status === 'NEEDED' || m.status === 'IN_PROGRESS');
  const done = filteredMaintenance.filter((m: any) => m.status === 'DONE');

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Maintenance</h2>
        {userGroups.length > 0 && (
          <button onClick={() => setShowAddForm(true)} className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
            + Report Issue
          </button>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Group</label>
            <select
              value={selectedGroupId}
              onChange={(e) => { setSelectedGroupId(e.target.value); setSelectedAircraftId(''); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Groups</option>
              {userGroups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Aircraft</label>
            <select
              value={selectedAircraftId}
              onChange={(e) => setSelectedAircraftId(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Aircraft</option>
              {groupAircraft.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nNumber || a.customName || a.nickname || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {(selectedGroupId || selectedAircraftId) && (
              <button
                onClick={() => { setSelectedGroupId(''); setSelectedAircraftId(''); }}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Report Maintenance Issue</h3>
          <div className="space-y-4">
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setFormData({ ...formData, aircraftId: '' });
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            >
              <option value="">Select Group</option>
              {userGroups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {selectedGroupId && (
              <select
                value={formData.aircraftId}
                onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                required
              >
                <option value="">Select Aircraft</option>
                {groupAircraft.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.nNumber || a.customName || a.nickname || 'Unknown'}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Description (e.g., Flat tire, Oil leak)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            <textarea
              placeholder="Additional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 h-20"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 rounded-lg">Submit</button>
          </div>
        </form>
      )}

      {needed.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">🔧 Needed</h3>
          <div className="space-y-3">
            {needed.map((m: any) => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-4 border border-orange-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Aircraft ID: {m.aircraftId}</div>
                    <div className="text-slate-400 text-sm">{m.description}</div>
                    {m.notes && <div className="text-slate-500 text-sm mt-1">{m.notes}</div>}
                    <div className="text-slate-500 text-xs mt-1">
                      Reported {new Date(m.reportedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    m.status === 'NEEDED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-green-400">✅ Done</h3>
          <div className="space-y-3">
            {done.map((m: any) => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 opacity-60">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Aircraft ID: {m.aircraftId}</div>
                    <div className="text-slate-400 text-sm">{m.description}</div>
                    {m.notes && <div className="text-slate-500 text-sm mt-1">{m.notes}</div>}
                    <div className="text-slate-500 text-xs mt-1">
                      {m.resolvedDate ? `Resolved ${new Date(m.resolvedDate).toLocaleDateString()}` : ''}
                      {m.cost && ` • $${m.cost}`}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">DONE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {maintenance.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">🔧</div>
          <p>No maintenance issues reported</p>
        </div>
      )}
    </div>
  );
}

function BillingView({ groups }: { groups: Group[] }) {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin of any group
  const isAdmin = groups?.some((g: any) => g.role === 'ADMIN') || false;

  useEffect(() => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    fetch(`/api/billing?month=${month}&year=${year}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load billing')))
      .then(data => setBilling(data))
      .catch(e => {
        console.error('Billing load error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [month, year, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-4">🔒</div>
        <p>Only admins can view billing</p>
      </div>
    );
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) return <div className="text-center py-12">Loading...</div>;
  
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">💰 Billing Statement</h2>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : billing?.error ? (
        <div className="text-center py-12 text-red-400">{billing.error}</div>
      ) : billing?.members?.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">📄</div>
          <p>No flights logged this month</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Members</div>
              <div className="text-2xl font-bold">{billing?.totalMembers || 0}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Flights</div>
              <div className="text-2xl font-bold">{billing?.totalFlights || 0}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Hobbs</div>
              <div className="text-2xl font-bold">{Number(billing?.totalHobbs || 0).toFixed(1)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Owed</div>
              <div className="text-2xl font-bold text-green-400">${Number(billing?.totalCost || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Member Statements */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left p-4">Member</th>
                  <th className="text-right p-4">Flights</th>
                  <th className="text-right p-4">Hobbs</th>
                  <th className="text-right p-4">Cost</th>
                </tr>
              </thead>
              <tbody>
                {billing?.members?.map((member: any, i: number) => (
                  <tr key={i} className="border-t border-slate-700">
                    <td className="p-4">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-slate-400">{member.email}</div>
                    </td>
                    <td className="text-right p-4">{member.flights}</td>
                    <td className="text-right p-4">{Number(member.totalHobbs).toFixed(1)}</td>
                    <td className="text-right p-4 font-bold text-green-400">${Number(member.totalCost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function NoGroupsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupData, setGroupData] = useState({
    id: '',
    name: '',
    description: '',
    dryRate: '',
    wetRate: ''
  });
  const [invites, setInvites] = useState([{ email: '', name: '' }]);
  const [aircraftData, setAircraftData] = useState({
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
    notes: ''
  });

  const handleCreateGroup = async () => {
    if (!groupData.name) {
      setError('Group name is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...groupData,
          dryRate: groupData.dryRate ? parseFloat(groupData.dryRate) : null,
          wetRate: groupData.wetRate ? parseFloat(groupData.wetRate) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create group');
      const group = await res.json();
      setGroupData({ ...groupData, id: group.id });
      
      // Send invites
      for (const invite of invites) {
        if (invite.email) {
          await fetch(`/api/groups/${group.id}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: invite.email, role: 'MEMBER', name: invite.name }),
          });
        }
      }
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAircraft = async () => {
    if (!groupData.name) return;
    
    setLoading(true);
    setError('');
    try {
      // First create the group if not created
      if (!groupData.id) {
        const createRes = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: groupData.name,
            description: groupData.description,
            dryRate: groupData.dryRate ? parseFloat(groupData.dryRate) : null,
            wetRate: groupData.wetRate ? parseFloat(groupData.wetRate) : null,
          }),
        });
        
        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err.error || 'Failed to create group');
        }
        
        const newGroup = await createRes.json();
        groupData.id = newGroup.id;
      }
      
      // Now add the aircraft
      const aircraftRes = await fetch(`/api/groups/${groupData.id}/aircraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nNumber: aircraftData.nNumber || null,
          nickname: aircraftData.nickname || null,
          customName: aircraftData.customName || null,
          make: aircraftData.make || null,
          model: aircraftData.model || null,
          year: aircraftData.year ? parseInt(aircraftData.year) : null,
          totalTachHours: aircraftData.totalTachHours ? parseFloat(aircraftData.totalTachHours) : null,
          totalHobbsHours: aircraftData.totalHobbsHours ? parseFloat(aircraftData.totalHobbsHours) : null,
          registrationType: aircraftData.registrationType || null,
          hasInsurance: aircraftData.hasInsurance,
          maxPassengers: aircraftData.maxPassengers ? parseInt(aircraftData.maxPassengers) : null,
          hourlyRate: aircraftData.hourlyRate ? parseFloat(aircraftData.hourlyRate) : null,
          notes: aircraftData.notes || null,
        }),
      });
      
      if (!aircraftRes.ok) {
        const err = await aircraftRes.json();
        throw new Error(err.error || 'Failed to add aircraft');
      }
      
      router.push('/modules/flying-club');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-sky-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">Create Your Flying Group</h1>
            <p className="text-slate-400 mb-8">Start by naming your group and setting rates</p>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  placeholder="e.g., Bay Area Flying Club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 h-24"
                  placeholder="What's your club about?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dry Rate ($/hr)</label>
                  <input
                    type="number"
                    value={groupData.dryRate}
                    onChange={(e) => setGroupData({ ...groupData, dryRate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Wet Rate ($/hr)</label>
                  <input
                    type="number"
                    value={groupData.wetRate}
                    onChange={(e) => setGroupData({ ...groupData, wetRate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    placeholder="200"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Continue →'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">Invite Members</h1>
            <p className="text-slate-400 mb-8">Add people by email (they&apos;ll need to create an account)</p>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              {invites.map((invite, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={invite.name}
                    onChange={(e) => {
                      const newInvites = [...invites];
                      newInvites[i].name = e.target.value;
                      setInvites(newInvites);
                    }}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) => {
                      const newInvites = [...invites];
                      newInvites[i].email = e.target.value;
                      setInvites(newInvites);
                    }}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="Email"
                  />
                </div>
              ))}

              <button
                onClick={() => setInvites([...invites, { email: '', name: '' }])}
                className="text-sky-400 hover:text-sky-300 text-sm"
              >
                + Add another person
              </button>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={loading}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Continue →'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">Add Your First Aircraft</h1>
            <p className="text-slate-400 mb-8">Enter the aircraft details (you can add more later)</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">N-Number</label>
                  <input
                    type="text"
                    value={aircraftData.nNumber}
                    onChange={(e) => setAircraftData({ ...aircraftData, nNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="N123AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nickname</label>
                  <input
                    type="text"
                    value={aircraftData.nickname}
                    onChange={(e) => setAircraftData({ ...aircraftData, nickname: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="e.g., Skyhawk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Make</label>
                  <input
                    type="text"
                    value={aircraftData.make}
                    onChange={(e) => setAircraftData({ ...aircraftData, make: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="Cessna"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                  <input
                    type="text"
                    value={aircraftData.model}
                    onChange={(e) => setAircraftData({ ...aircraftData, model: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="172S"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                  <input
                    type="number"
                    value={aircraftData.year}
                    onChange={(e) => setAircraftData({ ...aircraftData, year: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="2018"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Tach Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aircraftData.totalTachHours}
                    onChange={(e) => setAircraftData({ ...aircraftData, totalTachHours: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Hobbs Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aircraftData.totalHobbsHours}
                    onChange={(e) => setAircraftData({ ...aircraftData, totalHobbsHours: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Registration Type</label>
                  <select
                    value={aircraftData.registrationType}
                    onChange={(e) => setAircraftData({ ...aircraftData, registrationType: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Experimental">Experimental</option>
                    <option value="Light Sport">Light Sport</option>
                    <option value="Ultralight">Ultralight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Passengers</label>
                  <input
                    type="number"
                    value={aircraftData.maxPassengers}
                    onChange={(e) => setAircraftData({ ...aircraftData, maxPassengers: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={aircraftData.hourlyRate}
                    onChange={(e) => setAircraftData({ ...aircraftData, hourlyRate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="165"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasInsurance"
                  checked={aircraftData.hasInsurance}
                  onChange={(e) => setAircraftData({ ...aircraftData, hasInsurance: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="hasInsurance" className="text-slate-300">Has Insurance</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  value={aircraftData.notes}
                  onChange={(e) => setAircraftData({ ...aircraftData, notes: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 h-20"
                  placeholder="Any restrictions, annual due date, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.push('/modules/flying-club')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleAddAircraft}
                  disabled={loading}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Aircraft'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AircraftStatus({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [statusData, setStatusData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const inspectionItems = [
    { key: 'annualDate', label: 'Annual Inspection Due', type: 'date', category: 'Inspections' },
    { key: 'altimeterDue', label: 'Altimeter/Transponder Due', type: 'date', category: 'Inspections' },
    { key: 'eltBatteryDue', label: 'ELT Battery Due', type: 'date', category: 'Inspections' },
    { key: 'pitotTubeInspected', label: 'Pitot Tube Inspected', type: 'boolean', category: 'Inspections' },
    { key: 'staticSystemInspected', label: 'Static System Inspected', type: 'boolean', category: 'Inspections' },
    { key: 'oilChangeDue', label: 'Oil Change Due (Hobbs Hours)', type: 'number', category: 'Maintenance' },
    { key: 'oilFilterDue', label: 'Oil Filter Due (Hobbs Hours)', type: 'number', category: 'Maintenance' },
    { key: 'fuelFilterDue', label: 'Fuel Filter Due (Hobbs Hours)', type: 'number', category: 'Maintenance' },
    { key: 'brakeFluidDue', label: 'Brake Fluid Changed', type: 'date', category: 'Maintenance' },
    { key: 'coolantDue', label: 'Coolant Service', type: 'date', category: 'Maintenance' },
    { key: 'currentTach', label: 'Current Tach Time', type: 'number', category: 'Current Status' },
    { key: 'currentHobbs', label: 'Current Hobbs Time', type: 'number', category: 'Current Status' },
    { key: 'fuelOnBoard', label: 'Fuel On Board (Gal)', type: 'number', category: 'Current Status' },
    { key: 'aircraftStatus', label: 'Aircraft Status', type: 'select', options: ['Available', 'In Use', 'Maintenance Required', 'Grounded'], category: 'Current Status' },
    { key: 'engineMonitor', label: 'Engine Monitor Data Reviewed', type: 'boolean', category: 'Preflight' },
    { key: 'logsReviewed', label: 'Logbooks Reviewed', type: 'boolean', category: 'Preflight' },
    { key: 'adsbCompliant', label: 'ADS-B Compliant', type: 'boolean', category: 'Equipment' },
    { key: 'gpsInstalled', label: 'GPS Installed', type: 'boolean', category: 'Equipment' },
    { key: 'autopilotInstalled', label: 'Autopilot Installed', type: 'boolean', category: 'Equipment' },
    { key: 'last100Hour', label: 'Last 100-Hour Inspection', type: 'date', category: 'Inspections' },
    { key: 'propOverhaulDue', label: 'Prop Overhaul Due (Hours)', type: 'number', category: 'Maintenance' },
    { key: 'engineOverhaulDue', label: 'Engine Overhaul Due (Hours)', type: 'number', category: 'Maintenance' },
    { key: 'airworthinessCert', label: 'Airworthiness Certificate Expires', type: 'date', category: 'Registration' },
    { key: 'registrationExp', label: 'Registration Expires', type: 'date', category: 'Registration' },
    { key: 'insuranceExp', label: 'Insurance Expires', type: 'date', category: 'Registration' },
  ];

  const userGroups = groups?.filter((g: any) => g.role === 'ADMIN') || [];
  const selectedGroup = userGroups.find((g: any) => g.id === selectedGroupId);
  const aircraftList = selectedGroup?.aircraft || [];

  useEffect(() => {
    if (userGroups.length > 0 && !selectedGroupId) setSelectedGroupId(userGroups[0].id);
  }, [userGroups]);

  useEffect(() => {
    if (selectedGroupId && aircraftList.length > 0 && !selectedAircraftId) setSelectedAircraftId(aircraftList[0].id);
  }, [selectedGroupId, aircraftList]);

  useEffect(() => {
    if (selectedAircraftId) {
      const aircraft = aircraftList.find((a: any) => a.id === selectedAircraftId);
      if (aircraft?.aircraftNotes) {
        try { setStatusData(JSON.parse(aircraft.aircraftNotes)); } catch { setStatusData({}); }
      } else { setStatusData({}); }
    }
    setLoading(false);
  }, [selectedAircraftId, aircraftList]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/aircraft/${selectedAircraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: JSON.stringify(statusData) }),
      });
      if (res.ok) { setMessage('Status saved!'); setTimeout(() => setMessage(''), 3000); }
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  if (userGroups.length === 0) return <div className="text-center py-12 text-slate-400">Only admins can manage aircraft status</div>;
  if (loading) return <div className="text-center py-12">Loading...</div>;

  const categories = ['Current Status', 'Inspections', 'Maintenance', 'Preflight', 'Equipment', 'Registration'];
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = inspectionItems.filter(item => item.category === cat);
    return acc;
  }, {} as Record<string, typeof inspectionItems>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">📋 Aircraft Status</h2>
        <div className="flex gap-2">
          <select value={selectedGroupId} onChange={(e) => { setSelectedGroupId(e.target.value); setSelectedAircraftId(''); }} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            {userGroups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={selectedAircraftId} onChange={(e) => setSelectedAircraftId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            {aircraftList.map((a: any) => <option key={a.id} value={a.id}>{a.nNumber || a.customName || a.nickname || 'Aircraft'}</option>)}
          </select>
        </div>
      </div>

      {message && <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">{message}</div>}

      {selectedAircraftId && (
        <div className="space-y-6">
          {categories.map(category => {
            const items = itemsByCategory[category];
            if (!items.length) return null;
            return (
              <div key={category} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-sky-400">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(item => (
                    <div key={item.key}>
                      {item.type === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id={item.key} checked={!!statusData?.[item.key]} onChange={(e) => setStatusData({ ...statusData, [item.key]: e.target.checked })} className="w-5 h-5 rounded" />
                          <label htmlFor={item.key} className="text-slate-300">{item.label}</label>
                        </div>
                      ) : item.type === 'select' ? (
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">{item.label}</label>
                          <select value={statusData?.[item.key] || ''} onChange={(e) => setStatusData({ ...statusData, [item.key]: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2">
                            <option value="">Select...</option>
                            {item.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">{item.label}</label>
                          <input type={item.type} value={statusData?.[item.key] || ''} onChange={(e) => setStatusData({ ...statusData, [item.key]: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={handleSave} disabled={saving} className="w-full bg-sky-500 hover:bg-sky-600 py-3 rounded-lg font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Status'}
          </button>
        </div>
      )}
    </div>
  );
}
