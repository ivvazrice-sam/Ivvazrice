import type { CSSProperties } from "react";
import { cn, seededRandom } from "@/lib/utils";

/**
 * An animated, illustrated rice-mill line: ten machine bays from paddy intake to container export.
 * Pure SVG + CSS keyframes (see "Mill line" in globals.css) — no canvas, no JS animation loop,
 * so it stays light and pauses cleanly (ml-paused) when off-screen.
 */

export const BAY_W = 400;
export const BAYS = 10;
export const STRIP_W = BAY_W * BAYS;
export const STRIP_H = 470;
const FLOOR = 410;

const C = {
  husk: "#caa15a",
  brown: "#a8773f",
  cream: "#eadfc4",
  white: "#f7f3ea",
  gold: "#c6a15b",
  gold2: "#e3c992",
  line: "rgba(227,201,146,0.22)",
  dust: "#b9a27a",
  stone: "#5c5f58",
};

type Vars = CSSProperties & Record<`--${string}`, string>;
const anim = (name: string, dur: number, delay = 0, extra = "linear infinite") => ({ animation: `${name} ${dur}s ${extra}`, animationDelay: `${delay}s` });

// ——— Primitives ———

function Box({ x, y, w, h, r = 6, tone = "metal" }: { x: number; y: number; w: number; h: number; r?: number; tone?: "metal" | "dark" }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={tone === "metal" ? "url(#ml-metal)" : "url(#ml-dark)"} stroke={C.line} strokeWidth="1.2" />
      <path d={`M${x + r} ${y + 1.5}H${x + w - r}`} stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
    </g>
  );
}

function Legs({ x, y, w, h = FLOOR - y }: { x: number; y: number; w: number; h?: number }) {
  return (
    <g stroke="#2c3430" strokeWidth="6" strokeLinecap="round">
      <path d={`M${x + 10} ${y}v${h}M${x + w - 10} ${y}v${h}`} />
    </g>
  );
}

