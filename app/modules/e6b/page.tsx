'use client';

import { useState } from 'react';

// E6B Functions
type E6BMode = 'wind' | 'fuel' | 'speed' | 'convert';

export default function E6BPage() {
  const [mode, setMode] = useState<E6BMode>('wind');
  
  // Wind components
  const [tas, setTas] = useState(120);
  const [heading, setHeading] = useState(360);
  const [windDir, setWindDir] = useState(270);
  const [windSpeed, setWindSpeed] = useState(15);
  const [windResult, setWindResult] = useState<{ gs: number; track: number; correction: number } | null>(null);
  
  // Fuel
  const [fuelBurn, setFuelBurn] = useState(8.5);
  const [flightTime, setFlightTime] = useState(2.5);
  const [fuelResult, setFuelResult] = useState<{ fuel: number; endurance: number } | null>(null);
  
  // Speed
  const [ias, setIas] = useState(100);
  const [altitude, setAltitude] = useState(6500);
  const [temp, setTemp] = useState(15);
  const [tasResult, setTasResult] = useState<number | null>(null);
  
  // Conversions
  const [convertFrom, setConvertFrom] = useState('nm');
  const [convertValue, setConvertValue] = useState(100);
  const [convertResult, setConvertResult] = useState<Record<string, number> | null>(null);

  const calculateWind = () => {
    const headingRad = (heading * Math.PI) / 180;
    const windRad = (windDir * Math.PI) / 180;
    
    const windFrom = windRad + Math.PI;
    const wx = windSpeed * Math.cos(windFrom);
    const wy = windSpeed * Math.sin(windFrom);
    
    const gsx = tas * Math.cos(headingRad) - wx;
    const gsy = tas * Math.sin(headingRad) - wy;
    
    const gs = Math.sqrt(gsx * gsx + gsy * gsy);
    const track = ((Math.atan2(gsy, gsx) * 180) / Math.PI + 360) % 360;
    const correction = track - heading;
    
    setWindResult({ gs: Math.round(gs), track: Math.round(track), correction: Math.round(correction) });
  };

  const calculateFuel = () => {
    const fuel = fuelBurn * flightTime;
    const endurance = 48 / fuelBurn; // Assuming 48 gal usable
    setFuelResult({ fuel: Math.round(fuel * 10) / 10, endurance: Math.round(endurance * 10) / 10 });
  };

  const calculateTAS = () => {
    // ISA temperature at altitude
    const isaTemp = 15 - (altitude / 1000) * 2;
    const oat = temp || isaTemp;
    const deltaT = oat - isaTemp;
    const mach = ias / 661.47;
    const tas = Math.round(ias * (1 + 0.2 * Math.pow(mach, 2) + deltaT * 0.004));
    setTasResult(tas);
  };

  const calculateConversions = () => {
    const v = convertValue;
    const results: Record<string, number> = {};
    
    if (convertFrom === 'nm') {
      results['NM'] = v;
      results['SM'] = Math.round(v * 1.15078);
      results['KM'] = Math.round(v * 1.852);
      results['MI'] = Math.round(v * 1852);
    } else if (convertFrom === 'sm') {
      results['NM'] = Math.round(v * 0.868976);
      results['SM'] = v;
      results['KM'] = Math.round(v * 1.60934);
      results['MI'] = v * 1609.34;
    } else if (convertFrom === 'gal') {
      results['Gal'] = v;
      results['L'] = Math.round(v * 3.78541);
      results['Lbs'] = Math.round(v * 6);
    } else if (convertFrom === 'lbs') {
      results['Lbs'] = v;
      results['Kg'] = Math.round(v * 0.453592);
      results['Gal'] = Math.round(v / 6 * 10) / 10;
    } else if (convertFrom === 'f') {
      results['°F'] = v;
      results['°C'] = Math.round((v - 32) * 5 / 9);
      results['K'] = Math.round((v - 32) * 5 / 9 + 273.15);
    } else if (convertFrom === 'ft') {
      results['ft'] = v;
      results['m'] = Math.round(v * 0.3048);
      results['FL'] = Math.round(v / 100);
    }
    
    setConvertResult(results);
  };

  const modes = [
    { id: 'wind', label: '💨 Wind' },
    { id: 'fuel', label: '⛽ Fuel' },
    { id: 'speed', label: '🚀 Speed' },
    { id: 'convert', label: '🔄 Convert' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">🧮 E6B Flight Computer</h1>
        
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as E6BMode)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                mode === m.id ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 space-y-4">
          {mode === 'wind' && (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">True Airspeed (kts)</label>
                <input type="number" value={tas} onChange={e => setTas(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Heading (°)</label>
                <input type="number" value={heading} onChange={e => setHeading(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Wind From (°)</label>
                  <input type="number" value={windDir} onChange={e => setWindDir(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Wind Speed (kts)</label>
                  <input type="number" value={windSpeed} onChange={e => setWindSpeed(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <button onClick={calculateWind} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg font-medium">
                Calculate
              </button>
              {windResult && (
                <div className="bg-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ground Speed:</span>
                    <span className="text-white font-bold">{windResult.gs} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track:</span>
                    <span className="text-white font-bold">{windResult.track}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wind Correction:</span>
                    <span className={`font-bold ${windResult.correction > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {windResult.correction > 0 ? '+' : ''}{windResult.correction}°
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === 'fuel' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fuel Burn (gph)</label>
                  <input type="number" value={fuelBurn} onChange={e => setFuelBurn(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" step="0.1" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Flight Time (hrs)</label>
                  <input type="number" value={flightTime} onChange={e => setFlightTime(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" step="0.1" />
                </div>
              </div>
              <button onClick={calculateFuel} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg font-medium">
                Calculate
              </button>
              {fuelResult && (
                <div className="bg-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuel Required:</span>
                    <span className="text-white font-bold">{fuelResult.fuel} gal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endurance:</span>
                    <span className="text-white font-bold">{fuelResult.endurance} hrs</span>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === 'speed' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">IAS (kts)</label>
                  <input type="number" value={ias} onChange={e => setIas(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Alt (ft)</label>
                  <input type="number" value={altitude} onChange={e => setAltitude(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Temp (°C)</label>
                  <input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <button onClick={calculateTAS} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg font-medium">
                Calculate TAS
              </button>
              {tasResult !== null && (
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-sm">True Airspeed</div>
                  <div className="text-3xl font-bold text-sky-400">{tasResult} kts</div>
                </div>
              )}
            </>
          )}

          {mode === 'convert' && (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Convert</label>
                <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white mb-2">
                  <option value="nm">Nautical Miles</option>
                  <option value="sm">Statute Miles</option>
                  <option value="gal">Gallons</option>
                  <option value="lbs">Pounds</option>
                  <option value="f">Fahrenheit</option>
                  <option value="ft">Feet</option>
                </select>
                <input type="number" value={convertValue} onChange={e => setConvertValue(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white mb-2" />
                <button onClick={calculateConversions} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg font-medium">
                  Convert
                </button>
              </div>
              {convertResult && (
                <div className="bg-slate-700 rounded-lg p-3 space-y-2">
                  {Object.entries(convertResult).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-white font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          Full Sporty's E6B functionality - more functions coming soon
        </div>
      </div>
    </div>
  );
}
