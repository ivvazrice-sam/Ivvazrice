import * as THREE from "three";

/**
 * Physically based grain material with a shader extension:
 *  - `uPolish` (0→1) morphs each grain from ridged golden husk to polished pearl white,
 *    staggered per grain via the `aSeed` instance attribute;
 *  - a soft fresnel term fakes the translucency of real rice.
 */
export function createGrainMaterial() {
  const uniforms = { uPolish: { value: 0 } };
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0, envMapIntensity: 0.85 });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPolish = uniforms.uPolish;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aSeed;\nuniform float uPolish;\nvarying float vPolish;\nvarying vec3 vLocal;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLocal = position;\nvPolish = smoothstep(aSeed * 0.55, aSeed * 0.55 + 0.45, uPolish);",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vPolish;\nvarying vec3 vLocal;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float ang = atan(vLocal.z, vLocal.y);
        float ridge = smoothstep(0.3, 1.0, abs(sin(ang * 7.0 + vLocal.x * 4.0)));
        vec3 husk = mix(vec3(0.58, 0.40, 0.17), vec3(0.83, 0.64, 0.33), ridge);
        husk *= 0.82 + 0.3 * smoothstep(-0.5, 0.5, vLocal.x);
        vec3 pearl = vec3(0.96, 0.94, 0.88);
        diffuseColor.rgb *= mix(husk, pearl, vPolish);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.8, 0.32, vPolish);",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.2);
        totalEmissiveRadiance += fres * mix(vec3(0.32, 0.2, 0.07), vec3(0.5, 0.48, 0.43), vPolish) * 0.5;
        totalEmissiveRadiance += diffuseColor.rgb * 0.07 * vPolish;`,
      );
  };

  return { material, uniforms };
}

/** Soft round sprite for dust / bokeh particles. */
export function createDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