function Bolt({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="2.2" fill="#56615a" />;
}

function Grain({ color, r = 0 }: { color: string; r?: number }) {
  return <ellipse rx="4.4" ry="1.7" fill={color} transform={`rotate(${r})`} />;
}

/** Stream of falling/moving grains. */
function Fall({
  x,
  y,
  dx = 0,
  dy,
  n = 8,
  color,
  dur = 1.2,
  spread = 10,
  seed,
  size = 1,
}: {
  x: number;
  y: number;
  dx?: number;
  dy: number;
  n?: number;
  color: string;
  dur?: number;
  spread?: number;
  seed: string;
  size?: number;
}) {
  const rand = seededRandom(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const ox = (rand() - 0.5) * spread;
        const style: Vars = {
          ...anim("ml-fall", dur, -(i / n) * dur),
          "--dx": `${(dx + (rand() - 0.5) * spread * 0.6).toFixed(2)}px`,
          "--dy": `${dy}px`,
          "--r": `${rand() * 180}deg`,
          "--r2": `${rand() * 360}deg`,
        };
        return (
          <g key={i} transform={`translate(${(x + ox).toFixed(2)} ${y})`}>
            <g className="ml-a" style={style}>
              <ellipse rx={4.4 * size} ry={1.7 * size} fill={color} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Rising dust / husk particles. */
function Rise({ x, y, n = 6, color, dx = 0, dy = -60, dur = 2.4, spread = 30, seed, shape = "dot" }: { x: number; y: number; n?: number; color: string; dx?: number; dy?: number; dur?: number; spread?: number; seed: string; shape?: "dot" | "flake" }) {
  const rand = seededRandom(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const style: Vars = { ...anim("ml-rise", dur, -(i / n) * dur, "ease-out infinite"), "--dx": `${dx + (rand() - 0.5) * spread}px`, "--dy": `${dy * (0.7 + rand() * 0.6)}px` };
        return (
          <g key={i} transform={`translate(${(x + (rand() - 0.5) * spread * 0.5).toFixed(2)} ${y})`}>
            <g className="ml-a" style={style}>
              {shape === "dot" ? <circle r={1.6 + rand() * 1.6} fill={color} /> : <path d="M-4 0Q0 -3 4 0Q0 -1 -4 0Z" fill={color} />}
            </g>
          </g>
        );
      })}
    </g>
  );
}

function Wheel({ cx, cy, r, spokes = 6, reverse = false, dur = 1.6, color = "#48534c" }: { cx: number; cy: number; r: number; spokes?: number; reverse?: boolean; dur?: number; color?: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="ml-a" style={anim(reverse ? "ml-spin-rev" : "ml-spin", dur)}>
        <circle r={r} fill="url(#ml-roll)" stroke={C.line} />
        {Array.from({ length: spokes }, (_, i) => (
          <line key={i} x1="0" y1="0" x2={(Math.cos((i / spokes) * Math.PI * 2) * r * 0.85).toFixed(2)} y2={(Math.sin((i / spokes) * Math.PI * 2) * r * 0.85).toFixed(2)} stroke={color} strokeWidth="2" />
        ))}
        <circle r={r * 0.2} fill="#1b201d" stroke={C.gold} strokeOpacity="0.5" />
      </g>
    </g>
  );
}

function Label({ n, title }: { n: number; title: string }) {
  return (
    <g>
      <text x="24" y="444" fill={C.gold} fontSize="13" fontWeight="700" letterSpacing="3" fontFamily="var(--font-sans)">
        {String(n).padStart(2, "0")}
      </text>
      <text x="54" y="444" fill="#f6f2e9" fillOpacity="0.8" fontSize="15" fontFamily="var(--font-display)">
        {title}
      </text>
    </g>
  );
}

function Lamp({ x, y, color = "#7fdc9a", delay = 0 }: { x: number; y: number; color?: string; delay?: number }) {
  return <circle cx={x} cy={y} r="3" fill={color} style={anim("ml-blink", 1.6, delay, "ease-in-out infinite")} />;
}

// ——— Bays (local coordinates 0..400 × 0..470, floor at y=410) ———

function Reception() {
  return (
    <g>
      {/* Tipper truck: cab faces away, bed backs up to the intake pit and tips from its rear hinge */}
      <g transform="translate(-2 300)">
        <rect x="0" y="60" width="150" height="16" rx="3" fill="#232a26" />
        <circle cx="32" cy="84" r="16" fill="#18301f" stroke="#3a443e" strokeWidth="4" />
        <circle cx="120" cy="84" r="16" fill="#18301f" stroke="#3a443e" strokeWidth="4" />
        <path d="M42 18H14L0 44v16h42z" fill="url(#ml-metal)" stroke={C.line} />
        <rect x="16" y="24" width="18" height="14" rx="2" fill="url(#ml-glass)" />
        <g className="ml-o-br" style={anim("ml-tip-rear", 6, 0, "ease-in-out infinite")}>
          <path d="M48 10h100l-4 50H52z" fill="#3b3326" stroke="#6b5a3b" />
          <path d="M52 12q46 -22 92 0z" fill={C.husk} />
        </g>
      </g>
      {/* Paddy pours from the raised bed into the intake pit */}
      <g style={anim("ml-pour", 6, 0, "linear infinite")}>
        <Fall x={150} y={330} dx={30} dy={28} n={10} color={C.husk} dur={0.6} spread={10} seed="pour" />
      </g>
      <path d="M150 350h90l-18 60h-54z" fill="url(#ml-dark)" stroke={C.line} />
      <path d="M156 356h78" stroke={C.husk} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      {/* Bucket elevator */}
      <rect x="250" y="60" width="44" height="350" rx="4" fill="url(#ml-metal-h)" stroke={C.line} />
      <rect x="258" y="74" width="28" height="320" rx="2" fill="#1a3123" />
      <path d="M266 390V78" stroke={C.husk} strokeWidth="7" strokeDasharray="6 10" style={anim("ml-flow", 0.5)} />
      <path d="M278 78V390" stroke="#56615a" strokeWidth="5" strokeDasharray="6 10" style={anim("ml-flow", 0.5)} />
      <path d="M244 60q28 -34 56 0z" fill="url(#ml-metal)" stroke={C.line} />
      <path d="M222 400q20 -20 36 -12" stroke="#2c3430" strokeWidth="10" fill="none" />
      <Lamp x={272} y={50} />
    </g>
  );
}

function Cleaner() {
  return (
    <g>
      <Legs x={90} y={330} w={230} />
      <Box x={90} y={150} w={230} h={180} />
      {/* Aspiration hood + fan */}
      <rect x="235" y="96" width="70" height="54" rx="6" fill="url(#ml-metal)" stroke={C.line} />
      <Wheel cx={270} cy={123} r={20} spokes={5} dur={0.5} />
      <Rise x={270} y={96} n={8} color={C.dust} dy={-70} dx={10} seed="dust1" />
      {/* Window with vibrating sieves */}
      <rect x="108" y="176" width="160" height="126" rx="4" fill="url(#ml-glass)" stroke={C.line} />
      <g className="ml-a" style={anim("ml-shake", 0.14)}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={116} y1={200 + i * 36} x2={260} y2={212 + i * 36} stroke={C.gold2} strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="2 3" />
            <Fall x={140 + i * 30} y={206 + i * 36} dx={70} dy={10} n={5} color={C.husk} dur={0.9} spread={40} seed={`sv${i}`} />
          </g>
        ))}
      </g>
      <Fall x={200} y={300} dy={40} n={5} color={C.stone} dur={1.4} spread={40} seed="imp" size={0.9} />
      {[100, 310].map((x) => (
        <g key={x}>
          <Bolt x={x} y={160} />
          <Bolt x={x} y={320} />
        </g>
      ))}
      <Lamp x={300} y={170} delay={0.4} />
    </g>
  );
}

