'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

type GhostAircraftProps = {
  /** Aircraft length in feet */
  length?: number;
  /** Wingspan in feet */
  wingspan?: number;
  /** Number of engines */
  engineCount?: number;
  /** Aircraft manufacturer (for display) */
  manufacturer?: string;
  /** Aircraft model (for display) */
  model?: string;
};

/**
 * Procedural Aircraft "Ghost" Component
 * Renders a wireframe aircraft blueprint visualization
 */
export function GhostAircraft({
  length = 35,      // Default: similar to Cessna 172
  wingspan = 36,    // Default: similar to Cessna 172
  engineCount = 1,
  manufacturer = 'Unknown',
  model = 'Unknown'
}: GhostAircraftProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Scale factors - normalize to reasonable 3D units
  const scale = useMemo(() => {
    const maxDim = Math.max(length, wingspan);
    return 2 / maxDim; // Normalize so max dimension is 2 units
  }, [length, wingspan]);

  const scaledLength = length * scale;
  const scaledWingspan = wingspan * scale;
  const scaledHeight = scaledLength * 0.15; // Approximate height ratio

  // Pulse animation
  useFrame((state) => {
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 0.4;
      materialRef.current.opacity = pulse;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // Engine positions based on engine count
  const enginePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    if (engineCount === 1) {
      // Single engine - front center
      positions.push([scaledLength * 0.35, 0, 0]);
    } else if (engineCount === 2) {
      // Twin engine - wing mounted
      positions.push([scaledLength * 0.2, 0, scaledWingspan * 0.25]);
      positions.push([scaledLength * 0.2, 0, -scaledWingspan * 0.25]);
    } else if (engineCount === 3) {
      // Three engine - typical tri-jet
      positions.push([scaledLength * 0.35, scaledHeight * 0.3, 0]); // Tail
      positions.push([scaledLength * 0.15, 0, scaledWingspan * 0.3]);
      positions.push([scaledLength * 0.15, 0, -scaledWingspan * 0.3]);
    } else if (engineCount === 4) {
      // Four engine - quad
      positions.push([scaledLength * 0.15, 0, scaledWingspan * 0.35]);
      positions.push([scaledLength * 0.15, 0, -scaledWingspan * 0.35]);
      positions.push([scaledLength * 0.15, 0, scaledWingspan * 0.35]);
      positions.push([scaledLength * 0.15, 0, -scaledWingspan * 0.35]);
    }
    return positions;
  }, [engineCount, scaledLength, scaledWingspan, scaledHeight]);

  return (
    <group ref={groupRef}>
      {/* Fuselage - Main body */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[scaledHeight * 0.15, scaledHeight * 0.2, scaledLength * 0.7, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#00aaff"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[scaledLength * 0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[scaledHeight * 0.15, scaledLength * 0.15, 16]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Tail cone */}
      <mesh position={[-scaledLength * 0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[scaledHeight * 0.1, scaledLength * 0.12, 16]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Main Wings */}
      <mesh position={[scaledLength * 0.05, 0, 0]}>
        <boxGeometry args={[scaledLength * 0.4, 0.02, scaledWingspan]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Horizontal Stabilizer (Tail) */}
      <mesh position={[-scaledLength * 0.38, scaledHeight * 0.1, 0]}>
        <boxGeometry args={[scaledLength * 0.15, 0.015, scaledWingspan * 0.35]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Vertical Stabilizer */}
      <mesh position={[-scaledLength * 0.38, scaledHeight * 0.2, 0]}>
        <boxGeometry args={[scaledLength * 0.15, scaledHeight * 0.35, 0.015]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Engines */}
      {enginePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[scaledHeight * 0.08, scaledHeight * 0.1, scaledLength * 0.12, 12]} />
          <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Cockpit */}
      <mesh position={[scaledLength * 0.28, scaledHeight * 0.08, 0]}>
        <boxGeometry args={[scaledLength * 0.12, scaledHeight * 0.1, scaledHeight * 0.12]} />
        <meshStandardMaterial color="#00aaff" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Label */}
      <Html
        position={[0, scaledHeight * 0.8, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
        }}
      >
        <div style={{
          background: 'rgba(0, 20, 40, 0.85)',
          border: '1px solid #00aaff',
          borderRadius: '4px',
          padding: '6px 12px',
          color: '#00aaff',
          fontSize: '11px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          textShadow: '0 0 10px #00aaff',
          boxShadow: '0 0 20px rgba(0, 170, 255, 0.3)',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
            Generated from FAA Data Spec v2.1
          </div>
          <div style={{ opacity: 0.7, fontSize: '10px' }}>
            {manufacturer} {model}
          </div>
          <div style={{ opacity: 0.5, fontSize: '9px', marginTop: '2px' }}>
            L: {length}' | WS: {wingspan}' | {engineCount}x Engine
          </div>
        </div>
      </Html>
    </group>
  );
}

export default GhostAircraft;
