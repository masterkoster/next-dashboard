'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GhostAircraft } from './ghost-aircraft';

type AircraftModelProps = {
  /** Tail number / N-Number */
  nNumber: string;
  /** Aircraft length in feet (from specs) */
  length?: number;
  /** Wingspan in feet (from specs) */
  wingspan?: number;
  /** Number of engines */
  engineCount?: number;
  /** Aircraft manufacturer */
  manufacturer?: string;
  /** Aircraft model */
  model?: string;
  /** Optional custom .glb model path */
  modelPath?: string;
};

/**
 * Aircraft Model Component with Fallback
 * 
 * Tries to load a .glb file first.
 * If missing or on error, renders the procedural GhostAircraft.
 */
export function AircraftModel({
  nNumber,
  length,
  wingspan,
  engineCount = 1,
  manufacturer = 'Unknown',
  model = 'Unknown',
  modelPath,
}: AircraftModelProps) {
  const [hasModel, setHasModel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a custom model path is provided, try to load it
    if (modelPath) {
      // Check if model exists - in production, this would be an API call
      // For now, we'll assume the model doesn't exist and use fallback
      setHasModel(false);
    } else {
      // No custom path, use procedural ghost
      setHasModel(false);
    }
    setLoading(false);
  }, [modelPath, nNumber]);

  // Calculate specs from available data or use fallbacks
  const specs = {
    length: length || getDefaultLength(manufacturer, model),
    wingspan: wingspan || getDefaultWingspan(manufacturer, model),
    engineCount,
    manufacturer,
    model,
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading model...</div>
      </div>
    );
  }

  // If we have a real 3D model, render it
  // For now, always use the procedural ghost
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={50} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={1}
          maxDistance={20}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00aaff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6600" />
        
        {/* Environment for reflections */}
        <Environment preset="night" />
        
        {/* The Ghost Aircraft */}
        <GhostAircraft
          length={specs.length}
          wingspan={specs.wingspan}
          engineCount={specs.engineCount}
          manufacturer={specs.manufacturer}
          model={specs.model}
        />
        
        {/* Grid for reference */}
        <gridHelper args={[10, 20, '#1a3a4a', '#0a1a2a']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}

/**
 * Get default length based on manufacturer/model
 */
function getDefaultLength(manufacturer: string, model: string): number {
  const upperMfr = manufacturer.toUpperCase();
  const upperModel = model.toUpperCase();
  
  // Commercial jets
  if (upperMfr.includes('BOEING')) {
    if (upperModel.includes('737')) return 117;
    if (upperModel.includes('757')) return 155;
    if (upperModel.includes('767')) return 180;
    if (upperModel.includes('777')) return 209;
    if (upperModel.includes('787')) return 186;
  }
  
  if (upperMfr.includes('AIRBUS')) {
    if (upperModel.includes('A320')) return 123;
    if (upperModel.includes('A321')) return 145;
    if (upperModel.includes('A330')) return 209;
    if (upperModel.includes('A380')) return 239;
  }
  
  // Default GA sizes
  return 35; // ~Cessna 172 size
}

/**
 * Get default wingspan based on manufacturer/model
 */
function getDefaultWingspan(manufacturer: string, model: string): number {
  const upperMfr = manufacturer.toUpperCase();
  const upperModel = model.toUpperCase();
  
  // Commercial jets
  if (upperMfr.includes('BOEING')) {
    if (upperModel.includes('737')) return 117;
    if (upperModel.includes('757')) return 124;
    if (upperModel.includes('767')) return 156;
    if (upperModel.includes('777')) return 212;
    if (upperModel.includes('787')) return 197;
  }
  
  if (upperMfr.includes('AIRBUS')) {
    if (upperModel.includes('A320')) return 117;
    if (upperModel.includes('A321')) return 117;
    if (upperModel.includes('A330')) return 197;
    if (upperModel.includes('A380')) return 261;
  }
  
  // Default GA
  return 36; // ~Cessna 172
}

export default AircraftModel;