function Destoner() {
  return (
    <g>
      <Legs x={80} y={320} w={250} />
      <Box x={70} y={300} w={270} h={30} r={4} />
      {/* Inclined vibrating deck */}
      <g transform="rotate(12 205 250)">
        <g className="ml-a" style={anim("ml-shake", 0.12)}>
          <rect x="80" y="230" width="250" height="36" rx="4" fill="url(#ml-metal-h)" stroke={C.line} />
          <path d="M92 240h226" stroke={C.gold2} strokeOpacity="0.4" strokeDasharray="3 4" />
          {/* grains slide down (right), stones walk up (left) */}
          {Array.from({ length: 7 }, (_, i) => (
            <g key={`g${i}`} transform={`translate(${110 + i * 10} 238)`}>
              <g className="ml-a" style={{ ...anim("ml-slide", 1.6, -i * 0.23), "--dx": "190px" } as Vars}>
                <Grain color={C.husk} r={i * 25} />
              </g>
            </g>
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <g key={`s${i}`} transform={`translate(${280 - i * 8} 236)`}>
              <g className="ml-a" style={{ ...anim("ml-slide", 3, -i), "--dx": "-180px" } as Vars}>
                <circle r="3.4" fill={C.stone} />
              </g>
            </g>
          ))}
        </g>
      </g>
      {/* Hood + fan */}
      <path d="M100 132h210l20 56H80z" fill="url(#ml-metal)" stroke={C.line} />
      <Wheel cx={205} cy={160} r={22} spokes={6} dur={0.45} />
      <rect x="84" y="330" width="30" height="40" rx="3" fill="url(#ml-dark)" stroke={C.line} />
      <text x="99" y="386" textAnchor="middle" fill="#8a8f86" fontSize="9" fontFamily="var(--font-sans)">STONES</text>
      <Lamp x={320} y={165} delay={0.8} />
    </g>
  );
}

