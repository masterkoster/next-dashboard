'use client';

import { useState, useRef, useEffect } from 'react';
import { Waypoint, downloadGPX, downloadFPL, downloadJSON, FlightPlanData } from '../lib/exportUtils';

interface ExportDropdownProps {
  waypoints: Waypoint[];
  flightPlanName?: string;
  aircraftType?: string;
  cruisingAltitude?: number;
  isPro?: boolean;
}

export default function ExportDropdown({ 
  waypoints, 
  flightPlanName, 
  aircraftType, 
  cruisingAltitude,
  isPro = false 
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
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
