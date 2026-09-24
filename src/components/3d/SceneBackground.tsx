"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function AnimatedSphere({
  position,
  color,
  speed,
  distort,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.5}>
      <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={0.8}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const count = 80;
  const positions = Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 10,
    size: Math.random() * 0.03 + 0.01,
  }));

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
}

export default function SceneBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -5, 5]} intensity={0.5} color="#8b5cf6" />
        <AnimatedSphere position={[-3, 1, -2]} color="#06b6d4" speed={1} distort={0.4} />
        <AnimatedSphere position={[3, -1, -3]} color="#8b5cf6" speed={0.8} distort={0.3} />
        <AnimatedSphere position={[0, 2, -4]} color="#22d3ee" speed={1.2} distort={0.5} />
        <Particles />
      </Canvas>
    </div>
  );
}
