import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GuideModal } from './components/GuideModal';
import { OrientationStage } from './components/OrientationStage';
import { LocateStage } from './components/LocateStage';
import { CompareStage } from './components/CompareStage';
import { OrderStage } from './components/OrderStage';
import { PracticeStage } from './components/PracticeStage';
import type { ScoreBoard, StageId, StageScore, TpKey } from './types';
import { sound } from './utils/audio';

const STAGES: { id: StageId; short: string; title: string }[] = [
  { id: 'orientasi', short: 'Mulai', title: 'Orientasi' },
  { id: 'tp1', short: 'TP 1', title: 'Letak' },
  { id: 'tp2', short: 'TP 2', title: 'Bandingkan' },
  { id: 'tp3', short: 'TP 3', title: 'Urutkan' },
  { id: 'latihan', short: 'Akhir', title: 'Latihan' },
];

const STORAGE_KEY = 'bilangan-bulat-musi-v2';

interface Saved {
  stage: StageId;
  name: string;
  kelas: string;
  scores: ScoreBoard;
}

const EMPTY_SCORES: ScoreBoard = { tp1: null, tp2: null, tp3: null };

const load = (): Saved | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const saved = load();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [stage, setStage] = useState<StageId>(saved?.stage ?? 'orientasi');
  const [name, setName] = useState(saved?.name ?? '');
  const [kelas, setKelas] = useState(saved?.kelas ?? '');
  const [scores, setScores] = useState<ScoreBoard>(saved?.scores ?? EMPTY_SCORES);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, name, kelas, scores } satisfies Saved));
    } catch {
      // Penyimpanan tidak tersedia (mode privat), media tetap berjalan tanpa menyimpan kemajuan.
    }
  }, [stage, name, kelas, scores]);

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.enabled = newState;
    if (newState) {
      sound.playWaterSplash();
    }
  };

  const goTo = (id: StageId) => {
    setStage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveScore = (tp: TpKey) => (score: StageScore) => setScores((prev) => ({ ...prev, [tp]: score }));

  const isDone = (id: StageId) => id !== 'orientasi' && id !== 'latihan' && scores[id] !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <Navbar soundEnabled={soundEnabled} onToggleSound={handleToggleSound} onOpenGuide={() => setIsGuideOpen(true)} />

      <nav aria-label="Tahap belajar" className="border-b border-slate-800 bg-slate-950/95">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-5 gap-1.5">
          {STAGES.map((s) => {
            const active = s.id === stage;
            return (
              <li key={s.id}>
                <button
                  onClick={() => {
                    sound.playClick();
                    goTo(s.id);
                  }}
                  aria-current={active ? 'step' : undefined}
                  className={`w-full rounded-xl border px-1.5 py-1.5 text-center transition-colors ${
                    active
                      ? 'bg-amber-400 border-amber-300 text-slate-950'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 text-[11px] font-bold">
                    {isDone(s.id) && <CheckCircle2 className={`w-3.5 h-3.5 ${active ? 'text-slate-900' : 'text-emerald-400'}`} />}
                    <span>{s.short}</span>
                  </span>
                  <span className="block text-[10px] sm:text-xs font-semibold truncate">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {stage === 'orientasi' && (
          <OrientationStage
            name={name}
            kelas={kelas}
            onIdentity={(n, k) => {
              setName(n);
              setKelas(k);
            }}
            onContinue={() => goTo('tp1')}
          />
        )}
        {stage === 'tp1' && <LocateStage onComplete={saveScore('tp1')} onContinue={() => goTo('tp2')} />}
        {stage === 'tp2' && <CompareStage onComplete={saveScore('tp2')} onContinue={() => goTo('tp3')} />}
        {stage === 'tp3' && <OrderStage onComplete={saveScore('tp3')} onContinue={() => goTo('latihan')} />}
        {stage === 'latihan' && <PracticeStage name={name} kelas={kelas} stageScores={scores} onGoTo={goTo} />}
      </main>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-medium text-slate-300">
              Media Pembelajaran Bilangan Bulat · Konteks Sungai Musi Palembang
            </span>
          </div>
          <span>Letak · Membandingkan · Mengurutkan</span>
        </div>
      </footer>
    </div>
  );
}
