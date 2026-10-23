import React from 'react';
import { ArrowRight, CheckCircle2, Lock, Target } from 'lucide-react';
import type { StageScore } from '../types';
import { sound } from '../utils/audio';
import { usePersistentState } from '../utils/storage';

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

interface FlowState<A> {
  idx: number;
  answers: (A | null)[];
  // null berarti soal belum selesai dijawab.
  results: (boolean | null)[];
  finished: boolean;
}

// Mengelola urutan soal dalam satu tahap. Setiap soal hanya boleh dijawab sekali:
// jawaban yang sudah dikunci tidak dapat diubah, dan seluruh state disimpan di
// peramban sehingga memuat ulang halaman tidak membuka kesempatan menjawab ulang.
export function useLockedFlow<A>(key: string, total: number) {
  const [state, setState] = usePersistentState<FlowState<A>>(key, {
    idx: 0,
    answers: [],
    results: [],
    finished: false,
  });

  const idx = Math.min(state.idx, total - 1);
  const answer = state.answers[idx] ?? null;
  const result = state.results[idx] ?? null;
  const done = result !== null;

  // Menyimpan jawaban soal yang sedang aktif. result null dipakai untuk soal
  // dua langkah yang langkah pertamanya sudah dikunci tetapi belum selesai.
  const save = (value: A, itemResult: boolean | null) => {
    if (done) return;
    setState((prev) => {
      const answers = [...prev.answers];
      const results = [...prev.results];
      answers[idx] = value;
      results[idx] = itemResult;
      return { ...prev, answers, results };
    });
    if (itemResult === true) sound.playSuccess();
    if (itemResult === false) sound.playError();
  };

  const next = () => {
    if (!done) return;
    sound.playClick();
    setState((prev) => (idx + 1 >= total ? { ...prev, finished: true } : { ...prev, idx: idx + 1 }));
  };

  const score: StageScore = { correct: state.results.filter((r) => r === true).length, total };

  return { idx, answer, result, done, finished: state.finished, score, save, next };
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
}

export const StageSummary: React.FC<StageSummaryProps> = ({ score, message, nextLabel, onNext }) => (
  <div className="max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-center space-y-4">
    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
    <div>
      <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Jawaban benar</span>
      <span className="text-3xl font-extrabold font-mono text-emerald-300">
        {score.correct}/{score.total}
      </span>
    </div>
    <p className="text-sm text-slate-300">{message}</p>
    <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
      <Lock className="w-3.5 h-3.5" />
      Tahap ini sudah selesai dan jawabannya terkunci.
    </p>
    <button
      onClick={onNext}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold"
    >
      <span>{nextLabel}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// Tombol konfirmasi sebelum jawaban dikunci, agar murid memeriksa ulang pilihannya.
export const LockButton: React.FC<{ disabled: boolean; label: string; onClick: () => void }> = ({
  disabled,
  label,
  onClick,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm"
  >
    <Lock className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export const LockNotice: React.FC = () => (
  <p className="text-xs text-amber-200/90 flex items-start gap-1.5">
    <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
    <span>Jawaban hanya dapat dikunci satu kali dan tidak bisa diubah. Periksa pilihanmu dengan teliti.</span>
  </p>
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
