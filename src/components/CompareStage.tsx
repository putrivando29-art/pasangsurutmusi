import React, { useEffect, useMemo, useState } from 'react';
import { NumberLine } from './NumberLine';
import { Feedback, ItemProgress, NextButton, StageHeader, StageSummary, useItemFlow } from './StageShell';
import type { CompareItem, Relation, StageScore } from '../types';
import { absoluteValueRelation, fmt, relationOf, relationWord } from '../utils/number';
import { sound } from '../utils/audio';

// Angka ketinggian air pada soal adalah contoh rekaan untuk latihan, bukan data pengukuran.
const ITEMS: CompareItem[] = [
  { id: 'c1', context: 'Pukul 06.00 air tercatat -3 m, pukul 12.00 tercatat -1 m.', labelA: '06.00', labelB: '12.00', a: -3, b: -1 },
  { id: 'c2', context: 'Hari Senin air tercatat +2 m, hari Selasa tercatat -4 m.', labelA: 'Senin', labelB: 'Selasa', a: 2, b: -4 },
  { id: 'c3', context: 'Pukul 03.00 air tercatat -6 m, pukul 09.00 tercatat -2 m.', labelA: '03.00', labelB: '09.00', a: -6, b: -2 },
  { id: 'c4', context: 'Pagi hari air tepat di titik acuan (0 m), malam hari tercatat -5 m.', labelA: 'Pagi', labelB: 'Malam', a: 0, b: -5 },
  { id: 'c5', context: 'Hari Rabu dan hari Kamis air sama-sama tercatat -4 m.', labelA: 'Rabu', labelB: 'Kamis', a: -4, b: -4 },
  { id: 'c6', context: 'Pukul 15.00 air tercatat -1 m, pukul 21.00 tercatat -7 m.', labelA: '15.00', labelB: '21.00', a: -1, b: -7 },
  { id: 'c7', context: 'Bulan Januari pasang tertinggi tercatat +3 m, bulan Februari +8 m.', labelA: 'Jan', labelB: 'Feb', a: 3, b: 8 },
];

interface Reason {
  text: string;
  correct: boolean;
  why?: string;
}

const COUNTER_EXAMPLE =
  'Uji alasan itu dengan contoh -9 dan -1: angka 9 lebih besar dari 1 dan -9 lebih jauh dari 0, padahal -9 < -1 karena -9 terletak di sebelah kiri -1.';

const buildReasons = (a: number, b: number, idx: number): Reason[] => {
  const rel = relationOf(a, b);
  const correctText =
    rel === '='
      ? `${fmt(a)} dan ${fmt(b)} menempati titik yang sama pada garis bilangan.`
      : `Pada garis bilangan, ${fmt(a)} terletak di sebelah ${rel === '<' ? 'kiri' : 'kanan'} ${fmt(b)}.`;

  let distractors: Reason[];
  if (a >= 0 && b >= 0) {
    // Untuk dua bilangan tak negatif, membandingkan angkanya memang benar,
    // jadi pengecoh di sini harus benar-benar keliru.
    const nearer = Math.abs(a) <= Math.abs(b) ? a : b;
    distractors = [
      {
        text: 'Keduanya bilangan positif, jadi keduanya sama besar.',
        correct: false,
        why: 'Dua bilangan positif tetap bisa berbeda letak. Lihat titik mana yang lebih ke kanan.',
      },
      {
        text: `${fmt(nearer)} lebih dekat ke 0, jadi ${fmt(nearer)} lebih besar.`,
        correct: false,
        why: 'Untuk bilangan positif, yang lebih dekat ke 0 justru lebih kecil karena letaknya lebih ke kiri.',
      },
    ];
  } else {
    const absRel = absoluteValueRelation(a, b);
    distractors = [
      rel === '='
        ? {
            text: 'Semua bilangan negatif sama besar karena semuanya di bawah titik acuan.',
            correct: false,
            why: 'Bilangan negatif berbeda-beda letaknya, misalnya -9 dan -1. Keduanya sama besar di sini karena menempati titik yang sama.',
          }
        : {
            text: `Angka ${Math.abs(a)} ${relationWord(absRel)} ${Math.abs(b)}, jadi tanda negatif tidak perlu diperhatikan.`,
            correct: false,
            why: COUNTER_EXAMPLE,
          },
      { text: 'Bilangan yang letaknya lebih jauh dari 0 selalu lebih besar.', correct: false, why: COUNTER_EXAMPLE },
    ];
  }

  const reasons: Reason[] = [{ text: correctText, correct: true }, ...distractors];
  // Urutan pilihan digeser per soal agar jawaban benar tidak selalu di posisi yang sama.
  const shift = idx % reasons.length;
  return [...reasons.slice(shift), ...reasons.slice(0, shift)];
};