function Husker() {
  return (
    <g>
      <Legs x={80} y={360} w={250} />
      <Box x={80} y={100} w={250} h={260} r={8} />
      {/* Feed hopper */}
      <path d="M170 64h70l-20 36h-30z" fill="url(#ml-metal)" stroke={C.line} />
      {/* Window */}
      <rect x="112" y="128" width="186" height="210" rx="6" fill="url(#ml-glass)" stroke={C.line} />
      <Fall x={205} y={104} dy={78} n={8} color={C.husk} dur={0.7} spread={6} seed="feed" />
      {/* Rubber rolls turning against each other */}
      <Wheel cx={176} cy={210} r={30} spokes={8} dur={0.9} color="#6b3b2a" />
      <Wheel cx={236} cy={210} r={30} spokes={8} dur={0.9} reverse color="#6b3b2a" />
      {/* Brown rice out */}
      <Fall x={206} y={244} dy={84} n={9} color={C.brown} dur={0.8} spread={10} seed="brown" />
      {/* Husk blown out the aspirator */}
      <rect x="298" y="160" width="66" height="22" rx="4" fill="url(#ml-metal-h)" stroke={C.line} />
      <Rise x={330} y={170} n={10} color="#d9c49a" dx={60} dy={-40} dur={1.4} spread={20} seed="husk" shape="flake" />
      <text x="205" y="356" textAnchor="middle" fill="#9aa097" fontSize="9" letterSpacing="2" fontFamily="var(--font-sans)">RUBBER-ROLL SHELLER</text>
      <Lamp x={310} y={116} />
      <Lamp x={296} y={116} color={C.gold} delay={0.6} />
    </g>
  );
}

function Sorter() {
  return (
    <g>
      <Box x={110} y={70} w={200} h={320} r={10} />
      <rect x="110" y="390" width="200" height="20" fill="#1a1f1c" />
      <path d="M140 46h80l-14 28h-52z" fill="url(#ml-metal)" stroke={C.line} />
      {/* Chute */}
      <path d="M150 110L196 214" stroke="#56615a" strokeWidth="10" strokeLinecap="round" />
      <path d="M150 110L196 214" stroke={C.cream} strokeWidth="3.5" strokeDasharray="3 9" style={anim("ml-flow", 0.35)} />
      <rect x="138" y="190" width="146" height="160" rx="6" fill="url(#ml-glass)" stroke={C.line} />
      {/* Grain curtain */}
      <Fall x={200} y={216} dy={120} n={14} color={C.cream} dur={0.75} spread={16} seed="curtain" size={0.9} />
      {/* Cameras + scanning light */}
      <rect x="140" y="252" width="22" height="16" rx="3" fill="#16291e" stroke={C.gold} strokeOpacity="0.6" />
      <rect x="262" y="252" width="22" height="16" rx="3" fill="#16291e" stroke={C.gold} strokeOpacity="0.6" />
      <rect x="162" y="258" width="100" height="4" fill="url(#ml-beam)" style={anim("ml-glow", 0.5, 0, "ease-in-out infinite")} />
      {/* Ejector: air puff kicks a defect grain into the reject bin */}
      <g transform="translate(206 290)">
        <circle r="10" fill="#dff1ff" className="ml-a" style={anim("ml-puff", 1.3, 0, "ease-out infinite")} />
      </g>
      <g transform="translate(206 290)">
        <g className="ml-a" style={{ ...anim("ml-fall", 1.3, 0.1), "--dx": "54px", "--dy": "46px" } as Vars}>
          <ellipse rx="4" ry="1.6" fill="#6b5838" />
        </g>
      </g>
      <rect x="252" y="330" width="34" height="30" rx="3" fill="url(#ml-dark)" stroke={C.line} />
      <text x="269" y="372" textAnchor="middle" fill="#8a8f86" fontSize="8" fontFamily="var(--font-sans)">REJECT</text>
      {/* Control screen */}
      <rect x="126" y="92" width="0" height="0" />
      <g transform="translate(236 92)">
        <rect width="58" height="64" rx="4" fill="#16291e" stroke={C.line} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={8 + i * 9} y="16" width="5" height="38" rx="1" fill={C.gold} opacity="0.75" className="ml-o-b" style={anim("ml-bar", 0.9 + i * 0.17, -i * 0.3, "ease-in-out infinite")} />
        ))}
        <Lamp x={50} y={8} />
      </g>
    </g>
  );
}

