import React, { useState } from 'react';
import { PeilSchaalGauge } from './PeilSchaalGauge';
import { ComparisonProblem } from '../types';
import { GitCompare, CheckCircle2, XCircle, ArrowRight, HelpCircle, Sparkles, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface ComparisonStageProps {
  onContinue: () => void;
}

const COMPARISON_PROBLEMS: ComparisonProblem[] = [
  {
    id: 'c1',
    stationA: {
      name: 'Dermaga Benteng Kuto Besak (BKB)',
      level: -3,
      description: 'Air surut 3 meter di bawah permukaan normal.',
    },
    stationB: {
      name: 'Dermaga Seberang Ulu',
      level: -1,
      description: 'Air surut 1 meter di bawah permukaan normal.',
    },
    relation: '<',
    explanation: 'Pada tiang peil schaal (garis bilangan vertikal), posisi -3 m berada LEBIH RENDAH daripada -1 m. Meskipun angka 3 lebih besar dari 1, nilainya lebih negatif/lebih dalam di bawah nol. Jadi, -3 < -1.',
  },
  {
    id: 'c2',
    stationA: {
      name: 'Dermaga Benteng Kuto Besak (BKB)',
      level: 2,
      description: 'Air pasang naik 2 meter di atas permukaan normal.',
    },
    stationB: {
      name: 'Dermaga Seberang Ulu',
      level: -2,
      description: 'Air surut turun 2 meter di bawah permukaan normal.',
    },
    relation: '>',
    explanation: 'Posisi +2 m (air pasang) berada di atas titik acuan nol, sedangkan -2 m (air surut) berada di bawah titik acuan nol. Setiap bilangan positif selalu LEBIH BESAR daripada bilangan negatif. Jadi, 2 > -2.',
  },
  {
    id: 'c3',
    stationA: {
      name: 'Dermaga Benteng Kuto Besak (BKB)',
      level: -1,
      description: 'Air surut 1 meter di bawah permukaan normal.',
    },
    stationB: {
      name: 'Dermaga Seberang Ulu',
      level: -4,
      description: 'Air surut 4 meter di bawah permukaan normal.',
    },
    relation: '>',
    explanation: '-1 m posisinya lebih tinggi dan lebih dekat ke permukaan normal 0 dibandingkan -4 m. Semakin ke atas posisinya pada tiang peil schaal, nilainya semakin besar. Jadi, -1 > -4.',
  },
  {
    id: 'c4',
    stationA: {
      name: 'Dermaga Benteng Kuto Besak (BKB)',
      level: 0,
      description: 'Air tepat pada permukaan normal acuan.',
    },
    stationB: {
      name: 'Dermaga Seberang Ulu',
      level: -3,
      description: 'Air surut 3 meter di bawah normal.',
    },
    relation: '>',
    explanation: 'Permukaan normal (0) selalu lebih tinggi daripada semua kondisi air surut (bilangan negatif). Jadi, 0 > -3.',
  },
  {
    id: 'c5',
    stationA: {
      name: 'Dermaga Benteng Kuto Besak (BKB)',
      level: -2,
      description: 'Air surut 2 meter di bawah normal.',
    },
    stationB: {
      name: 'Dermaga Seberang Ulu',
      level: -2,
      description: 'Air surut 2 meter di bawah normal.',
    },
    relation: '=',
    explanation: 'Kedua stasiun pengamatan mencatat ketinggian yang sama persis di tiang peil schaal. Jadi, -2 = -2.',
  },
];

export const ComparisonStage: React.FC<ComparisonStageProps> = ({ onContinue }) => {
  const [problemIdx, setProblemIdx] = useState<number>(0);
  const currentProblem = COMPARISON_PROBLEMS[problemIdx];

  const [selectedRelation, setSelectedRelation] = useState<'<' | '>' | '=' | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Free Sandbox Mode Toggle
  const [sandboxMode, setSandboxMode] = useState<boolean>(false);
  const [sandboxA, setSandboxA] = useState<number>(-3);
  const [sandboxB, setSandboxB] = useState<number>(-1);

  const handleSelectRelation = (rel: '<' | '>' | '=') => {
    sound.playClick();
    setSelectedRelation(rel);
    const correct = rel === currentProblem.relation;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playSuccess();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (problemIdx < COMPARISON_PROBLEMS.length - 1) {
      setProblemIdx(problemIdx + 1);
      setSelectedRelation(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      onContinue();
    }
  };

  const currentLevelA = sandboxMode ? sandboxA : currentProblem.stationA.level;
  const currentLevelB = sandboxMode ? sandboxB : currentProblem.stationB.level;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Membandingkan Nilai Bilangan Bulat Positif & Negatif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Perbandingan Ketinggian Air di Dua Dermaga Sungai Musi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Bandingkan ketinggian air di <strong>Dermaga Benteng Kuto Besak (BKB)</strong> dengan <strong>Dermaga Seberang Ulu</strong>. 
              Amati posisi air pada tiang peil schaal dan pilih simbol relasi matematika (<strong>&lt;</strong>, <strong>&gt;</strong>, atau <strong>=</strong>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setSandboxMode(!sandboxMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                sandboxMode
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{sandboxMode ? 'Kembali ke Soal' : 'Mode Eksplorasi Bebas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Gauges View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Dual Station Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center max-w-3xl mx-auto">
          {/* Station A: BKB */}
          <div className="flex flex-col items-center p-4 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-lg">
            <div className="w-full text-center pb-2 mb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                Lokasi 1 (Seberang Ilir)
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Dermaga Benteng Kuto Besak
              </h3>
            </div>

            <PeilSchaalGauge
              currentLevel={currentLevelA}
              height={320}
              interactive={sandboxMode}
              onSelectLevel={(lvl) => sandboxMode && setSandboxA(lvl)}
            />

            {sandboxMode && (
              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {[-5, -3, -1, 0, 1, 3, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSandboxA(lvl)}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {lvl > 0 ? `+${lvl}` : lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Station B: Seberang Ulu */}
          <div className="flex flex-col items-center p-4 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-lg">
            <div className="w-full text-center pb-2 mb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                Lokasi 2 (Seberang Ulu)
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Dermaga Seberang Ulu
              </h3>
            </div>

            <PeilSchaalGauge
              currentLevel={currentLevelB}
              height={320}
              interactive={sandboxMode}
              onSelectLevel={(lvl) => sandboxMode && setSandboxB(lvl)}
            />

            {sandboxMode && (
              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {[-5, -3, -1, 0, 1, 3, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSandboxB(lvl)}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {lvl > 0 ? `+${lvl}` : lvl}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Statement Section */}
        {!sandboxMode ? (
          <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-slate-800">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Soal {problemIdx + 1} dari {COMPARISON_PROBLEMS.length}
              </span>
              <p className="text-sm font-semibold text-slate-200">
                Bandingkan ketinggian air Dermaga BKB dengan Dermaga Seberang Ulu:
              </p>
            </div>

            {/* Comparison Equation Box */}
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl">
              {/* Level A */}
              <div className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono font-extrabold text-xl text-slate-100">
                {currentProblem.stationA.level > 0 ? `+${currentProblem.stationA.level}` : currentProblem.stationA.level}
              </div>

              {/* Relational Slot */}
              <div
                className={`w-14 h-12 flex items-center justify-center font-mono font-extrabold text-2xl rounded-xl border-2 transition-all ${
                  selectedRelation
                    ? isCorrect
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-900/50'
                      : 'bg-rose-950 border-rose-500 text-rose-300 shadow-md shadow-rose-900/50'
                    : 'bg-slate-900 border-dashed border-slate-600 text-slate-400'
                }`}
              >
                {selectedRelation || '?'}
              </div>

              {/* Level B */}
              <div className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono font-extrabold text-xl text-slate-100">
                {currentProblem.stationB.level > 0 ? `+${currentProblem.stationB.level}` : currentProblem.stationB.level}
              </div>
            </div>

            {/* Relational Choice Buttons */}
            <div className="flex items-center justify-center gap-3">
              {[
                { symbol: '<', label: 'Lebih Kecil (<)' },
                { symbol: '=', label: 'Sama Dengan (=)' },
                { symbol: '>', label: 'Lebih Besar (>)' },
              ].map(({ symbol, label }) => (
                <button
                  key={symbol}
                  onClick={() => handleSelectRelation(symbol as '<' | '>' | '=')}
                  className={`flex-1 max-w-[140px] py-3 rounded-xl border-2 font-mono font-bold text-lg transition-all active:scale-95 ${
                    selectedRelation === symbol
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <span className="block text-xl leading-none">{symbol}</span>
                  <span className="text-[10px] text-slate-300 font-sans block mt-1">{label}</span>
                </button>
              ))}
            </div>

            {/* Feedback and Explanation */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Benar Sekali! Pemahaman Kamu Mantap</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Belum Tepat. Perhatikan Tiang Skala Peil Schaal</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Penjelasan Geometris Peil Schaal:</strong> {currentProblem.explanation}
                </p>

                {isCorrect && (
                  <div className="pt-2">
                    <button
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <span>
                        {problemIdx < COMPARISON_PROBLEMS.length - 1
                          ? 'Lanjut ke Soal Perbandingan Berikutnya ➔'
                          : 'Selesai! Lanjut ke Tantangan Mandiri & Kuis ➔'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Sandbox Live Comparison Result */
          <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-slate-800 text-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Hasil Perbandingan Langsung (Sandbox)</span>
            </span>

            <div className="flex items-center justify-center gap-3 p-4 bg-slate-950 border border-amber-500/30 rounded-2xl">
              <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-xl text-slate-100">
                {sandboxA > 0 ? `+${sandboxA}` : sandboxA}
              </div>

              <div className="w-14 h-12 flex items-center justify-center font-mono font-extrabold text-2xl rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300">
                {sandboxA > sandboxB ? '>' : sandboxA < sandboxB ? '<' : '='}
              </div>

              <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-xl text-slate-100">
                {sandboxB > 0 ? `+${sandboxB}` : sandboxB}
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {sandboxA > sandboxB
                ? `Ketinggian di BKB (${sandboxA > 0 ? `+${sandboxA}` : sandboxA}m) LEBIH TINGGI daripada di Seberang Ulu (${sandboxB > 0 ? `+${sandboxB}` : sandboxB}m).`
                : sandboxA < sandboxB
                ? `Ketinggian di BKB (${sandboxA > 0 ? `+${sandboxA}` : sandboxA}m) LEBIH RENDAH daripada di Seberang Ulu (${sandboxB > 0 ? `+${sandboxB}` : sandboxB}m).`
                : `Kedua dermaga berada pada ketinggian yang SAMA PERSIS (${sandboxA > 0 ? `+${sandboxA}` : sandboxA}m).`}
            </p>
          </div>
        )}
      </div>

      {/* Principle Summary Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Kaidah Penting Membandingkan Bilangan Bulat pada Tiang Peil Schaal:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-emerald-300 block mb-1">1. Prinsip Vertikal</strong>
            Semakin ke atas posisi suatu bilangan pada peil schaal, nilainya selalu semakin besar.
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-cyan-300 block mb-1">2. Positif vs Negatif</strong>
            Setiap bilangan positif (di atas normal) selalu lebih besar daripada bilangan negatif (di bawah normal).
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-rose-300 block mb-1">3. Dua Bilangan Negatif</strong>
            Untuk dua bilangan negatif, bilangan yang posisinya lebih dekat ke 0 (misalnya -1 dibandingkan -4) nilainya LEBIH BESAR.
          </div>
        </div>
      </div>
    </div>
  );
};
