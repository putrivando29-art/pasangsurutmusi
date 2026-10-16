import React, { useState } from 'react';
import { AmperaCanvas } from './AmperaCanvas';
import { SymbolicProblem } from '../types';
import { Calculator, CheckCircle2, XCircle, ArrowRight, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface SymbolicStageProps {
  onContinue: () => void;
}

const PROBLEMS: SymbolicProblem[] = [
  {
    id: 'p1',
    contextStory: 'Sungai Musi surut di posisi 2 meter di bawah normal (-2 m). Datang hujan dari hulu Bukit Barisan yang menaikkan air sebesar 2 meter.',
    startLevel: -2,
    operation: '+',
    changeAmount: 2,
    expectedResult: 0,
    explanation: 'Surut 2 meter (-2) ditambah kenaikan hujan 2 meter (+2) menghasilkan 0 meter. Bilangan berlawanan (-2 dan +2) jika dijumlahkan bernilai 0 (kembali ke permukaan normal).',
  },
  {
    id: 'p2',
    contextStory: 'Air Sungai Musi sedang surut di posisi -2 meter. Tiba-tiba badai muson lebat menyebabkan air naik drastis sebesar 5 meter.',
    startLevel: -2,
    operation: '+',
    changeAmount: 5,
    expectedResult: 3,
    explanation: 'Dari -2 naik 2 langkah mencapai 0, lalu lanjut naik 3 langkah lagi mencapai +3. Kalimat matematikanya: -2 + 5 = 3.',
  },
  {
    id: 'p3',
    contextStory: 'Pagi hari air Sungai Musi pasang di ketinggian +1 meter. Menjelang sore, air laut surut sehingga permukaan turun sebesar 3 meter.',
    startLevel: 1,
    operation: '-',
    changeAmount: 3,
    expectedResult: -2,
    explanation: 'Dari posisi 1 meter, air turun 1 meter mencapai titik normal (0), lalu turun 2 meter lagi ke daerah surut sehingga mencapai -2 meter. Bentuk matematikanya: 1 - 3 = -2.',
  },
  {
    id: 'p4',
    contextStory: 'Air Sungai Musi sudah surut di -1 meter. Karena kemarau panjang, air menyusut lagi sebesar 3 meter.',
    startLevel: -1,
    operation: '-',
    changeAmount: 3,
    expectedResult: -4,
    explanation: 'Posisi awal sudah negatif (-1), kemudian semakin surut atau berkurang 3 meter. Posisi semakin ke bawah: -1 - 3 = -4 meter.',
  },
  {
    id: 'p5',
    contextStory: 'Air Sungai Musi pasang tinggi di posisi +3 meter. Menjelang tengah malam, air menyusut sebesar 5 meter.',
    startLevel: 3,
    operation: '-',
    changeAmount: 5,
    expectedResult: -2,
    explanation: 'Air pasang +3 meter turun melintasi 0 sejauh 5 meter. 3 - 5 = -2 meter (berada 2 meter di bawah normal).',
  },
];

export const SymbolicStage: React.FC<SymbolicStageProps> = ({ onContinue }) => {
  const [problemIndex, setProblemIndex] = useState<number>(0);
  const currentProblem = PROBLEMS[problemIndex];

  // User input slots for: [start] [op] [amount] = [result]
  const [inputStart, setInputStart] = useState<string>('');
  const [inputOp, setInputOp] = useState<string>('+');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [inputResult, setInputResult] = useState<string>('');

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [simLevel, setSimLevel] = useState<number>(currentProblem.startLevel);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  const handleCheck = () => {
    sound.playClick();
    const startNum = parseInt(inputStart, 10);
    const amountNum = parseInt(inputAmount, 10);
    const resultNum = parseInt(inputResult, 10);

    const matchesStart = startNum === currentProblem.startLevel;
    const matchesOp = inputOp === currentProblem.operation;
    const matchesAmount = amountNum === currentProblem.changeAmount;
    const matchesResult = resultNum === currentProblem.expectedResult;

    const correct = matchesStart && matchesOp && matchesAmount && matchesResult;
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playSuccess();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Animate Ampera Canvas to verify
      setPrevLevel(currentProblem.startLevel);
      setSimLevel(currentProblem.expectedResult);
    } else {
      sound.playError();
    }
  };

  const handleQuickFill = (field: 'start' | 'op' | 'amount' | 'result', val: string) => {
    sound.playClick();
    if (field === 'start') setInputStart(val);
    if (field === 'op') setInputOp(val);
    if (field === 'amount') setInputAmount(val);
    if (field === 'result') setInputResult(val);
    setIsSubmitted(false);
  };

  const handleNextProblem = () => {
    sound.playClick();
    if (problemIndex < PROBLEMS.length - 1) {
      const nextIdx = problemIndex + 1;
      setProblemIndex(nextIdx);
      setInputStart('');
      setInputOp('+');
      setInputAmount('');
      setInputResult('');
      setIsSubmitted(false);
      setIsCorrect(false);
      setPrevLevel(null);
      setSimLevel(PROBLEMS[nextIdx].startLevel);
    } else {
      onContinue();
    }
  };

  const handleAutoFillGuide = () => {
    setInputStart(currentProblem.startLevel.toString());
    setInputOp(currentProblem.operation);
    setInputAmount(currentProblem.changeAmount.toString());
    setInputResult(currentProblem.expectedResult.toString());
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-rose-300 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Transisi Konkrit ke Simbolik Matematika</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Menyusun Kalimat Matematika Penjumlahan & Pengurangan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Hubungkan peristiwa fisik pasang surut Sungai Musi dengan bentuk simbolik matematika. 
              Tentukan posisi awal, operasi (+ / -), besaran perubahan, dan posisi akhirnya!
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-400">
            <span>Soal {problemIndex + 1} dari {PROBLEMS.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Visual Verification on Ampera */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verifikasi Visual Sungai Musi
            </span>
            <span className="text-xs font-mono text-cyan-300">
              Mula-mula: {currentProblem.startLevel > 0 ? `+${currentProblem.startLevel}` : currentProblem.startLevel}m
            </span>
          </div>

          <AmperaCanvas
            waterLevel={simLevel}
            previousLevel={prevLevel}
            weatherMode={currentProblem.operation === '+' ? 'rain' : 'sun'}
            locationName="Sungai Musi · Pembuktian Garis Bilangan"
          />

          {/* Context Story Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Kisah Kejadian di Sungai Musi:</span>
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{currentProblem.contextStory}"
            </p>
          </div>
        </div>

        {/* Right: Equation Assembly & Solver */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Susun Kalimat Matematika
              </span>
              <button
                onClick={handleAutoFillGuide}
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
                title="Bantuan susun jawaban"
              >
                Isi Otomatis
              </button>
            </div>

            {/* Interactive Equation Slots */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-lg font-mono font-bold">
                {/* Posisi Awal */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-sans mb-1">Posisi Awal</span>
                  <input
                    type="number"
                    value={inputStart}
                    onChange={(e) => {
                      setInputStart(e.target.value);
                      setIsSubmitted(false);
                    }}
                    placeholder="-2"
                    className="w-16 h-12 text-center text-base font-bold bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Operasi */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-sans mb-1">Aksi</span>
                  <div className="flex bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden h-12">
                    <button
                      onClick={() => handleQuickFill('op', '+')}
                      className={`px-3 flex items-center justify-center font-bold text-lg transition-colors ${
                        inputOp === '+' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleQuickFill('op', '-')}
                      className={`px-3 flex items-center justify-center font-bold text-lg transition-colors ${
                        inputOp === '-' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Perubahan */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-sans mb-1">Perubahan</span>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => {
                      setInputAmount(e.target.value);
                      setIsSubmitted(false);
                    }}
                    placeholder="2"
                    className="w-16 h-12 text-center text-base font-bold bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Equal sign */}
                <div className="flex flex-col items-center justify-end h-16 pb-3">
                  <span className="text-xl text-slate-400">=</span>
                </div>

                {/* Posisi Akhir */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-sans mb-1">Posisi Akhir</span>
                  <input
                    type="number"
                    value={inputResult}
                    onChange={(e) => {
                      setInputResult(e.target.value);
                      setIsSubmitted(false);
                    }}
                    placeholder="0"
                    className="w-16 h-12 text-center text-base font-bold bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Quick Choice Buttons for Current Problem */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 block text-center">
                  Pilihan Cepat untuk Mengisi:
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        if (!inputStart) {
                          handleQuickFill('start', val.toString());
                        } else if (!inputAmount) {
                          handleQuickFill('amount', Math.abs(val).toString());
                        } else {
                          handleQuickFill('result', val.toString());
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Check Button */}
            <div className="flex gap-2">
              <button
                onClick={handleCheck}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.01]"
              >
                Periksa & Simulasikan
              </button>

              <button
                onClick={() => {
                  setInputStart('');
                  setInputAmount('');
                  setInputResult('');
                  setIsSubmitted(false);
                  setIsCorrect(false);
                  setPrevLevel(null);
                  setSimLevel(currentProblem.startLevel);
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Kosongkan form"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback & Explanation */}
            {isSubmitted && (
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
                      <span>Luar Biasa! Jawaban Kamu Tepat Sekali</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Susunan Belum Tepat. Perhatikan Ceritanya Lagi</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Penjelasan:</strong> {currentProblem.explanation}
                </p>

                {isCorrect && (
                  <div className="pt-2">
                    <button
                      onClick={handleNextProblem}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <span>
                        {problemIndex < PROBLEMS.length - 1
                          ? 'Lanjut ke Soal Berikutnya ➔'
                          : 'Selesai! Lanjut ke Tahap 4: Bandingkan Ketinggian'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
