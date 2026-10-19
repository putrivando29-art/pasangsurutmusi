import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { NumberLine } from './NumberLine';
import { Feedback, ItemProgress, NextButton, StageHeader, StageSummary, useItemFlow } from './StageShell';
import type { OrderItem, StageScore } from '../types';
import { fmt, sortValues } from '../utils/number';
import { sound } from '../utils/audio';

// Data ketinggian air pada soal adalah contoh rekaan untuk latihan, bukan data pengukuran.
const ITEMS: OrderItem[] = [
  {
    id: 'o1',
    context: 'Catatan ketinggian air empat hari: Senin +2 m, Selasa -3 m, Rabu 0 m, Kamis -1 m.',
    direction: 'naik',
    values: [2, -3, 0, -1],
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
  },
  {
    id: 'o2',
    context: 'Catatan ketinggian air lima waktu pengamatan: -4 m, +3 m, -5 m, +1 m, 0 m.',
    direction: 'turun',
    values: [-4, 3, -5, 1, 0],
  },
  {
    id: 'o3',
    context: 'Urutkan bilangan berikut.',
    direction: 'naik',
    values: [-2, -7, 5, -5, 4],
  },
  {
    id: 'o4',
    context: 'Saat kemarau, air selalu di bawah titik acuan: -1 m, -4 m, -3 m, -5 m, -2 m.',
    direction: 'turun',
    values: [-1, -4, -3, -5, -2],
  },
];

const directionText = (d: OrderItem['direction']) =>
  d === 'naik' ? 'dari yang terkecil ke yang terbesar' : 'dari yang terbesar ke yang terkecil';

const chain = (values: number[], d: OrderItem['direction']) => values.map(fmt).join(d === 'naik' ? ' < ' : ' > ');

const diagnose = (answer: number[], item: OrderItem): string => {
  const expected = sortValues(item.values, item.direction);
  const reversed = [...expected].reverse();
  if (answer.every((v, i) => v === reversed[i])) {
    const allNegative = item.values.every((v) => v < 0);
    return `Urutanmu terbalik. Soal meminta ${directionText(item.direction)}.${
      allNegative
        ? ' Hati-hati: pada bilangan negatif, angka yang tampak besar (misalnya 5 pada -5) justru bernilai paling kecil karena letaknya paling kiri.'
        : ''
    }`;
  }
  const byAbs = [...item.values].sort((x, y) =>
    item.direction === 'naik' ? Math.abs(x) - Math.abs(y) : Math.abs(y) - Math.abs(x),
  );
  if (answer.every((v, i) => v === byAbs[i])) {
    return 'Kamu mengurutkan angkanya tanpa memperhatikan tanda negatif. Ingat: bilangan negatif selalu lebih kecil daripada 0 dan bilangan positif.';
  }
  return 'Bandingkan dua bilangan yang bersebelahan satu per satu. Gunakan tombol "Tampilkan di garis bilangan" lalu baca titiknya dari kiri ke kanan.';
};

interface OrderStageProps {
  onComplete: (score: StageScore) => void;
  onContinue: () => void;
}