function Polisher() {
  return (
    <g>
      <Legs x={70} y={290} w={260} />
      <rect x="64" y="186" width="276" height="104" rx="52" fill="url(#ml-metal-h)" stroke={C.line} />
      <rect x="92" y="206" width="206" height="64" rx="32" fill="url(#ml-glass)" stroke={C.line} />
      {/* Rotating screw */}
      <path d="M100 238h190" stroke={C.white} strokeOpacity="0.85" strokeWidth="18" strokeDasharray="10 14" style={anim("ml-flow", 0.4)} />
      <path d="M100 238h190" stroke="#1b201d" strokeWidth="2" />
      {/* Mist nozzles */}
      {[130, 190, 250].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y={160} width="12" height="26" rx="3" fill="url(#ml-metal)" stroke={C.line} />
          <Fall x={x} y={190} dy={22} n={4} color="#bfe1f2" dur={0.6} spread={8} seed={`mist${i}`} size={0.6} />
        </g>
      ))}
      <path d="M110 150h180" stroke="#56615a" strokeWidth="6" strokeLinecap="round" />
      {/* Motor + belt */}
      <rect x="290" y="300" width="56" height="44" rx="6" fill="url(#ml-metal)" stroke={C.line} />
      <Wheel cx={318} cy={322} r={14} spokes={4} dur={0.4} />
      <Fall x={330} y={260} dx={20} dy={60} n={6} color={C.white} dur={0.9} spread={8} seed="pol" />
      <Lamp x={80} y={200} delay={0.3} />
    </g>
  );
}

