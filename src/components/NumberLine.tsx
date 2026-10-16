import React, { useEffect, useRef } from 'react';
import { fmt } from '../utils/number';

export interface NumberLinePoint {
  value: number;
  label?: string;
  tone: 'a' | 'b' | 'ok' | 'bad' | 'neutral';
}

interface NumberLineProps {
  min?: number;
  max?: number;
  // 'all': semua angka ditulis; 'sparse': hanya 0 dan kelipatan 5; 'zero': hanya 0.
  labels?: 'all' | 'sparse' | 'zero';
  points?: NumberLinePoint[];
  onPick?: (value: number) => void;
  picked?: number | null;
  showDirection?: boolean;
  ariaLabel?: string;
}

const TONE: Record<NumberLinePoint['tone'], { fill: string; text: string }> = {
  a: { fill: '#f43f5e', text: '#fecdd3' },
  b: { fill: '#22d3ee', text: '#cffafe' },
  ok: { fill: '#34d399', text: '#d1fae5' },
  bad: { fill: '#fb7185', text: '#ffe4e6' },
  neutral: { fill: '#fbbf24', text: '#fef3c7' },
};

export const NumberLine: React.FC<NumberLineProps> = ({
  min = -10,
  max = 10,
  labels = 'all',
  points = [],
  onPick,
  picked = null,
  showDirection = true,
  ariaLabel = 'Garis bilangan',
}) => {
  const width = 1000;
  const padX = 40;
  const lineY = 120;
  const count = max - min;
  const step = (width - padX * 2) / count;
  const xOf = (v: number) => padX + (v - min) * step;
  const ticks = Array.from({ length: count + 1 }, (_, i) => min + i);

  const showLabel = (v: number) => labels === 'all' || v === 0 || (labels === 'sparse' && v % 5 === 0);

  // Label titik yang berdekatan dinaikkan satu tingkat agar tidak saling menimpa.
  const placed: { x: number; w: number; level: number }[] = [];
  const layout = points.map((p) => {
    const x = xOf(p.value);
    const w = p.label ? Math.max(52, p.label.length * 13) : 0;
    let level = 0;
    if (p.label) {
      while (placed.some((q) => q.level === level && Math.abs(q.x - x) < (q.w + w) / 2 + 6)) level += 1;
      placed.push({ x, w, level });
    }
    return { x, w, level };
  });

  // Di layar sempit garis bilangan dibuat lebih lebar dari layar dan dapat digeser,
  // supaya angka tetap terbaca dan turus cukup besar untuk diketuk.
  const scrollRef = useRef<HTMLDivElement>(null);
  const minWidth = count * 32;
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [min, max]);

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} 190`}
          className="w-full h-auto select-none"
          style={{ minWidth }}
          role="group"
          aria-label={ariaLabel}
        >
          {showDirection && (
            <g fontFamily="sans-serif" fontSize="18" fontWeight="600">
              <text x={padX} y={182} fill="#fda4af">
                ← makin kecil
              </text>
              <text x={width - padX} y={182} fill="#a5f3fc" textAnchor="end">
                makin besar →
              </text>
            </g>
          )}

          <line x1={padX - 24} y1={lineY} x2={width - padX + 24} y2={lineY} stroke="#cbd5e1" strokeWidth="3" />
          <polygon
            points={`${padX - 30},${lineY} ${padX - 16},${lineY - 8} ${padX - 16},${lineY + 8}`}
            fill="#cbd5e1"
          />
          <polygon
            points={`${width - padX + 30},${lineY} ${width - padX + 16},${lineY - 8} ${width - padX + 16},${lineY + 8}`}
            fill="#cbd5e1"
          />

          {ticks.map((v) => {
            const x = xOf(v);
            const isZero = v === 0;
            const isPicked = picked === v;
            const content = (
              <>
                <line
                  x1={x}
                  y1={lineY - (isZero ? 16 : 11)}
                  x2={x}
                  y2={lineY + (isZero ? 16 : 11)}
                  stroke={isZero ? '#fbbf24' : '#94a3b8'}
                  strokeWidth={isZero ? 4 : 2.5}
                />
                {showLabel(v) && (
                  <text
                    x={x}
                    y={lineY + 42}
                    fill={isZero ? '#fbbf24' : v > 0 ? '#a5f3fc' : '#fda4af'}
                    fontSize={count > 16 ? 19 : 24}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {v}
                  </text>
                )}
                {isPicked && <circle cx={x} cy={lineY} r="11" fill="none" stroke="#fbbf24" strokeWidth="3" />}
              </>
            );

            if (!onPick) return <g key={v}>{content}</g>;

            return (
              <g
                key={v}
                role="button"
                tabIndex={0}
                aria-label={`Pilih titik ${fmt(v)}`}
                onClick={() => onPick(v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPick(v);
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>rect]:fill-amber-300/25 [&:hover>rect]:fill-white/10"
              >
                <rect x={x - step / 2} y={lineY - 50} width={step} height={100} fill="transparent" rx="6" />
                {content}
              </g>
            );
          })}

          {points.map((p, i) => {
            const { x, w, level } = layout[i];
            const y = lineY - 26 - level * 34;
            const tone = TONE[p.tone];
            return (
              <g key={`${p.value}-${i}`} className="pointer-events-none">
                <line x1={x} y1={lineY} x2={x} y2={y} stroke={tone.fill} strokeWidth="2" />
                <circle cx={x} cy={lineY} r="9" fill={tone.fill} stroke="#0f172a" strokeWidth="2" />
                {p.label && (
                  <>
                    <rect
                      x={x - w / 2}
                      y={y - 26}
                      width={w}
                      height="26"
                      rx="6"
                      fill="#0f172a"
                      stroke={tone.fill}
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={y - 7}
                      fill={tone.text}
                      fontSize="17"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {minWidth > 360 && (
        <p className="sm:hidden text-[11px] text-slate-500 text-center mt-1">
          Geser garis bilangan ke kiri atau ke kanan.
        </p>
      )}
    </div>
  );
};
