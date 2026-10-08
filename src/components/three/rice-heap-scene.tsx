"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildPile, createRealGrainGeometry, createRealGrainMaterial } from "./rice-grain";

export interface RiceHeapProps {
  color: string;
  tier: "low" | "high";
  active: boolean;
  /** Static render (no turntable, no interaction) — used to bake product images. */
  still?: boolean;
  seed?: number;
  onReady?: () => void;
}

function Env() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Pile({ color, tier, still, seed = 7 }: Omit<RiceHeapProps, "active" | "onReady">) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = tier === "high" ? 500 : 250;
  const { geometry, material, pile } = useMemo(() => {
    const geometry = createRealGrainGeometry({ detail: tier === "high" ? 0.45 : 0.3 });
    const { material } = createRealGrainMaterial(color);
    return { geometry, material, pile: buildPile(count, seed, 1.35, 0.31) };
    // colour changes are animated in useFrame, not by rebuilding
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed, tier]);
  const target = useMemo(() => new THREE.Color(color), [color]);
  const drag = useRef({ down: false, x: 0, vel: 0 });
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const mat = new THREE.Matrix4();
    const c = new THREE.Color();
    pile.forEach((g, i) => {
      mat.compose(g.p, g.q, new THREE.Vector3(0.31 * g.s, 0.31 * g.s, 0.31 * g.s));
      m.setMatrixAt(i, mat);
      m.setColorAt(i, c.setScalar(g.shade));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [pile, geometry, material]);

  useEffect(() => {
    if (still) return;
    const el = gl.domElement;
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.down = true;
      d.x = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!d.down) return;
      d.vel = (e.clientX - d.x) * 0.004;
      d.x = e.clientX;
      if (group.current) group.current.rotation.y += d.vel;
    };
    const up = () => (d.down = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, still]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.color.lerp(target, 1 - Math.exp(-dt * 5));
    if (still || !group.current) return;
    const d = drag.current;
    if (!d.down) {
      d.vel *= 0.94;
      group.current.rotation.y += dt * 0.12 + d.vel;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, material, pile.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}

/** Photoreal 3D rice heap (instanced, PBR, soft contact shadows). */
export default function RiceHeapScene({ color, tier, active, still, seed, onReady }: RiceHeapProps) {
  return (
    <Canvas
      shadows
      dpr={still ? 2 : tier === "high" ? [1, 2] : [1, 1.4]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: !!still, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.3, 4.45], fov: 30, near: 0.1, far: 30 }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0.22, 0);
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 0.92;
        onReady?.();
      }}
      style={{ touchAction: "pan-y", cursor: still ? "default" : "grab" }}
    >
      <Env />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[2.2, 4.2, 2.4]}
        intensity={3.2}
        color="#fff8e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={8}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.9} color="#e8f0ff" />
      <pointLight position={[0, 3, -3]} intensity={0.4} color="#fff5e0" />
      <Pile color={color} tier={tier} still={still} seed={seed} />
      {/* Contact shadow catcher on a transparent floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.28} />
      </mesh>
    </Canvas>
  );
}
