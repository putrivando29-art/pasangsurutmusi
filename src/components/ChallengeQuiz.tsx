import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Jika ketinggian air di Sungai Musi saat ini berada di posisi -3 meter, apa arti fisik dari angka tersebut?',
    options: [
      'Air pasang setinggi 3 meter di atas normal',
      'Air surut setinggi 3 meter di bawah permukaan normal acuan',
      'Sungai Musi membeku setinggi 3 meter',
      'Sungai Musi berada tepat di garis normal 0 meter',
    ],
    correctAnswer: 'Air surut setinggi 3 meter di bawah permukaan normal acuan',
    explanation: 'Tanda minus (-) pada tiang peil schaal menyatakan posisi di bawah titik acuan normal nol (0), yaitu kondisi air surut.',
  },
  {
    id: 2,
    question: 'Kondisi air surut di posisi -4 meter. Agar air kembali tepat ke permukaan normal (0 meter), aksi apa yang harus terjadi?',
    options: [
      'Terjadi surut lagi sebesar 4 meter (-4)',
      'Terjadi hujan yang menaikkan air sebesar 4 meter (+4)',
      'Terjadi pasang yang menaikkan air sebesar 8 meter (+8)',
      'Tidak perlu ada perubahan air',
    ],
    correctAnswer: 'Terjadi hujan yang menaikkan air sebesar 4 meter (+4)',
    explanation: '-4 + 4 = 0. Untuk meniadakan surut 4 meter, diperlukan kenaikan air sebesar 4 meter (+4) sebagai lawan (invers penjumlahan).',
  },
  {
    id: 3,
    question: 'Pagi hari air berada di posisi +2 meter. Akibat surut di muara, air turun sebesar 4 meter. Berapakah posisi air sekarang?',
    options: [
      '-2 meter (surut)',
      '+2 meter (pasang)',
      '-6 meter (surut ekstrem)',
      '0 meter (normal)',
    ],
    correctAnswer: '-2 meter (surut)',
    explanation: '2 - 4 = -2 meter. Air turun 2 meter mencapai titik nol, lalu lanjut turun 2 meter lagi ke daerah negatif.',
  },
  {
    id: 4,
    question: 'Bandingkan ketinggian air di Dermaga BKB (-4 m) dengan Dermaga Ulu (-1 m). Tanda relasi yang benar adalah...',
    options: [
      '-4 > -1',
      '-4 < -1',
      '-4 = -1',
      'Tidak dapat ditentukan',
    ],
    correctAnswer: '-4 < -1',
    explanation: 'Pada garis bilangan vertikal (peil schaal), -4 berada lebih jauh di bawah daripada -1, sehingga nilainya lebih kecil: -4 < -1.',
  },
  {
    id: 5,
    question: 'Ketinggian air di bawah kolong Jembatan Ampera saat air pasang (+3 meter) dibandingkan saat air surut (-2 meter). Pernyataan yang benar adalah...',
    options: [
      'Ruang kolong jembatan lebih sempit saat air pasang (+3 m)',
      'Ruang kolong jembatan lebih sempit saat air surut (-2 m)',
      'Ruang kolong jembatan selalu sama kapan saja',
      'Kapal lebih sulit lewat saat air surut (-2 m)',
    ],
    correctAnswer: 'Ruang kolong jembatan lebih sempit saat air pasang (+3 m)',
    explanation: 'Saat air pasang (+3 m), permukaan air naik mendekati lantai Jembatan Ampera sehingga tinggi ruang bebas (clearance) kolong jembatan menjadi lebih sempit.',
  },
];

export const ChallengeQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answeredState, setAnsweredState] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: number; chosen: string; isCorrect: boolean }[]>([]);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (answeredState) return;
    sound.playClick();
    setSelectedOpt(opt);
    setAnsweredState(true);

    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) {
      sound.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      sound.playError();
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: q.id, chosen: opt, isCorrect },
    ]);
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setAnsweredState(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setAnsweredState(false);
    setIsFinished(false);
    setUserAnswers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Tantangan Mandiri & Asesmen Pemahaman</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Kuis Evaluasi Konsep Bilangan Bulat Sungai Musi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Uji pemahamanmu secara menyeluruh tentang titik acuan nol, bilangan positif/negatif, operasi penjumlahan/pengurangan, dan perbandingan bilangan bulat.
            </p>
          </div>

          {!isFinished && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300">
              <span>Soal {currentIdx + 1} / {QUIZ_QUESTIONS.length}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Skor: {score * 20}</span>
            </div>
          )}
        </div>
      </div>

      {!isFinished ? (
        /* Quiz Active Question Card */
        <div className="max-w-2xl mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Pertanyaan {currentIdx + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {q.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrectOpt = opt === q.correctAnswer;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800/80';
              if (answeredState) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  disabled={answeredState}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm font-medium ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answeredState && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {answeredState && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation and Next Button */}
          {answeredState && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="text-xs text-slate-300">
                <strong className="text-amber-400 block mb-1">Penjelasan Konsep:</strong>
                {q.explanation}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Lanjut ke Soal Berikutnya ➔' : 'Lihat Hasil Akhir'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Result & Certificate Card */
        <div className="max-w-2xl mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-300">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block">
              Sertifikat Keberhasilan
            </span>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {score >= 4 ? 'Ahli Hidrologi Sungai Musi 🌟' : score >= 3 ? 'Nahkoda Perahu Ketek ⛵' : 'Sahabat Sungai Musi 💧'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Kamu berhasil menyelesaikan seluruh alur eksplorasi bilangan bulat kontekstual Sungai Musi & Jembatan Ampera!
            </p>
          </div>

          {/* Score display */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl inline-flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Skor Akhir</span>
              <span className="text-3xl font-extrabold font-mono text-emerald-400">{score * 20}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Benar</span>
              <span className="text-3xl font-extrabold font-mono text-cyan-400">{score}</span>
              <span className="text-xs text-slate-400">/{QUIZ_QUESTIONS.length}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Coba Kuis Lagi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
