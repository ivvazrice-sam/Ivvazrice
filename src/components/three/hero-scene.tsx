"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createDotTexture, createGrainMaterial } from "./grain-assets";
import { createRealGrainGeometry } from "./rice-grain";

/**
 * Cinematic hero: thousands of instanced rice grains that re-form as the visitor scrolls —
 * Paddy → Processing → Cleaning → Sorting → Polishing → Premium Rice → Packaging → Export.
 * Everything is one instanced draw call; formations are computed on the CPU and eased.
 */


const TAU = Math.PI * 2;
const wrap = (v: number) => v - Math.floor(v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const bump = (s: number, center: number, width = 0.7) => Math.max(0, 1 - Math.abs(s - center) / width);

/**
 * Auto-playing formation sequence: vortex → polishing drum → premium heap → sack → globe → (loop).
 * Each formation holds, then morphs into the next; grains turn from golden husk to polished pearl.
 */
const PLAYLIST = [1, 4, 5, 6, 7];
const HOLD = 4.2;
const MORPH = 2.6;
function stageAt(t: number) {
  const cycle = HOLD + MORPH;
  const k = Math.floor(t / cycle);
  const local = t - k * cycle;
  return {
    a: PLAYLIST[k % PLAYLIST.length],
    b: PLAYLIST[(k + 1) % PLAYLIST.length],
    f: local < HOLD ? 0 : (local - HOLD) / MORPH,
  };
}

/** Per-stage polish level driving the husk → pearl shader morph. */
const POLISH = [0, 0.06, 0.16, 0.3, 1, 1, 1, 1];
/** Camera path: [x, y, z] position and look-at y per stage. */
const CAM = [
  [0, 0, 9.6, 0],
  [0, 0.3, 8.8, 0],
  [0, 0, 8.6, 0],
  [0, 0, 7.8, 0],
  [0, 0, 8.4, 0],
  [0, 2.1, 8.4, -0.8],
  [0, 0.2, 8.4, 0],
  [0, 0.4, 9.4, 0],
];

interface GrainData {
  u: Float32Array; // 6 randoms per grain
  fib: Float32Array; // evenly distributed unit-sphere point per grain
  kind: Uint8Array; // 0 = grain, 1 = impurity (removed at cleaning), 2 = reject (removed at sorting)
  pos: Float32Array; // current x,y,z,scale
  quat: THREE.Quaternion[];
}

function createData(count: number): GrainData {
  const u = new Float32Array(count * 6);
  const fib = new Float32Array(count * 3);
  const kind = new Uint8Array(count);
  const pos = new Float32Array(count * 4);
  const quat: THREE.Quaternion[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < 6; k++) u[i * 6 + k] = Math.random();
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    fib[i * 3] = Math.cos(golden * i) * r;
    fib[i * 3 + 1] = y;
    fib[i * 3 + 2] = Math.sin(golden * i) * r;
    kind[i] = i % 17 === 0 ? 1 : i % 31 === 0 ? 2 : 0;
    pos[i * 4] = (u[i * 6] - 0.5) * 14;
    pos[i * 4 + 1] = (u[i * 6 + 1] - 0.5) * 9;
    pos[i * 4 + 2] = -6 + u[i * 6 + 2] * 8;
    pos[i * 4 + 3] = 0;
    quat.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(u[i * 6 + 3] * TAU, u[i * 6 + 4] * TAU, u[i * 6 + 5] * TAU)));
  }
  return { u, fib, kind, pos, quat };
}

const _e = new THREE.Euler();

