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
  onClearWaypoints?: () => void;
}

// Fetch fuel price for an airport
async function fetchFuelPrice(icao: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/fuel?icao=${icao}`);
    if (res.ok) {
      const data = await res.json();
      return data.average?.['100LL'] ? parseFloat(data.average['100LL']) : null;
    }
  } catch { /* ignore */ }
  return null;
}

// Airport size classifications
const AIRPORT_SIZES = {
  large: { label: '🏙️ Large', fee: 75 },
  medium: { label: '🏘️ Medium', fee: 35 },
  small: { label: '🏚️ Small', fee: 15 }
};

type AirportSize = 'large' | 'medium' | 'small';
type TimeMode = 'per_leg' | 'per_day';
type FinderMode = 'plan' | 'find' | 'cheapest';

export default function TripFinder({
  airports,
  waypoints,
  aircraft,
  fuelPrices,
  onAddWaypoint,
  onClearWaypoints
}: TripFinderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<FinderMode>('plan');
  
  // Plan mode settings
  const [maxHours, setMaxHours] = useState(4);
  const [timeMode, setTimeMode] = useState<TimeMode>('per_leg');
  const [airportSize, setAirportSize] = useState<AirportSize>('medium');
  
  // Find mode settings
  const [findBudget, setFindBudget] = useState(150);
  const [findMaxHours, setFindMaxHours] = useState(2);
  
  // Cheapest mode settings
  const [maxDetour, setMaxDetour] = useState(30); // max nm off route
  const [fuelPriceThreshold, setFuelPriceThreshold] = useState(0.50); // save at least this much
  
  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== PLAN MODE ====================
  const tripStats = useMemo(() => {
    if (waypoints.length < 2 || !aircraft) return null;
    
    let totalDist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDist += calculateDistance(
        waypoints[i-1].latitude, waypoints[i-1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
    }
    
    const gs = aircraft.speed * 0.8;
    const totalTime = totalDist / gs;
    const fuelNeeded = (totalDist / aircraft.speed) * aircraft.burnRate * 1.25;
    
    return {
      totalDistance: totalDist,
      totalTime,
      fuelNeeded,
      legsNeeded: Math.ceil(totalTime / maxHours)
    };
  }, [waypoints, aircraft, maxHours]);

  const handlePlanTrip = () => {
    if (!aircraft || waypoints.length < 2 || !tripStats) return;
    
    setIsCalculating(true);
    setError(null);
    
    const gs = aircraft.speed * 0.8;
    const departure = waypoints[0];
    const arrival = waypoints[waypoints.length - 1];
    const stopsNeeded = Math.ceil(tripStats.totalTime / maxHours);
    const depFuelPrice = fuelPrices[departure.icao]?.price100ll || 6.50;
    
    const stops: any[] = [];
    
    for (let stopNum = 1; stopNum <= stopsNeeded; stopNum++) {
      const fraction = stopNum / (stopsNeeded + 1);
      const routeLat = departure.latitude + (arrival.latitude - departure.latitude) * fraction;
      const routeLon = departure.longitude + (arrival.longitude - departure.longitude) * fraction;
      
      const candidates = airports
        .filter(a => {
          if (a.icao === departure.icao || a.icao === arrival.icao) return false;
          if (!a.latitude || !a.longitude) return false;
          if (airportSize === 'large' && a.type !== 'large_airport') return false;
          if (airportSize === 'medium' && a.type === 'small_airport') return false;
          return true;
        })
        .map(a => ({
          airport: a,
          distFromRoute: calculateDistance(routeLat, routeLon, a.latitude, a.longitude)
        }))
        .filter(a => a.distFromRoute < 30)
        .sort((a, b) => a.distFromRoute - b.distFromRoute)
        .slice(0, 5);
      
      if (candidates.length > 0) {
        const best = candidates[0];
        const fuelPrice = fuelPrices[best.airport.icao]?.price100ll || depFuelPrice;
        const fuelForLeg = (best.distFromRoute / aircraft.speed) * aircraft.burnRate * 1.25;
        
        stops.push({
          airport: best.airport,
          distanceFromPrevious: best.distFromRoute,
          fuelCost: fuelForLeg * fuelPrice,
          landingFee: AIRPORT_SIZES[airportSize].fee
        });
      }
    }
    
    setResults(stops);
    setIsCalculating(false);
  };

  // ==================== FIND MODE ====================
  const handleFindDestinations = () => {
    if (!aircraft || !waypoints[0]) return;
    
    setIsCalculating(true);
    setError(null);
    
    const departure = waypoints[0];
    const gs = aircraft.speed * 0.8;
    const maxDist = findMaxHours * gs;
    const depFuelPrice = fuelPrices[departure.icao]?.price100ll || 6.50;
    
    const destinations = airports
      .filter(a => a.icao !== departure.icao && a.latitude && a.longitude)
      .map(airport => {
        const dist = calculateDistance(
          departure.latitude, departure.longitude,
          airport.latitude, airport.longitude
        );
        const fuelNeeded = (dist / aircraft.speed) * aircraft.burnRate * 1.25;
        const fuelCost = fuelNeeded * (fuelPrices[airport.icao]?.price100ll || depFuelPrice);
        const landingFee = AIRPORT_SIZES.medium.fee;
        
        return {
          airport,
          distance: dist,
          timeHours: dist / gs,
          fuelCost,
          landingFee,
          totalCost: fuelCost + landingFee
        };
      })
      .filter(d => d.distance <= maxDist * 1.1)
      .filter(d => d.totalCost <= findBudget * 1.2)
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, 15);
    
    setResults(destinations);
    setIsCalculating(false);
  };

  // ==================== CHEAPEST MODE ====================
  const handleFindCheapestFuel = async () => {
    if (!aircraft || waypoints.length < 2) return;
    
    setIsCalculating(true);
    setError(null);
    
    const departure = waypoints[0];
    const arrival = waypoints[waypoints.length - 1];
    const gs = aircraft.speed * 0.8;
    const depFuelPrice = fuelPrices[departure.icao]?.price100ll || 6.50;
    
    // Calculate direct route distance
    const directDistance = calculateDistance(
      departure.latitude, departure.longitude,
      arrival.latitude, arrival.longitude
    );
    const directFuelNeeded = (directDistance / aircraft.speed) * aircraft.burnRate * 1.25;
    const directFuelCost = directFuelNeeded * depFuelPrice;
    
    // Find all airports within maxDetour of the route
    const candidateStops: any[] = [];
    
    // Sample points along the route
    const samplePoints = 10;
    for (let i = 1; i < samplePoints; i++) {
      const fraction = i / samplePoints;
      const routeLat = departure.latitude + (arrival.latitude - departure.latitude) * fraction;
      const routeLon = departure.longitude + (arrival.longitude - departure.longitude) * fraction;
      
      // Find airports near this point
      airports
        .filter(a => {
          if (a.icao === departure.icao || a.icao === arrival.icao) return false;
          if (!a.latitude || !a.longitude) return false;
          return true;
        })
        .forEach(airport => {
          const distFromRoute = calculateDistance(routeLat, routeLon, airport.latitude, airport.longitude);
          if (distFromRoute <= maxDetour) {
            // Try to get fuel price from prop, or fetch it
            let fuelPrice = fuelPrices[airport.icao]?.price100ll;
            
            // Check if we already have this price cached
            const cached = localStorage.getItem(`fuel_${airport.icao}`);
            if (!fuelPrice && cached) {
              fuelPrice = JSON.parse(cached).price100ll;
            }
            
            if (fuelPrice) {
              candidateStops.push({
                airport,
                detourDistance: distFromRoute,
                fuelPrice
              });
            }
          }
        });
    }
    
    // Find unique airports with fuel prices
    type CandidateStop = { airport: Airport; detourDistance: number; fuelPrice: number };
    const uniqueStops = candidateStops.reduce((acc: CandidateStop[], stop: CandidateStop) => {
      const existing = acc.find((s: CandidateStop) => s.airport.icao === stop.airport.icao);
      if (!existing || stop.detourDistance < existing.detourDistance) {
        const idx = acc.findIndex((s: CandidateStop) => s.airport.icao === stop.airport.icao);
        if (idx >= 0) acc[idx] = stop;
        else acc.push(stop);
      }
      return acc;
    }, [] as CandidateStop[]);
    
    // Calculate savings for each potential stop
    const withSavings = uniqueStops.map((stop: CandidateStop) => {
      const detourFuel = (stop.detourDistance / aircraft.speed) * aircraft.burnRate * 1.25;
      const detourCost = detourFuel * depFuelPrice;
      const fuelAtStop = directFuelNeeded * stop.fuelPrice;
      
      // Extra cost to divert vs fuel cost savings
      const savings = (directFuelCost - fuelAtStop) - detourCost;
      
      return {
        ...stop,
        detourFuel,
        detourCost,
        savings,
        worthIt: savings > fuelPriceThreshold * 10 // At least save $X to be worth it
      };
    })
    .filter((s: any) => s.worthIt)
    .sort((a: any, b: any) => b.savings - a.savings);
    
    // Calculate total potential savings with best stops
    const optimalStops: any[] = [];
    let remainingFuel = directFuelNeeded;
    let currentPos = { lat: departure.latitude, lon: departure.longitude };
    let totalSavings = 0;
    
    // Greedy: take stops that save money until no more savings
    for (const stop of withSavings) {
      const distToStop = calculateDistance(
        currentPos.lat, currentPos.lon,
        stop.airport.latitude, stop.airport.longitude
      );
      
      // Check if we can reach it with remaining fuel
      const fuelToStop = (distToStop / aircraft.speed) * aircraft.burnRate * 1.25;
      if (fuelToStop < remainingFuel * 0.9) {
        optimalStops.push({
          airport: stop.airport,
          detourDistance: stop.detourDistance,
          fuelPrice: stop.fuelPrice,
          savings: stop.savings,
          fuelAtStop: directFuelNeeded * stop.fuelPrice
        });
        totalSavings += stop.savings;
        remainingFuel = remainingFuel - fuelToStop + (aircraft.fuelCapacity * 0.5);
        currentPos = { lat: stop.airport.latitude, lon: stop.airport.longitude };
      }
    }
    
    const directCost = directFuelCost + AIRPORT_SIZES.medium.fee;
    const optimizedCost = directCost - totalSavings;
    
    setResults([{
      type: 'summary',
      directDistance,
      directCost,
      optimizedCost,
      totalSavings,
      stops: optimalStops
    }]);
    setIsCalculating(false);
  };

  const hasValidRoute = waypoints.length >= 2 && aircraft;

  return (
    <div className="bg-slate-800 border-t border-slate-700">
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-700">
        {[
          { id: 'plan', label: '🗺️ Plan' },
          { id: 'find', label: '🔍 Find' },
          { id: 'cheapest', label: '⛽ Cheapest' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id as FinderMode); setResults([]); }}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === tab.id 
                ? 'bg-slate-700 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Error message */}
          {error && (
            <div className="text-red-400 text-xs bg-red-900/30 p-2 rounded">
              {error}
            </div>
          )}

          {!waypoints[0] ? (
            <div className="text-center py-3 text-slate-400 text-sm">
              Add a departure airport to start
            </div>
          ) : !aircraft ? (
            <div className="text-center py-3 text-slate-400 text-sm">
              Select an aircraft
            </div>
          ) : mode === 'plan' ? (
            // ==================== PLAN MODE ====================
            <>
              {tripStats && (
                <div className="bg-slate-700/50 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="text-white">{tripStats.totalDistance.toFixed(0)} NM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-white">{tripStats.totalTime.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stops needed:</span>
                    <span className="text-amber-400">~{tripStats.legsNeeded}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setTimeMode('per_leg')}
                    className={`flex-1 py-1.5 rounded ${timeMode === 'per_leg' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Per Leg
                  </button>
                  <button
                    onClick={() => setTimeMode('per_day')}
                    className={`flex-1 py-1.5 rounded ${timeMode === 'per_day' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Per Day
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Max hours</label>
                  <input
                    type="number"
                    value={maxHours}
                    onChange={(e) => setMaxHours(Number(e.target.value))}
                    min={1}
                    max={12}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

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

                <button
                  onClick={handlePlanTrip}
                  disabled={isCalculating || waypoints.length < 2}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium"
                >
                  {isCalculating ? 'Finding...' : '🛫 Find Stops'}
                </button>
              </div>

              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((stop, i) => (
                    <button
                      key={i}
                      onClick={() => onAddWaypoint(stop.airport)}
                      className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">{stop.airport.icao}</span>
                          <span className="text-slate-400 ml-2 text-xs">{stop.airport.name?.substring(0, 15)}</span>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-slate-400">{stop.distanceFromPrevious.toFixed(0)} NM</div>
                          <div className="text-amber-400">${(stop.fuelCost + stop.landingFee).toFixed(0)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : mode === 'find' ? (
            // ==================== FIND MODE ====================
            <>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={findBudget}
                    onChange={(e) => setFindBudget(Number(e.target.value))}
                    min={50}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Max hours</label>
                  <input
                    type="number"
                    value={findMaxHours}
                    onChange={(e) => setFindMaxHours(Number(e.target.value))}
                    min={0.5}
                    step={0.5}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

                <button
                  onClick={handleFindDestinations}
                  disabled={isCalculating}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium"
                >
                  {isCalculating ? 'Searching...' : '🔍 Find Destinations'}
                </button>
              </div>

              {results.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.map((r: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => onAddWaypoint(r.airport)}
                      className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 text-left"
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium text-white">{r.airport.icao}</span>
                          <span className="text-slate-400 ml-2 text-xs">{r.airport.name?.substring(0, 12)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400">${r.totalCost.toFixed(0)}</div>
                          <div className="text-slate-400 text-xs">{r.distance.toFixed(0)} NM</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : mode === 'cheapest' ? (
            // ==================== CHEAPEST MODE ====================
            <>
              <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-2">
                Find cheapest fuel stops, even if it means a slight detour. Optimizes total trip cost.
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Max detour (NM)</label>
                  <input
                    type="number"
                    value={maxDetour}
                    onChange={(e) => setMaxDetour(Number(e.target.value))}
                    min={5}
                    max={50}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Min savings to worth it ($)</label>
                  <input
                    type="number"
                    value={fuelPriceThreshold}
                    onChange={(e) => setFuelPriceThreshold(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>

                <button
                  onClick={handleFindCheapestFuel}
                  disabled={isCalculating || waypoints.length < 2}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium"
                >
                  {isCalculating ? 'Optimizing...' : '⛽ Find Cheapest Fuel'}
                </button>
              </div>

              {results.length > 0 && results[0]?.type === 'summary' && (
                <div className="space-y-2">
                  <div className="bg-emerald-900/30 border border-emerald-700 rounded p-2 text-center">
                    <div className="text-emerald-400 font-bold text-lg">
                      Save ${results[0].totalSavings.toFixed(0)}
                    </div>
                    <div className="text-slate-400 text-xs">
                      Direct: ${results[0].directCost.toFixed(0)} → Optimized: ${results[0].optimizedCost.toFixed(0)}
                    </div>
                  </div>

                  {results[0].stops.length > 0 ? (
                    <>
                      <div className="text-xs text-slate-400">Suggested stops:</div>
                      {results[0].stops.map((stop: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => onAddWaypoint(stop.airport)}
                          className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 text-left"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-white">{stop.airport.icao}</span>
                              <span className="text-slate-400 ml-2 text-xs">${stop.fuelPrice.toFixed(2)}/gal</span>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-emerald-400">Save ${stop.savings.toFixed(0)}</div>
                              <div className="text-slate-400">+{stop.detourDistance.toFixed(0)} NM</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-2 text-slate-400 text-xs">
                      No cheaper fuel stops found on this route
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Haversine distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