function Inspection() {
  return (
    <g>
      {/* Bench */}
      <rect x="40" y="300" width="320" height="14" rx="3" fill="url(#ml-metal-h)" stroke={C.line} />
      <Legs x={50} y={314} w={300} />
      {/* Sample tray with grains */}
      <rect x="80" y="276" width="170" height="24" rx="4" fill="#0f130f" stroke={C.line} />
      {Array.from({ length: 18 }, (_, i) => (
        <g key={i} transform={`translate(${92 + (i % 9) * 18} ${283 + Math.floor(i / 9) * 9})`}>
          <Grain color={C.white} r={(i * 47) % 180} />
        </g>
      ))}
      {/* Magnifier scanning the tray */}
      <g style={{ ...anim("ml-scan", 5, 0, "ease-in-out infinite"), "--dx": "120px" } as Vars}>
        <g transform="translate(110 236)">
          <circle r="30" fill="rgba(191,225,242,0.12)" stroke={C.gold2} strokeWidth="3" />
          <g transform="scale(3)">
            <Grain color={C.white} r={-20} />
          </g>
          <path d="M22 22l22 22" stroke={C.gold2} strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>
      {/* Microscope */}
      <g transform="translate(270 190)">
        <rect x="0" y="100" width="56" height="10" rx="2" fill="url(#ml-metal)" />
        <path d="M20 100V40l18 -20" stroke="#56615a" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="30" y="4" width="14" height="34" rx="3" fill="url(#ml-metal)" stroke={C.line} transform="rotate(35 37 21)" />
      </g>
      {/* Checklist */}
      <g transform="translate(150 64)">
        <rect width="180" height="130" rx="8" fill="#16291e" stroke={C.line} />
        {["Grain length", "Moisture", "Broken %", "Foreign matter"].map((t, i) => (
          <g key={t} transform={`translate(16 ${26 + i * 26})`}>
            <text x="22" y="4" fill="#cfd3cb" fontSize="11" fontFamily="var(--font-sans)">
              {t}
            </text>
            <g className="ml-a" style={anim("ml-pop", 4, i * 0.5, "ease-out infinite")}>
              <circle r="7" fill={C.gold} />
              <path d="M-3 0l2 2.5 4 -5" stroke="#1b3125" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>
      <Lamp x={320} y={76} delay={0.2} />
    </g>
  );
}

function Grader() {
  const holes = Array.from({ length: 30 }, (_, i) => i);
  return (
    <g>
      <Legs x={80} y={290} w={240} />
      <g transform="rotate(6 200 230)">
        <rect x="60" y="180" width="280" height="100" rx="18" fill="url(#ml-metal-h)" stroke={C.line} />
        <clipPath id="ml-grader-clip">
          <rect x="74" y="192" width="252" height="76" rx="12" />
        </clipPath>
        <g clipPath="url(#ml-grader-clip)">
          <rect x="74" y="192" width="252" height="76" fill="#1a3123" />
          <g style={{ ...anim("ml-slide", 1.2), "--dx": "-40px" } as Vars}>
            {holes.map((i) => (
              <g key={i}>
                <circle cx={80 + i * 20} cy={210} r="4" fill="#2c3430" />
                <circle cx={90 + i * 20} cy={232} r="4" fill="#2c3430" />
                <circle cx={80 + i * 20} cy={254} r="4" fill="#2c3430" />
              </g>
            ))}
          </g>
          <Fall x={120} y={236} dx={180} dy={6} n={10} color={C.white} dur={1.4} spread={40} seed="grade" />
        </g>
      </g>
      {/* Outputs: head rice and brokens */}
      <Fall x={300} y={276} dy={70} n={6} color={C.white} dur={0.9} spread={10} seed="head" />
      <Fall x={160} y={288} dy={60} n={5} color={C.cream} dur={1.1} spread={10} seed="brk" size={0.6} />
      <rect x="276" y="352" width="54" height="40" rx="4" fill="url(#ml-dark)" stroke={C.line} />
      <rect x="136" y="352" width="54" height="40" rx="4" fill="url(#ml-dark)" stroke={C.line} />
      <text x="303" y="404" textAnchor="middle" fill="#8a8f86" fontSize="8" fontFamily="var(--font-sans)">HEAD RICE</text>
      <text x="163" y="404" textAnchor="middle" fill="#8a8f86" fontSize="8" fontFamily="var(--font-sans)">BROKENS</text>
      <Wheel cx={72} cy={318} r={16} spokes={5} dur={0.8} />
    </g>
  );
}

function Packing() {
  return (
    <g>
      {/* Weigh hopper */}
      <rect x="110" y="90" width="90" height="80" rx="6" fill="url(#ml-metal)" stroke={C.line} />
      <path d="M120 170h70l-20 40h-30z" fill="url(#ml-metal)" stroke={C.line} />
      <rect x="126" y="104" width="58" height="22" rx="3" fill="#16291e" />
      <text x="155" y="119" textAnchor="middle" fill={C.gold2} fontSize="10" fontFamily="var(--font-sans)" style={anim("ml-blink", 1.2, 0, "ease-in-out infinite")}>
        WEIGHING
      </text>
      <Fall x={155} y={212} dy={60} n={8} color={C.white} dur={0.6} spread={6} seed="bagfill" />
      {/* Conveyor */}
      <rect x="40" y="350" width="360" height="12" rx="6" fill="#262d29" stroke={C.line} />
      {[60, 110, 160, 210, 260, 310, 360].map((x) => (
        <Wheel key={x} cx={x} cy={356} r={5} spokes={3} dur={0.6} />
      ))}
      {/* Stitching head */}
      <rect x="236" y="220" width="46" height="40" rx="4" fill="url(#ml-metal)" stroke={C.line} />
      <rect x="256" y="260" width="4" height="16" fill="#9aa097" style={anim("ml-needle", 0.25, 0, "ease-in-out infinite")} />
      {/* Bag: fills under the spout, then travels to stitching and on */}
      <g style={anim("ml-bag", 5, 0, "ease-in-out infinite")}>
        <g transform="translate(125 270)">
          <path d="M0 0h60v74q0 6 -6 6H6q-6 0 -6 -6z" fill="#efe8d8" stroke="#b9ab8c" />
          <g className="ml-o-b" style={anim("ml-bagfill", 5, 0, "ease-in-out infinite")}>
            <rect x="3" y="14" width="54" height="62" rx="3" fill="#e4dcc7" />
          </g>
          <rect x="0" y="34" width="60" height="18" fill="#1f2c26" />
          <text x="30" y="47" textAnchor="middle" fill={C.gold2} fontSize="8" fontFamily="var(--font-display)">RICE</text>
        </g>
      </g>
      <Lamp x={190} y={100} delay={0.5} />
    </g>
  );
}

function Export() {
  return (
    <g>
      {/* Sea + ship */}
      <clipPath id="ml-sea">
        <rect x="0" y="300" width="400" height="110" />
      </clipPath>
      <g className="ml-a" style={anim("ml-bob", 4, 0, "ease-in-out infinite")}>
        <path d="M150 330h240l-20 40H176z" fill="#1c2a24" stroke={C.line} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={186 + i * 34} y={306} width="30" height="24" fill={i % 2 ? "#6b3b2a" : "#3a5a4a"} stroke="#1b3125" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={203 + i * 34} y={282} width="30" height="24" fill={i % 2 ? "#a8793c" : "#2f4a5a"} stroke="#1b3125" />
        ))}
        <rect x="350" y="270" width="24" height="60" fill="url(#ml-metal)" />
      </g>
      <g clipPath="url(#ml-sea)">
        <g style={anim("ml-wave", 2.4)}>
          <path d={`M0 372${Array.from({ length: 12 }, () => " q15 -8 30 0 t30 0").join("")}`} stroke="#2f5160" strokeWidth="3" fill="none" />
          <path d={`M-20 390${Array.from({ length: 12 }, () => " q15 -6 30 0 t30 0").join("")}`} stroke="#23404c" strokeWidth="3" fill="none" />
        </g>
      </g>
      {/* Gantry crane lowering a container */}
      <g stroke="#56615a" strokeWidth="6" fill="none">
        <path d="M120 410V120h220" />
        <path d="M120 150l40 -30" />
      </g>
      <g style={anim("ml-crane", 7, 0, "ease-in-out infinite")}>
        <g transform="translate(300 124)">
          <rect x="-14" y="-4" width="28" height="12" rx="2" fill={C.gold} />
          <g style={anim("ml-hook", 7, 0, "ease-in-out infinite")}>
            <line x1="0" y1="8" x2="0" y2="70" stroke="#9aa097" strokeWidth="2" />
            <rect x="-28" y="70" width="56" height="30" fill="#a8793c" stroke="#1b3125" />
            <text x="0" y="90" textAnchor="middle" fill="#1b3125" fontSize="8" fontWeight="700" fontFamily="var(--font-sans)">EXPORT</text>
          </g>
        </g>
      </g>
      {/* Container on the quay being stuffed with bags */}
      <rect x="10" y="300" width="130" height="80" fill="#2f4a5a" stroke="#1b3125" />
      <rect x="14" y="304" width="122" height="72" fill="#18242b" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={20 + (i % 4) * 28} y={352 - Math.floor(i / 4) * 22} width="24" height="20" rx="3" fill="#efe8d8" className="ml-a" style={anim("ml-stack", 8, i * 0.6, "ease-out infinite")} />
      ))}
      <path d="M140 300l22 -10v100l-22 -10z" fill="#28404e" stroke="#1b3125" />
      <rect x="0" y="380" width="400" height="30" fill="#161b18" />
    </g>
  );
}

