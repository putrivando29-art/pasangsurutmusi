import React, { useState } from 'react';
import { AmperaCanvas } from './AmperaCanvas';
import { CloudRain, Sun, ArrowRight, RotateCcw, Sparkles, Droplets, Info } from 'lucide-react';
import { sound } from '../utils/audio';

interface SimulationStageProps {
  onContinue: () => void;
}

interface ActionItem {
  id: string;
  name: string;
  type: 'rain' | 'sun';
  delta: number;
  label: string;
  description: string;
  icon: 'rain' | 'sun';
}

export const SimulationStage: React.FC<SimulationStageProps> = ({ onContinue }) => {
  const [currentLevel, setCurrentLevel] = useState<number>(-2);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [weatherMode, setWeatherMode] = useState<'normal' | 'rain' | 'sun'>('normal');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [crossedZero, setCrossedZero] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const rainActions: ActionItem[] = [
    { id: 'rain-1', name: 'Gerimis Hulu', type: 'rain', delta: 1, label: '+1 m', description: 'Air naik 1 meter', icon: 'rain' },
    { id: 'rain-2', name: 'Hujan Sedang', type: 'rain', delta: 2, label: '+2 m', description: 'Air naik 2 meter', icon: 'rain' },
    { id: 'rain-3', name: 'Hujan Deras', type: 'rain', delta: 3, label: '+3 m', description: 'Air naik 3 meter', icon: 'rain' },
    { id: 'rain-5', name: 'Hujan Badai Muson', type: 'rain', delta: 5, label: '+5 m', description: 'Air naik 5 meter', icon: 'rain' },
  ];

  const drainActions: ActionItem[] = [
    { id: 'sun-1', name: 'Arus Surut Ringan', type: 'sun', delta: -1, label: '-1 m', description: 'Air surut 1 meter', icon: 'sun' },
    { id: 'sun-2', name: 'Terik Matahari', type: 'sun', delta: -2, label: '-2 m', description: 'Air surut 2 meter', icon: 'sun' },
    { id: 'sun-3', name: 'Surut Muara', type: 'sun', delta: -3, label: '-3 m', description: 'Air surut 3 meter', icon: 'sun' },
    { id: 'sun-5', name: 'Surut Ekstrem Selat', type: 'sun', delta: -5, label: '-5 m', description: 'Air surut 5 meter', icon: 'sun' },
  ];

  const applyAction = (action: ActionItem) => {
    const prev = currentLevel;
    let next = prev + action.delta;
    // Clamp to -5 and +5
    next = Math.max(-5, Math.min(5, next));

    setPreviousLevel(prev);
    setCurrentLevel(next);

    // Check if water crossed zero
    const crossed = (prev < 0 && next > 0) || (prev > 0 && next < 0) || (prev !== 0 && next === 0);
    setCrossedZero(crossed);

    // Weather effects and sound
    if (action.type === 'rain') {
      sound.playRainDrop();
      sound.playWaterSplash();
      setWeatherMode('rain');
    } else {
      sound.playSunEvaporate();
      sound.playWaterSplash();
      setWeatherMode('sun');
    }

    setLastAction(
      `Aksi: ${action.name} (${action.label}) ➔ Dari ${prev > 0 ? `+${prev}` : prev}m menjadi ${next > 0 ? `+${next}` : next}m`
    );

    // Reset weather mode back to normal after animation
    setTimeout(() => {
      setWeatherMode('normal');
    }, 2400);
  };

  const handleReset = (level: number = 0) => {
    sound.playClick();
    setPreviousLevel(currentLevel);
    setCurrentLevel(level);
    setCrossedZero(false);
    setWeatherMode('normal');
    setLastAction(`Ketinggian air diatur ulang ke posisi ${level} m`);
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
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Header & Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Droplets className="w-3.5 h-3.5" />
              <span>Simulasi Aksi Manipulatif: Operasi Penjumlahan & Pengurangan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Eksperimen Pasang Surut Sungai Musi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Tarik (drag) atau klik objek aksi di bawah ke atas Sungai Musi! 
              Amati bagaimana <strong>Awan Hujan</strong> menambah ketinggian air (penjumlahan) 
              dan <strong>Matahari Terik / Katup Surut</strong> menurunkan ketinggian air (pengurangan), 
              termasuk saat melintasi <strong>titik acuan nol (0)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReset(0)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset ke Normal (0 m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: River Canvas Drop Target */}
        <div className="lg:col-span-8 space-y-4">
          {/* Drop Target Wrapper */}
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
              <div className="absolute inset-0 bg-cyan-900/30 backdrop-blur-xs z-30 flex items-center justify-center rounded-2xl pointer-events-none">
                <span className="px-4 py-2 bg-slate-900/90 text-cyan-300 font-bold text-sm rounded-xl border border-cyan-400 shadow-2xl">
                  Lepaskan di sini untuk memberi aksi pada Sungai Musi!
                </span>
              </div>
            )}

            <AmperaCanvas
              waterLevel={currentLevel}
              previousLevel={previousLevel}
              weatherMode={weatherMode}
              locationName="Sungai Musi · Ampera Palembang"
            />
          </div>

          {/* Mathematical Process Feedback Banner */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Catatan Perubahan Ketinggian Air:
              </span>
              {previousLevel !== null && (
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Awal: {previousLevel > 0 ? `+${previousLevel}` : previousLevel}m
                  </span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Akhir: {currentLevel > 0 ? `+${currentLevel}` : currentLevel}m
                  </span>
                </div>
              )}
            </div>

            {/* Crossed Zero Alert */}
            {crossedZero && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center gap-2.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200 font-medium">
                  <strong>Hebat! Air melintasi titik acuan nol (0).</strong> Dari daerah {previousLevel! < 0 ? 'surut (negatif)' : 'pasang (positif)'} menyeberang menuju daerah {currentLevel > 0 ? 'pasang (positif)' : currentLevel < 0 ? 'surut (negatif)' : 'permukaan normal (0)'}!
                </span>
              </div>
            )}

            {lastAction && (
              <p className="text-xs text-slate-300 font-mono">
                {lastAction}
              </p>
            )}
          </div>
        </div>

        {/* Right: Concrete Action Toolbox */}
        <div className="lg:col-span-4 space-y-5">
          {/* Preset Demonstrations as requested in the brief */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Skenario Kunci (Coba Langsung)</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentLevel(-2);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(rainActions[1]); // +2 m -> to 0
                  }, 400);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block">
                  1. Surut -2 m lalu Hujan Naik 2 m (Tepat ke 0)
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  -2 + 2 = 0 (Garis Normal)
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentLevel(-2);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(rainActions[3]); // +5 m -> to +3
                  }, 400);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block">
                  2. Surut -2 m lalu Hujan Badai Naik 5 m
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  -2 + 5 = +3 (Melintasi 0 ke Pasang)
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentLevel(1);
                  setPreviousLevel(null);
                  setTimeout(() => {
                    applyAction(drainActions[2]); // -3 m -> to -2
                  }, 400);
                }}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block">
                  3. Pasang +1 m lalu Surut 3 m
                </span>
                <span className="text-[11px] font-mono text-rose-400">
                  1 - 3 = -2 (Melintasi 0 ke Surut)
                </span>
              </button>
            </div>
          </div>

          {/* Action Object: Rain (Penjumlahan) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  Aksi Awan Hujan (Operasi Penjumlahan / +)
                </span>
              </div>
              <span className="text-[10px] text-cyan-400/80">Geser atau Klik</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {rainActions.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, action)}
                  onClick={() => applyAction(action)}
                  className="p-3 bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-800/50 hover:border-cyan-400 rounded-xl cursor-grab active:cursor-grabbing hover:scale-102 transition-all text-center select-none shadow-md group"
                >
                  <div className="flex justify-center mb-1 text-cyan-400 group-hover:scale-110 transition-transform">
                    <CloudRain className="w-5 h-5" />
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

          {/* Action Object: Sun / Drain (Pengurangan) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Aksi Terik & Surut (Operasi Pengurangan / -)
                </span>
              </div>
              <span className="text-[10px] text-amber-400/80">Geser atau Klik</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {drainActions.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, action)}
                  onClick={() => applyAction(action)}
                  className="p-3 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-800/50 hover:border-amber-400 rounded-xl cursor-grab active:cursor-grabbing hover:scale-102 transition-all text-center select-none shadow-md group"
                >
                  <div className="flex justify-center mb-1 text-amber-400 group-hover:scale-110 transition-transform">
                    <Sun className="w-5 h-5" />
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

          {/* Next Button */}
          <button
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02]"
          >
            <span>Lanjut ke Tahap 3: Simbolik Matematika</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
