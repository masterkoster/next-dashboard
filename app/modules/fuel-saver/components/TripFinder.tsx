'use client';

import { useState, useMemo } from 'react';
import { Airport } from '../page';

interface TripFinderProps {
  airports: Airport[];
  waypoints: {
    icao: string;
    latitude: number;
    longitude: number;
    name?: string;
  }[];
  aircraft?: {
    name: string;
    speed: number;
    burnRate: number;
    fuelCapacity: number;
  };
  fuelPrices: Record<string, { price100ll: number | null }>;
  onAddWaypoint: (airport: Airport) => void;
}

// Airport size classifications
const AIRPORT_SIZES = {
  large: { label: '🏙️ Large', minRunway: 8000, fee: 75 },
  medium: { label: '🏘️ Medium', minRunway: 5000, fee: 35 },
  small: { label: '🏚️ Small', minRunway: 0, fee: 15 }
};

type AirportSize = 'large' | 'medium' | 'small';
type TimeMode = 'per_leg' | 'per_day';

export default function TripFinder({
  airports,
  waypoints,
  aircraft,
  fuelPrices,
  onAddWaypoint
}: TripFinderProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Settings
  const [maxHours, setMaxHours] = useState(4);
  const [timeMode, setTimeMode] = useState<TimeMode>('per_leg');
  const [airportSize, setAirportSize] = useState<AirportSize>('medium');
  const [budget, setBudget] = useState(300);
  const [roundTrip, setRoundTrip] = useState(false);
  
  const [suggestedStops, setSuggestedStops] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Stats
  const tripStats = useMemo(() => {
    if (waypoints.length < 2 || !aircraft) return null;
    
    let totalDist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDist += calculateDistance(
        waypoints[i-1].latitude, waypoints[i-1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
    }
    if (roundTrip) totalDist *= 2;
    
    const gs = aircraft.speed * 0.8; // Assume 80% of cruise for winds
    const totalTime = totalDist / gs;
    const fuelNeeded = (totalDist / aircraft.speed) * aircraft.burnRate * 1.25;
    
    return {
      totalDistance: totalDist,
      totalTime,
      fuelNeeded,
      legsNeeded: Math.ceil(totalTime / maxHours)
    };
  }, [waypoints, aircraft, roundTrip, maxHours]);

  const handleFindStops = () => {
    if (!aircraft || waypoints.length < 2 || !tripStats) return;
    
    setIsCalculating(true);
    
    const gs = aircraft.speed * 0.8;
    const departure = waypoints[0];
    const arrival = waypoints[waypoints.length - 1];
    const stopsNeeded = Math.ceil(tripStats.totalTime / maxHours);
    
    // Get departure fuel price
    const depFuelPrice = fuelPrices[departure.icao]?.price100ll || 6.50;
    
    const stops: any[] = [];
    
    // For each stop needed, find a suitable airport along the route
    for (let stopNum = 1; stopNum <= stopsNeeded; stopNum++) {
      // Calculate where along the route this stop should be
      const fraction = stopNum / (stopsNeeded + 1);
      
      // Find point along great circle route (simplified: straight line)
      const routeLat = departure.latitude + (arrival.latitude - departure.latitude) * fraction;
      const routeLon = departure.longitude + (arrival.longitude - departure.longitude) * fraction;
      
      // Find suitable airports near this point
      const candidates = airports
        .filter(a => {
          // Skip departure and arrival
          if (a.icao === departure.icao || a.icao === arrival.icao) return false;
          if (!a.latitude || !a.longitude) return false;
          
          // Filter by airport size
          if (airportSize === 'large' && a.type !== 'large_airport') return false;
          if (airportSize === 'medium' && a.type === 'small_airport') return false;
          // small can go anywhere
          
          return true;
        })
        .map(a => ({
          airport: a,
          distFromRoute: calculateDistance(routeLat, routeLon, a.latitude, a.longitude)
        }))
        .filter(a => a.distFromRoute < 30) // Within 30nm of route
        .sort((a, b) => a.distFromRoute - b.distFromRoute)
        .slice(0, 5);
      
      if (candidates.length > 0) {
        const best = candidates[0];
        const distToStop = best.distFromRoute;
        
        // Calculate costs
        const fuelPrice = fuelPrices[best.airport.icao]?.price100ll || depFuelPrice;
        const fuelForLeg = (distToStop / aircraft.speed) * aircraft.burnRate * 1.25;
        const fuelCost = fuelForLeg * fuelPrice;
        
        // Landing fee based on airport size
        const landingFee = AIRPORT_SIZES[airportSize].fee;
        
        stops.push({
          stopNum,
          airport: best.airport,
          distanceFromPrevious: distToStop,
          timeFromPrevious: (distToStop / gs) * 60, // minutes
          fuelCost,
          landingFee,
          totalStopCost: fuelCost + landingFee
        });
      }
    }
    
    setSuggestedStops(stops);
    setIsCalculating(false);
  };

  const totalEstimatedCost = useMemo(() => {
    if (!tripStats) return 0;
    const depFuelPrice = fuelPrices[waypoints[0]?.icao]?.price100ll || 6.50;
    const fuelCost = tripStats.fuelNeeded * depFuelPrice;
    const landingFees = suggestedStops.length * AIRPORT_SIZES[airportSize].fee;
    return fuelCost + landingFees;
  }, [tripStats, suggestedStops, airportSize, fuelPrices, waypoints]);

  const hasValidRoute = waypoints.length >= 2 && aircraft;

  return (
    <div className="bg-slate-800 border-t border-slate-700">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-750 hover:bg-slate-750/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🛫</span>
          <span className="font-medium text-white">Trip Planner</span>
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-slate-400`}>
          ▼
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-3 space-y-3">
          {!waypoints[0] ? (
            <div className="text-center py-3 text-slate-400 text-sm">
              Add a departure airport to start
            </div>
          ) : !aircraft ? (
            <div className="text-center py-3 text-slate-400 text-sm">
              Select an aircraft
            </div>
          ) : hasValidRoute ? (
            <>
              {/* Trip Summary */}
              {tripStats && (
                <div className="bg-slate-700/50 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total distance:</span>
                    <span className="text-white font-medium">{tripStats.totalDistance.toFixed(0)} NM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flight time:</span>
                    <span className="text-white font-medium">{tripStats.totalTime.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stops needed:</span>
                    <span className="text-amber-400 font-medium">~{tripStats.legsNeeded}</span>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="space-y-2">
                {/* Time Mode */}
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setTimeMode('per_leg')}
                    className={`flex-1 py-1.5 rounded ${
                      timeMode === 'per_leg' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Per Leg
                  </button>
                  <button
                    onClick={() => setTimeMode('per_day')}
                    className={`flex-1 py-1.5 rounded ${
                      timeMode === 'per_day' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Per Day
                  </button>
                </div>

                {/* Max Hours */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Max {timeMode === 'per_leg' ? 'hours per leg' : 'hours per day'}
                  </label>
                  <input
                    type="number"
                    value={maxHours}
                    onChange={(e) => setMaxHours(Number(e.target.value))}
                    min={1}
                    max={12}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

                {/* Airport Size */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stop at</label>
                  <select
                    value={airportSize}
                    onChange={(e) => setAirportSize(e.target.value as AirportSize)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  >
                    <option value="large">{AIRPORT_SIZES.large.label}</option>
                    <option value="medium">{AIRPORT_SIZES.medium.label}</option>
                    <option value="small">{AIRPORT_SIZES.small.label}</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Budget</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={50}
                      step={25}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                </div>

                {/* Round Trip */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roundTrip}
                    onChange={(e) => setRoundTrip(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500"
                  />
                  <span className="text-sm text-slate-300">Round trip</span>
                </label>

                {/* Calculate Button */}
                <button
                  onClick={handleFindStops}
                  disabled={isCalculating || waypoints.length < 2}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                >
                  {isCalculating ? 'Finding stops...' : '🛫 Find Stops'}
                </button>
              </div>

              {/* Results */}
              {suggestedStops.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Suggested stops:</span>
                    <span className="text-emerald-400">Est: ${totalEstimatedCost.toFixed(0)}</span>
                  </div>
                  
                  {suggestedStops.map((stop, i) => (
                    <button
                      key={i}
                      onClick={() => onAddWaypoint(stop.airport)}
                      className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">{stop.airport.icao}</span>
                          <span className="text-slate-400 ml-2 text-xs">
                            {stop.airport.name?.substring(0, 15)}
                          </span>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-slate-400">{stop.distanceFromPrevious.toFixed(0)} NM</div>
                          <div className="text-amber-400">${stop.totalStopCost.toFixed(0)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {suggestedStops.length === 0 && !isCalculating && tripStats && (
                <div className="text-center py-2 text-slate-400 text-xs">
                  Click "Find Stops" to see suggested fuel stops
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-3 text-slate-400 text-sm">
              Add at least 2 waypoints to plan a route
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Haversine distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
