"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createRealGrainGeometry, createRealGrainMaterial } from "./rice-grain";

/** Scene units = the ruler SVG's viewBox units (1000 × 250), so grains land exactly on the scale. */
export interface RulerGrainsProps {
  left: number;
  rawLen: number;
  cookedLen: number;
  rawY: number;
  cookedY: number;
  tone: string;
  showCooked: boolean;
  /** Visual grain width in viewBox units (keeps the grain inside its ruler row). */
  grainWidth: number;
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
    };
  }, [gl, scene]);
  return null;
}

const COOKED_WHITE = new THREE.Color("#fffaf0");

function Grain({ left, len, y, tone, cooked, visible, widthRef }: { left: number; len: number; y: number; tone: THREE.Color; cooked: boolean; visible: boolean; widthRef: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { geometry, material } = useMemo(() => {
    const geometry = createRealGrainGeometry({ detail: 1.2, cooked });
    const { material } = createRealGrainMaterial(tone, { cooked });
    material.transparent = true;
    material.opacity = cooked ? 0 : 1;
    return { geometry, material };
    // tone changes are animated below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooked]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 4);
    const tl = Math.max(1, len);
    m.scale.x += (tl - m.scale.x) * k;
    // widthRef is the desired on-screen width; geometry width is 0.25 (raw) / 0.3 (cooked) of unit length
    const w = cooked ? (widthRef * 1.12) / 0.3 : widthRef / 0.25;
    m.scale.y += (w - m.scale.y) * k;
    m.scale.z += (w - m.scale.z) * k;
    m.position.x = left + m.scale.x / 2;
    const op = visible ? 1 : 0;
    material.opacity += (op - material.opacity) * k;
    m.visible = material.opacity > 0.02;
    target.copy(tone);
    if (cooked) target.lerp(COOKED_WHITE, 0.55);
    material.color.lerp(target, k);
    // a gentle, slow sway so the grain reads as a real object
    m.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <mesh ref={mesh} geometry={geometry} material={material} position={[left, -y, 0]} rotation={[-1.15, 0, 0]} scale={[Math.max(1, len), widthRef / 0.25, widthRef / 0.25]} />
  );
}

export default function RulerGrainsScene({ left, rawLen, cookedLen, rawY, cookedY, tone, showCooked, grainWidth, onReady }: RulerGrainsProps) {
  const color = useMemo(() => new THREE.Color(tone), [tone]);
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ manual: true, left: 0, right: 1000, top: 0, bottom: -250, near: -2000, far: 2000, position: [0, 0, 500] } as never}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 0.95;
        (camera as THREE.OrthographicCamera).updateProjectionMatrix();
        onReady?.();
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Env />
      <ambientLight intensity={0.45} />
      <directionalLight position={[-300, 450, 700]} intensity={3.2} color="#fffaf0" />
      <directionalLight position={[500, -150, 400]} intensity={1.1} color="#e0ecff" />
      <pointLight position={[200, 300, -400]} intensity={0.8} color="#fff8e0" />
      <Grain left={left} len={rawLen} y={rawY} tone={color} cooked={false} visible widthRef={grainWidth} />
      <Grain left={left} len={showCooked ? cookedLen : rawLen} y={cookedY} tone={color} cooked visible={showCooked && cookedLen > 0} widthRef={grainWidth} />
    </Canvas>
  );
}
