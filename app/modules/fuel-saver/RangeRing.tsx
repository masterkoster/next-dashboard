'use client';

import { useState, useEffect } from 'react';

interface RangeRingProps {
  center: [number, number];
  aircraft?: {
    fuelCapacity: number;
    burnRate: number;
    cruiseSpeed: number;
    unusableFuel?: number;
  };
  currentFuel?: number; // percentage or gallons
}

interface RangeRingResult {
  maxRangeNm: number;
  usableFuel: number;
  reserveFuel: number;
  withReserve: number;
}

/**
 * Calculate range ring parameters
 * Default: 45 min + 1 hour reserve = 1.75 hours
 */
export function calculateRange(
  fuelCapacity: number,
  burnRate: number,
  cruiseSpeed: number,
  currentFuelPercent: number = 100,
  unusableFuel: number = 2
): RangeRingResult {
  const currentFuel = (fuelCapacity * currentFuelPercent / 100) - unusableFuel;
  
  // Reserve: 45 min + 1 hour = 1.75 hours
  const reserveHours = 1.75;
  const reserveFuel = burnRate * reserveHours;
  
  // Usable fuel after reserves
  const usableFuel = Math.max(0, currentFuel - reserveFuel);
  
  // Range without reserve
  const maxRangeNm = (usableFuel / burnRate) * cruiseSpeed;
  
  // Range with reserve (what you can actually use)
  const withReserve = ((currentFuel - unusableFuel) / burnRate) * cruiseSpeed;
  
  return {
    maxRangeNm: Math.round(maxRangeNm),
    usableFuel: Math.round(usableFuel * 10) / 10,
    reserveFuel: Math.round(reserveFuel * 10) / 10,
    withReserve: Math.round(withReserve)
  };
}

/**
 * Range Ring Calculator Component
 */
export function RangeRingCalculator({ 
  onRangeChange, 
  initialCenter 
}: { 
  onRangeChange: (range: RangeRingResult, center: [number, number]) => void;
  initialCenter?: [number, number];
}) {
  const [fuelCapacity, setFuelCapacity] = useState(56); // gallons
  const [burnRate, setBurnRate] = useState(9.5); // gph
  const [cruiseSpeed, setCruiseSpeed] = useState(120); // kts
  const [currentFuel, setCurrentFuel] = useState(100); // percentage
  const [unusableFuel, setUnusableFuel] = useState(2); // gallons
  const [range, setRange] = useState<RangeRingResult | null>(null);

  // Use selected airport as center when available
  const [center, setCenter] = useState<[number, number]>(initialCenter || [39.8283, -98.5795]);

  // Calculate range whenever inputs change
  useEffect(() => {
    const result = calculateRange(fuelCapacity, burnRate, cruiseSpeed, currentFuel, unusableFuel);
    setRange(result);
    onRangeChange(result, center);
  }, [fuelCapacity, burnRate, cruiseSpeed, currentFuel, unusableFuel, center]);

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <span>⛽</span> Range Calculator
      </h3>
      
      {/* Quick Aircraft Select */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Quick Select</label>
        <select
          onChange={(e) => {
            const presets: Record<string, { fuel: number; burn: number; speed: number }> = {
              '172s': { fuel: 56, burn: 9.5, speed: 122 },
              '182t': { fuel: 87, burn: 13.5, speed: 150 },
              'pa28': { fuel: 48, burn: 8.5, speed: 120 },
              'sr22': { fuel: 92, burn: 12.5, speed: 180 },
              'bonanza': { fuel: 102, burn: 14, speed: 155 }
            };
            const preset = presets[e.target.value];
            if (preset) {
              setFuelCapacity(preset.fuel);
              setBurnRate(preset.burn);
              setCruiseSpeed(preset.speed);
            }
          }}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
        >
          <option value="">Custom</option>
          <option value="172s">Cessna 172S</option>
          <option value="182t">Cessna 182T</option>
          <option value="pa28">Piper Archer</option>
          <option value="sr22">Cirrus SR22</option>
          <option value="bonanza">Beechcraft Bonanza</option>
        </select>
      </div>

      {/* Manual Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Fuel (gal)</label>
          <input
            type="number"
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(Number(e.target.value))}
            min="1"
            max="500"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Fuel on Board</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={currentFuel}
              onChange={(e) => setCurrentFuel(Number(e.target.value))}
              min="10"
              max="100"
              className="flex-1"
            />
            <span className="text-white text-sm w-12 text-right">{currentFuel}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Burn Rate (gph)</label>
          <input
            type="number"
            value={burnRate}
            onChange={(e) => setBurnRate(Number(e.target.value))}
            min="1"
            max="50"
            step="0.5"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Cruise Speed (kts)</label>
          <input
            type="number"
            value={cruiseSpeed}
            onChange={(e) => setCruiseSpeed(Number(e.target.value))}
            min="50"
            max="500"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Unusable Fuel (gal)</label>
        <input
          type="number"
          value={unusableFuel}
          onChange={(e) => setUnusableFuel(Number(e.target.value))}
          min="0"
          max="10"
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
        />
      </div>

      {/* Results */}
      {range && (
        <div className="bg-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Max Range:</span>
            <span className="text-green-400 font-bold text-lg">{range.maxRangeNm} nm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">With 1.75hr Reserve:</span>
            <span className="text-yellow-400 font-semibold">{range.withReserve} nm</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Usable Fuel:</span>
            <span className="text-slate-300">{range.usableFuel} gal</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Reserve Required:</span>
            <span className="text-slate-300">{range.reserveFuel} gal</span>
          </div>
        </div>
      )}

      <button
        onClick={() => center && onRangeChange(range!, center)}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-lg py-2 text-sm font-medium"
      >
        Show on Map
      </button>
    </div>
  );
}

export default RangeRingCalculator;
