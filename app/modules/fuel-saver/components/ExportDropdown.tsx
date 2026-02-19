'use client';

import { useState, useRef, useEffect } from 'react';
import { Waypoint, downloadGPX, downloadFPL, downloadJSON, downloadNavLog, downloadNavLogPdf, FlightPlanData, generateForeFlightDeepLink, generateGarminDeepLink } from '../lib/exportUtils';

interface ExportDropdownProps {
  waypoints: Waypoint[];
  flightPlanName?: string;
  aircraftType?: string;
  cruisingAltitude?: number;
  isPro?: boolean;
  aircraft?: {
    name: string;
    speed: number;
    burnRate: number;
    fuelCapacity: number;
  };
  fuelPrices?: Record<string, { price100ll: number | null }>;
}

export default function ExportDropdown({ 
  waypoints, 
  flightPlanName, 
  aircraftType, 
  cruisingAltitude,
  isPro = false,
  aircraft,
  fuelPrices = {}
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [navLogDetail, setNavLogDetail] = useState<'basic' | 'detailed' | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    const planData: FlightPlanData = {
      name: flightPlanName,
      waypoints,
      aircraftType,
      cruisingAltitude
    };
    
    // Encode to base64 for URL sharing
    const encoded = btoa(encodeURIComponent(JSON.stringify(planData)));
    const shareUrl = `${window.location.origin}/modules/fuel-saver?plan=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportGPX = () => {
    const planData: FlightPlanData = {
      name: flightPlanName,
      waypoints,
      aircraftType,
      cruisingAltitude
    };
    downloadGPX(planData);
    setIsOpen(false);
  };

  const handleExportFPL = () => {
    downloadFPL(waypoints);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    const planData: FlightPlanData = {
      name: flightPlanName,
      waypoints,
      aircraftType,
      cruisingAltitude
    };
    downloadJSON(planData);
    setIsOpen(false);
  };

  const handleExportNavLog = (detailed: boolean) => {
    if (!aircraft || waypoints.length < 2) return;
    downloadNavLog(
      waypoints,
      {
        name: aircraftType || aircraft.name,
        speed: aircraft.speed,
        burnRate: aircraft.burnRate,
        fuelCapacity: aircraft.fuelCapacity
      },
      cruisingAltitude || 5500,
      fuelPrices,
      detailed,
      flightPlanName
    );
    setIsOpen(false);
  };

  const handleExportNavLogPdf = (detailed: boolean) => {
    if (!aircraft || waypoints.length < 2) return;
    downloadNavLogPdf(
      waypoints,
      {
        name: aircraftType || aircraft.name,
        speed: aircraft.speed,
        burnRate: aircraft.burnRate,
        fuelCapacity: aircraft.fuelCapacity
      },
      cruisingAltitude || 5500,
      fuelPrices,
      {
        detailed,
        planName: flightPlanName
      }
    );
    setIsOpen(false);
  };

  const attemptDeepLink = (scheme: string, fallback?: string, label?: string) => {
    if (typeof window === 'undefined') return;
    try {
      const ua = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|android/.test(ua);
      if (isMobile) {
        window.location.href = scheme;
        return;
      }
      if (fallback) {
        window.open(fallback, '_blank', 'noopener');
      } else if (navigator?.clipboard) {
        navigator.clipboard.writeText(scheme);
      }
      alert(`${label || 'Link'} opened. If nothing happened, paste the copied link into your device.`);
    } catch (error) {
      console.error('Deep link failed', error);
      if (fallback) {
        window.open(fallback, '_blank', 'noopener');
      }
    }
  };

  const handleOpenForeFlight = () => {
    const link = generateForeFlightDeepLink(waypoints, {
      planName: flightPlanName || 'Flight Plan',
      altitude: cruisingAltitude || 5500,
    });
    if (!link) return;
    attemptDeepLink(link.scheme, link.fallback, 'ForeFlight link');
  };

  const handleOpenGarmin = () => {
    const link = generateGarminDeepLink(waypoints, {
      planName: flightPlanName || 'Flight Plan',
    });
    if (!link) return;
    attemptDeepLink(link.scheme, link.fallback, 'Garmin Pilot link');
  };

  const showNavLogTooltip = (detailed: boolean) => {
    if (detailed) {
      return 'Includes magnetic variation, wind correction, VOR info, groundspeed - for serious IFR planning';
    }
    return 'Simple format with course, distance, time, fuel, cost - quick reference';
  };

  if (waypoints.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
      >
        <span>📤</span>
        <span>Export</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="py-1">
            {/* Copy Shareable Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span className="text-lg">🔗</span>
              <div className="flex-1 text-left">
                <div>{copied ? '✅ Copied!' : 'Copy Shareable Link'}</div>
                <div className="text-xs text-slate-400">
                  {isPro ? 'Unlimited' : 'Free: 3 days'}
                </div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-1" />

            {/* GPX Export */}
            <button
              onClick={handleExportGPX}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span className="text-lg">🗺️</span>
              <div className="flex-1 text-left">
                <div>Export GPX</div>
                <div className="text-xs text-slate-400">ForeFlight, Garmin, SkyDemon</div>
              </div>
            </button>

            {/* FPL Export */}
            <button
              onClick={handleExportFPL}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span className="text-lg">📋</span>
              <div className="flex-1 text-left">
                <div>Export FPL</div>
                <div className="text-xs text-slate-400">Garmin 430/530/G1000</div>
              </div>
            </button>

            {/* JSON Export */}
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span className="text-lg">{'{ }'}</span>
              <div className="flex-1 text-left">
                <div>Export JSON</div>
                <div className="text-xs text-slate-400">Backup & custom use</div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-1" />
            <div className="px-4 py-1 text-xs uppercase tracking-wide text-slate-500">Send to EFB</div>

            <button
              onClick={handleOpenForeFlight}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">🛩️</span>
              <div className="flex-1 text-left">
                <div>Open in ForeFlight</div>
                <div className="text-xs text-slate-400">Mobile devices launch automatically</div>
              </div>
            </button>

            <button
              onClick={handleOpenGarmin}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">🧭</span>
              <div className="flex-1 text-left">
                <div>Open in Garmin Pilot</div>
                <div className="text-xs text-slate-400">Copies link on desktop</div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-1" />

            {/* Nav Log - Basic */}
            <button
              onClick={() => handleExportNavLog(false)}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={showNavLogTooltip(false)}
            >
              <span className="text-lg">📄</span>
              <div className="flex-1 text-left">
                <div>Nav Log (Basic)</div>
                <div className="text-xs text-slate-400">Simple format</div>
              </div>
            </button>

            {/* Nav Log - Detailed */}
            <button
              onClick={() => handleExportNavLog(true)}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={showNavLogTooltip(true)}
            >
              <span className="text-lg">📊</span>
              <div className="flex-1 text-left">
                <div>Nav Log (Detailed)</div>
                <div className="text-xs text-slate-400">Wind, mag var, headings</div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-1" />

            {/* Nav Log PDF - Basic */}
            <button
              onClick={() => handleExportNavLogPdf(false)}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">🖨️</span>
              <div className="flex-1 text-left">
                <div>Nav Log PDF</div>
                <div className="text-xs text-slate-400">Shareable PDF export</div>
              </div>
            </button>

            {/* Nav Log PDF - Detailed */}
            <button
              onClick={() => handleExportNavLogPdf(true)}
              disabled={waypoints.length < 2}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">🧾</span>
              <div className="flex-1 text-left">
                <div>Nav Log PDF (Detailed)</div>
                <div className="text-xs text-slate-400">Headings, winds, costs</div>
              </div>
            </button>

            {/* Pro Features Preview */}
            {!isPro && (
              <>
                <div className="border-t border-slate-700 my-1" />
                <div className="px-4 py-2 text-xs text-purple-300 bg-purple-500/10">
                  🔒 Pro: Unlimited sharing, more export formats
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
