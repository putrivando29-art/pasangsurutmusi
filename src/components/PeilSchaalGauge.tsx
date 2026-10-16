import React from 'react';

interface PeilSchaalGaugeProps {
  currentLevel: number; // -5 to +5
  previousLevel?: number | null;
  interactive?: boolean;
  onSelectLevel?: (level: number) => void;
  showLabels?: boolean;
  height?: number; // default e.g. 360
  title?: string;
  stationName?: string;
}

export const PeilSchaalGauge: React.FC<PeilSchaalGaugeProps> = ({
  currentLevel,
  previousLevel = null,
  interactive = false,
  onSelectLevel,
  showLabels = true,
  height = 380,
  title,
  stationName,
}) => {
  // Range from +5 to -5 (11 levels)
  const levels = [5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5];

  // Convert water level (-5 to +5) to percentage from top
  // +5 is top (0%), 0 is middle (50%), -5 is bottom (100%)
  const levelToPct = (lvl: number) => {
    const clamped = Math.max(-5, Math.min(5, lvl));
    return ((5 - clamped) / 10) * 100;
  };

  const currentPct = levelToPct(currentLevel);
  const previousPct = previousLevel !== null && previousLevel !== undefined ? levelToPct(previousLevel) : null;
  const delta = previousLevel !== null && previousLevel !== undefined ? currentLevel - previousLevel : 0;

  return (
    <div className="flex flex-col items-center select-none">
      {stationName && (
        <div className="mb-2 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
            Pos Pengamatan
          </span>
          <span className="text-sm font-bold text-slate-100">{stationName}</span>
        </div>
      )}
      {title && (
        <div className="text-xs font-semibold text-sky-300 mb-1 text-center">
          {title}
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {/* Main Gauge Container */}
        <div
          className="relative bg-slate-950/90 border-2 border-slate-700 rounded-lg shadow-2xl flex flex-col justify-between"
          style={{ height: `${height}px`, width: '84px' }}
        >
          {/* Water Fill background in gauge - overflow hidden inside so numbers never get clipped */}
          <div className="absolute inset-0 overflow-hidden rounded-[6px] pointer-events-none">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-800/80 via-cyan-600/70 to-sky-400/80 transition-all duration-700 ease-out z-0"
              style={{ height: `${100 - currentPct}%` }}
            >
              {/* Water surface wave shimmer line */}
              <div className="w-full h-1.5 bg-cyan-200/90 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            </div>
          </div>

          {/* Reference Zero Water Plane line across gauge */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400/80 z-10 pointer-events-none"
            style={{ top: '50%' }}
          />

          {/* Gauge Marks */}
          <div className="relative z-20 h-full flex flex-col justify-between pt-1 pb-1.5 px-1">
            {levels.map((lvl) => {
              const isZero = lvl === 0;
              const isPositive = lvl > 0;
              const isCurrent = lvl === currentLevel;
              const isPrev = previousLevel === lvl;

              return (
                <div
                  key={lvl}
                  onClick={() => interactive && onSelectLevel?.(lvl)}
                  className={`group relative flex items-center px-1.5 py-0.5 cursor-pointer transition-all ${
                    interactive ? 'hover:bg-white/10' : ''
                  }`}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                >
                  {/* Gauge Tick */}
                  <div
                    className={`h-0.5 shrink-0 transition-all ${
                      isZero
                        ? 'w-5 bg-amber-400 h-1 rounded-sm'
                        : lvl % 2 === 0
                        ? 'w-3.5 bg-slate-200'
                        : 'w-2 bg-slate-400'
                    }`}
                  />

                  {/* Level Number */}
                  <span
                    className={`ml-1 text-xs font-mono font-bold tracking-tight transition-transform leading-none select-none ${
                      isCurrent
                        ? 'text-white scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                        : isZero
                        ? 'text-amber-400 font-extrabold'
                        : isPositive
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {lvl > 0 ? `+${lvl}` : lvl}
                  </span>

                  {/* Meter unit on 0 and extremes */}
                  {(lvl === 5 || lvl === 0 || lvl === -5) && (
                    <span className="text-[9px] text-slate-400 ml-0.5 leading-none">m</span>
                  )}

                  {/* Active Float Indicator Needle */}
                  {isCurrent && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rotate-45 border border-white shadow-sm" />
                  )}

                  {/* Previous level ghost marker */}
                  {isPrev && previousLevel !== currentLevel && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-400/80 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delta arrow indicator when changing */}
        {previousPct !== null && delta !== 0 && (
          <div
            className="absolute -right-8 pointer-events-none flex flex-col items-center justify-center transition-all duration-700"
            style={{
              top: `${Math.min(currentPct, previousPct)}%`,
              height: `${Math.abs(currentPct - previousPct)}%`,
            }}
          >
            <div className="h-full w-1 bg-amber-400/80 rounded-full flex flex-col justify-between items-center py-0.5">
              {delta > 0 ? (
                <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-amber-300 -mt-1.5" />
              ) : <div />}
              <span className="text-[10px] font-bold font-mono px-1 py-0.2 bg-slate-900 text-amber-300 border border-amber-400/50 rounded shadow whitespace-nowrap">
                {delta > 0 ? `+${delta}m` : `${delta}m`}
              </span>
              {delta < 0 ? (
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-amber-300 -mb-1.5" />
              ) : <div />}
            </div>
          </div>
        )}
      </div>

      {/* Description below gauge */}
      {showLabels && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentLevel > 0
                  ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]'
                  : currentLevel === 0
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                  : 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
              }`}
            />
            <span className="font-mono font-bold text-sm text-slate-100">
              {currentLevel > 0 ? `+${currentLevel}` : currentLevel} m
            </span>
          </div>

          <div className="text-[11px] font-medium mt-1">
            {currentLevel > 0 ? (
              <span className="text-cyan-300">Air Pasang (+{currentLevel} m)</span>
            ) : currentLevel === 0 ? (
              <span className="text-amber-300">Permukaan Normal (0 m)</span>
            ) : (
              <span className="text-rose-300">Air Surut ({currentLevel} m)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
