import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MusiRiverMedia } from './components/MusiRiverMedia';
import { GuideModal } from './components/GuideModal';
import { sound } from './utils/audio';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.enabled = newState;
    if (newState) {
      sound.playWaterSplash();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Interactive River Musi Media Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <MusiRiverMedia />
      </main>

      {/* Pedagogical & Context Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-medium text-slate-300">
              Media Pembelajaran Interaktif Bilangan Bulat · Konteks Sungai Musi Palembang
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Jembatan Ampera · Peil Schaal · Titik Acuan 0m</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
