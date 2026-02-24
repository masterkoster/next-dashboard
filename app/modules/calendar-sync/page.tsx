'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FlightEvent {
  title: string;
  date: string;
  time: string;
  duration: number;
  routeFrom: string;
  routeTo: string;
  aircraft: string;
  notes: string;
}

export default function CalendarSyncPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userTier, setUserTier] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState(true);
  
  const [flight, setFlight] = useState<FlightEvent>({
    title: '',
    date: '',
    time: '',
    duration: 1.5,
    routeFrom: '',
    routeTo: '',
    aircraft: '',
    notes: '',
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Check user tier when session is available
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserTier();
    } else if (status === 'unauthenticated') {
      setLoadingTier(false);
    }
  }, [status]);

  const fetchUserTier = async () => {
    try {
      const res = await fetch('/api/user/tier');
      if (res.ok) {
        const data = await res.json();
        setUserTier(data.tier);
      }
    } catch (err) {
      console.error('Failed to fetch tier');
    } finally {
      setLoadingTier(false);
    }
  };

  const isProPlus = userTier === 'proplus' || userTier === 'pro';

  const generateGoogleCalendarLink = () => {
    const startDate = new Date(`${flight.date}T${flight.time}`);
    const endDate = new Date(startDate.getTime() + flight.duration * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = flight.title || `Flight: ${flight.routeFrom} → ${flight.routeTo}`;
    const description = `
Aircraft: ${flight.aircraft}
Route: ${flight.routeFrom} → ${flight.routeTo}
Duration: ${flight.duration} hours

${flight.notes}
    `.trim();

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: description,
    });

    const link = `https://calendar.google.com/calendar/render?${params.toString()}`;
    setGeneratedLink(link);
    window.open(link, '_blank');
  };

  const generateICSFile = () => {
    const startDate = new Date(`${flight.date}T${flight.time}`);
    const endDate = new Date(startDate.getTime() + flight.duration * 60 * 60 * 1000);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    };

    const title = flight.title || `Flight: ${flight.routeFrom} → ${flight.routeTo}`;
    const description = `Aircraft: ${flight.aircraft}\\nRoute: ${flight.routeFrom} → ${flight.routeTo}\\nDuration: ${flight.duration} hours\\n\\n${flight.notes}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flight-${flight.routeFrom}-${flight.routeTo}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading' || loadingTier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Show upgrade prompt for non-Pro+ users
  if (!isProPlus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Calendar Sync</h1>
          <p className="text-muted-foreground mb-6">
            Add your flights to Google or Apple Calendar to keep your schedule organized.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-700 font-medium mb-2">🔒 Pro+ Feature</p>
            <p className="text-muted-foreground text-sm">
              Calendar Sync is available exclusively for Pro+ subscribers. 
              Upgrade to unlock this feature and more!
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              View Pro+ Plans
            </Link>
            <Link
              href="/dashboard"
              className="block w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">📅 Calendar Sync</h1>
          <p className="text-muted-foreground">Add your flights to Google or Apple Calendar</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Flight Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Flight Title (optional)</label>
              <input
                type="text"
                value={flight.title}
                onChange={(e) => setFlight({...flight, title: e.target.value})}
                placeholder="Cross Country Training"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={flight.date}
                  onChange={(e) => setFlight({...flight, date: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Time</label>
                <input
                  type="time"
                  value={flight.time}
                  onChange={(e) => setFlight({...flight, time: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">From</label>
                <input
                  type="text"
                  value={flight.routeFrom}
                  onChange={(e) => setFlight({...flight, routeFrom: e.target.value.toUpperCase()})}
                  placeholder="KABC"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground uppercase"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">To</label>
                <input
                  type="text"
                  value={flight.routeTo}
                  onChange={(e) => setFlight({...flight, routeTo: e.target.value.toUpperCase()})}
                  placeholder="KXYZ"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground uppercase"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Duration (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={flight.duration}
                  onChange={(e) => setFlight({...flight, duration: parseFloat(e.target.value) || 0})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Aircraft</label>
              <input
                type="text"
                value={flight.aircraft}
                onChange={(e) => setFlight({...flight, aircraft: e.target.value})}
                placeholder="N123AB"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Notes</label>
              <textarea
                value={flight.notes}
                onChange={(e) => setFlight({...flight, notes: e.target.value})}
                placeholder="Check weather, file flight plan..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Sync Options */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add to Calendar</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={generateGoogleCalendarLink}
              disabled={!flight.date || !flight.time}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground text-white px-6 py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              Google Calendar
            </button>

            <button
              onClick={generateICSFile}
              disabled={!flight.date || !flight.time}
              className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 disabled:bg-muted disabled:text-muted-foreground text-foreground px-6 py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
              Apple/Outlook (.ics)
            </button>
          </div>

          {(!flight.date || !flight.time) && (
            <p className="text-amber-600 text-sm mt-4 text-center">
              Please fill in date and time to add to calendar
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-muted/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Google Calendar</strong> - Opens Google Calendar in a new tab with pre-filled event details</li>
            <li>• <strong>Apple/Outlook</strong> - Downloads an .ics file you can open in any calendar app</li>
            <li>• Flight events include route, aircraft, duration, and your notes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
