'use client';

import { useState, useRef } from 'react';

interface TrackPoint {
  timestamp: string;
  lat: number;
  lon: number;
  alt?: number;
  speed?: number;
  heading?: number;
  vs?: number;
}

interface FlightRecording {
  id: string;
  filename: string;
  fileType: string;
  flightDate?: string;
  departure?: string;
  arrival?: string;
  duration?: number;
  track: TrackPoint[];
}

export default function FlightPlayback() {
  const [recording, setRecording] = useState<FlightRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Parse GPX file
  const parseGPX = (content: string): TrackPoint[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    const trkpts = doc.querySelectorAll('trkpt');
    
    const points: TrackPoint[] = [];
    trkpts.forEach((pt) => {
      const lat = parseFloat(pt.getAttribute('lat') || '0');
      const lon = parseFloat(pt.getAttribute('lon') || '0');
      const ele = pt.querySelector('ele')?.textContent;
      const time = pt.querySelector('time')?.textContent;
      
      if (lat && lon) {
        points.push({
          timestamp: time || new Date().toISOString(),
          lat,
          lon,
          alt: ele ? parseFloat(ele) : undefined,
        });
      }
    });
    
    return points;
  };

  // Parse CSV file (simple format)
  const parseCSV = (content: string): TrackPoint[] => {
    const lines = content.split('\n');
    const points: TrackPoint[] = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
          points.push({
            timestamp: parts[2] || new Date().toISOString(),
            lat,
            lon,
            alt: parts[3] ? parseFloat(parts[3]) : undefined,
            speed: parts[4] ? parseFloat(parts[4]) : undefined,
          });
        }
      }
    }
    
    return points;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ext = file.name.toLowerCase();
        let track: TrackPoint[] = [];
        let fileType = '';

        if (ext.endsWith('.gpx')) {
          track = parseGPX(content);
          fileType = 'GPX';
        } else if (ext.endsWith('.csv') || ext.endsWith('.igc')) {
          track = parseCSV(content);
          fileType = ext.endsWith('.igc') ? 'IGC' : 'CSV';
        } else {
          setError('Unsupported file format. Please upload GPX, CSV, or IGC files.');
          return;
        }

        if (track.length === 0) {
          setError('No valid track points found in file.');
          return;
        }

        // Calculate duration
        const startTime = new Date(track[0].timestamp).getTime();
        const endTime = new Date(track[track.length - 1].timestamp).getTime();
        const duration = Math.round((endTime - startTime) / 60000); // minutes

        // Try to extract departure/arrival from filename
        const filenameMatch = file.name.match(/([A-Z]{4})[-_]([A-Z]{4})/);
        
        const newRecording: FlightRecording = {
          id: crypto.randomUUID(),
          filename: file.name,
          fileType,
          flightDate: track[0]?.timestamp.split('T')[0],
          departure: filenameMatch?.[1],
          arrival: filenameMatch?.[2],
          duration,
          track,
        };

        setRecording(newRecording);
        setCurrentIndex(0);
        setIsPlaying(false);
      } catch (err) {
        setError('Error parsing file. Please check the format.');
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  // Playback control
  const togglePlayback = () => {
    if (!recording) return;
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start playing
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= recording.track.length - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentPoint = recording?.track[currentIndex];

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <span>🛫</span> Flight Playback
      </h3>

      {/* File Upload */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Import Flight (GPX, CSV, IGC)</label>
        <input
          type="file"
          accept=".gpx,.csv,.igc"
          onChange={handleFileUpload}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-sky-500 file:text-white file:cursor-pointer"
        />
        <p className="text-xs text-slate-500 mt-1">Import from ForeFlight, Garmin, CloudAhoy, etc.</p>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-2 rounded text-sm">{error}</div>
      )}

      {/* Recording Info */}
      {recording && (
        <>
          <div className="bg-slate-700 rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">File:</span>
              <span className="text-white">{recording.filename}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Format:</span>
              <span className="text-white">{recording.fileType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Duration:</span>
              <span className="text-white">{recording.duration} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Track Points:</span>
              <span className="text-white">{recording.track.length}</span>
            </div>
            {recording.departure && recording.arrival && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Route:</span>
                <span className="text-white">{recording.departure} → {recording.arrival}</span>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="space-y-3">
            {/* Progress */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={recording.track.length - 1}
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Start</span>
                <span>{currentIndex + 1} / {recording.track.length}</span>
                <span>End</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayback}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={resetPlayback}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded"
              >
                ⏹ Reset
              </button>
              
              {/* Speed */}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-slate-400">Speed:</span>
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded text-xs ${
                      playbackSpeed === speed 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Current Point Info */}
            {currentPoint && (
              <div className="bg-slate-700 rounded p-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Position:</span>
                  <span className="text-white ml-1">
                    {currentPoint.lat.toFixed(4)}, {currentPoint.lon.toFixed(4)}
                  </span>
                </div>
                {currentPoint.alt && (
                  <div>
                    <span className="text-slate-400">Altitude:</span>
                    <span className="text-white ml-1">{currentPoint.alt} ft</span>
                  </div>
                )}
                {currentPoint.speed && (
                  <div>
                    <span className="text-slate-400">Speed:</span>
                    <span className="text-white ml-1">{currentPoint.speed} kts</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Time:</span>
                  <span className="text-white ml-1">
                    {new Date(currentPoint.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tips */}
      {!recording && (
        <div className="text-xs text-slate-500 space-y-1">
          <p>Export your flight track from:</p>
          <ul className="list-disc list-inside">
            <li>ForeFlight: More → Track Logs → Export</li>
            <li>Garmin Pilot: My Flights → Export</li>
            <li>CloudAhoy: Import/Export → Download</li>
            <li>X-Plane: Track logs folder</li>
          </ul>
        </div>
      )}
    </div>
  );
}
