import React from 'react';
import { PeilSchaalGauge } from './PeilSchaalGauge';

interface AmperaCanvasProps {
  waterLevel: number; // -5 to +5
  previousLevel?: number | null;
  weatherMode?: 'normal' | 'rain' | 'sun';
  interactiveGauge?: boolean;
  onSelectLevel?: (level: number) => void;
  showClearanceInfo?: boolean;
  locationName?: string;
  isAnimating?: boolean;
}

export const AmperaCanvas: React.FC<AmperaCanvasProps> = ({
  waterLevel,
  previousLevel = null,
  weatherMode = 'normal',
  interactiveGauge = false,
  onSelectLevel,
  showClearanceInfo = true,
  locationName = 'Sungai Musi · Sekitar Jembatan Ampera',
}) => {
  // Clamped water level between -5 and +5
  const clampedLevel = Math.max(-5, Math.min(5, waterLevel));

  // In SVG coordinate system:
  // ViewBox: 0 0 1000 560
  // Bridge deck is at y = 230
  // Normal water level (0 m) is at y = 390
  // Each 1 meter = 24 pixels
  // +5 m = y = 390 - (5 * 24) = 270 (high tide, closer to bridge deck)
  // -5 m = y = 390 - (-5 * 24) = 510 (low tide, deep down)
  const normalY = 390;
  const pixelsPerMeter = 24;
  const waterY = normalY - clampedLevel * pixelsPerMeter;

  // Clearance under Ampera:
  // Bridge lower girder is at y = 240
  // At normal 0m: Clearance = 11.5 meters
  const standardClearance = 11.5;
  const currentClearance = (standardClearance - clampedLevel).toFixed(1);

  // Perahu ketek position follows waterY
  const boatY = waterY - 14;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 select-none">
      {/* Top Location and Status Ribbon */}
      <div className="absolute top-2.5 left-2.5 z-30 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-110px)]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[220px] md:max-w-none">{locationName}</span>
        </div>

        {/* Current State Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-md text-xs font-bold shadow-md transition-colors shrink-0 ${
            clampedLevel > 0
              ? 'bg-cyan-950/85 border-cyan-500/50 text-cyan-300'
              : clampedLevel === 0
              ? 'bg-amber-950/85 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/85 border-rose-500/50 text-rose-300'
          }`}
        >
          <span>
            {clampedLevel > 0
              ? `Air Pasang (+${clampedLevel} m)`
              : clampedLevel === 0
              ? 'Air Normal (0 m)'
              : `Air Surut (${clampedLevel} m)`}
          </span>
        </div>
      </div>

      {/* Ampera Clearance Info Pill at bottom left (preventing overlap with top and right elements) */}
      {showClearanceInfo && (
        <div className="absolute bottom-2.5 left-2.5 z-30 flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 text-xs text-slate-300 shadow-md">
          <span className="text-slate-400">Ruang Kolong Jembatan:</span>
          <span className="font-mono font-bold text-amber-300">{currentClearance} m</span>
          <span className="text-[10px] text-slate-400 hidden xs:inline">
            {clampedLevel > 0 ? '(Menyempit)' : clampedLevel < 0 ? '(Meningkat)' : '(Standar)'}
          </span>
        </div>
      )}

      {/* SVG Canvas Scene */}
      <div className="relative w-full aspect-[16/9] min-h-[340px] max-h-[520px]">
        <svg
          viewBox="0 0 1000 560"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sky gradient based on weather */}
            <linearGradient id="skyGradNormal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="skyGradRain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="50%" stopColor="#1e2230" />
              <stop offset="100%" stopColor="#333847" />
            </linearGradient>

            <linearGradient id="skyGradSun" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="40%" stopColor="#312e81" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* River water gradient */}
            <linearGradient id="musiRiverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#0369a1" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#0f4c81" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0c2340" stopOpacity="0.98" />
            </linearGradient>

            {/* River bottom silt */}
            <linearGradient id="riverBedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>

            {/* Sun glow filter */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="1" />
              <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>

            {/* Ampera Red Paint Gradient */}
            <linearGradient id="amperaRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="amperaDarkRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>

          {/* 1. SKY BACKGROUND */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="560"
            fill={
              weatherMode === 'rain'
                ? 'url(#skyGradRain)'
                : weatherMode === 'sun'
                ? 'url(#skyGradSun)'
                : 'url(#skyGradNormal)'
            }
          />

          {/* Sun or Rain Cloud details */}
          {weatherMode === 'sun' && (
            <g className="animate-pulse">
              <circle cx="200" cy="80" r="45" fill="url(#sunGlow)" />
              <circle cx="200" cy="80" r="22" fill="#fef08a" />
              {/* Sun rays */}
              {[-60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240].map((deg) => (
                <line
                  key={deg}
                  x1={200 + Math.cos((deg * Math.PI) / 180) * 32}
                  y1={80 + Math.sin((deg * Math.PI) / 180) * 32}
                  x2={200 + Math.cos((deg * Math.PI) / 180) * 55}
                  y2={80 + Math.sin((deg * Math.PI) / 180) * 55}
                  stroke="#fde047"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              ))}
            </g>
          )}

          {weatherMode === 'rain' && (
            <g>
              {/* Rain Clouds */}
              <path
                d="M 140 70 q 25 -30 60 -15 q 35 -35 80 -10 q 45 -10 65 25 q 40 10 30 45 q -10 30 -50 30 l -160 0 q -35 0 -40 -35 q -5 -30 15 -40 z"
                fill="#334155"
                opacity="0.9"
              />
              <path
                d="M 220 75 q 30 -25 70 -5 q 40 -15 75 15 q 30 5 25 35 l -150 0 z"
                fill="#475569"
                opacity="0.85"
              />
              {/* Animated falling raindrops */}
              {[
                { x: 160, y: 130, len: 16 },
                { x: 185, y: 170, len: 20 },
                { x: 210, y: 140, len: 18 },
                { x: 235, y: 190, len: 22 },
                { x: 260, y: 135, len: 17 },
                { x: 285, y: 165, len: 19 },
                { x: 310, y: 145, len: 21 },
                { x: 340, y: 180, len: 18 },
                { x: 370, y: 140, len: 20 },
                { x: 400, y: 175, len: 19 },
              ].map((drop, i) => (
                <line
                  key={i}
                  x1={drop.x}
                  y1={drop.y}
                  x2={drop.x - 4}
                  y2={drop.y + drop.len}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              ))}
            </g>
          )}

          {weatherMode === 'normal' && (
            <g opacity="0.4">
              <path
                d="M 120 70 q 20 -20 50 -10 q 30 -25 65 -5 q 30 10 25 30 l -120 0 z"
                fill="#94a3b8"
              />
            </g>
          )}

          {/* Distant Palembang skyline / riverbank trees */}
          <path
            d="M 0 350 L 150 345 L 280 348 L 400 344 L 600 347 L 850 345 L 1000 348 L 1000 390 L 0 390 Z"
            fill="#0f172a"
            opacity="0.85"
          />

          {/* 2. JEMBATAN AMPERA (ICONIC RED PALEMBANG BRIDGE) */}
          <g id="amperaBridge">
            {/* Foundation Piers in Water */}
            {/* Tower 1 Foundation Pier (Ilir side) */}
            <rect x="420" y="240" width="40" height="280" fill="#334155" rx="3" />
            {/* Tower 2 Foundation Pier (Ulu side) */}
            <rect x="680" y="240" width="40" height="280" fill="#334155" rx="3" />

            {/* Pier concrete cap */}
            <rect x="412" y="235" width="56" height="15" fill="#475569" rx="2" />
            <rect x="672" y="235" width="56" height="15" fill="#475569" rx="2" />

            {/* Ampera Main Red Deck / Girder */}
            <rect x="0" y="230" width="1000" height="14" fill="url(#amperaDarkRed)" />
            <rect x="0" y="226" width="1000" height="5" fill="#ef4444" />
            {/* Road railings and lamp posts */}
            <line x1="0" y1="223" x2="1000" y2="223" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="6,4" />

            {/* Vehicles silhouettes moving on bridge */}
            <rect x="250" y="215" width="22" height="10" fill="#1e293b" rx="2" />
            <rect x="530" y="214" width="30" height="11" fill="#0f172a" rx="2" />
            <rect x="760" y="216" width="18" height="9" fill="#1e293b" rx="2" />

            {/* TOWER 1 (Left / Ilir side) - 63m tall iconic Ampera tower */}
            <g id="tower1">
              {/* Left column */}
              <polygon points="426,226 432,60 442,60 440,226" fill="url(#amperaRed)" />
              {/* Right column */}
              <polygon points="446,226 448,60 458,60 460,226" fill="url(#amperaRed)" />
              {/* Tower Top Portal / Crown */}
              <rect x="425" y="48" width="40" height="16" fill="url(#amperaDarkRed)" rx="2" />
              <polygon points="428,48 445,30 462,48" fill="#dc2626" />
              {/* Cross bracings (Trusses) */}
              <line x1="432" y1="90" x2="456" y2="120" stroke="#f87171" strokeWidth="2.5" />
              <line x1="456" y1="90" x2="432" y2="120" stroke="#f87171" strokeWidth="2.5" />
              <line x1="434" y1="135" x2="454" y2="165" stroke="#f87171" strokeWidth="2.5" />
              <line x1="454" y1="135" x2="434" y2="165" stroke="#f87171" strokeWidth="2.5" />
              <line x1="436" y1="180" x2="452" y2="210" stroke="#f87171" strokeWidth="2.5" />
              <line x1="452" y1="180" x2="436" y2="210" stroke="#f87171" strokeWidth="2.5" />
              {/* Ampera Central Lifting Counterweight Housing */}
              <rect x="430" y="80" width="28" height="35" fill="#7f1d1d" rx="2" />
            </g>

            {/* TOWER 2 (Right / Ulu side) */}
            <g id="tower2">
              {/* Left column */}
              <polygon points="686,226 692,60 702,60 700,226" fill="url(#amperaRed)" />
              {/* Right column */}
              <polygon points="706,226 708,60 718,60 720,226" fill="url(#amperaRed)" />
              {/* Tower Top Portal / Crown */}
              <rect x="685" y="48" width="40" height="16" fill="url(#amperaDarkRed)" rx="2" />
              <polygon points="688,48 705,30 722,48" fill="#dc2626" />
              {/* Cross bracings (Trusses) */}
              <line x1="692" y1="90" x2="716" y2="120" stroke="#f87171" strokeWidth="2.5" />
              <line x1="716" y1="90" x2="692" y2="120" stroke="#f87171" strokeWidth="2.5" />
              <line x1="694" y1="135" x2="714" y2="165" stroke="#f87171" strokeWidth="2.5" />
              <line x1="714" y1="135" x2="694" y2="165" stroke="#f87171" strokeWidth="2.5" />
              <line x1="696" y1="180" x2="712" y2="210" stroke="#f87171" strokeWidth="2.5" />
              <line x1="712" y1="180" x2="696" y2="210" stroke="#f87171" strokeWidth="2.5" />
              {/* Ampera Central Lifting Counterweight Housing */}
              <rect x="690" y="80" width="28" height="35" fill="#7f1d1d" rx="2" />
            </g>

            {/* Suspension stay cables */}
            <line x1="445" y1="58" x2="280" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="445" y1="58" x2="340" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="445" y1="58" x2="495" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="445" y1="58" x2="550" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />

            <line x1="705" y1="58" x2="590" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="705" y1="58" x2="645" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="705" y1="58" x2="800" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
            <line x1="705" y1="58" x2="860" y2="226" stroke="#f87171" strokeWidth="1.5" opacity="0.7" />
          </g>

          {/* 3. DOCK / DERMAGA & PILAR PEIL SCHAAL */}
          <g id="dockStructure">
            {/* Dock pillar on the right side */}
            <rect x="80" y="240" width="70" height="280" fill="#1e293b" />
            <rect x="74" y="240" width="82" height="18" fill="#334155" rx="3" />
            {/* Dock Handrail */}
            <line x1="74" y1="230" x2="156" y2="230" stroke="#94a3b8" strokeWidth="2" />
            <line x1="90" y1="230" x2="90" y2="240" stroke="#94a3b8" strokeWidth="2" />
            <line x1="140" y1="230" x2="140" y2="240" stroke="#94a3b8" strokeWidth="2" />
          </g>

          {/* 4. SUNGAI MUSI WATER BODY (DYNAMIC HEIGHT) */}
          <g id="waterBody">
            {/* Main water mass */}
            <rect
              x="0"
              y={waterY}
              width="1000"
              height={560 - waterY}
              fill="url(#musiRiverGrad)"
              className="transition-all duration-700 ease-out"
            />

            {/* Animated Surface Waves */}
            <path
              d={`M 0 ${waterY} 
                  Q 125 ${waterY - 4}, 250 ${waterY} 
                  T 500 ${waterY} 
                  T 750 ${waterY} 
                  T 1000 ${waterY} 
                  L 1000 ${waterY + 6} 
                  L 0 ${waterY + 6} Z`}
              fill="#38bdf8"
              opacity="0.6"
              className="transition-all duration-700 ease-out"
            />
            <line
              x1="0"
              y1={waterY}
              x2="1000"
              y2={waterY}
              stroke="#7dd3fc"
              strokeWidth="2.5"
              className="transition-all duration-700 ease-out"
            />

            {/* Water ripples highlights */}
            <line x1="280" y1={waterY + 18} x2="350" y2={waterY + 18} stroke="#bae6fd" strokeWidth="1.5" opacity="0.4" />
            <line x1="520" y1={waterY + 28} x2="610" y2={waterY + 28} stroke="#bae6fd" strokeWidth="1.5" opacity="0.4" />
            <line x1="720" y1={waterY + 15} x2="790" y2={waterY + 15} stroke="#bae6fd" strokeWidth="1.5" opacity="0.4" />

            {/* River bed silt layer at bottom */}
            <rect x="0" y="535" width="1000" height="25" fill="url(#riverBedGrad)" />
            <line x1="0" y1="535" x2="1000" y2="535" stroke="#78350f" strokeWidth="2" />
          </g>

          {/* 5A. STARTING LEVEL LINE (TITIK AWAL MULA-MULA) - Visible when changing levels */}
          {previousLevel !== null && previousLevel !== clampedLevel && (
            <g id="startingLevelPlane" className="transition-all duration-700 ease-out pointer-events-none">
              <line
                x1="0"
                y1={normalY - previousLevel * pixelsPerMeter}
                x2="1000"
                y2={normalY - previousLevel * pixelsPerMeter}
                stroke="#c084fc"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.9"
              />
              <rect
                x="8"
                y={normalY - previousLevel * pixelsPerMeter - 10}
                width="100"
                height="20"
                fill="#1e1b4b"
                rx="4"
                opacity="0.95"
              />
              <rect
                x="8"
                y={normalY - previousLevel * pixelsPerMeter - 10}
                width="100"
                height="20"
                stroke="#c084fc"
                strokeWidth="1.2"
                rx="4"
                fill="none"
              />
              <text
                x="58"
                y={normalY - previousLevel * pixelsPerMeter + 4}
                fill="#e9d5ff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                Titik Awal ({previousLevel > 0 ? `+${previousLevel}` : previousLevel}m)
              </text>
            </g>
          )}

          {/* 5B. ZERO REFERENCE LINE (TITIK ACUAN NORMAL 0 M) - Rendered ON TOP of water body so it remains visible even when water rises */}
          <g id="zeroReferencePlane" className="pointer-events-none">
            {/* Subtle glow under line */}
            <line
              x1="0"
              y1={normalY}
              x2="1000"
              y2={normalY}
              stroke="#fbbf24"
              strokeWidth="4"
              opacity="0.3"
            />
            {/* Main dashed zero reference line */}
            <line
              x1="0"
              y1={normalY}
              x2="1000"
              y2={normalY}
              stroke="#fbbf24"
              strokeWidth="2.2"
              strokeDasharray="6,4"
              opacity="0.95"
            />
            {/* Zero label banner on the left */}
            <rect x="8" y={normalY - 10} width="105" height="20" fill="#0f172a" rx="4" opacity="0.95" />
            <rect x="8" y={normalY - 10} width="105" height="20" stroke="#fbbf24" strokeWidth="1.2" rx="4" fill="none" />
            <circle cx="18" cy={normalY} r="3" fill="#fbbf24" />
            <text
              x="62"
              y={normalY + 4}
              fill="#fbbf24"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              Titik Acuan (0m)
            </text>
          </g>

          {/* 6. CLEARANCE DIMENSION ARROW (Between water surface and bridge deck) */}
          {showClearanceInfo && (
            <g id="clearanceDimension" className="transition-all duration-700 ease-out">
              {/* Vertical arrow */}
              <line
                x1="610"
                y1="244"
                x2="610"
                y2={waterY - 3}
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="4,3"
              />
              {/* Arrowheads */}
              <polygon points="610,240 606,248 614,248" fill="#facc15" />
              <polygon points={`610,${waterY} 606,${waterY - 8} 614,${waterY - 8}`} fill="#facc15" />
              {/* Clearance badge */}
              <rect x="560" y={(244 + waterY) / 2 - 10} width="100" height="20" rx="4" fill="#0f172a" stroke="#eab308" strokeWidth="1" />
              <text
                x="610"
                y={(244 + waterY) / 2 + 4}
                fill="#fef08a"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                Kolong {currentClearance}m
              </text>
            </g>
          )}

          {/* 7. TRADITIONAL PERAHU KETEK (PALEMBANG WOODEN BOAT) FLOATING ON RIVER */}
          <g
            id="perahuKetek"
            className="transition-all duration-700 ease-out"
            transform={`translate(320, ${boatY})`}
          >
            {/* Hull of wooden boat */}
            <path
              d="M 0 10 Q 15 22 55 22 L 85 22 Q 120 22 135 6 Q 100 12 70 12 L 20 12 Q 5 12 0 10 Z"
              fill="#92400e"
            />
            {/* Wooden rim */}
            <path
              d="M -2 9 L 138 5 L 135 8 L 0 12 Z"
              fill="#d97706"
            />
            {/* Boat Canopy (atap rumbia / terpal khas ketek) */}
            <path
              d="M 35 12 L 40 -8 L 90 -8 L 95 12 Z"
              fill="none"
              stroke="#b45309"
              strokeWidth="2"
            />
            <rect x="36" y="-12" width="58" height="6" fill="#0284c7" rx="1" />
            {/* Passenger / Driver Silhouette */}
            <circle cx="50" cy="2" r="4" fill="#1e293b" />
            <rect x="46" y="6" width="9" height="7" fill="#334155" rx="1" />
            {/* Small Palembang flag on stern */}
            <line x1="125" y1="8" x2="125" y2="-6" stroke="#94a3b8" strokeWidth="1" />
            <polygon points="125,-6 138,-3 125,0" fill="#ef4444" />
            {/* Water wake ripple under boat */}
            <ellipse cx="65" cy="22" rx="45" ry="3" fill="#bae6fd" opacity="0.4" />
          </g>

          {/* 8. WATER SURFACE FLOATING READOUT TAG */}
          <g
            id="waterLevelTag"
            className="transition-all duration-700 ease-out"
            transform={`translate(160, ${waterY - 12})`}
          >
            <rect
              x="-36"
              y="-9"
              width="72"
              height="18"
              rx="4"
              fill="#0369a1"
              stroke="#7dd3fc"
              strokeWidth="1.2"
            />
            <text
              x="0"
              y="3.5"
              fill="#ffffff"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {clampedLevel > 0 ? `+${clampedLevel} m` : `${clampedLevel} m`}
            </text>
          </g>
        </svg>

        {/* OVERLAY PEIL SCHAAL GAUGE (Right-positioned real-life observation staff) */}
        <div className="absolute right-2.5 top-2.5 bottom-2.5 z-20 flex items-center">
          <div className="bg-slate-900/95 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-2xl">
            <PeilSchaalGauge
              currentLevel={clampedLevel}
              previousLevel={previousLevel}
              interactive={interactiveGauge}
              onSelectLevel={onSelectLevel}
              height={240}
              showLabels={false}
              title="Peil Schaal"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