/** Writes the target position/scale for grain i in a given stage into out[0..3]. */
function formation(stage: number, i: number, t: number, d: GrainData, out: Float32Array) {
  const o = i * 6;
  const u1 = d.u[o], u2 = d.u[o + 1], u3 = d.u[o + 2], u4 = d.u[o + 3], u5 = d.u[o + 4];
  const kind = d.kind[i];
  let x = 0, y = 0, z = 0, s = 1;

  if ((kind === 1 && stage >= 2) || (kind === 2 && stage >= 4)) {
    out[0] = (u1 - 0.5) * 8;
    out[1] = -7;
    out[2] = (u3 - 0.5) * 3;
    out[3] = 0;
    return;
  }

  switch (stage) {
    case 0: // Paddy — a slow, drifting field of golden grains with depth
      x = (u1 - 0.5) * 14 + Math.sin(t * 0.13 + u4 * TAU) * 0.45;
      y = (u2 - 0.5) * 8 + Math.sin(t * 0.17 + u5 * TAU) * 0.35;
      z = -7 + u3 * 9.5;
      break;
    case 1: {
      // Processing — a rising vortex feeding the line
      const h = u2;
      const a = u1 * TAU * 2 + t * (0.45 + (1 - h) * 0.7);
      const r = 0.25 + h * 2.5 + (u4 - 0.5) * 0.3;
      x = Math.cos(a) * r;
      y = -2.5 + h * 5.1;
      z = Math.sin(a) * r * 0.8;
      break;
    }
    case 2: {
      // Cleaning — a horizontal stream; impurities drop out (handled above)
      x = wrap(u1 + t * 0.045 * (0.8 + u2 * 0.4)) * 17 - 8.5;
      y = (u2 - 0.5) * 1.2 + Math.sin(x * 0.5 + t * 0.8) * 0.25;
      z = (u3 - 0.5) * 2.2;
      break;
    }
    case 3: {
      // Sorting — orderly lanes pass through an optical beam; rejects are ejected
      const lane = Math.floor(u2 * 7);
      x = wrap(u1 + t * 0.035) * 17 - 8.5;
      y = (lane - 3) * 0.36;
      z = (u3 - 0.5) * 0.18;
      if (kind === 2 && x > 0.8) {
        y += (x - 0.8) * 0.9;
        z += (x - 0.8) * 0.6;
        s = Math.max(0, 1 - (x - 0.8) / 3);
      }
      break;
    }
    case 4: {
      // Polishing — tumbling inside a turning drum
      const a = u1 * TAU + t * 0.7 * (0.8 + u3 * 0.4);
      const r = 2.1 + (u2 - 0.5) * 0.9;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
      z = (u3 - 0.5) * 1.2 + Math.sin(a * 3 + t) * 0.1;
      break;
    }
    case 5: {
      // Premium rice — a luminous heap, seen from above
      const R = 2.5;
      const r = Math.sqrt(u1) * R;
      const th = u2 * TAU;
      x = Math.cos(th) * r;
      z = Math.sin(th) * r * 0.9;
      y = -1.7 + (1 - (r / R) ** 2) * 2 * (0.9 + 0.1 * u3) + Math.sin(t * 0.6 + u4 * TAU) * 0.02;
      s = 1.2;
      break;
    }
    case 6: {
      // Packaging — grains settle into a pillow-shaped sack
      const fx = d.fib[i * 3], fy = d.fib[i * 3 + 1], fz = d.fib[i * 3 + 2];
      const sq = (v: number) => Math.sign(v) * Math.abs(v) ** 0.38;
      const bx = sq(fx) * 1.35, by = sq(fy) * 1.85, bz = sq(fz) * 0.72 * (1 - 0.25 * fy * fy);
      const a = t * 0.22 - 0.5;
      x = bx * Math.cos(a) + bz * Math.sin(a);
      z = -bx * Math.sin(a) + bz * Math.cos(a);
      y = by;
      break;
    }
    default: {
      // Export — the grains become a turning globe with an orbit of shipping lanes
      if (u5 < 0.14) {
        const a = u1 * TAU + t * 0.35;
        const r = 2.75 + (u2 - 0.5) * 0.2;
        const tilt = 0.35;
        x = Math.cos(a) * r;
        y = Math.sin(a) * r * Math.sin(tilt);
        z = Math.sin(a) * r * Math.cos(tilt) * 0.6;
        s = 0.8;
      } else {
        const fx = d.fib[i * 3], fy = d.fib[i * 3 + 1], fz = d.fib[i * 3 + 2];
        const a = t * 0.18;
        const R = 1.95;
        x = (fx * Math.cos(a) + fz * Math.sin(a)) * R;
        z = (-fx * Math.sin(a) + fz * Math.cos(a)) * R;
        y = fy * R;
        s = 0.85;
      }
    }
  }
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = s;
}

