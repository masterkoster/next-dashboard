'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Trip {
  id: string;
  name: string;
  departureIcao?: string;
  arrivalIcao?: string;
  cruisingAlt?: number;
  waypoints?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function TripsPage() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/flight-plans')
        .then(res => res.json())
        .then(data => {
          setTrips(data.flightPlans || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Trips</h1>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">My Trips</h1>
          <p className="text-slate-400 mb-6">Sign in to view and manage your saved trips</p>
          <Link href="/login" className="inline-block bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Trips</h1>
          <Link href="/modules/fuel-saver" className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium">
            + New Trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-slate-400 mb-6">Create your first trip using the Flight Planner</p>
            <Link href="/modules/fuel-saver" className="inline-block bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium">
              Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{trip.name || 'Untitled Trip'}</h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                      {trip.departureIcao && trip.arrivalIcao ? (
                        <>
                          <span className="text-sky-400">{trip.departureIcao}</span>
                          <span>→</span>
                          <span className="text-amber-400">{trip.arrivalIcao}</span>
                        </>
                      ) : (
                        <span>Route not specified</span>
                      )}
                      {trip.waypoints && trip.waypoints.length > 0 && (
                        <span className="text-slate-500">• {trip.waypoints.length} waypoints</span>
                      )}
                    </div>
                    {trip.createdAt && (
                      <div className="text-xs text-slate-500 mt-2">
                        Created {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Link 
                    href={`/modules/fuel-saver?load=${trip.id}`}
                    className="text-sky-400 hover:text-sky-300 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-slate-500 text-sm">
          {trips.length} trip{trips.length !== 1 ? 's' : ''} saved
        </div>
      </div>
    </div>
  );
}
