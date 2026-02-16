import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airport Lookup - AirNav",
  description: "Quickly look up any airport on AirNav.com for detailed information including fuel prices, services, and contact info.",
};

export default function AirportLookupPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/modules/fuel-saver" className="text-sky-400 hover:text-sky-300 mb-4 inline-block">
          ← Back to Fuel Saver
        </Link>
        
        <h1 className="text-2xl font-bold mb-4">Airport Quick Lookup</h1>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-300 mb-4">
            For detailed airport information including:
          </p>
          
          <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6">
            <li>Fuel prices (100LL, Jet-A)</li>
            <li>Control tower status & hours</li>
            <li>Attendance schedules</li>
            <li>Phone numbers & contacts</li>
            <li>Landing fees</li>
            <li>FBO services & amenities</li>
            <li>Runway information</li>
            <li>Weather & NOTAMs</li>
          </ul>
          
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sky-400 mb-2">How to use:</h3>
            <p className="text-sm text-slate-300">
              Enter an ICAO code (e.g., KORD) or search by airport name/city to go directly to AirNav.com for complete, up-to-date airport details.
            </p>
          </div>
          
          <form 
            action="https://www.airnav.com/airport/" 
            method="get"
            target="_blank"
            className="flex gap-2"
          >
            <input
              type="text"
              name="icao"
              placeholder="Enter ICAO code (e.g., KORD)"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              required
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-medium"
            >
              Go to AirNav
            </button>
          </form>
          
          <p className="text-xs text-slate-500 mt-4 text-center">
            Opens AirNav.com in a new tab for detailed airport information
          </p>
        </div>
        
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Popular Airports</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['KORD', 'KLAX', 'KJFK', 'KATL', 'KDFW', 'KDEN', 'KSFO', 'KSEA', 'KMIA', 'KBOS', 'KLAS', 'KPHX'].map(icao => (
              <a
                key={icao}
                href={`https://www.airnav.com/airport/${icao}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm text-center"
              >
                {icao}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