/** Target orientation for grain i in a stage. */
function orientation(stage: number, i: number, t: number, d: GrainData, q: THREE.Quaternion) {
  const o = i * 6;
  const u1 = d.u[o], u2 = d.u[o + 1], u3 = d.u[o + 2], u4 = d.u[o + 3];
  switch (stage) {
    case 2:
      _e.set(u1 * TAU + t * 0.6, (u2 - 0.5) * 0.5, (u3 - 0.5) * 0.5);
      break;
    case 3:
      _e.set(u1 * TAU, (u2 - 0.5) * 0.06, (u3 - 0.5) * 0.06);
      break;
    case 5:
    case 6:
    case 7:
      _e.set(u1 * TAU, u2 * TAU, u3 * TAU);
      break;
    default: {
      const speed = stage === 4 ? 1.6 : stage === 1 ? 0.7 : 0.25;
      _e.set(u1 * TAU + t * speed * (0.5 + u2), u3 * TAU + t * speed * 0.7 * (0.5 + u4), u2 * TAU);
    }
  }
  return q.setFromEuler(_e);
}

function Grains({ count, offsetX }: { count: number; offsetX: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const setDpr = useThree((s) => s.setDpr);
  const { geometry, material, uniforms, data } = useMemo(() => {
    const geometry = createRealGrainGeometry({ detail: count > 1200 ? 0.6 : 0.4 });
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = Math.random();
    geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    const { material, uniforms } = createGrainMaterial();
    return { geometry, material, uniforms, data: createData(count) };
  }, [count]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const k = data.kind[i];
      const v = 0.9 + data.u[i * 6 + 5] * 0.16;
      if (k === 1) c.setRGB(0.3, 0.27, 0.24);
      else if (k === 2) c.setRGB(v * 0.86, v * 0.8, v * 0.66);
      else c.setRGB(v, v, v * 0.98);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [count, data, geometry, material]);

  const tmp = useMemo(
    () => ({
      a: new Float32Array(4),
      b: new Float32Array(4),
      qa: new THREE.Quaternion(),
      qb: new THREE.Quaternion(),
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(),
      frames: 0,
      slow: 0,
      degraded: false,
    }),
    [],
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const { a: sa, b: sb, f } = stageAt(t);
    const damp = 1 - Math.exp(-Math.min(delta, 0.05) * 4.2);

    uniforms.uPolish.value = THREE.MathUtils.lerp(POLISH[sa], POLISH[sb], smooth(f));

    for (let i = 0; i < count; i++) {
      const fi = smooth(THREE.MathUtils.clamp(f * 1.7 - data.u[i * 6 + 5] * 0.7, 0, 1));
      formation(sa, i, t, data, tmp.a);
      orientation(sa, i, t, data, tmp.qa);
      if (fi > 0) {
        formation(sb, i, t, data, tmp.b);
        orientation(sb, i, t, data, tmp.qb);
        for (let k = 0; k < 4; k++) tmp.a[k] += (tmp.b[k] - tmp.a[k]) * fi;
        tmp.qa.slerp(tmp.qb, fi);
      }
      const o = i * 4;
      const dx = tmp.a[0] + offsetX - data.pos[o];
      const dy = tmp.a[1] - data.pos[o + 1];
      // Stream stages wrap around; snap instead of flying grains back across the frame.
      const k = Math.abs(dx) > 6 ? 1 : damp;
      data.pos[o] += dx * k;
      data.pos[o + 1] += dy * k;
      data.pos[o + 2] += (tmp.a[2] - data.pos[o + 2]) * k;
      data.pos[o + 3] += (tmp.a[3] - data.pos[o + 3]) * damp;
      data.quat[i].slerp(tmp.qa, damp);

      const sc = data.pos[o + 3] * 0.27;
      tmp.p.set(data.pos[o], data.pos[o + 1], data.pos[o + 2]);
      tmp.s.set(sc, sc, sc);
      m.setMatrixAt(i, tmp.m.compose(tmp.p, data.quat[i], tmp.s));
    }
    m.instanceMatrix.needsUpdate = true;

    // Adaptive quality: if the device struggles, halve the grain count and pixel ratio once.
    if (!tmp.degraded && t > 2) {
      tmp.frames++;
      if (delta > 1 / 30) tmp.slow++;
      if (tmp.frames >= 90) {
        if (tmp.slow > 45) {
          tmp.degraded = true;
          m.count = Math.floor(count / 2);
          setDpr(1);
        }
        tmp.frames = 0;
        tmp.slow = 0;
      }
    }
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

function Dust({ count, offsetX }: { count: number; offsetX: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geometry, material, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = -6 + Math.random() * 10;
      speeds[i] = 0.05 + Math.random() * 0.15;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.045,
      map: createDotTexture(),
      color: new THREE.Color("#e9cf94"),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material, speeds };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const st = stageAt(state.clock.elapsedTime);
    const s = st.a + (st.b - st.a) * smooth(st.f);
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const dt = Math.min(delta, 0.05);
    const cleaning = bump(s, 2, 1);
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds[i] * dt * (1 + cleaning * 4);
      if (y > 5) y = -5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    pts.position.x = offsetX * 0.5;
    material.opacity = 0.28 + cleaning * 0.5 + bump(s, 5, 1) * 0.25;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

function CameraRig({ offsetX, distance }: { offsetX: number; distance: number }) {
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const st = stageAt(state.clock.elapsedTime);
    const a = st.a;
    const b = st.b;
    const f = smooth(st.f);
    const [ax, ay, az, al] = CAM[a];
    const [bx, by, bz, bl] = CAM[b];
    const px = state.pointer.x * 0.35;
    const py = state.pointer.y * 0.2;
    target.set(offsetX * 0.12 + ax + (bx - ax) * f + px, ay + (by - ay) * f + py, (az + (bz - az) * f) * distance);
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 3);
    state.camera.position.lerp(target, k);
    look.set(offsetX * 0.18, al + (bl - al) * f, 0);
    state.camera.lookAt(look);
  });
  return null;
}

function Environment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Layout({ tier }: { tier: "low" | "high" }) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const desktop = size.width >= 1024;
  const offsetX = desktop ? 3.1 : 0;
  // Pull the camera back so each formation sits comfortably beside the headline.
  const distance = THREE.MathUtils.clamp(1.3 / aspect, 1, 1.9) * (desktop ? 1.4 : 1.25);
  return (
    <>
      <Grains count={tier === "high" ? 800 : 300} offsetX={offsetX} />
      <Dust count={tier === "high" ? 150 : 60} offsetX={offsetX} />
      <CameraRig offsetX={offsetX} distance={distance} />
    </>
  );
}

export default function HeroScene({
  tier,
  active,
  onReady,
}: {
  tier: "low" | "high";
  active: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.5] : [1, 1.2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: tier === "high", alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9.6], fov: 35, near: 0.1, far: 60 }}
      onCreated={() => onReady?.()}
      aria-hidden
    >
      <Environment />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#ffe9c4" />
      <directionalLight position={[6, -2, -4]} intensity={1.4} color="#9fb7c9" />
      <pointLight position={[2, 1, 4]} intensity={6} distance={14} color="#e9c27a" />
      <fog attach="fog" args={["#24412f", 9, 22]} />
      <Layout tier={tier} />
    </Canvas>
  );
}
