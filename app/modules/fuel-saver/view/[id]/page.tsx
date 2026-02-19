'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// This page shows a static view of a saved flight plan
// without loading the interactive map

interface Waypoint {
  id?: string;
  icao: string;
  name?: string;
  city?: string;
  latitude: number;
  longitude: number;
  sequence?: number;
}

interface FlightPlan {
  id?: string;
  name?: string;
  callsign?: string;
  aircraftType?: string;
  pilotName?: string;
  departureTime?: string;
  cruisingAlt?: number;
  alternateIcao?: string;
  remarks?: string;
  soulsOnBoard?: number;
  departureFuel?: number;
  departureIcao?: string;
  arrivalIcao?: string;
  waypoints?: Waypoint[];
  createdAt?: string;
  updatedAt?: string;
}

// Simple distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Default aircraft profiles with W&B data
const AIRCRAFT_PROFILES = [
  { name: 'Cessna 172S', speed: 120, burnRate: 8.4, fuelCapacity: 56, emptyWeight: 1689, emptyCG: 39.1, maxWeight: 2550, arms: { frontSeats: 37.0, rearSeats: 73.0, baggage1: 95.0, baggage2: 123.0, fuel: 48.0 }, cgLimits: { forward: 35.0, aft: 47.3 } },
  { name: 'Cessna 182T', speed: 140, burnRate: 12, fuelCapacity: 88, emptyWeight: 1710, emptyCG: 39.0, maxWeight: 3100, arms: { frontSeats: 37.0, rearSeats: 73.0, baggage1: 95.0, baggage2: 123.0, fuel: 48.0 }, cgLimits: { forward: 35.0, aft: 47.3 } },
  { name: 'Cirrus SR22', speed: 155, burnRate: 14, fuelCapacity: 82, emptyWeight: 3400, emptyCG: 35.0, maxWeight: 3600, arms: { frontSeats: 35.0, rearSeats: 66.0, baggage1: 86.0, baggage2: 86.0, fuel: 48.0 }, cgLimits: { forward: 33.0, aft: 47.3 } },
  { name: 'Diamond DA40', speed: 140, burnRate: 10, fuelCapacity: 52, emptyWeight: 1650, emptyCG: 93.0, maxWeight: 2700, arms: { frontSeats: 85.0, rearSeats: 85.0, baggage1: 90.0, fuel: 90.0 }, cgLimits: { forward: 82.0, aft: 96.0 } },
  { name: 'Piper Archer', speed: 120, burnRate: 9, fuelCapacity: 48, emptyWeight: 1500, emptyCG: 35.0, maxWeight: 2550, arms: { frontSeats: 32.5, rearSeats: 75.0, baggage1: 95.0, fuel: 47.0 }, cgLimits: { forward: 31.0, aft: 47.3 } },
];

