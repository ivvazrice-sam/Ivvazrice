import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  },
  {
    // WebGL scenes: three.js objects are imperative and are mutated every frame inside useFrame,
    // and per-mount random layouts are generated once inside useMemo. Both are the intended
    // React Three Fiber patterns, so the React Compiler purity/immutability rules don't apply here.
    files: ["src/components/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".data/**", "scripts/**"]),
]);
