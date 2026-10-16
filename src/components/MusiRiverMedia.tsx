import React, { useState } from 'react';
import { AmperaCanvas } from './AmperaCanvas';
import { CloudRain, Sun, RotateCcw, Droplets, Sparkles, Compass, Info, ArrowUpRight, ArrowDownRight, Anchor } from 'lucide-react';
import { sound } from '../utils/audio';

interface ActionItem {
  id: string;
  name: string;
  type: 'rain' | 'sun';
  delta: number;
  label: string;
  description: string;
}

export const MusiRiverMedia: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(-2);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [weatherMode, setWeatherMode] = useState<'normal' | 'rain' | 'sun'>('normal');
  const [lastAction, setLastAction] = useState<string>('Air surut di posisi -2 meter');
  const [crossedZero, setCrossedZero] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const rainActions: ActionItem[] = [
    { id: 'rain-1', name: 'Gerimis Hulu', type: 'rain', delta: 1, label: '+1 m', description: 'Air naik 1 meter' },
    { id: 'rain-2', name: 'Hujan Sedang', type: 'rain', delta: 2, label: '+2 m', description: 'Air naik 2 meter' },
    { id: 'rain-3', name: 'Hujan Deras', type: 'rain', delta: 3, label: '+3 m', description: 'Air naik 3 meter' },
    { id: 'rain-5', name: 'Badai Muson', type: 'rain', delta: 5, label: '+5 m', description: 'Air naik 5 meter' },
  ];

  const drainActions: ActionItem[] = [
    { id: 'sun-1', name: 'Arus Surut Ringan', type: 'sun', delta: -1, label: '-1 m', description: 'Air surut 1 meter' },
    { id: 'sun-2', name: 'Terik Matahari', type: 'sun', delta: -2, label: '-2 m', description: 'Air surut 2 meter' },
    { id: 'sun-3', name: 'Surut Muara', type: 'sun', delta: -3, label: '-3 m', description: 'Air surut 3 meter' },
    { id: 'sun-5', name: 'Surut Ekstrem', type: 'sun', delta: -5, label: '-5 m', description: 'Air surut 5 meter' },
  ];

  const applyAction = (action: ActionItem) => {
    const prev = currentLevel;
    let next = prev + action.delta;
    next = Math.max(-5, Math.min(5, next));

    setPreviousLevel(prev);
    setCurrentLevel(next);
    setLastDelta(action.delta);

    // Cek apakah melintasi titik acuan nol
    const crossed = (prev < 0 && next > 0) || (prev > 0 && next < 0) || (prev !== 0 && next === 0);
    setCrossedZero(crossed);

    if (action.type === 'rain') {
      sound.playRainDrop();
      sound.playWaterSplash();
      setWeatherMode('rain');
    } else {
      sound.playSunEvaporate();
      sound.playWaterSplash();
      setWeatherMode('sun');
    }

    setLastAction(`${action.name} (${action.label}): dari ${prev > 0 ? `+${prev}` : prev}m menjadi ${next > 0 ? `+${next}` : next}m`);

    setTimeout(() => {
      setWeatherMode('normal');
    }, 2200);
  };

  const handleSelectLevelDirectly = (lvl: number) => {
    if (lvl === currentLevel) return;
    sound.playWaterSplash();
    const prev = currentLevel;
    const delta = lvl - prev;
    setPreviousLevel(prev);
    setCurrentLevel(lvl);
    setLastDelta(delta);
    setCrossedZero((prev < 0 && lvl > 0) || (prev > 0 && lvl < 0) || (prev !== 0 && lvl === 0));
    setLastAction(`Diubah langsung ke ${lvl > 0 ? `+${lvl}` : lvl} meter`);
  };

  const handleReset = (targetLevel: number = 0) => {
    sound.playClick();
    setPreviousLevel(currentLevel);
    setCurrentLevel(targetLevel);
    setLastDelta(targetLevel - currentLevel);
    setCrossedZero(currentLevel !== targetLevel && targetLevel === 0);
    setWeatherMode('normal');
    setLastAction(`Ketinggian air diatur ulang ke posisi acuan normal (0 m)`);
  };

  const handleDragStart = (e: React.DragEvent, action: ActionItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(action));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        const action: ActionItem = JSON.parse(data);
        applyAction(action);
      }
    } catch {
      // ignore
    }
  };

  // Hitung formula matematika yang sedang terjadi
  const renderFormula = () => {
    if (previousLevel === null || lastDelta === null) {
      return (
        <span className="font-mono text-cyan-300 font-bold">
          Posisi saat ini = {currentLevel > 0 ? `+${currentLevel}` : currentLevel} meter
        </span>
      );
    }

    const op = lastDelta >= 0 ? '+' : '-';
    const absDelta = Math.abs(lastDelta);
    return (
      <div className="flex flex-wrap items-center gap-2 font-mono text-base sm:text-lg font-extrabold">
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
          {previousLevel > 0 ? `+${previousLevel}` : previousLevel}
        </span>
        <span className="text-amber-400">{op}</span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
          {absDelta}
        </span>
        <span className="text-slate-400">=</span>
        <span
          className={`px-2.5 py-0.5 rounded border ${
            currentLevel > 0
              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
              : currentLevel === 0
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-rose-950 text-rose-300 border-rose-700'
          }`}
        >
          {currentLevel > 0 ? `+${currentLevel}` : currentLevel}
        </span>
        <span className="text-xs text-slate-400 font-sans ml-1">meter</span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Context Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-rose-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Media Pembelajaran Kontekstual Palembang</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
              Simulasi Pasang Surut Sungai Musi & Jembatan Ampera
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Titik acuan normal disepakati sebagai bilangan <strong>0</strong>. 
              Air pasang melambangkan bilangan <strong>positif (+)</strong>, dan air surut melambangkan bilangan <strong>negatif (-)</strong>. 
              Gunakan awan hujan untuk menambah air (<strong>penjumlahan</strong>) atau matahari/katup surut untuk menurunkan air (<strong>pengurangan</strong>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleReset(0)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shadow-sm"
              title="Kembali ke permukaan normal 0 m"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Titik Acuan (0 m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Direct Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* Canvas Container with Drop Support */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl transition-all duration-300 ${
              isDragOver ? 'ring-4 ring-cyan-400 scale-[1.01]' : ''
            }`}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-xs z-30 flex items-center justify-center rounded-2xl pointer-events-none">
                <span className="px-4 py-2 bg-slate-900/95 text-cyan-300 font-bold text-sm rounded-xl border border-cyan-400 shadow-2xl">
                  Lepaskan di sini untuk memberi aksi pada Sungai Musi!
                </span>
              </div>
            )}

            <AmperaCanvas
              waterLevel={currentLevel}
              previousLevel={previousLevel}
              weatherMode={weatherMode}
              interactiveGauge={true}
              onSelectLevel={handleSelectLevelDirectly}
              locationName="Sungai Musi · Jembatan Ampera"
            />
          </div>

          {/* Real-time Math Equation & Visual Feedback Bar */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Kalimat Matematika Perubahan Air:
                </span>
                {renderFormula()}
              </div>

              {previousLevel !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    {currentLevel > previousLevel ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {currentLevel > previousLevel
                        ? `Naik ${currentLevel - previousLevel} m`
                        : `Turun ${previousLevel - currentLevel} m`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notification when water crosses zero */}
            {crossedZero && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200 font-medium">
                  <strong>Air melintasi titik acuan nol (0)!</strong> Bergerak dari daerah{' '}
                  {previousLevel! < 0 ? 'surut (negatif)' : 'pasang (positif)'} menyeberangi garis batas normal menuju{' '}
                  {currentLevel > 0 ? 'pasang (positif)' : currentLevel < 0 ? 'surut (negatif)' : 'garis normal (0)'}.
                </span>
              </div>
            )}

            {/* Quick Level Slider / Selector Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs text-slate-400">Pilih Ketinggian Langsung:</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleSelectLevelDirectly(lvl)}
                    className={`w-9 h-8 rounded-lg font-mono font-bold text-xs transition-all ${
                      currentLevel === lvl
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : lvl > 0
                        ? 'bg-cyan-950 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900'
                        : lvl === 0
                        ? 'bg-slate-800 border border-amber-500/50 text-amber-300 hover:bg-slate-700'
                        : 'bg-rose-950 border border-rose-800/80 text-rose-300 hover:bg-rose-900'
                    }`}
                  >
                    {lvl > 0 ? `+${lvl}` : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Concrete Action Elements & Real Scenarios */}
        <div className="lg:col-span-4 space-y-4">
          {/* Action 1: Awan Hujan (Penjumlahan) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  Aksi Awan Hujan (Operasi Penjumlahan / +)
                </span>
              </div>
              <span className="text-[10px] text-cyan-400/80">Tarik atau Klik</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {rainActions.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, action)}
                  onClick={() => applyAction(action)}
                  className="p-2.5 bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-800/50 hover:border-cyan-400 rounded-xl cursor-grab active:cursor-grabbing hover:scale-102 transition-all text-center select-none shadow-md group"
                >
                  <div className="flex justify-center mb-1 text-cyan-400 group-hover:scale-110 transition-transform">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-extrabold text-sm text-cyan-300 block">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {action.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action 2: Terik Matahari / Katup Surut (Pengurangan) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Aksi Terik & Surut (Operasi Pengurangan / -)
                </span>
              </div>
              <span className="text-[10px] text-amber-400/80">Tarik atau Klik</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {drainActions.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, action)}
                  onClick={() => applyAction(action)}
                  className="p-2.5 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-800/50 hover:border-amber-400 rounded-xl cursor-grab active:cursor-grabbing hover:scale-102 transition-all text-center select-none shadow-md group"
                >
                  <div className="flex justify-center mb-1 text-amber-400 group-hover:scale-110 transition-transform">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-extrabold text-sm text-amber-300 block">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {action.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skenario Nyata Sungai Musi (Quick Test Scenarios) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Skenario Penting Sungai Musi</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setCurrentLevel(-2);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(rainActions[1]); // +2 m -> to 0
                  }, 350);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="font-bold text-slate-200 group-hover:text-cyan-300 block">
                  1. Dari -2 m naik 2 m tepat ke garis 0
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  -2 + 2 = 0 m (Titik Normal)
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentLevel(-2);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(rainActions[3]); // +5 m -> to +3
                  }, 350);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="font-bold text-slate-200 group-hover:text-cyan-300 block">
                  2. Dari -2 m naik 5 m mencapai pasang +3 m
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  -2 + 5 = +3 m (Melintasi Nol)
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentLevel(1);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(drainActions[2]); // -3 m -> to -2
                  }, 350);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="font-bold text-slate-200 group-hover:text-cyan-300 block">
                  3. Dari +1 m surut 3 m menuju posisi -2 m
                </span>
                <span className="font-mono text-[11px] text-rose-400">
                  1 - 3 = -2 m (Melintasi Nol ke Bawah)
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentLevel(0);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(drainActions[2]); // -3 m -> to -3
                  }, 350);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="font-bold text-slate-200 group-hover:text-cyan-300 block">
                  4. Dari normal 0 m surut 3 m
                </span>
                <span className="font-mono text-[11px] text-amber-400">
                  0 - 3 = -3 m (Menuju Daerah Negatif)
                </span>
              </button>
            </div>
          </div>

          {/* Ringkasan Konsep Fisik Matematika */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Panduan Skala Peil Schaal:</span>
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-200">
                <strong>+ (Positif):</strong> Air pasang di atas normal. Kolong jembatan menyempit.
              </div>
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/20 text-amber-200">
                <strong>0 (Nol):</strong> Titik acuan permukaan air standar Sungai Musi.
              </div>
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-200">
                <strong>- (Negatif):</strong> Air surut di bawah normal. Kolong jembatan bertambah luas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
