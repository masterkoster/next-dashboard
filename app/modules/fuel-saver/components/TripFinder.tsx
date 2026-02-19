'use client';

import { useState, useMemo } from 'react';
import { Airport } from '../page';

interface TripFinderProps {
  airports: Airport[];
  departureAirport?: {
    icao: string;
    latitude: number;
    longitude: number;
  };
  aircraft?: {
    name: string;
    speed: number;
    burnRate: number;
    fuelCapacity: number;
  };
  fuelPrices: Record<string, { price100ll: number | null }>;
  onSelectAirport: (airport: Airport) => void;
}

export default function TripFinder({
  airports,
  departureAirport,
  aircraft,
  fuelPrices,
  onSelectAirport
}: TripFinderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [budget, setBudget] = useState(150);
  const [maxHours, setMaxHours] = useState(2);
  const [roundTrip, setRoundTrip] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Calculate max range based on budget and aircraft
  const maxRangeNM = useMemo(() => {
    if (!aircraft || !departureAirport) return 0;
    
    // Get fuel price at departure
    const fuelPrice = fuelPrices[departureAirport.icao]?.price100ll || 6.50;
    
    // Calculate fuel cost budget (budget minus some buffer for FBO fees)
    const fboBuffer = roundTrip ? 60 : 30; // Estimated FBO fees
    const fuelBudget = Math.max(0, budget - fboBuffer);
    
    // Calculate max fuel that can be purchased
    const maxFuel = fuelBudget / fuelPrice;
    
    // Calculate range (accounting for reserves - assume 1 hour reserve)
    const usableFuel = Math.min(maxFuel, aircraft.fuelCapacity * 0.8); // 80% of tank
    const reserveFuel = aircraft.burnRate * 1; // 1 hour reserve
    const burnableFuel = Math.max(0, usableFuel - reserveFuel);
    
    // Range in NM
    return (burnableFuel / aircraft.burnRate) * aircraft.speed;
  }, [aircraft, budget, roundTrip, departureAirport, fuelPrices]);

  const handleSearch = () => {
    if (!departureAirport || !aircraft) return;
    
    setIsSearching(true);
    
    // Calculate distance from departure to all airports
    const withDistances = airports
      .filter(a => a.icao !== departureAirport.icao && a.latitude && a.longitude)
      .map(airport => {
        const dist = calculateDistance(
          departureAirport.latitude,
          departureAirport.longitude,
          airport.latitude,
          airport.longitude
        );
        
        // Estimate fuel cost
        const fuelPrice = fuelPrices[airport.icao]?.price100ll || 
                          fuelPrices[departureAirport.icao]?.price100ll || 
                          6.50;
        
        // Fuel needed (with reserves)
        const fuelNeeded = (dist / aircraft.speed) * aircraft.burnRate * 1.25;
        
        // If round trip, double the distance
        const totalDist = roundTrip ? dist * 2 : dist;
        const totalFuel = (totalDist / aircraft.speed) * aircraft.burnRate * 1.25;
        
        // Cost estimate
        const fuelCost = totalFuel * fuelPrice;
        const fboFee = 30; // Approximate landing fee
        const estimatedCost = fuelCost + fboFee;
        
        // Time estimate (using cruise speed)
        const timeHours = totalDist / aircraft.speed;
        
        return {
          airport,
          distance: dist,
          totalDistance: totalDist,
          estimatedCost,
          timeHours,
          fuelPrice
        };
      })
      .filter(r => r.totalDistance <= maxRangeNM * 1.1) // 10% buffer
      .filter(r => r.timeHours <= maxHours * (roundTrip ? 2 : 1))
      .filter(r => r.estimatedCost <= budget * 1.2) // 20% buffer
      .sort((a, b) => a.estimatedCost - b.estimatedCost)
      .slice(0, 20);
    
    setResults(withDistances);
    setIsSearching(false);
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-750 hover:bg-slate-750/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-medium text-white">Trip Finder</span>
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-slate-400`}>
          ▼
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-3 space-y-3">
          {!departureAirport ? (
            <div className="text-center py-4 text-slate-400 text-sm">
              Add a departure airport to start
            </div>
          ) : !aircraft ? (
            <div className="text-center py-4 text-slate-400 text-sm">
              Select an aircraft to calculate range
            </div>
          ) : (
            <>
              {/* Input Fields */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    💰 Budget (fuel + fees)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={50}
                      max={2000}
                      step={25}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ⏱️ Max flight time (one way)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={maxHours}
                      onChange={(e) => setMaxHours(Number(e.target.value))}
                      min={0.5}
                      max={10}
                      step={0.5}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                    <span className="text-slate-400 text-sm">hrs</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roundTrip}
                    onChange={(e) => setRoundTrip(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500"
                  />
                  <span className="text-sm text-slate-300">Round trip</span>
                </label>

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                >
                  {isSearching ? 'Searching...' : '🔍 Find Destinations'}
                </button>
              </div>

              {/* Range Info */}
              {maxRangeNM > 0 && (
                <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-2">
                  Max range: ~{Math.round(maxRangeNM)} NM on ${budget} budget
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs text-slate-400">
                    Found {results.length} destinations within budget
                  </div>
                  {results.map((result) => (
                    <button
                      key={result.airport.icao}
                      onClick={() => onSelectAirport(result.airport)}
                      className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">{result.airport.icao}</span>
                          <span className="text-slate-400 ml-2 text-xs">
                            {result.airport.name?.substring(0, 20)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 text-sm font-medium">
                            ${result.estimatedCost.toFixed(0)}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {Math.round(result.totalDistance)} NM • {result.timeHours.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.length === 0 && !isSearching && departureAirport && aircraft && (
                <div className="text-center py-2 text-slate-400 text-xs">
                  No destinations found. Try increasing budget or time.
                </div>
              )}
            </>
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
