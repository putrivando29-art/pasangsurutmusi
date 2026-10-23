import React, { useEffect, useState, type ReactNode } from 'react';
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
import { usePersistentState } from './utils/storage';

const STAGES: { id: StageId; short: string; title: string }[] = [
  { id: 'orientasi', short: 'Mulai', title: 'Orientasi' },
  { id: 'tp1', short: 'TP 1', title: 'Letak' },
  { id: 'tp2', short: 'TP 2', title: 'Bandingkan' },
  { id: 'tp3', short: 'TP 3', title: 'Urutkan' },
  { id: 'latihan', short: 'Akhir', title: 'Latihan' },
];

const EMPTY_SCORES: ScoreBoard = { tp1: null, tp2: null, tp3: null };

// Identitas dari akun login. Tanpa akun (mode lokal), nama dan kelas diisi di tahap Mulai.
export interface StudentAccount {
  nama: string;
  kelas: string;
  navExtra: ReactNode;
}

export default function StudentApp({ account }: { account?: StudentAccount }) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [stage, setStage] = usePersistentState<StageId>('tahap', 'orientasi');
  const [localName, setName] = usePersistentState('nama', '');
  const [localKelas, setKelas] = usePersistentState('kelas', '');
  const name = account?.nama ?? localName;
  const kelas = account?.kelas ?? localKelas;
  const [scores, setScores] = usePersistentState<ScoreBoard>('skor', EMPTY_SCORES);

  // Nama dan kelas wajib diisi sebelum mengerjakan soal, karena keduanya menjadi
  // identitas pada ringkasan hasil yang dikirim ke Google Classroom.
  const ready = name.trim() !== '' && kelas.trim() !== '';

  // Peramban menampilkan peringatan bawaannya saat murid menutup tab, memuat ulang,
  // atau berpindah alamat. Kemajuan tetap tersimpan walaupun murid tetap keluar.
  useEffect(() => {
    if (!ready) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [ready]);

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
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenGuide={() => setIsGuideOpen(true)}
        extra={account?.navExtra}
      />

      <nav aria-label="Tahap belajar" className="border-b border-slate-800 bg-slate-950/95">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-5 gap-1.5">
          {STAGES.map((s) => {
            const active = s.id === stage;
            const locked = s.id !== 'orientasi' && !ready;
            return (
              <li key={s.id}>
                <button
                  disabled={locked}
                  title={locked ? 'Isi nama dan kelas di tahap Mulai terlebih dahulu' : undefined}
                  onClick={() => {
                    sound.playClick();
                    goTo(s.id);
                  }}
                  aria-current={active ? 'step' : undefined}
                  className={`w-full rounded-xl border px-1.5 py-1.5 text-center transition-colors ${
                    active
                      ? 'bg-amber-400 border-amber-300 text-slate-950'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900'
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
        {(stage === 'orientasi' || !ready) && (
          <OrientationStage
            name={name}
            kelas={kelas}
            ready={ready}
            identityLocked={!!account}
            onIdentity={(n, k) => {
              setName(n);
              setKelas(k);
            }}
            onContinue={() => goTo('tp1')}
          />
        )}
        {ready && stage === 'tp1' && <LocateStage onComplete={saveScore('tp1')} onContinue={() => goTo('tp2')} />}
        {ready && stage === 'tp2' && <CompareStage onComplete={saveScore('tp2')} onContinue={() => goTo('tp3')} />}
        {ready && stage === 'tp3' && <OrderStage onComplete={saveScore('tp3')} onContinue={() => goTo('latihan')} />}
        {ready && stage === 'latihan' && <PracticeStage name={name} kelas={kelas} stageScores={scores} />}
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