export default function ViewTripPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<FlightPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_PROFILES[0]);
  const [fuelPrice, setFuelPrice] = useState(6.50);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // If we have an ID, fetch from API
        if (params.id) {
          const res = await fetch(`/api/flight-plans?id=${params.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.flightPlans?.[0]) {
              setPlan(data.flightPlans[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [params.id]);

  // Calculate route stats
  const routeStats = useMemo(() => {
    if (!plan?.waypoints || plan.waypoints.length < 2) return null;

    let totalDist = 0;
    const legs: { from: string; to: string; distance: number }[] = [];

    for (let i = 1; i < plan.waypoints.length; i++) {
      const dist = calculateDistance(
        plan.waypoints[i-1].latitude, plan.waypoints[i-1].longitude,
        plan.waypoints[i].latitude, plan.waypoints[i].longitude
      );
      totalDist += dist;
      legs.push({
        from: plan.waypoints[i-1].icao,
        to: plan.waypoints[i].icao,
        distance: dist
      });
    }

    const timeHours = totalDist / selectedAircraft.speed;
    const fuelNeeded = (totalDist / selectedAircraft.speed) * selectedAircraft.burnRate * 1.25;
    const estimatedCost = fuelNeeded * fuelPrice;

    return {
      totalDistance: totalDist,
      totalTime: timeHours,
      fuelNeeded,
      estimatedCost,
      legs
    };
  }, [plan?.waypoints, selectedAircraft, fuelPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
          <p className="text-slate-400 mb-6">This trip doesn't exist or you don't have access.</p>
          <Link href="/trips" className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded">
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/trips" className="text-slate-400 hover:text-white">
              ← Back
            </Link>
            <div>
              <h1 className="text-xl font-bold">{plan.name || 'Flight Plan'}</h1>
              {plan.createdAt && (
                <p className="text-xs text-slate-400">
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/modules/fuel-saver?load=${plan.id}`}
              className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded text-sm"
            >
              ✏️ Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-sky-400">
              {routeStats?.totalDistance.toFixed(0) || '-'}
            </div>
            <div className="text-xs text-slate-400">Total NM</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {routeStats?.totalTime.toFixed(1) || '-'}h
            </div>
            <div className="text-xs text-slate-400">Flight Time</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {routeStats?.fuelNeeded.toFixed(0) || '-'}
            </div>
            <div className="text-xs text-slate-400">Gal Fuel</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              ${routeStats?.estimatedCost.toFixed(0) || '-'}
            </div>
            <div className="text-xs text-slate-400">Est. Cost</div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-bold mb-3">Flight Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {plan.callsign && (
              <div>
                <span className="text-slate-400">Callsign:</span> {plan.callsign}
              </div>
            )}
            {plan.pilotName && (
              <div>
                <span className="text-slate-400">Pilot:</span> {plan.pilotName}
              </div>
            )}
            {plan.aircraftType && (
              <div>
                <span className="text-slate-400">Aircraft:</span> {plan.aircraftType}
              </div>
            )}
            {plan.departureTime && (
              <div>
                <span className="text-slate-400">Departure:</span> {new Date(plan.departureTime).toLocaleString()}
              </div>
            )}
            {plan.cruisingAlt && (
              <div>
                <span className="text-slate-400">Altitude:</span> {plan.cruisingAlt} ft
              </div>
            )}
            {plan.soulsOnBoard && (
              <div>
                <span className="text-slate-400">Souls:</span> {plan.soulsOnBoard}
              </div>
            )}
          </div>
          {plan.remarks && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <span className="text-slate-400">Remarks:</span> {plan.remarks}
            </div>
          )}
        </div>

        {/* Calculator Settings */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-bold mb-3">Calculator Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Aircraft</label>
              <select
                value={selectedAircraft.name}
                onChange={(e) => setSelectedAircraft(AIRCRAFT_PROFILES.find(a => a.name === e.target.value) || AIRCRAFT_PROFILES[0])}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              >
                {AIRCRAFT_PROFILES.map(ac => (
                  <option key={ac.name} value={ac.name}>{ac.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fuel Price ($/gal)</label>
              <input
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Number(e.target.value))}
                step={0.1}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-bold mb-3">Route</h2>
          <div className="space-y-2">
            {plan.waypoints?.map((wp, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <span className="font-medium">{wp.icao}</span>
                  <span className="text-slate-400 ml-2 text-sm">{wp.name}</span>
                </div>
                {i > 0 && routeStats?.legs[i-1] && (
                  <span className="text-slate-400 text-sm">
                    {routeStats.legs[i-1].distance.toFixed(0)} NM
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nav Log Preview */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Nav Log</h2>
            <button
              onClick={() => window.print()}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
            >
              🖨️ Print
            </button>
          </div>
          
          {/* Simple Nav Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-2 py-1 text-left">From</th>
                  <th className="px-2 py-1 text-left">To</th>
                  <th className="px-2 py-1">Course</th>
                  <th className="px-2 py-1">Dist</th>
                  <th className="px-2 py-1">Time</th>
                  <th className="px-2 py-1">Fuel</th>
                </tr>
              </thead>
              <tbody>
                {plan.waypoints?.slice(1).map((wp, i) => {
                  const leg = routeStats?.legs[i];
                  const time = leg ? (leg.distance / selectedAircraft.speed * 60) : 0;
                  const fuel = leg ? (leg.distance / selectedAircraft.speed * selectedAircraft.burnRate * 1.25) : 0;
                  const course = i > 0 ? calculateCourse(
                    plan.waypoints![i-1].latitude, plan.waypoints![i-1].longitude,
                    wp.latitude, wp.longitude
                  ) : 0;
                  
                  return (
                    <tr key={i} className="border-t border-slate-700">
                      <td className="px-2 py-1">{plan.waypoints![i].icao}</td>
                      <td className="px-2 py-1">{wp.icao}</td>
                      <td className="px-2 py-1 text-center">{course}°</td>
                      <td className="px-2 py-1 text-center">{leg?.distance.toFixed(0)} NM</td>
                      <td className="px-2 py-1 text-center">{Math.floor(time)}:{((time % 1) * 60).toFixed(0).padStart(2, '0')}</td>
                      <td className="px-2 py-1 text-center">{fuel.toFixed(1)} gal</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-600 bg-slate-700 font-bold">
                  <td colSpan={3} className="px-2 py-1">TOTAL</td>
                  <td className="px-2 py-1 text-center">{routeStats?.totalDistance.toFixed(0)} NM</td>
                  <td className="px-2 py-1 text-center">{Math.floor(routeStats?.totalTime || 0)}:{(((routeStats?.totalTime || 0) % 1) * 60).toFixed(0).padStart(2, '0')}</td>
                  <td className="px-2 py-1 text-center">{routeStats?.fuelNeeded.toFixed(1)} gal</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-slate-500 mt-3 text-center">
            Generated by FuelSaver - For planning purposes only, not for navigation
          </p>
        </div>
      </div>
    </div>
  );
}

// Calculate bearing between two points
function calculateCourse(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const x = Math.sin(dLon) * Math.cos(lat2Rad);
  const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let course = (Math.atan2(x, y) * 180) / Math.PI;
  course = ((course % 360) + 360) % 360;
  return Math.round(course);
}
