import React from 'react';
import { Volume2, VolumeX, HelpCircle, Compass } from 'lucide-react';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-400/30 shrink-0">
            <span className="font-extrabold text-white text-lg font-serif">M</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight leading-none">
                Media Pasang Surut Sungai Musi
              </h1>
              <span className="text-[10px] font-bold text-rose-400 border border-rose-500/30 rounded px-1.5 py-0.2 bg-rose-950/40">
                Palembang
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulasi Interaktif Bilangan Bulat Berbasis Garis Bilangan Vertikal (Peil Schaal) & Jembatan Ampera
            </p>
          </div>
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
            title={soundEnabled ? 'Efek Suara Aktif (Klik untuk Mematikan)' : 'Efek Suara Mati (Klik untuk Menyalakan)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Suara Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Suara Mati</span>
              </>
            )}
          </button>

          {/* Guide Modal Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Panduan & Info</span>
          </button>
        </div>
      </div>
    </header>
  );
};
