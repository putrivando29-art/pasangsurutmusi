import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Target } from 'lucide-react';
import type { StageScore } from '../types';
import { sound } from '../utils/audio';

interface StageHeaderProps {
  badge: string;
  title: string;
  tujuan: string;
  bukti: string;
  children?: React.ReactNode;
}

export const StageHeader: React.FC<StageHeaderProps> = ({ badge, title, tujuan, bukti, children }) => (
  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
      <Target className="w-3.5 h-3.5" />
      <span>{badge}</span>
    </div>
    <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm">
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tujuan pembelajaran</span>
        <span className="text-slate-200">{tujuan}</span>
      </div>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bukti ketercapaian</span>
        <span className="text-slate-200">{bukti}</span>
      </div>
    </div>
    {children}
  </div>
);

// Mengelola urutan soal dalam satu tahap. Hanya percobaan pertama yang dihitung
// sebagai bukti ketercapaian; siswa tetap boleh mencoba lagi sampai benar.
export function useItemFlow(total: number) {
  const [idx, setIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const record = (correct: boolean) => {
    if (attempts === 0) setFirstTry((prev) => [...prev, correct]);
    setAttempts((a) => a + 1);
    if (correct) {
      setSolved(true);
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  // Menandai soal gagal pada percobaan pertama tanpa menambah percobaan,
  // dipakai untuk soal dua langkah (simbol lalu alasan).
  const markFirstTryWrong = () => {
    if (attempts === 0) setFirstTry((prev) => [...prev, false]);
    setAttempts((a) => Math.max(a, 1));
  };

  const next = () => {
    sound.playClick();
    if (idx + 1 >= total) {
      setFinished(true);
      return;
    }
    setIdx(idx + 1);
    setAttempts(0);
    setSolved(false);
  };

  const restart = () => {
    sound.playClick();
    setIdx(0);
    setAttempts(0);
    setSolved(false);
    setFirstTry([]);
    setFinished(false);
  };

  const score: StageScore = { correct: firstTry.filter(Boolean).length, total };

  return { idx, attempts, solved, finished, score, record, markFirstTryWrong, next, restart };
}

export const ItemProgress: React.FC<{ idx: number; total: number }> = ({ idx, total }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
      Soal {idx + 1} dari {total}
    </span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400 transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
    </div>
  </div>
);

interface StageSummaryProps {
  score: StageScore;
  message: string;
  nextLabel: string;
  onNext: () => void;
  onRetry: () => void;
}

export const StageSummary: React.FC<StageSummaryProps> = ({ score, message, nextLabel, onNext, onRetry }) => (
  <div className="max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-center space-y-4">
    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
    <div>
      <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Benar pada percobaan pertama</span>
      <span className="text-3xl font-extrabold font-mono text-emerald-300">
        {score.correct}/{score.total}
      </span>
    </div>
    <p className="text-sm text-slate-300">{message}</p>
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <button
        onClick={onRetry}
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold"
      >
        <RotateCcw className="w-4 h-4 text-amber-400" />
        <span>Ulangi tahap ini</span>
      </button>
      <button
        onClick={onNext}
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold"
      >
        <span>{nextLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const Feedback: React.FC<{ tone: 'ok' | 'bad' | 'info'; title: string; children?: React.ReactNode }> = ({
  tone,
  title,
  children,
}) => {
  const style =
    tone === 'ok'
      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
      : tone === 'bad'
      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
      : 'bg-slate-950 border-slate-700 text-slate-200';
  return (
    <div role="status" className={`p-3.5 rounded-xl border text-sm space-y-1.5 ${style}`}>
      <strong className="block">{title}</strong>
      {children && <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">{children}</div>}
    </div>
  );
};

export const NextButton: React.FC<{ onClick: () => void; last: boolean }> = ({ onClick, last }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
  >
    <span>{last ? 'Lihat hasil tahap ini' : 'Soal berikutnya'}</span>
    <ArrowRight className="w-4 h-4" />
  </button>
);
