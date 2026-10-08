"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildLandDots, type LandDot } from "./land-mask";

export interface GlobeRoute {
  id: string;
  name: string;
  lat: number;
  lng: number;
  major: boolean;
}

export interface GlobeProps {
  origin: { name: string; lat: number; lng: number };
  routes: GlobeRoute[];
  focusId: string | null;
  tier: "low" | "high";
  active: boolean;
  labelRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
}

const R = 2;
const DEG = Math.PI / 180;

export function latLngToVec(lat: number, lng: number, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Rotation (about Y) that brings a longitude to face the camera. */
function facingRotation(lat: number, lng: number) {
  const v = latLngToVec(lat, lng);
  return { y: -Math.atan2(v.x, v.z), x: lat * DEG * 0.55 };
}

function LandPoints({ dots, tier }: { dots: LandDot[]; tier: "low" | "high" }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(dots.length * 3);
    const india = new Float32Array(dots.length);
    dots.forEach((d, i) => {
      const v = latLngToVec(d.lat, d.lng, R * 1.001);
      pos.set([v.x, v.y, v.z], i * 3);
      india[i] = d.india ? 1 : 0;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aIndia", new THREE.BufferAttribute(india, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uSize: { value: (tier === "high" ? 3.2 : 2.6) * dpr }, uTime: { value: 0 } },
      vertexShader: `
        attribute float aIndia;
        uniform float uSize; uniform float uTime;
        varying float vIndia; varying float vFacing;
        void main() {
          vIndia = aIndia;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normalize(position));
          vFacing = dot(n, normalize(-mv.xyz));
          gl_PointSize = uSize * (aIndia > 0.5 ? 1.35 : 1.0) * (6.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uTime;
        varying float vIndia; varying float vFacing;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          if (length(c) > 0.5) discard;
          float a = smoothstep(0.5, 0.2, length(c));
          float facing = smoothstep(-0.2, 0.6, vFacing);
          vec3 land = vec3(0.78, 0.66, 0.44);
          vec3 india = vec3(1.0, 0.82, 0.48) * (1.1 + 0.25 * sin(uTime * 2.0));
          vec3 col = mix(land, india, vIndia);
          gl_FragColor = vec4(col, a * mix(0.08, mix(0.55, 1.0, vIndia), facing));
        }`,
    });
    return { geometry, material };
  }, [dots, tier, dpr]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame((s) => (material.uniforms.uTime.value = s.clock.elapsedTime));
  return <points geometry={geometry} material={material} />;
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(vec3(0.85,0.66,0.36) * i, i); }",
      }),
    [],
  );
  const core = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "varying vec3 vN; void main(){ float f = pow(1.0 - max(dot(vN, vec3(0.0,0.0,1.0)), 0.0), 2.5); vec3 base = vec3(0.075,0.15,0.105); gl_FragColor = vec4(base + vec3(0.32,0.24,0.12) * f * 0.6, 1.0); }",
      }),
    [],
  );
  useEffect(
    () => () => {
      material.dispose();
      core.dispose();
    },
    [material, core],
  );
  return (
    <>
      <mesh material={core}>
        <sphereGeometry args={[R * 0.995, 64, 64]} />
      </mesh>
      <mesh material={material} scale={1.18}>
        <sphereGeometry args={[R, 64, 64]} />
      </mesh>
    </>
  );
}

function Route({ from, to, index, focused, dimmed }: { from: THREE.Vector3; to: THREE.Vector3; index: number; focused: boolean; dimmed: boolean }) {
  const ship = useRef<THREE.Mesh>(null);
  const { curve, geometry, material } = useMemo(() => {
    const a = from.clone().normalize();
    const b = to.clone().normalize();
    const angle = a.angleTo(b);
    const lift = 0.1 + (angle / Math.PI) * 0.55;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const v = new THREE.Vector3().copy(a).lerp(b, t).normalize();
      // proper great-circle interpolation
      const sinA = Math.sin(angle);
      if (sinA > 1e-4) v.copy(a).multiplyScalar(Math.sin((1 - t) * angle) / sinA).add(b.clone().multiplyScalar(Math.sin(t * angle) / sinA));
      pts.push(v.multiplyScalar(R * (1 + lift * Math.sin(Math.PI * t))));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geometry = new THREE.TubeGeometry(curve, 96, 0.0065, 6, false);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOffset: { value: index * 0.37 }, uStrength: { value: 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `
        uniform float uTime; uniform float uOffset; uniform float uStrength; varying vec2 vUv;
        void main(){
          float head = fract(uTime * 0.12 + uOffset);
          float d = vUv.x - head;
          float trail = d < 0.0 ? exp(d * 9.0) : exp(-d * 60.0);
          float a = (0.3 + trail * 0.9) * uStrength;
          vec3 col = mix(vec3(0.78,0.62,0.36), vec3(1.0,0.93,0.75), trail);
          gl_FragColor = vec4(col * a, a);
        }`,
    });
    return { curve, geometry, material };
  }, [from, to, index]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    const target = dimmed ? 0.25 : focused ? 1.8 : 1;
    material.uniforms.uStrength.value += (target - material.uniforms.uStrength.value) * 0.08;
    if (ship.current) {
      const h = (s.clock.elapsedTime * 0.12 + index * 0.37) % 1;
      const p = curve.getPointAt(h);
      ship.current.position.copy(p);
      ship.current.lookAt(curve.getPointAt(Math.min(1, h + 0.01)));
    }
  });

  return (
    <>
      <mesh geometry={geometry} material={material} />
      {/* Container "ship" travelling the lane */}
      <mesh ref={ship}>
        <boxGeometry args={[0.022, 0.022, 0.06]} />
        <meshBasicMaterial color="#f3dca6" />
      </mesh>
    </>
  );
}