const BAY_COMPONENTS = [Reception, Cleaner, Destoner, Husker, Sorter, Polisher, Inspection, Grader, Packing, Export];

/** Where each bay's product leaves (out) and where the next bay takes it in (in), in local coordinates. */
const OUT: [number, number][] = [
  [300, 76],
  [320, 250],
  [340, 300],
  [330, 330],
  [310, 372],
  [346, 238],
  [360, 300],
  [330, 320],
];
const IN: [number, number][] = [
  [120, 150],
  [120, 150],
  [205, 64],
  [180, 46],
  [110, 186],
  [100, 276],
  [90, 196],
  [155, 90],
];
const PIPE_COLORS = [C.husk, C.husk, C.husk, C.cream, C.cream, C.white, C.white, C.white];
const TOP = 26;

function pipePath(i: number) {
  const [ox, oy] = OUT[i];
  const [ix, iy] = IN[i];
  const px = i * BAY_W + ox;
  const qx = (i + 1) * BAY_W + ix;
  return `M${px} ${oy}H${px + 24}Q${px + 34} ${oy} ${px + 34} ${oy - 10}V${TOP + 10}Q${px + 34} ${TOP} ${px + 44} ${TOP}H${qx - 10}Q${qx} ${TOP} ${qx} ${TOP + 10}V${iy}`;
}

