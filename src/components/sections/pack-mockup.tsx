import type { Packaging } from "@/lib/content/types";

/**
 * Illustrative packaging mockups (SVG). They show the pack format only — no sizes,
 * materials or claims — and are replaced by real product photography when uploaded.
 */
export function PackMockup({ type, brand, id, logo }: { type: Packaging["packType"]; brand: string; id: string; logo?: string }) {
  const b = brand.replace(/^\[|\]$/g, "");
  const g = `pk-${id}`;
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full drop-shadow-[0_40px_40px_rgba(27,49,37,0.35)]" role="img" aria-label={`${b} ${type} pack`}>
      <defs>
        <linearGradient id={`${g}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#15201a" />
          <stop offset="0.5" stopColor="#223128" />
          <stop offset="1" stopColor="#101712" />
        </linearGradient>
        <linearGradient id={`${g}-kraft`} x1="0" x2="1">
          <stop offset="0" stopColor="#cdb58a" />
          <stop offset="0.5" stopColor="#e5d3ae" />
          <stop offset="1" stopColor="#bda173" />
        </linearGradient>
        <linearGradient id={`${g}-sheen`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${g}-weave`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3h6M3 0v6" stroke="#000" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>
      <ellipse cx="150" cy="342" rx="110" ry="10" fill="#000" opacity="0.18" />

      {type === "consumer" && (
        <g>
          <path d="M70 40h160l10 280c0 8-8 14-16 14H76c-8 0-16-6-16-14z" fill={`url(#${g}-body)`} />
          <path d="M70 40h160v18H70z" fill="#0c120e" />
          <path d="M74 66h152" stroke="#c6a15b" strokeOpacity="0.5" strokeDasharray="3 3" />
          <rect x="102" y="170" width="96" height="92" rx="46" fill="#f4efe3" opacity="0.92" />
          <g opacity="0.8">
            {Array.from({ length: 14 }).map((_, i) => (
              <ellipse key={i} cx={118 + (i % 5) * 16} cy={196 + Math.floor(i / 5) * 18} rx="7" ry="2.4" fill="#e3d8bf" transform={`rotate(${(i * 37) % 180} ${118 + (i % 5) * 16} ${196 + Math.floor(i / 5) * 18})`} />
            ))}
          </g>
          {logo ? <image href={logo} x="92" y="88" width="116" height="36" preserveAspectRatio="xMidYMid meet" /> : <text x="150" y="112" textAnchor="middle" fill="#e3c992" fontFamily="var(--font-display)" fontSize="22">{b}</text>}
          <text x="150" y="134" textAnchor="middle" fill="#f6f2e9" opacity="0.6" fontSize="8" letterSpacing="3">PREMIUM RICE</text>
          <path d="M70 40h160l10 280c0 8-8 14-16 14H76c-8 0-16-6-16-14z" fill={`url(#${g}-sheen)`} />
        </g>
      )}

      {type === "bulk" && (
        <g>
          <path d="M58 58c30-14 154-14 184 0l8 250c-40 22-160 22-200 0z" fill="#efe8d8" />
          <path d="M58 58c30-14 154-14 184 0l8 250c-40 22-160 22-200 0z" fill={`url(#${g}-weave)`} />
          <path d="M60 70c40-10 140-10 180 0" stroke="#b9ab8c" strokeDasharray="4 3" fill="none" />
          <rect x="58" y="140" width="192" height="70" fill="#1d2a22" />
          {logo ? <image href={logo} x="96" y="152" width="116" height="36" preserveAspectRatio="xMidYMid meet" /> : <text x="154" y="176" textAnchor="middle" fill="#e3c992" fontFamily="var(--font-display)" fontSize="22">{b}</text>}
          <text x="154" y="196" textAnchor="middle" fill="#f6f2e9" opacity="0.6" fontSize="8" letterSpacing="3">BULK PACK</text>
          <path d="M58 58c30-14 154-14 184 0l8 250c-40 22-160 22-200 0z" fill={`url(#${g}-sheen)`} />
        </g>
      )}

      {type === "export" && (
        <g>
          <path d="M150 60 262 110v160l-112 56-112-56V110z" fill={`url(#${g}-kraft)`} />
          <path d="M150 170 262 110v160l-112 56z" fill="#000" opacity="0.12" />
          <path d="M150 60 262 110 150 170 38 110z" fill="#e9dcbf" />
          <path d="M150 170v156" stroke="#000" strokeOpacity="0.12" />
          <path d="M94 85 206 137" stroke="#c6a15b" strokeWidth="10" opacity="0.5" />
          <g transform="matrix(1 .45 0 1 48 150)">
            <rect x="0" y="0" width="92" height="64" fill="#1d2a22" />
            {logo ? <image href={logo} x="12" y="14" width="68" height="22" preserveAspectRatio="xMidYMid meet" /> : <text x="46" y="30" textAnchor="middle" fill="#e3c992" fontFamily="var(--font-display)" fontSize="13">{b}</text>}
            <text x="46" y="46" textAnchor="middle" fill="#f6f2e9" opacity="0.6" fontSize="6" letterSpacing="2">EXPORT</text>
          </g>
        </g>
      )}

      {type === "custom" && (
        <g>
          <path d="M70 40h160l10 280c0 8-8 14-16 14H76c-8 0-16-6-16-14z" fill="#f6f2e9" stroke="#c6a15b" strokeDasharray="6 5" strokeWidth="1.5" />
          <circle cx="150" cy="150" r="46" fill="none" stroke="#c6a15b" strokeOpacity="0.6" strokeDasharray="4 4" />
          <text x="150" y="146" textAnchor="middle" fill="#a8793c" fontFamily="var(--font-display)" fontSize="18">Your</text>
          <text x="150" y="168" textAnchor="middle" fill="#a8793c" fontFamily="var(--font-display)" fontSize="18" fontStyle="italic">brand</text>
          <text x="150" y="250" textAnchor="middle" fill="#62655e" fontSize="8" letterSpacing="3">PRIVATE LABEL</text>
        </g>
      )}
    </svg>
  );
}
