import React, { useEffect, useState } from 'react';
import { AmperaCanvas } from './AmperaCanvas';
import { NumberLine } from './NumberLine';
import { Feedback, ItemProgress, NextButton, StageHeader, StageSummary, useItemFlow } from './StageShell';
import type { LocateItem, StageScore } from '../types';
import { fmt } from '../utils/number';
import { sound } from '../utils/audio';

const ITEMS: LocateItem[] = [
  {
    id: 'l1',
    mode: 'tempatkan',
    line: 'tegak',
    context: 'Air sedang surut, permukaannya 3 meter di bawah titik acuan. Klik posisi permukaan air pada papan duga (peil schaal).',
    target: -3,
  },
  {
    id: 'l2',
    mode: 'tempatkan',
    line: 'tegak',
    context: 'Air sedang pasang, permukaannya 4 meter di atas titik acuan. Klik posisi permukaan air pada papan duga.',
    target: 4,
  },
  {
    id: 'l3',
    mode: 'baca',
    line: 'mendatar',
    context: 'Papan duga dirobohkan ke kanan sehingga menjadi garis bilangan mendatar. Bilangan berapakah yang ditunjukkan titik merah?',
    target: -6,
  },
  {
    id: 'l4',
    mode: 'tempatkan',
    line: 'mendatar',
    context: 'Tempatkan bilangan -8 pada garis bilangan. Hanya 0, 5, dan 10 (beserta lawannya) yang diberi angka, jadi hitunglah lompatannya dari titik yang kamu ketahui.',
    target: -8,
  },
  {
    id: 'l5',
    mode: 'tempatkan',
    line: 'mendatar',
    context: 'Tempatkan bilangan 7 pada garis bilangan.',
    target: 7,
  },
  {
    id: 'l6',
    mode: 'baca',
    line: 'mendatar',
    context: 'Bilangan berapakah yang ditunjukkan titik merah?',
    target: 3,
  },
  {
    id: 'l7',
    mode: 'tempatkan',
    line: 'mendatar',
    context: 'Tempatkan bilangan -1 pada garis bilangan.',
    target: -1,
  },
];

// Pilihan jawaban memuat kesalahan umum: tanda terbalik dan salah hitung satu langkah.
const readOptions = (target: number): number[] => {
  const set = Array.from(new Set([target, -target, target + 1, target - 1])).filter((v) => v >= -10 && v <= 10);
  return set.sort((x, y) => x - y);
};

const diagnose = (target: number, picked: number): string => {
  if (picked === -target && target !== 0) {
    return `Jaraknya dari 0 sudah tepat, tetapi arahnya terbalik. Bilangan ${target < 0 ? 'negatif ada di bawah/kiri' : 'positif ada di atas/kanan'} titik 0.`;
  }
  if (Math.abs(picked - target) === 1) {
    return 'Hampir tepat, selisihnya satu langkah. Hitung ulang lompatan satu per satu mulai dari 0 atau dari angka yang tertulis.';
  }
  return 'Mulailah dari titik 0. Bilangan positif ke atas/kanan, bilangan negatif ke bawah/kiri, satu langkah untuk setiap satuan.';
};

interface LocateStageProps {
  onComplete: (score: StageScore) => void;
  onContinue: () => void;
}