const symbolHint = (a: number, b: number, chosen: Relation): string => {
  const rel = relationOf(a, b);
  if (chosen === absoluteValueRelation(a, b) && chosen !== rel) {
    return `Kamu membandingkan ${Math.abs(a)} dan ${Math.abs(b)} tanpa tandanya. Lihat garis bilangan: bilangan yang letaknya lebih ke kanan nilainya lebih besar, termasuk sesama bilangan negatif.`;
  }
  if (chosen === '=') {
    return 'Dua bilangan sama besar hanya jika keduanya menempati titik yang sama. Apakah kedua titik pada garis bilangan berimpit?';
  }
  return 'Perhatikan titik mana yang lebih ke kanan. Bilangan di sebelah kanan selalu lebih besar daripada bilangan di sebelah kirinya.';
};

interface CompareStageProps {
  onComplete: (score: StageScore) => void;
  onContinue: () => void;
}

export const CompareStage: React.FC<CompareStageProps> = ({ onComplete, onContinue }) => {
  const flow = useItemFlow(ITEMS.length);
  const item = ITEMS[flow.idx];
  const rel = relationOf(item.a, item.b);
  const reasons = useMemo(() => buildReasons(item.a, item.b, flow.idx), [item, flow.idx]);

  const [symbol, setSymbol] = useState<Relation | null>(null);
  const [symbolOk, setSymbolOk] = useState(false);
  const [symbolTries, setSymbolTries] = useState(0);
  const [reasonPick, setReasonPick] = useState<number | null>(null);

  useEffect(() => {
    setSymbol(null);
    setSymbolOk(false);
    setSymbolTries(0);
    setReasonPick(null);
  }, [flow.idx, flow.finished]);

  useEffect(() => {
    if (flow.finished) onComplete(flow.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.finished]);

  const chooseSymbol = (s: Relation) => {
    if (symbolOk) return;
    setSymbol(s);
    setSymbolTries((t) => t + 1);
    if (s === rel) {
      setSymbolOk(true);
      sound.playClick();
    } else {
      // Simbol salah membuat soal ini tidak lagi benar pada percobaan pertama.
      flow.markFirstTryWrong();
      sound.playError();
    }
  };

  const chooseReason = (i: number) => {
    if (flow.solved) return;
    setReasonPick(i);
    flow.record(reasons[i].correct);
  };

  return (
    <div className="space-y-5">
      <StageHeader
        badge="Tahap 2 · TP 2"
        title="Membandingkan Dua Bilangan Bulat"
        tujuan="Dengan bantuan garis bilangan, peserta didik mampu membandingkan nilai dua bilangan bulat menggunakan simbol matematis (<, >, =) dengan benar."
        bukti="Murid dapat membandingkan nilai dua bilangan bulat dan menuliskannya menggunakan simbol matematis (<, >, atau =) melalui bantuan garis bilangan."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="font-mono text-amber-300">a &lt; b</strong> dibaca "a kurang dari b": titik a di sebelah kiri b.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="font-mono text-amber-300">a &gt; b</strong> dibaca "a lebih dari b": titik a di sebelah kanan b.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="font-mono text-amber-300">a = b</strong> dibaca "a sama dengan b": kedua titik berimpit.
          </div>
        </div>
      </StageHeader>

      {flow.finished ? (
        <StageSummary
          score={flow.score}
          message="Soal dihitung benar jika simbol dan alasannya tepat pada percobaan pertama. Tulis tiga kalimat perbandingan dari tahap ini beserta cara membacanya di LKPD-mu."
          nextLabel="Lanjut ke Tahap 3: Mengurutkan"
          onNext={onContinue}
          onRetry={flow.restart}
        />
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <ItemProgress idx={flow.idx} total={ITEMS.length} />
          <p className="text-sm sm:text-base font-semibold text-slate-100">
            {item.context} Bandingkan ketinggian air <span className="text-rose-300">{item.labelA}</span> dengan{' '}
            <span className="text-cyan-300">{item.labelB}</span>.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3">
            <NumberLine
              min={-10}
              max={10}
              labels="all"
              points={[
                { value: item.a, label: item.labelA, tone: 'a' },
                { value: item.b, label: item.labelB, tone: 'b' },
              ]}
              ariaLabel={`Garis bilangan dengan titik ${fmt(item.a)} dan ${fmt(item.b)}`}
            />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="px-3 sm:px-4 py-2 rounded-xl bg-rose-950 border border-rose-700 font-mono font-extrabold text-xl text-rose-200">
              {fmt(item.a)}
            </span>
            <span
              className={`w-14 h-12 flex items-center justify-center font-mono font-extrabold text-2xl rounded-xl border-2 ${
                symbolOk
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : symbol
                  ? 'bg-rose-950 border-rose-500 text-rose-200'
                  : 'border-dashed border-slate-600 text-slate-500'
              }`}
              aria-live="polite"
            >
              {symbol ?? '?'}
            </span>
            <span className="px-3 sm:px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-700 font-mono font-extrabold text-xl text-cyan-200">
              {fmt(item.b)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['<', '=', '>'] as Relation[]).map((s) => (
              <button
                key={s}
                disabled={symbolOk}
                onClick={() => chooseSymbol(s)}
                className={`py-2.5 rounded-xl border-2 font-mono font-bold transition-all ${
                  symbol === s
                    ? s === rel
                      ? 'bg-emerald-800 border-emerald-400 text-white'
                      : 'bg-rose-800 border-rose-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500 disabled:opacity-50'
                }`}
              >
                <span className="block text-2xl leading-none">{s}</span>
                <span className="block text-[11px] font-sans mt-1 text-slate-300">{relationWord(s)}</span>
              </button>
            ))}
          </div>

          {symbol && !symbolOk && (
            <Feedback tone="bad" title="Simbol belum tepat.">
              {symbolHint(item.a, item.b, symbol)}
              {symbolTries >= 2 && (
                <span className="block mt-1 text-amber-200">
                  Petunjuk: titik {item.labelA} ({fmt(item.a)}) berada di sebelah{' '}
                  {rel === '=' ? 'yang sama dengan' : rel === '<' ? 'kiri' : 'kanan'} titik {item.labelB} ({fmt(item.b)}).
                </span>
              )}
            </Feedback>
          )}

          {symbolOk && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-100">
                Simbol tepat. Sekarang pilih alasan yang paling benar untuk {fmt(item.a)} {rel} {fmt(item.b)}:
              </p>
              {reasons.map((r, i) => (
                <button
                  key={r.text}
                  disabled={flow.solved}
                  onClick={() => chooseReason(i)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                    reasonPick === i
                      ? r.correct
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-100'
                        : 'bg-rose-950 border-rose-500 text-rose-100'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600 disabled:opacity-50'
                  }`}
                >
                  {r.text}
                </button>
              ))}
              {reasonPick !== null && !reasons[reasonPick].correct && !flow.solved && (
                <Feedback tone="bad" title="Alasan ini tidak berlaku untuk semua bilangan bulat.">
                  {reasons[reasonPick].why} Pilih alasan yang memakai letak pada garis bilangan.
                </Feedback>
              )}
            </div>
          )}

          {flow.solved && (
            <>
              <Feedback tone="ok" title={`${fmt(item.a)} ${rel} ${fmt(item.b)}`}>
                Dibaca: "{fmt(item.a)} {relationWord(rel)} {fmt(item.b)}". Artinya ketinggian air {item.labelA}{' '}
                {rel === '<' ? 'lebih rendah daripada' : rel === '>' ? 'lebih tinggi daripada' : 'sama dengan'} ketinggian air{' '}
                {item.labelB}.
              </Feedback>
              <NextButton onClick={flow.next} last={flow.idx === ITEMS.length - 1} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
