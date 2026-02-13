'use client';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo } from "react";

export type TailHistoryRecord = {
  nNumber: string;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  airworthinessDate?: string | null;
  lastActionDate?: string | null;
  status?: string | null;
  ownerName?: string | null;
  typeRegistrant?: string | null;
  engineManufacturer?: string | null;
  engineModel?: string | null;
  engineCount?: number | null;
};

type Timeline3DProps = {
  record: TailHistoryRecord | null;
};

type Node = {
  id: string;
  label: string;
  detail?: string;
  z: number;
};

function Ribbon({ nodes }: { nodes: Node[] }) {
  return (
    <group>
      {nodes.map((node) => (
        <mesh key={node.id} position={[0, 0, node.z]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#34d399" emissive="#0f172a" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {nodes.slice(1).map((node, index) => {
        const prev = nodes[index];
        const length = node.z - prev.z;
        return (
          <mesh key={`segment-${node.id}`} position={[0, 0, prev.z + length / 2]}>
            <cylinderGeometry args={[0.04, 0.04, length, 16]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0b1224" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function Labels({ nodes }: { nodes: Node[] }) {
  return (
    <group>
      {nodes.map((node) => (
        <group key={`label-${node.id}`} position={[0.75, 0, node.z]}>
          <mesh>
            <planeGeometry args={[2.5, 0.9]} />
            <meshStandardMaterial color="#0f172a" opacity={0.9} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Timeline3D({ record }: Timeline3DProps) {
  const nodes: Node[] = useMemo(() => {
    if (!record) return [];

    const parseDate = (value?: string | null): number | null => {
      if (!value) return null;
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const air = parseDate(record.airworthinessDate);
    const last = parseDate(record.lastActionDate);

    const dates = [air, last].filter((d): d is number => d !== null);
    const min = dates.length ? Math.min(...dates) : 0;

    const scale = (value: number | null) => {
      if (value === null) return 0;
      const months = (value - min) / (1000 * 60 * 60 * 24 * 30);
      return months * 0.3; // compress spacing
    };

    const items: Node[] = [];

    items.push({
      id: "birth",
      label: `Airworthiness: ${record.airworthinessDate ?? "unknown"}`,
      detail: `${record.manufacturer ?? ""} ${record.model ?? ""} SN ${
        record.serialNumber ?? ""
      }`,
      z: scale(air ?? min),
    });

    items.push({
      id: "status",
      label: `Status: ${record.status ?? "unknown"}`,
      detail: `Last action: ${record.lastActionDate ?? "unknown"}`,
      z: scale(last ?? air ?? min + 1),
    });

    items.push({
      id: "power",
      label: `Power: ${record.engineManufacturer ?? "?"} ${
        record.engineModel ?? "?"
      }`,
      detail: `${record.engineCount ?? "?"} engine(s)` ,
      z: scale((last ?? air ?? min) + 1),
    });

    items.push({
      id: "owner",
      label: `Owner: ${record.ownerName ?? "Unknown"}`,
      detail: `Registrant: ${record.typeRegistrant ?? "Unknown"}`,
      z: scale((last ?? air ?? min) + 2),
    });

    return items;
  }, [record]);

  if (!record) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
        Enter an N-Number to see the timeline.
      </div>
    );
  }

  return (
    <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/50">
      <Canvas>
        <color attach="background" args={[0.07, 0.09, 0.15]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#34d399" />
        <pointLight position={[-4, -4, -4]} intensity={0.4} color="#0ea5e9" />
        <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate />

        <group position={[0, 0, -1]}>
          <Ribbon nodes={nodes} />
          <Labels nodes={nodes} />
        </group>
      </Canvas>
    </div>
  );
}
