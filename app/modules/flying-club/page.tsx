'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { demoGroups, demoBookings, demoMaintenance, demoFlightLogs } from './demoData';

interface Group {
  id: string;
  name: string;
  description: string | null;
  dryRate: number | null;
  wetRate: number | null;
  hourlyRate?: number | null;
  aircraft?: Aircraft[];
  members?: any[];
  role?: string;
  // Visibility settings
  showBookings?: boolean;
  showAircraft?: boolean;
  showFlights?: boolean;
  showMaintenance?: boolean;
  showBilling?: boolean;
  showBillingAll?: boolean;
  showMembers?: boolean;
  showPartners?: boolean;
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
  status: string | null;
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

interface MaintenanceBlock {
  id: string;
  aircraftId: string;
  aircraft: {
    id: string;
    nNumber: string | null;
    customName: string | null;
    nickname: string | null;
  };
  description: string;
  status: string;
  isGrounded: boolean;
  reportedDate: string;
  groupName?: string;
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
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'aircraft' | 'flights' | 'maintenance' | 'billing' | 'members' | 'status' | 'partners'>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [userGroups, setUserGroups] = useState<{ group: Group; role: string; members: Member[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoPopup, setShowDemoPopup] = useState(false);

  // Demo mode param for links
  const isDemoModeParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') === 'true' : false;
  const demoParam = isDemoModeParam ? '?demo=true' : '';

  // Check for demo mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      setIsDemoMode(true);
      setShowDemoPopup(true);
      setGroups(demoGroups as any);
      setBookings(demoBookings as any);
      
      const groundedMaintenance = demoMaintenance.filter((m: any) => 
        m.isGrounded && (m.status === 'NEEDED' || m.status === 'IN_PROGRESS')
      );
      
      const maintenanceWithGroup = groundedMaintenance.map((m: any) => {
        const group = demoGroups.find((g: any) => g.aircraft?.some((a: any) => a.id === m.aircraftId));
        return {
          ...m,
          groupName: group?.name || 'Unknown Group'
        };
      });
      
      setMaintenanceBlocks(maintenanceWithGroup);
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    // Skip if in demo mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') return;
    
    // Normal data loading
    try {
      setError(null);
      const [groupsRes, bookingsRes, maintenanceRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/groups/all-bookings'),
        fetch('/api/maintenance')
      ]);
      
      // Check for errors
      if (!groupsRes.ok) {
        const errData = await groupsRes.json();
        console.error('Groups API error:', errData);
        setError('Failed to load groups: ' + (errData.error || errData.details || 'Unknown error'));
      }
      
      const groupsData = groupsRes.ok ? await groupsRes.json() : [];
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
      const maintenanceData = maintenanceRes.ok ? await maintenanceRes.json() : [];
      
      console.log('Loaded groups:', groupsData);
      console.log('Bookings:', bookingsData);
      
      setGroups(groupsData);
      setBookings(bookingsData);
      
      // Filter to only show grounded maintenance as blocks
      const groundedMaintenance = (maintenanceData || []).filter((m: any) => 
        m.isGrounded && (m.status === 'NEEDED' || m.status === 'IN_PROGRESS')
      );
      
      // Add groupName to each maintenance block
      const maintenanceWithGroup = groundedMaintenance.map((m: any) => {
        const group = groupsData.find((g: any) => g.aircraft?.some((a: any) => a.id === m.aircraftId));
        return {
          ...m,
          groupName: group?.name || 'Unknown Group'
        };
      });
      
      setMaintenanceBlocks(maintenanceWithGroup);
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

  const getMaintenanceForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return maintenanceBlocks.filter(m => {
      if (selectedGroup !== 'all' && m.groupName !== selectedGroup) return false;
      const reportedDate = new Date(m.reportedDate).toISOString().split('T')[0];
      return reportedDate === dateStr;
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

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
            <p className="text-slate-300 mb-4">{error}</p>
            <button 
              onClick={() => loadData()}
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
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
      {/* Demo Mode Popup */}
      {showDemoPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 border-2 border-amber-500/50 max-w-md text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Demo Mode</h2>
            <p className="text-slate-300 mb-6">
              This is <strong>demo data</strong> to help you explore the Flying Club features.
              <br /><br />
              Any changes you make will <strong>not be saved</strong>. 
              <br />
              When you close this popup, all data resets.
            </p>
            <button
              onClick={() => setShowDemoPopup(false)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Demo Badge */}
        {isDemoMode && (
          <div className="fixed top-4 right-4 bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-full z-40 shadow-lg">
            DEMO
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          {(['dashboard', 'bookings', 'aircraft', 'flights', 'status', 'maintenance', 'billing', 'members', 'partners'] as const).map((tab) => (
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
              {tab === 'partners' && '🤝 '}
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
                      {/* Maintenance Blocks - Red Overlay */}
                      {getMaintenanceForDay(day).map(maint => (
                        <div
                          key={maint.id}
                          className="text-xs bg-red-500/30 text-red-300 px-2 py-1 rounded truncate border border-red-500/50"
                          title={`MAINTENANCE: ${maint.description}`}
                        >
                          🔧 {maint.aircraft?.nNumber || 'Aircraft'} - Grounded
                        </div>
                      ))}
                      {/* Bookings */}
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
                    href={`/modules/flying-club/groups/${groups.find(g => g.name === booking.groupName)?.id}${demoParam}`}
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
          <AircraftList groups={groups} demoParam={demoParam} isDemoMode={isDemoMode} />
        )}

        {activeTab === 'flights' && (
          <FlightsList groups={groups} isDemoMode={isDemoMode} demoLogs={isDemoMode ? demoFlightLogs : undefined} demoParam={demoParam} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceList groups={groups} isDemoMode={isDemoMode} demoMaintenance={isDemoMode ? demoMaintenance : undefined} />
        )}

        {activeTab === 'status' && (
          <AircraftStatus groups={groups} isDemoMode={isDemoMode} />
        )}

        {activeTab === 'billing' && (
          <BillingView groups={groups} isDemoMode={isDemoMode} demoBookings={isDemoMode ? demoBookings : undefined} />
        )}

        {activeTab === 'members' && (
          <MembersList groups={groups} isDemoMode={isDemoMode} demoGroups={isDemoMode ? demoGroups : undefined} />
        )}

        {activeTab === 'partners' && (
          <PartnershipMarketplace />
        )}
      </div>
    </div>
  );
}

function BookingsList({ bookings, groups }: { bookings: Booking[]; groups: Group[] }) {
  const router = useRouter();
  
  const isDemoModeParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') === 'true' : false;
  const demoParam = isDemoModeParam ? '?demo=true' : '';

  // Get group ID helper
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
        <Link href="/modules/flying-club" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
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
                    onClick={() => router.push(`/modules/flying-club/groups/${getGroupId(booking.groupName)}${demoParam}`)}
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
                    onClick={() => router.push(`/modules/flying-club/groups/${getGroupId(booking.groupName)}${demoParam}`)}
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

function AircraftList({ groups, demoParam, isDemoMode }: { groups: Group[]; demoParam?: string; isDemoMode?: boolean }) {
  const router = useRouter();
  const [allAircraft, setAllAircraft] = useState<{ aircraft: any; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAircraft = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }
      
      // Use demo data if in demo mode
      if (isDemoMode) {
        const data: { aircraft: any; groupName: string }[] = [];
        for (const group of groups) {
          if (group.aircraft && Array.isArray(group.aircraft)) {
            group.aircraft.forEach((ac: any) => {
              data.push({ aircraft: ac, groupName: group.name });
            });
          }
        }
        setAllAircraft(data);
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
  }, [groups, isDemoMode]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Aircraft</h2>
        <Link href="/modules/flying-club" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium">
          + Add Aircraft
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAircraft.map(({ aircraft, groupName }) => {
          // Read status from database status field, fallback to JSON parsing
          let statusData: any = {};
          try { statusData = aircraft.aircraftNotes ? JSON.parse(aircraft.aircraftNotes) : {}; } catch {}
          const aircraftStatus = aircraft.status || statusData?.aircraftStatus || 'Available';
          const statusColor = aircraftStatus === 'Available' ? 'bg-green-500/20 text-green-400' : 
                            aircraftStatus === 'In Use' ? 'bg-blue-500/20 text-blue-400' :
                            aircraftStatus === 'Grounded' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400';
          
          return (
            <div key={aircraft.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-sky-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-lg">{aircraft.nNumber || 'Custom'}</div>
                  <div className="text-slate-400">{aircraft.customName || aircraft.nickname || 'Unnamed'}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${statusColor}`}>
                  {aircraftStatus}
                </span>
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                {aircraft.make && <div>{aircraft.make} {aircraft.model} {aircraft.year}</div>}
                {aircraft.totalTachHours && <div>Tach: {Number(aircraft.totalTachHours).toFixed(1)} hrs</div>}
                {aircraft.totalHobbsHours && <div>Hobbs: {Number(aircraft.totalHobbsHours).toFixed(1)} hrs</div>}
                {aircraft.hourlyRate && <div className="text-sky-400">${Number(aircraft.hourlyRate)}/hr</div>}
              </div>
              <button
                onClick={() => router.push(`/modules/flying-club/groups/${groups.find(g => g.name === groupName)?.id}${demoParam}`)}
                className="text-sky-400 hover:text-sky-300 text-sm mt-2 block"
              >
                View details →
              </button>
            </div>
          );
        })}
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

function FlightsList({ groups, isDemoMode, demoLogs, demoParam }: { groups: Group[]; isDemoMode?: boolean; demoLogs?: any[]; demoParam?: string }) {
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
      
      // Use demo data if available
      if (isDemoMode && demoLogs) {
        const data: { log: any; groupName: string }[] = [];
        for (const log of demoLogs) {
          const group = groups.find(g => g.aircraft?.some((a: any) => a.id === log.aircraftId));
          if (group) {
            data.push({ log, groupName: group.name });
          }
        }
        setAllLogs(data.sort((a, b) => new Date(b.log.date).getTime() - new Date(a.log.date).getTime()));
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
  }, [groups, isDemoMode]);

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
              id="filterUser"
              name="filterUser"
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
              id="filterAircraft"
              name="filterAircraft"
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
              id="filterDateFrom"
              name="filterDateFrom"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To Date</label>
            <input
              id="filterDateTo"
              name="filterDateTo"
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

function MembersList({ groups, isDemoMode, demoGroups }: { groups: Group[]; isDemoMode?: boolean; demoGroups?: any[] }) {
  const router = useRouter();
  const [allMembers, setAllMembers] = useState<{ member: any; groupName: string }[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  const userGroups = groups?.filter((g: any) => g.role === 'ADMIN' || g.role === 'MEMBER') || [];
  const isAdmin = userGroups.some((g: any) => g.role === 'ADMIN');

  useEffect(() => {
    const loadMembers = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }
      
      // Use demo data if in demo mode
      if (isDemoMode && demoGroups) {
        const data: { member: any; groupName: string }[] = [];
        for (const group of groups) {
          if (group.members && Array.isArray(group.members)) {
            group.members.forEach((m: any) => {
              data.push({ member: m, groupName: group.name });
            });
          }
        }
        setAllMembers(data);
        setPendingInvites([]);
        setLoading(false);
        return;
      }
      
      const data: { member: any; groupName: string }[] = [];
      
      // Load members for each group the user belongs to
      for (const group of userGroups) {
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
      
      // Load pending invites for admin groups
      if (isAdmin) {
        const allInvites: any[] = [];
        for (const group of userGroups.filter((g: any) => g.role === 'ADMIN')) {
          try {
            const res = await fetch(`/api/groups/${group.id}/invites`);
            if (res.ok) {
              const invites = await res.json();
              if (Array.isArray(invites)) {
                allInvites.push(...invites.map((i: any) => ({ ...i, groupName: group.name })));
              }
            }
          } catch (e) {
            console.error('Error loading invites:', e);
          }
        }
        setPendingInvites(allInvites);
      }
      setLoading(false);
    };
    loadMembers();
  }, [groups, userGroups, isAdmin]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  // Group members by email
  const membersByEmail: Record<string, { member: any; groups: string[] }> = {};
  allMembers.forEach(({ member, groupName }) => {
    const email = member.user.email;
    if (!membersByEmail[email]) {
      membersByEmail[email] = { member, groups: [] };
    }
    if (!membersByEmail[email].groups.includes(groupName)) {
      membersByEmail[email].groups.push(groupName);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Members & Invites</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Members ({Object.keys(membersByEmail).length})
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'invites'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Invites ({pendingInvites.length})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
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
          {Object.keys(membersByEmail).length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">👥</div>
              <p>No members yet</p>
            </div>
          )}
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          {pendingInvites.length > 0 ? (
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                  <div>
                    <div className="font-medium">{invite.email || 'No email specified'}</div>
                    <div className="text-sm text-slate-400">
                      {invite.groupName} • Role: {invite.role} • Sent {new Date(invite.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-yellow-400 text-sm">Pending</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">📧</div>
              <p>No pending invitations</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MaintenanceList({ groups, isDemoMode, demoMaintenance }: { groups: Group[]; isDemoMode?: boolean; demoMaintenance?: any[] }) {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFixForm, setShowFixForm] = useState(false);
  const [fixingMaintenance, setFixingMaintenance] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [formData, setFormData] = useState({ aircraftId: '', description: '', notes: '', isGrounded: false });
  const [fixData, setFixData] = useState({ notes: '', cost: '', isGrounded: false });

  // Common pilot-fixable issues
  const pilotFixableIssues = [
    'Oil top-up needed',
    'Coolant top-up needed',
    'Tire inflation low',
    'Fuel contamination check',
    'Windshield cleaning',
    'Seat adjustment',
    'Brake pad check',
    'Battery check',
    'Oil filter check',
    'Fuel drain',
  ];

  const handleFixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixingMaintenance) return;
    
    // In demo mode, just close the form
    if (isDemoMode) {
      setShowFixForm(false);
      setFixingMaintenance(null);
      return;
    }
    
    const res = await fetch(`/api/maintenance/${fixingMaintenance.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DONE',
        cost: fixData.cost || null,
        notes: fixData.notes,
        isGrounded: fixData.isGrounded,
      }),
    });
    
    if (res.ok) {
      setShowFixForm(false);
      setFixingMaintenance(null);
      setFixData({ notes: '', cost: '', isGrounded: false });
      // Reload maintenance
      const reloadRes = await fetch('/api/maintenance');
      if (reloadRes.ok) {
        setMaintenance(await reloadRes.json());
      }
    }
  };

  useEffect(() => {
    // Use demo data if available
    if (isDemoMode && demoMaintenance) {
      const data = demoMaintenance.map((m: any) => {
        const group = groups.find(g => g.aircraft?.some((a: any) => a.id === m.aircraftId));
        return { ...m, groupName: group?.name || 'Unknown' };
      });
      setMaintenance(data);
      setLoading(false);
      return;
    }
    
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
      setFormData({ aircraftId: '', description: '', notes: '', isGrounded: false });
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

  // Show all maintenance if user has no groups or groups not loaded, otherwise filter by group
  let filteredMaintenance = maintenance;
  const userGroupIds = userGroups?.map((g: any) => g.id) || [];
  
  // Show all if no groups, or filter by user's groups (including records with no groupId)
  if (userGroupIds.length > 0) {
    filteredMaintenance = maintenance.filter((m: any) => !m.groupId || userGroupIds.includes(m.groupId));
    
    if (selectedGroupId) {
      filteredMaintenance = filteredMaintenance.filter((m: any) => !m.groupId || m.groupId === selectedGroupId);
    }
    if (selectedAircraftId) {
      filteredMaintenance = filteredMaintenance.filter((m: any) => m.aircraftId === selectedAircraftId);
    }
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
              {userGroups.length > 1 && <option value="">All Groups</option>}
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
              id="maintenanceGroup"
              name="maintenanceGroup"
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
                id="maintenanceAircraft"
                name="maintenanceAircraft"
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
              id="maintenanceDescription"
              name="maintenanceDescription"
              type="text"
              placeholder="Description (e.g., Flat tire, Oil leak)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            {/* Quick select common issues */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quick select:</label>
              <div className="flex flex-wrap gap-1">
                {pilotFixableIssues.slice(0, 5).map((issue: string) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => setFormData({ ...formData, description: issue })}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="maintenanceNotes"
              name="maintenanceNotes"
              placeholder="Additional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 h-20"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addIsGrounded"
                checked={formData.isGrounded}
                onChange={(e) => setFormData({ ...formData, isGrounded: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="addIsGrounded" className="text-sm text-slate-300">
                Ground this aircraft (block bookings)
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 rounded-lg">Submit</button>
          </div>
        </form>
      )}

      {/* Fix Form Modal */}
      {showFixForm && fixingMaintenance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleFixSubmit} className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mark as Fixed</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Aircraft</label>
                <div className="text-white">{fixingMaintenance.nNumber} - {fixingMaintenance.customName || fixingMaintenance.nickname || 'Unknown'}</div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Issue</label>
                <div className="text-white">{fixingMaintenance.description}</div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">What was fixed?</label>
                <textarea
                  value={fixData.notes}
                  onChange={(e) => setFixData({ ...fixData, notes: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 h-24"
                  placeholder="Describe what was done to fix the issue..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cost (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fixData.cost}
                  onChange={(e) => setFixData({ ...fixData, cost: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGrounded"
                  checked={fixData.isGrounded}
                  onChange={(e) => setFixData({ ...fixData, isGrounded: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isGrounded" className="text-sm text-slate-300">
                  Keep aircraft Grounded until explicitly cleared
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => { setShowFixForm(false); setFixingMaintenance(null); }} className="flex-1 px-4 py-2 bg-slate-700 rounded-lg">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-green-500 rounded-lg">Mark Fixed</button>
            </div>
          </form>
        </div>
      )}

      {/* Pilot Fixable Issues Summary */}
      {needed.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-medium mb-3 text-sky-400">📋 Quick Checklist - Pilot Fixable</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {needed.filter((m: any) => pilotFixableIssues.some(issue => m.description?.toLowerCase().includes(issue.toLowerCase()))).map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={false} onChange={() => { setFixingMaintenance(m); setShowFixForm(true); }} className="w-4 h-4 rounded" />
                <span className="text-slate-300">{m.description?.substring(0, 30)}...</span>
              </div>
            ))}
            {needed.filter((m: any) => pilotFixableIssues.some(issue => m.description?.toLowerCase().includes(issue.toLowerCase()))).length === 0 && (
              <p className="text-slate-500 text-sm col-span-full">No pilot-fixable issues reported</p>
            )}
          </div>
        </div>
      )}

      {needed.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">🔧 Needed</h3>
          <div className="space-y-3">
            {needed.map((m: any) => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-4 border border-orange-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {m.nNumber || 'N/A'} - {m.customName || m.nickname || m.make + ' ' + m.model || 'Unknown Aircraft'}
                    </div>
                    <div className="text-slate-400 text-sm">{m.description}</div>
                    {m.notes && <div className="text-slate-500 text-sm mt-1">{m.notes}</div>}
                    <div className="text-slate-500 text-xs mt-1">
                      Reported {new Date(m.reportedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      m.status === 'NEEDED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {m.status}
                    </span>
                    <button
                      onClick={() => { setFixingMaintenance(m); setShowFixForm(true); }}
                      className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    >
                      ✓ Fixed
                    </button>
                  </div>
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
                    <div className="font-medium">
                      {m.nNumber || 'N/A'} - {m.customName || m.nickname || m.make + ' ' + m.model || 'Unknown Aircraft'}
                    </div>
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

function BillingView({ groups, isDemoMode, demoBookings }: { groups: Group[]; isDemoMode?: boolean; demoBookings?: any[] }) {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<any>(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Format number with thousands separator
  const formatNumber = (num: number | undefined | null, decimals = 0): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Format currency with thousands separator
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '$0.00';
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get groups where user is admin
  const adminGroups = groups?.filter((g: any) => g.role === 'ADMIN') || [];
  const isAdmin = adminGroups.length > 0;
  const selectedGroup = adminGroups.find((g: any) => g.id === selectedGroupId);

  const generatePDF = () => {
    if (!billing || !billing.members) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.text('Billing Statement', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`${selectedGroup?.name || 'Flying Club'} - ${months[month]} ${year}`, pageWidth / 2, 30, { align: 'center' });
    
    // Summary
    doc.setFontSize(11);
    doc.text(`Total Members: ${billing.totalMembers}`, 20, 45);
    doc.text(`Total Flights: ${billing.totalFlights}`, 20, 52);
    doc.text(`Total Hobbs Hours: ${Number(billing.totalHobbs).toFixed(1)}`, 20, 59);
    doc.setFontSize(14);
    doc.text(`Total Owed: $${Number(billing.totalCost).toFixed(2)}`, 20, 70);

    // Members table
    const tableData = billing.members.map((member: any) => [
      member.name || 'Unknown',
      member.email || '',
      member.flights.toString(),
      Number(member.totalHobbs).toFixed(1),
      Number(member.totalTach).toFixed(1),
      `$${Number(member.totalCost).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Member', 'Email', 'Flights', 'Hobbs', 'Tach', 'Cost']],
      body: tableData,
      foot: [['', '', billing.totalFlights.toString(), Number(billing.totalHobbs).toFixed(1), '', `$${Number(billing.totalCost).toFixed(2)}`]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`billing-${months[month].toLowerCase()}-${year}.pdf`);
  };

  // Auto-select first group if only one
  useEffect(() => {
    if (adminGroups.length === 1 && !selectedGroupId) {
      setSelectedGroupId(adminGroups[0].id);
    }
  }, [adminGroups]);

  useEffect(() => {
    if (!isAdmin && !isDemoMode) return;
    
    // Demo mode - generate fake billing from demo bookings
    if (isDemoMode && demoBookings && adminGroups.length > 0) {
      const groupId = selectedGroupId || adminGroups[0].id;
      const group = groups.find((g: any) => g.id === groupId);
      if (!group) {
        setLoading(false);
        return;
      }
      
      // Filter bookings for selected group and month/year
      const groupBookings = demoBookings.filter((b: any) => {
        const bookingGroup = groups.find((g: any) => g.aircraft?.some((a: any) => a.id === b.aircraftId));
        return bookingGroup?.id === groupId;
      });
      
      const monthBookings = groupBookings.filter((b: any) => {
        const bookingDate = new Date(b.startTime);
        return bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
      });
      
      // Group by user
      const memberMap = new Map();
      monthBookings.forEach((b: any) => {
        const userId = b.userId;
        if (!memberMap.has(userId)) {
          memberMap.set(userId, {
            userId,
            name: b.user?.name || 'Unknown',
            email: b.user?.email || '',
            flights: 0,
            totalHobbs: 0,
            totalTach: 0,
            totalCost: 0,
            flightDetails: []
          });
        }
        const member = memberMap.get(userId);
        member.flights++;
        const hobbs = b.hobbsTime || 1.5;
        member.totalHobbs += hobbs;
        member.totalTach += hobbs;
        const rate = group.hourlyRate || 165;
        const flightCost = hobbs * rate;
        member.totalCost += flightCost;
        member.flightDetails.push({
          date: b.startTime,
          aircraft: b.aircraft?.nNumber || '',
          hobbs,
          cost: flightCost
        });
      });
      
      const members = Array.from(memberMap.values());
      setBilling({
        members,
        totalMembers: members.length,
        totalFlights: monthBookings.length,
        totalHobbs: members.reduce((sum: number, m: any) => sum + m.totalHobbs, 0),
        totalCost: members.reduce((sum: number, m: any) => sum + m.totalCost, 0)
      });
      setLoading(false);
      return;
    }
    
    // Normal mode
    setLoading(true);
    setError(null);
    const groupParam = selectedGroupId ? `&groupId=${selectedGroupId}` : '';
    fetch(`/api/billing?month=${month}&year=${year}${groupParam}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load billing')))
      .then(data => setBilling(data))
      .catch(e => {
        console.error('Billing load error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [month, year, selectedGroupId, isAdmin, isDemoMode]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-4">🔒</div>
        <p>Only admins can view billing</p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">💰 Billing Statement</h2>
        <div className="flex gap-2 items-center">
          {/* Group selector - only show if user is admin of multiple groups */}
          {adminGroups.length > 1 && (
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
            >
              {adminGroups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
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
          {billing?.members?.length > 0 && (
            <button
              onClick={generatePDF}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
            >
              📄 PDF
            </button>
          )}
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
              <div className="text-2xl font-bold">{formatNumber(billing?.totalMembers)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Flights</div>
              <div className="text-2xl font-bold">{formatNumber(billing?.totalFlights)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Hobbs</div>
              <div className="text-2xl font-bold">{formatNumber(billing?.totalHobbs, 1)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Owed</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(billing?.totalCost)}</div>
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
                  <th className="text-right p-4">Tach</th>
                  <th className="text-right p-4">Cost</th>
                  <th className="text-center p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {billing?.members?.map((member: any, i: number) => (
                  <>
                    <tr key={i} className="border-t border-slate-700">
                      <td className="p-4">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-slate-400">{member.email}</div>
                      </td>
                      <td className="text-right p-4">{member.flights}</td>
                      <td className="text-right p-4">{Number(member.totalHobbs).toFixed(1)}</td>
                      <td className="text-right p-4">{Number(member.totalTach).toFixed(1)}</td>
                      <td className="text-right p-4 font-bold text-green-400">${Number(member.totalCost).toFixed(2)}</td>
                      <td className="text-center p-4">
                        <button
                          onClick={() => setSelectedMemberDetails(member)}
                          className="text-sky-400 hover:text-sky-300 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Details */}
                    {showDetail === member.email && member.flightDetails && (
                      <tr key={`${i}-detail`}>
                        <td colSpan={6} className="p-0 bg-slate-800/50">
                          <div className="p-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-600">
                                  <th className="text-left py-2">Date</th>
                                  <th className="text-left py-2">Aircraft</th>
                                  <th className="text-right py-2">Hobbs</th>
                                  <th className="text-right py-2">Tach</th>
                                  <th className="text-right py-2">Cost</th>
                                </tr>
                              </thead>
                              <tbody>
                                {member.details.map((detail: any, di: number) => (
                                  <tr key={di} className="border-b border-slate-700/50">
                                    <td className="py-2">{new Date(detail.date).toLocaleDateString()}</td>
                                    <td className="py-2">{detail.aircraft}</td>
                                    <td className="text-right py-2">{Number(detail.hobbs).toFixed(1)}</td>
                                    <td className="text-right py-2">{Number(detail.tach).toFixed(1)}</td>
                                    <td className="text-right py-2 text-green-400">${Number(detail.cost).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="font-semibold">
                                  <td colSpan={2} className="py-2 text-right">Totals:</td>
                                  <td className="text-right py-2">{Number(member.totalHobbs).toFixed(1)}</td>
                                  <td className="text-right py-2">{Number(member.totalTach).toFixed(1)}</td>
                                  <td className="text-right py-2 text-green-400">${Number(member.totalCost).toFixed(2)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
              <tfoot className="bg-slate-700 font-semibold">
                <tr>
                  <td className="p-4 text-right">TOTALS:</td>
                  <td className="text-right p-4">{billing?.totalFlights || 0}</td>
                  <td className="text-right p-4">{Number(billing?.totalHobbs || 0).toFixed(1)}</td>
                  <td className="text-right p-4">-</td>
                  <td className="text-right p-4 text-green-400">${Number(billing?.totalCost || 0).toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Member Details Modal */}
          {selectedMemberDetails && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedMemberDetails.name}</h3>
                    <p className="text-slate-400">{selectedMemberDetails.email}</p>
                    <p className="text-sky-400 mt-2">
                      {months[month]} {year} Billing Statement
                    </p>
                  </div>
                  <button onClick={() => setSelectedMemberDetails(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4 bg-slate-700 p-4 rounded-lg">
                  <div>
                    <div className="text-slate-400 text-sm">Flights</div>
                    <div className="text-xl font-bold">{selectedMemberDetails.flights}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Hobbs</div>
                    <div className="text-xl font-bold">{Number(selectedMemberDetails.totalHobbs).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Tach</div>
                    <div className="text-xl font-bold">{Number(selectedMemberDetails.totalTach).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Total Cost</div>
                    <div className="text-xl font-bold text-green-400">${Number(selectedMemberDetails.totalCost).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700 sticky top-0">
                      <tr>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Aircraft</th>
                        <th className="text-right p-3">Hobbs</th>
                        <th className="text-right p-3">Tach</th>
                        <th className="text-right p-3">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMemberDetails.details?.map((detail: any, di: number) => (
                        <tr key={di} className="border-b border-slate-700">
                          <td className="p-3">{new Date(detail.date).toLocaleDateString()}</td>
                          <td className="p-3">{detail.aircraft}</td>
                          <td className="text-right p-3">{Number(detail.hobbs).toFixed(1)}</td>
                          <td className="text-right p-3">{Number(detail.tach).toFixed(1)}</td>
                          <td className="text-right p-3 text-green-400">${Number(detail.cost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                  <button onClick={() => setSelectedMemberDetails(null)} className="px-4 py-2 bg-slate-700 rounded-lg">Close</button>
                  <button onClick={generatePDF} className="px-4 py-2 bg-sky-500 rounded-lg">📄 Download PDF</button>
                </div>
              </div>
            </div>
          )}
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
                  id="groupName"
                  name="groupName"
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
                  id="groupDescription"
                  name="groupDescription"
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
                    id="dryRate"
                    name="dryRate"
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
                    id="wetRate"
                    name="wetRate"
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
                    id={`inviteName${i}`}
                    name={`inviteName${i}`}
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
                    id={`inviteEmail${i}`}
                    name={`inviteEmail${i}`}
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
                    id="nNumber"
                    name="nNumber"
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
                    id="nickname"
                    name="nickname"
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
                    id="make"
                    name="make"
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
                    id="model"
                    name="model"
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
                    id="year"
                    name="year"
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
                    id="totalTachHours"
                    name="totalTachHours"
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
                    id="totalHobbsHours"
                    name="totalHobbsHours"
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
                    id="registrationType"
                    name="registrationType"
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
                    id="maxPassengers"
                    name="maxPassengers"
                    type="number"
                    value={aircraftData.maxPassengers}
                    onChange={(e) => setAircraftData({ ...aircraftData, maxPassengers: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate ($)</label>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
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

function AircraftStatus({ groups, isDemoMode }: { groups: Group[]; isDemoMode?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [statusData, setStatusData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
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
  // In demo mode, user is admin of all groups
  const adminGroups = isDemoMode ? groups : userGroups;
  const selectedGroup = (adminGroups as any[])?.find((g: any) => g.id === selectedGroupId);
  const aircraftList = selectedGroup?.aircraft || [];

  useEffect(() => {
    if (adminGroups.length > 0 && !selectedGroupId) setSelectedGroupId(adminGroups[0].id);
  }, [adminGroups, groups]);

  useEffect(() => {
    if (selectedGroupId && aircraftList.length > 0 && !selectedAircraftId) setSelectedAircraftId(aircraftList[0].id);
  }, [selectedGroupId, aircraftList, selectedAircraftId]);

  useEffect(() => {
    if (selectedAircraftId) {
      const aircraft = aircraftList.find((a: any) => a.id === selectedAircraftId);
      if (aircraft) {
        let parsed: any = {};
        try {
          parsed = aircraft.aircraftNotes ? JSON.parse(aircraft.aircraftNotes) : {};
        } catch (e) {
          console.error('Error parsing aircraftNotes:', e);
        }
        setStatusData({
          ...parsed,
          aircraftStatus: aircraft.status || parsed.aircraftStatus || 'Available'
        });
      }
    }
    setLoading(false);
    setIsEditing(false);
  }, [selectedAircraftId, aircraftList, adminGroups]);

  const handleSave = async () => {
    setSaving(true);
    
    // In demo mode, just save locally in memory
    if (isDemoMode) {
      setMessage('Status saved (demo mode)!');
      setTimeout(() => setMessage(''), 3000);
      setIsEditing(false);
      setSaving(false);
      return;
    }
    
    // Normal mode - save to server
    try {
      const aircraftStatus = statusData.aircraftStatus || 'Available';
      
      const res = await fetch(`/api/groups/${selectedGroupId}/aircraft/${selectedAircraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: JSON.stringify(statusData),
          status: aircraftStatus
        }),
      });
      if (res.ok) { 
        setMessage('Status saved!'); 
        setTimeout(() => setMessage(''), 3000);
        setIsEditing(false);
      }
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handleCancel = () => {
    // Reload original data
    const aircraft = aircraftList.find((a: any) => a.id === selectedAircraftId);
    const parsed = aircraft?.aircraftNotes ? JSON.parse(aircraft.aircraftNotes) : {};
    setStatusData({
      ...parsed,
      aircraftStatus: aircraft?.status || parsed.aircraftStatus || 'Available'
    });
    setIsEditing(false);
  };

  if (userGroups.length === 0) return <div className="text-center py-12 text-slate-400">Only admins can manage aircraft status</div>;
  if (loading) return <div className="text-center py-12">Loading...</div>;

  const categories = ['Current Status', 'Inspections', 'Maintenance', 'Preflight', 'Equipment', 'Registration'];
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = inspectionItems.filter(item => item.category === cat);
    return acc;
  }, {} as Record<string, typeof inspectionItems>);

  // Helper to render a field (read-only or editable)
  const renderField = (item: any, value: any, onChange: (val: any) => void) => {
    if (item.type === 'boolean') {
      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" id={item.key} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 rounded" />
            <label htmlFor={item.key} className="text-slate-300">{item.label}</label>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded flex items-center justify-center ${value ? 'bg-green-500' : 'bg-slate-600'}`}>
            {value && '✓'}
          </span>
          <span className="text-slate-300">{item.label}</span>
        </div>
      );
    }
    if (item.type === 'select') {
      if (isEditing) {
        return (
          <div>
            <label className="block text-sm text-slate-400 mb-1">{item.label}</label>
            <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2">
              <option value="">Select...</option>
              {item.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      }
      return (
        <div>
          <div className="text-sm text-slate-400">{item.label}</div>
          <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            value === 'Available' ? 'bg-green-500/20 text-green-400' :
            value === 'In Use' ? 'bg-blue-500/20 text-blue-400' :
            value === 'Grounded' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>{value || 'Available'}</div>
        </div>
      );
    }
    // Date or number
    if (isEditing) {
      return (
        <div>
          <label className="block text-sm text-slate-400 mb-1">{item.label}</label>
          <input type={item.type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2" />
        </div>
      );
    }
    return (
      <div>
        <div className="text-sm text-slate-400">{item.label}</div>
        <div className="text-slate-200">{value || '—'}</div>
      </div>
    );
  };

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
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleCancel} className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg">
              ✏️ Edit
            </button>
          )}
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
                      {renderField(item, statusData?.[item.key], (val) => setStatusData({ ...statusData, [item.key]: val }))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartnershipMarketplace() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [filters, setFilters] = useState({ airport: '', state: '', experience: '' });
  const [mapProfiles, setMapProfiles] = useState<any[]>([]);

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
    loadProfiles();
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
        // Check if user has a partnership profile
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

  useEffect(() => {
    loadMyProfile();
  }, []);

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

  // US State abbreviations
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">🤝 Flying Partner Marketplace</h2>
          <p className="text-slate-400 text-sm">Find other pilots in your area to fly with</p>
        </div>
        <button
          onClick={() => { loadMyProfile(); setShowEditForm(true); }}
          className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-medium"
        >
          {myProfile ? '✏️ Edit My Profile' : '➕ Create Profile'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
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

      {/* Map View - OpenStreetMap */}
      {mapProfiles.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
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
                  {mapProfiles.slice(0, 6).map((p, i) => (
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
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">🤝</div>
          <p>No pilots found matching your criteria</p>
          <p className="text-sm mt-2">Be the first to create a profile!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
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
              
              <button className="mt-4 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm transition-colors">
                📧 Contact
              </button>
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
                    id="city"
                    name="city"
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
                    id="state"
                    name="state"
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
                  id="homeAirport"
                  name="homeAirport"
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
                  id="experienceLevel"
                  name="experienceLevel"
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
                  id="availability"
                  name="availability"
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
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 h-20"
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Looking For</label>
                <input
                  id="lookingFor"
                  name="lookingFor"
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
  );
}