function Marker({ position, origin, focused }: { position: THREE.Vector3; origin?: boolean; focused?: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  // Face the marker outward from the globe centre (circle normal = +Z).
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()), [position]);
  useFrame((s) => {
    if (!ring.current) return;
    const t = (s.clock.elapsedTime * (origin ? 0.6 : 0.8) + position.x) % 1;
    const scale = (origin ? 1.4 : 1) * (1 + t * 2.2) * (focused ? 1.4 : 1);
    ring.current.scale.setScalar(scale);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
  });
  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[origin ? 0.045 : 0.028, 20]} />
        <meshBasicMaterial color={origin ? "#ffd98a" : "#f4e3bd"} transparent opacity={0.95} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.04, 0.05, 32]} />
        <meshBasicMaterial color={origin ? "#e6b660" : "#e9d3a4"} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Globe({ origin, routes, focusId, tier, labelRefs }: Omit<GlobeProps, "active">) {
  const group = useRef<THREE.Group>(null);
  const [dots, setDots] = useState<LandDot[]>([]);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    let alive = true;
    buildLandDots(tier === "high" ? 1.25 : 1.6).then((d) => alive && setDots(d));
    return () => {
      alive = false;
    };
  }, [tier]);

  const originVec = useMemo(() => latLngToVec(origin.lat, origin.lng, R * 1.004), [origin.lat, origin.lng]);
  const routeVecs = useMemo(() => routes.map((r) => ({ ...r, vec: latLngToVec(r.lat, r.lng, R * 1.004) })), [routes]);

  const state = useRef({
    rotY: facingRotation(origin.lat, origin.lng).y - 0.5,
    rotX: facingRotation(origin.lat, origin.lng).x,
    targetY: facingRotation(origin.lat, origin.lng).y - 0.5,
    targetX: facingRotation(origin.lat, origin.lng).x,
    dragging: false,
    lastX: 0,
    lastY: 0,
    idle: 0,
  });

  // Pointer drag to rotate
  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.targetY += (e.clientX - s.lastX) * 0.006;
      s.targetX = THREE.MathUtils.clamp(s.targetX + (e.clientY - s.lastY) * 0.004, -0.9, 0.9);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.idle = 0;
    };
    const up = () => (s.dragging = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  // Focus a destination: rotate to the midpoint of the lane.
  useEffect(() => {
    const r = routes.find((x) => x.id === focusId);
    if (!r) return;
    const mid = facingRotation((origin.lat + r.lat) / 2, (origin.lng + r.lng) / 2);
    const s = state.current;
    // choose the equivalent angle closest to the current one
    const twoPi = Math.PI * 2;
    s.targetY = mid.y + Math.round((s.rotY - mid.y) / twoPi) * twoPi;
    s.targetX = mid.x;
    s.idle = -4;
  }, [focusId, routes, origin.lat, origin.lng]);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), n: new THREE.Vector3(), c: new THREE.Vector3() }), []);

  useFrame((_, delta) => {
    const s = state.current;
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    s.idle += dt;
    if (!s.dragging && s.idle > 2 && !focusId) s.targetY += dt * 0.06;
    s.rotY += (s.targetY - s.rotY) * (1 - Math.exp(-dt * 3));
    s.rotX += (s.targetX - s.rotX) * (1 - Math.exp(-dt * 3));
    g.rotation.set(s.rotX, s.rotY, 0);
    g.updateMatrixWorld();

    // Project HTML labels
    const labels = labelRefs.current;
    if (!labels) return;
    const place = (key: string, local: THREE.Vector3) => {
      const el = labels[key];
      if (!el) return;
      tmp.v.copy(local).applyMatrix4(g.matrixWorld);
      tmp.n.copy(tmp.v).normalize();
      tmp.c.copy(camera.position).sub(tmp.v).normalize();
      const facing = tmp.n.dot(tmp.c);
      tmp.v.project(camera);
      const x = (tmp.v.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = facing > 0.15 ? "1" : "0";
    };
    place("origin", originVec);
    for (const r of routeVecs) place(r.id, r.vec);
  });

  return (
    <group ref={group}>
      <Atmosphere />
      {dots.length > 0 && <LandPoints dots={dots} tier={tier} />}
      <Marker position={originVec} origin />
      {routeVecs.map((r, i) => (
        <group key={r.id}>
          <Route from={originVec} to={r.vec} index={i} focused={focusId === r.id} dimmed={!!focusId && focusId !== r.id} />
          <Marker position={r.vec} focused={focusId === r.id} />
        </group>
      ))}
    </group>
  );
}

export default function GlobeScene(props: GlobeProps) {
  return (
    <Canvas
      dpr={props.tier === "high" ? [1, 1.75] : [1, 1.3]}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.4], fov: 38 }}
      style={{ touchAction: "pan-y", cursor: "grab" }}
    >
      <Globe {...props} />
    </Canvas>
  );
}
