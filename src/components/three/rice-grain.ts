import * as THREE from "three";

/**
 * Photoreal rice kernel geometry (length = 1 along X, centred at the origin):
 * full-bodied ellipsoid cross-section, gently bowed back, slightly oblique tapered tip and
 * the small embryo notch at the base — the details that make a grain read as real rice.
 */
export function createRealGrainGeometry({ detail = 1, cooked = false }: { detail?: number; cooked?: boolean } = {}) {
  const geo = new THREE.SphereGeometry(0.5, Math.round(56 * detail), Math.round(28 * detail));
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const u = v.x / 0.5; // -1 (base / embryo end) … 1 (tip)
    const ny = v.y / 0.5;
    const nz = v.z / 0.5;
    // Fuller body than a plain ellipsoid (superellipse along the length)
    const body = Math.min(1.35, Math.pow(Math.max(1e-4, 1 - u * u), -0.08));
    // Broad face lies horizontally (Z = width, seen from above); Y = thickness.
    let w = v.z * (cooked ? 0.3 : 0.25) * body;
    const t = v.y * (cooked ? 0.26 : 0.19) * body * (u > 0.35 ? 1 - 0.2 * ((u - 0.35) / 0.65) ** 2 : 1);
    // Tip tapers and leans to one side (oblique apex)
    if (u > 0.35) {
      const k = (u - 0.35) / 0.65;
      w = w * (1 - 0.3 * k * k) + 0.02 * k * k;
    }
    // Embryo notch on the ventral edge near the base
    if (!cooked && u < -0.7 && nz < 0.1) {
      const g = Math.exp(-Math.pow((u + 0.86) / 0.07, 2));
      w *= 1 - 0.22 * g * Math.min(1, -nz + 0.4);
    }
    // Gentle bow seen from above; cooked grains curl a bit more
    w += (cooked ? 0.05 : 0.026) * (1 - u * u);
    void ny;
    pos.setXYZ(i, v.x, t, w);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Physically based rice material: clear-coated, softly sheened surface with fake subsurface
 * translucency (bright, slightly warm rim + lighter tips) and faint lengthwise striations.
 */
export function createRealGrainMaterial(color: THREE.ColorRepresentation, { cooked = false }: { cooked?: boolean } = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: cooked ? 0.58 : 0.32,
    metalness: 0,
    clearcoat: cooked ? 0.08 : 0.42,
    clearcoatRoughness: 0.28,
    sheen: 0.42,
    sheenRoughness: 0.38,
    sheenColor: new THREE.Color("#fffbf5"),
    envMapIntensity: 1.0,
    reflectivity: 0.95,
  });
  const uniforms = { uTranslucency: { value: cooked ? 0.62 : 0.52 } };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTranslucency = uniforms.uTranslucency;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRice;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRice = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRice;\nuniform float uTranslucency;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float ang = atan(vRice.z, vRice.y);
        float stri = 0.965 + 0.035 * sin(ang * 18.0 + vRice.x * 6.0);
        float tip = smoothstep(0.32, 0.5, abs(vRice.x));
        diffuseColor.rgb *= stri;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.08 + 0.04, tip * 0.6);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float rim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.4);
        totalEmissiveRadiance += diffuseColor.rgb * rim * uTranslucency * 0.38;
        totalEmissiveRadiance += vec3(1.0, 0.98, 0.92) * rim * uTranslucency * 0.08;`,
      );
  };
  return { material, uniforms };
}

/**
 * Deterministic natural rice heap: a rounded cone (≈30° angle of repose) whose surface is
 * covered by several jittered layers of grains lying tangent to the slope, plus a few loose
 * grains scattered around the foot — how poured rice really sits.
 */
export function buildPile(count: number, seed = 7, radius = 1.35, grainLen = 0.42) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const H = radius * 0.5;
  const height = (r: number) => H * Math.pow(Math.max(0, 1 - Math.pow(r / radius, 1.7)), 0.95);
  const thick = grainLen * 0.19;
  const UP = new THREE.Vector3(0, 1, 0);
  const out: { p: THREE.Vector3; q: THREE.Quaternion; s: number; shade: number }[] = [];
  for (let n = 0; n < count; n++) {
    const loose = rand() < 0.07;
    const r = loose ? radius * (0.92 + rand() * 0.45) : radius * Math.sqrt(rand()) * 0.97;
    const th = rand() * Math.PI * 2;
    const h = loose ? 0 : height(r);
    const slope = loose ? 0 : (height(r + 0.01) - height(Math.max(0, r - 0.01))) / 0.02;
    const normal = new THREE.Vector3(-slope * Math.cos(th), 1, -slope * Math.sin(th)).normalize();
    const y = h + thick * 0.5 - (loose ? 0 : rand() * thick * 1.6);
    const q = new THREE.Quaternion()
      .setFromUnitVectors(UP, normal)
      .multiply(new THREE.Quaternion().setFromAxisAngle(UP, rand() * Math.PI * 2))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.35, 0, (rand() - 0.5) * 0.18)));
    // Ambient-occlusion approximation: grains buried below the surface receive less light.
    const buried = loose ? 0 : Math.min(1, Math.max(0, (h - y) / (thick * 1.6)));
    out.push({ p: new THREE.Vector3(Math.cos(th) * r, Math.max(thick * 0.5, y), Math.sin(th) * r), q, s: 0.9 + rand() * 0.2, shade: (0.92 + rand() * 0.1) * (1 - 0.38 * buried) });
  }
  // Draw back-to-front isn't needed (opaque), but sorting by height keeps instancing cache-friendly.
  return out.sort((a, b) => a.p.y - b.p.y);
}