export const LocateStage: React.FC<LocateStageProps> = ({ onComplete, onContinue }) => {
  const flow = useItemFlow(ITEMS.length);
  const item = ITEMS[flow.idx];
  const [picked, setPicked] = useState<number | null>(null);
  const [lastWrong, setLastWrong] = useState<number | null>(null);

  useEffect(() => {
    setPicked(null);
    setLastWrong(null);
  }, [flow.idx, flow.finished]);

  useEffect(() => {
    if (flow.finished) onComplete(flow.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.finished]);

  const check = (value: number) => {
    const correct = value === item.target;
    flow.record(correct);
    setLastWrong(correct ? null : value);
  };

  const pick = (value: number) => {
    if (flow.solved) return;
    sound.playWaterSplash();
    setPicked(value);
    setLastWrong(null);
  };

  const showAnswer = flow.attempts >= 2 && !flow.solved;

  return (
    <div className="space-y-5">
      <StageHeader
        badge="Tahap 1 · TP 1"
        title="Menentukan Letak Bilangan Bulat pada Garis Bilangan"
        tujuan="Peserta didik mampu menentukan letak bilangan bulat pada garis bilangan dengan tepat."
        bukti="Murid dapat menentukan letak bilangan bulat dan menempatkannya secara tepat pada garis bilangan."
      >
        <p className="text-xs sm:text-sm text-slate-300">
          Papan duga di tepi sungai adalah <strong>garis bilangan tegak</strong>: 0 sebagai titik acuan, positif di atasnya,
          negatif di bawahnya. Jika papan itu dirobohkan ke kanan, bagian atas menjadi <strong>kanan</strong> dan bagian bawah
          menjadi <strong>kiri</strong>. Itulah garis bilangan mendatar yang ada di buku.
        </p>
      </StageHeader>

      {flow.finished ? (
        <StageSummary
          score={flow.score}
          message="Catat skor ini di LKPD-mu. Jika masih ada yang salah, ulangi tahap ini sebelum lanjut, karena membandingkan dan mengurutkan bergantung pada letak bilangan yang tepat."
          nextLabel="Lanjut ke Tahap 2: Membandingkan"
          onNext={onContinue}
          onRetry={flow.restart}
        />
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <ItemProgress idx={flow.idx} total={ITEMS.length} />
          <p className="text-sm sm:text-base font-semibold text-slate-100">{item.context}</p>

          {item.line === 'tegak' ? (
            <div className="space-y-3">
              <AmperaCanvas
                waterLevel={picked ?? 0}
                interactiveGauge={!flow.solved}
                onSelectLevel={pick}
                showClearanceInfo={false}
                locationName="Papan duga · Sungai Musi"
              />
              <p className="text-xs text-slate-400">
                Klik angka pada papan duga di sisi kanan gambar. Permukaan air akan berpindah ke posisi yang kamu pilih.
              </p>
            </div>
          ) : item.mode === 'tempatkan' ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3">
              <NumberLine
                min={-10}
                max={10}
                labels="sparse"
                onPick={flow.solved ? undefined : pick}
                picked={picked}
                points={
                  flow.solved || showAnswer
                    ? [{ value: item.target, label: fmt(item.target), tone: 'ok' }]
                    : picked !== null
                    ? [{ value: picked, tone: 'neutral' }]
                    : []
                }
                ariaLabel="Garis bilangan dari -10 sampai 10, klik untuk menempatkan bilangan"
              />
              <p className="text-xs text-slate-400 px-1">Klik garis tegak kecil (turus) tempat bilangan itu berada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3">
                <NumberLine
                  min={-10}
                  max={10}
                  labels="sparse"
                  points={[{ value: item.target, tone: 'a', label: flow.solved || showAnswer ? fmt(item.target) : '?' }]}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {readOptions(item.target).map((opt) => (
                  <button
                    key={opt}
                    disabled={flow.solved}
                    onClick={() => {
                      sound.playClick();
                      setPicked(opt);
                      check(opt);
                    }}
                    className={`py-3 rounded-xl border-2 font-mono font-extrabold text-lg transition-all ${
                      picked === opt
                        ? opt === item.target
                          ? 'bg-emerald-900 border-emerald-400 text-white'
                          : 'bg-rose-900 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500 disabled:opacity-50'
                    }`}
                  >
                    {fmt(opt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.mode === 'tempatkan' && !flow.solved && (
            <button
              disabled={picked === null}
              onClick={() => picked !== null && check(picked)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm"
            >
              {picked === null ? 'Pilih posisi terlebih dahulu' : `Periksa: ${fmt(picked)}`}
            </button>
          )}

          {flow.solved && (
            <Feedback tone="ok" title={`Tepat. Bilangan ${fmt(item.target)} terletak ${Math.abs(item.target)} langkah di ${item.target < 0 ? (item.line === 'tegak' ? 'bawah' : 'kiri') : item.line === 'tegak' ? 'atas' : 'kanan'} titik 0.`} />
          )}
          {lastWrong !== null && !flow.solved && (
            <Feedback tone="bad" title={`Belum tepat. Kamu memilih ${fmt(lastWrong)}.`}>
              {diagnose(item.target, lastWrong)}
              {showAnswer && (
                <span className="block mt-1 text-amber-200">
                  Jawaban yang benar adalah {fmt(item.target)}. Perhatikan letaknya, lalu pilih posisi itu untuk melanjutkan.
                </span>
              )}
            </Feedback>
          )}

          {flow.solved && <NextButton onClick={flow.next} last={flow.idx === ITEMS.length - 1} />}
        </div>
      )}
    </div>
  );
};
