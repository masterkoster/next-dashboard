'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">📅 Calendar Sync</h1>
          <p className="text-slate-400">Add your flights to Google or Apple Calendar</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Flight Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Flight Title (optional)</label>
              <input
                type="text"
                value={flight.title}
                onChange={(e) => setFlight({...flight, title: e.target.value})}
                placeholder="Cross Country Training"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={flight.date}
                  onChange={(e) => setFlight({...flight, date: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Time</label>
                <input
                  type="time"
                  value={flight.time}
                  onChange={(e) => setFlight({...flight, time: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">From</label>
                <input
                  type="text"
                  value={flight.routeFrom}
                  onChange={(e) => setFlight({...flight, routeFrom: e.target.value.toUpperCase()})}
                  placeholder="KABC"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">To</label>
                <input
                  type="text"
                  value={flight.routeTo}
                  onChange={(e) => setFlight({...flight, routeTo: e.target.value.toUpperCase()})}
                  placeholder="KXYZ"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Duration (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={flight.duration}
                  onChange={(e) => setFlight({...flight, duration: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Aircraft</label>
              <input
                type="text"
                value={flight.aircraft}
                onChange={(e) => setFlight({...flight, aircraft: e.target.value})}
                placeholder="N123AB"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Notes</label>
              <textarea
                value={flight.notes}
                onChange={(e) => setFlight({...flight, notes: e.target.value})}
                placeholder="Check weather, file flight plan..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Sync Options */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add to Calendar</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={generateGoogleCalendarLink}
              disabled={!flight.date || !flight.time}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              Google Calendar
            </button>

            <button
              onClick={generateICSFile}
              disabled={!flight.date || !flight.time}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
              Apple/Outlook (.ics)
            </button>
          </div>

          {(!flight.date || !flight.time) && (
            <p className="text-amber-400 text-sm mt-4 text-center">
              Please fill in date and time to add to calendar
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">How it works</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• <strong>Google Calendar</strong> - Opens Google Calendar in a new tab with pre-filled event details</li>
            <li>• <strong>Apple/Outlook</strong> - Downloads an .ics file you can open in any calendar app</li>
            <li>• Flight events include route, aircraft, duration, and your notes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
