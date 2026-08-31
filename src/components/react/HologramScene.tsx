import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A wireframe icosahedron inside a counter-rotating cage, easing toward the
 * pointer. Loaded only by Hologram.tsx, and only after the page goes idle —
 * three + R3F is ~860 KB and must never sit in the critical path.
 */
function Core() {
  const inner = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  const cageGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.35, 1)),
    [],
  );
  useEffect(() => () => cageGeometry.dispose(), [cageGeometry]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientY / innerHeight - 0.5) * 0.5;
      target.current.y = (e.clientX / innerWidth - 0.5) * 0.9;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, dt) => {
    const g = group.current;
    if (g) {
      // Ease toward the pointer instead of snapping — the lag reads as mass.
      g.rotation.x += (target.current.x - g.rotation.x) * Math.min(1, dt * 2.2);
      g.rotation.y += (target.current.y - g.rotation.y) * Math.min(1, dt * 2.2);
    }
    if (inner.current) inner.current.rotation.y += dt * 0.28;
    if (cage.current) {
      cage.current.rotation.y -= dt * 0.16;
      cage.current.rotation.z += dt * 0.06;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.45, 0]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.85} />
      </mesh>

      <mesh scale={1.02}>
        <icosahedronGeometry args={[1.45, 0]} />
        <meshBasicMaterial color="#9d00ff" transparent opacity={0.09} />
      </mesh>

      <lineSegments ref={cage} geometry={cageGeometry}>
        <lineBasicMaterial color="#ff00ff" transparent opacity={0.32} />
      </lineSegments>
    </group>
  );
}

export default function HologramScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
      flat
    >
      <Core />
    </Canvas>
  );
}