export const OrderStage: React.FC<OrderStageProps> = ({ onComplete, onContinue }) => {
  const flow = useItemFlow(ITEMS.length);
  const item = ITEMS[flow.idx];
  const expected = sortValues(item.values, item.direction);

  // Menyimpan indeks kartu, bukan nilainya, agar setiap kartu hanya bisa dipakai sekali.
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[] | null>(null);
  const [showLine, setShowLine] = useState(false);

  useEffect(() => {
    setChosen([]);
    setChecked(null);
    setShowLine(false);
  }, [flow.idx, flow.finished]);

  useEffect(() => {
    if (flow.finished) onComplete(flow.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.finished]);

  const answer = chosen.map((i) => item.values[i]);
  const full = chosen.length === item.values.length;

  const take = (i: number) => {
    if (flow.solved) return;
    sound.playClick();
    setChecked(null);
    setChosen((prev) => [...prev, i]);
  };

  const drop = (pos: number) => {
    if (flow.solved) return;
    sound.playClick();
    setChecked(null);
    setChosen((prev) => prev.filter((_, p) => p !== pos));
  };

  const check = () => {
    const correct = answer.every((v, i) => v === expected[i]);
    setChecked(answer);
    flow.record(correct);
  };

  const labelOf = (i: number) => item.labels?.[i];

  return (
    <div className="space-y-5">
      <StageHeader
        badge="Tahap 3 · TP 3"
        title="Mengurutkan Beberapa Bilangan Bulat"
        tujuan="Peserta didik mampu mengurutkan beberapa bilangan bulat dari yang terkecil ke terbesar atau sebaliknya berdasarkan hasil perbandingan dengan tepat."
        bukti="Murid dapat mengurutkan beberapa bilangan bulat dan menyusunnya dari yang terkecil ke terbesar atau sebaliknya berdasarkan hasil perbandingan."
      >
        <p className="text-xs sm:text-sm text-slate-300">
          Mengurutkan adalah membandingkan berulang kali. Pada garis bilangan, urutan dari kiri ke kanan adalah urutan dari yang
          terkecil ke yang terbesar.
        </p>
      </StageHeader>

      {flow.finished ? (
        <StageSummary
          score={flow.score}
          message="Salin satu urutan dari tahap ini ke LKPD-mu dalam bentuk kalimat dengan simbol, misalnya -7 < -5 < -2 < 4 < 5."
          nextLabel="Lanjut ke Latihan Penguatan"
          onNext={onContinue}
          onRetry={flow.restart}
        />
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <ItemProgress idx={flow.idx} total={ITEMS.length} />
          <p className="text-sm sm:text-base font-semibold text-slate-100">
            {item.context} Urutkan <span className="text-amber-300">{directionText(item.direction)}</span>
            {item.labels
              ? ` (dari ketinggian air ${item.direction === 'naik' ? 'terendah ke tertinggi' : 'tertinggi ke terendah'}).`
              : '.'}
          </p>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Kartu bilangan (ketuk untuk memasukkan ke urutan)
            </span>
            <div className="flex flex-wrap gap-2">
              {item.values.map((v, i) => {
                const used = chosen.includes(i);
                return (
                  <button
                    key={i}
                    disabled={used || flow.solved}
                    onClick={() => take(i)}
                    className={`min-w-[64px] px-3 py-2 rounded-xl border-2 font-mono font-extrabold text-lg transition-all ${
                      used
                        ? 'border-dashed border-slate-700 text-slate-600 bg-transparent'
                        : 'bg-slate-800 border-slate-600 text-slate-100 hover:border-amber-400'
                    }`}
                  >
                    {fmt(v)}
                    {labelOf(i) && <span className="block text-[10px] font-sans font-semibold text-slate-400">{labelOf(i)}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Urutanmu ({item.direction === 'naik' ? 'terkecil → terbesar' : 'terbesar → terkecil'}). Ketuk kartu untuk mengeluarkannya.
            </span>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[60px] p-2 rounded-xl bg-slate-950 border border-slate-800">
              {item.values.map((_, pos) => {
                const cardIdx = chosen[pos];
                const filled = cardIdx !== undefined;
                const wrong = checked !== null && filled && checked[pos] !== expected[pos];
                const right = checked !== null && filled && checked[pos] === expected[pos];
                return (
                  <React.Fragment key={pos}>
                    {pos > 0 && (
                      <span className="font-mono font-bold text-amber-300 text-lg" aria-hidden>
                        {item.direction === 'naik' ? '<' : '>'}
                      </span>
                    )}
                    <button
                      disabled={!filled || flow.solved}
                      onClick={() => drop(pos)}
                      aria-label={filled ? `Keluarkan ${fmt(item.values[cardIdx])} dari urutan` : `Posisi ${pos + 1} kosong`}
                      className={`min-w-[56px] h-11 px-2 rounded-lg border-2 font-mono font-extrabold text-base ${
                        !filled
                          ? 'border-dashed border-slate-700 text-slate-600'
                          : right
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                          : wrong
                          ? 'bg-rose-950 border-rose-500 text-rose-200'
                          : 'bg-slate-800 border-slate-500 text-slate-100'
                      }`}
                    >
                      {filled ? fmt(item.values[cardIdx]) : pos + 1}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setShowLine((s) => !s);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200"
            >
              {showLine ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showLine ? 'Sembunyikan garis bilangan' : 'Tampilkan di garis bilangan'}</span>
            </button>
            {!flow.solved && chosen.length > 0 && (
              <button
                onClick={() => {
                  sound.playClick();
                  setChosen([]);
                  setChecked(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Kosongkan urutan</span>
              </button>
            )}
          </div>

          {(showLine || flow.solved) && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3">
              <NumberLine
                min={-10}
                max={10}
                labels="all"
                points={item.values.map((v, i) => ({ value: v, label: labelOf(i) ?? fmt(v), tone: 'neutral' as const }))}
                ariaLabel="Garis bilangan dengan semua bilangan pada soal"
              />
            </div>
          )}

          {!flow.solved && (
            <button
              disabled={!full}
              onClick={check}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm"
            >
              {full ? 'Periksa urutan' : `Masukkan semua kartu (${chosen.length}/${item.values.length})`}
            </button>
          )}

          {checked !== null && !flow.solved && (
            <Feedback tone="bad" title="Urutan belum tepat. Kartu bertanda merah berada di posisi yang salah.">
              {diagnose(checked, item)}
              {flow.attempts >= 2 && (
                <span className="block mt-1 text-amber-200">Urutan yang benar: {chain(expected, item.direction)}</span>
              )}
            </Feedback>
          )}

          {flow.solved && (
            <>
              <Feedback tone="ok" title={chain(expected, item.direction)}>
                {item.direction === 'naik'
                  ? 'Urutan terkecil ke terbesar sama dengan membaca titik pada garis bilangan dari kiri ke kanan.'
                  : 'Urutan terbesar ke terkecil sama dengan membaca titik pada garis bilangan dari kanan ke kiri.'}
              </Feedback>
              <NextButton onClick={flow.next} last={flow.idx === ITEMS.length - 1} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