export function MillStrip({
  titles,
  active,
  paused,
  className,
  onBayClick,
}: {
  titles: string[];
  active?: number | null;
  paused?: boolean;
  className?: string;
  onBayClick?: (i: number) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
      className={cn("block h-full w-auto", paused && "ml-paused", active !== null && active !== undefined && "ml-dim", className)}
      role="img"
      aria-label={`Animated rice mill line: ${titles.join(", ")}`}
    >
      <defs>
        <linearGradient id="ml-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4640" />
          <stop offset="1" stopColor="#1c231f" />
        </linearGradient>
        <linearGradient id="ml-metal-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#252c28" />
          <stop offset="0.45" stopColor="#46514a" />
          <stop offset="1" stopColor="#212824" />
        </linearGradient>
        <linearGradient id="ml-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2622" />
          <stop offset="1" stopColor="#101411" />
        </linearGradient>
        <linearGradient id="ml-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe1f2" stopOpacity="0.16" />
          <stop offset="1" stopColor="#bfe1f2" stopOpacity="0.03" />
        </linearGradient>
        <radialGradient id="ml-roll">
          <stop offset="0" stopColor="#3a2a22" />
          <stop offset="1" stopColor="#1b1512" />
        </radialGradient>
        <linearGradient id="ml-beam" x1="0" x2="1">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff4d6" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ml-spot" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#c6a15b" stopOpacity="0.16" />
          <stop offset="1" stopColor="#c6a15b" stopOpacity="0" />
        </radialGradient>
        <pattern id="ml-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(227,201,146,0.05)" />
        </pattern>
      </defs>

      <rect width={STRIP_W} height={STRIP_H} fill="url(#ml-grid)" />
      <rect x="0" y={FLOOR} width={STRIP_W} height={STRIP_H - FLOOR} fill="#18301f" />
      <line x1="0" y1={FLOOR} x2={STRIP_W} y2={FLOOR} stroke="rgba(227,201,146,0.25)" />

      {/* Overhead transfer pipes with product flowing through them */}
      {OUT.map((_, i) => (
        <g key={i}>
          <path d={pipePath(i)} fill="none" stroke="#252c28" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pipePath(i)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeLinejoin="round" />
          <path d={pipePath(i)} fill="none" stroke={PIPE_COLORS[i]} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 9" style={anim("ml-flow", 0.45)} />
        </g>
      ))}

      {BAY_COMPONENTS.map((Bay, i) => (
        <g
          key={i}
          transform={`translate(${i * BAY_W} 0)`}
          className={cn("ml-bay", active === i && "ml-on", onBayClick && "cursor-pointer")}
          onClick={onBayClick ? () => onBayClick(i) : undefined}
        >
          <rect x="0" y="0" width={BAY_W} height={FLOOR} fill="url(#ml-spot)" opacity={active === i ? 1 : 0.4} />
          <Bay />
          <Label n={i + 1} title={titles[i] ?? ""} />
          {i > 0 && <line x1="0" y1={FLOOR + 8} x2="0" y2={STRIP_H - 8} stroke="rgba(227,201,146,0.12)" />}
        </g>
      ))}
    </svg>
  );
}
