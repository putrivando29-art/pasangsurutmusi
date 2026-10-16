import React, { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCopy, RotateCcw, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PracticeQuestion, ScoreBoard, TpKey } from '../types';
import { sound } from '../utils/audio';

const QUESTIONS: PracticeQuestion[] = [
  {
    id: 'p1',
    tp: 'tp1',
    question: 'Titik A terletak 4 satuan di sebelah kiri 0 pada garis bilangan. Bilangan yang ditunjukkan titik A adalah ...',
    options: ['4', '-3', '-4', '0'],
    answer: '-4',
    explanation: 'Sebelah kiri 0 adalah bilangan negatif. Empat langkah ke kiri dari 0 adalah -4.',
  },
  {
    id: 'p2',
    tp: 'tp2',
    question: 'Pukul 06.00 air tercatat -5 m dan pukul 18.00 tercatat -2 m. Pernyataan yang benar adalah ...',
    options: ['-5 > -2', '-5 = -2', 'Tidak dapat dibandingkan', '-5 < -2'],
    answer: '-5 < -2',
    explanation: '-5 terletak di sebelah kiri -2 pada garis bilangan, jadi -5 < -2. Air pukul 06.00 lebih rendah.',
  },
  {
    id: 'p3',
    tp: 'tp3',
    question: 'Urutan dari yang terkecil ke yang terbesar dari -3, 4, -6, 0, 1 adalah ...',
    options: ['0, 1, -3, 4, -6', '-6, -3, 0, 1, 4', '-3, -6, 0, 1, 4', '4, 1, 0, -3, -6'],
    answer: '-6, -3, 0, 1, 4',
    explanation: 'Baca titiknya dari kiri ke kanan pada garis bilangan: -6, -3, 0, 1, 4.',
  },
  {
    id: 'p4',
    tp: 'tp1',
    question: 'Ketinggian air 6 m di atas titik acuan ditulis sebagai bilangan ...',
    options: ['-6', '+6', '+5', '-5'],
    answer: '+6',
    explanation: 'Di atas titik acuan berarti positif. Enam meter di atas titik acuan ditulis +6 (atau 6).',
  },
  {
    id: 'p5',
    tp: 'tp2',
    question: 'Simbol yang tepat untuk mengisi titik-titik pada 0 ... -8 adalah ...',
    options: ['<', '>', '='],
    answer: '>',
    explanation: '0 terletak di sebelah kanan -8, jadi 0 > -8. Nol lebih besar daripada setiap bilangan negatif.',
  },
  {
    id: 'p6',
    tp: 'tp3',
    question:
      'Catatan ketinggian air: Senin -2 m, Selasa 1 m, Rabu -4 m, Kamis 3 m, Jumat 0 m. Urutan hari dari air tertinggi ke terendah adalah ...',
    options: [
      'Rabu, Kamis, Senin, Selasa, Jumat',
      'Rabu, Senin, Jumat, Selasa, Kamis',
      'Kamis, Selasa, Jumat, Senin, Rabu',
      'Kamis, Rabu, Selasa, Senin, Jumat',
    ],
    answer: 'Kamis, Selasa, Jumat, Senin, Rabu',
    explanation: 'Dari terbesar ke terkecil: 3 > 1 > 0 > -2 > -4, yaitu Kamis, Selasa, Jumat, Senin, Rabu.',
  },
  {
    id: 'p7',
    tp: 'tp1',
    question: 'Pada garis bilangan, bilangan yang terletak 3 satuan di sebelah kanan -5 adalah ...',
    options: ['-8', '-2', '2', '-3'],
    answer: '-2',
    explanation: 'Dari -5 melangkah ke kanan tiga kali: -4, -3, -2.',
  },
  {
    id: 'p8',
    tp: 'tp2',
    question: 'Raka menulis -9 > -1 karena 9 lebih besar dari 1. Pendapat yang tepat tentang jawaban Raka adalah ...',
    options: [
      'Benar, karena 9 > 1',
      'Salah, karena -9 terletak di sebelah kiri -1 sehingga -9 < -1',
      'Benar, karena keduanya bilangan negatif',
      'Salah, karena -9 = -1',
    ],
    answer: 'Salah, karena -9 terletak di sebelah kiri -1 sehingga -9 < -1',
    explanation: 'Raka membandingkan angka tanpa tanda. Pada garis bilangan -9 berada di kiri -1, jadi -9 < -1.',
  },
  {
    id: 'p9',
    tp: 'tp3',
    question: 'Urutan dari yang terbesar ke yang terkecil dari -1, -8, -5, -10 adalah ...',
    options: ['-10, -8, -5, -1', '-8, -5, -1, -10', '-1, -5, -8, -10', '-5, -1, -10, -8'],
    answer: '-1, -5, -8, -10',
    explanation: 'Bilangan negatif yang paling dekat ke 0 adalah yang terbesar: -1 > -5 > -8 > -10.',
  },
];

// Batas minimal yang dipakai media untuk menyarankan pengulangan tahap.
// RPM belum menetapkan kriteria ketercapaian, jadi guru dapat mengubah angka ini.
const MIN_BENAR_PER_TP = 2;

const TP_LABEL: Record<TpKey, string> = {
  tp1: 'TP 1 · Menentukan letak',
  tp2: 'TP 2 · Membandingkan',
  tp3: 'TP 3 · Mengurutkan',
};

const REFLECTIONS = [
  'Jelaskan dengan kata-katamu cara menentukan bilangan yang lebih besar di antara dua bilangan negatif.',
  'Sebutkan satu contoh lain dalam kehidupan sehari-hari yang memakai bilangan bulat, lalu bandingkan dua nilainya.',
  'Bagian mana yang masih membingungkan bagimu?',
];

interface PracticeStageProps {
  name: string;
  kelas: string;
  stageScores: ScoreBoard;
  onGoTo: (tp: TpKey) => void;
}

export const PracticeStage: React.FC<PracticeStageProps> = ({ name, kelas, stageScores, onGoTo }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reflections, setReflections] = useState<string[]>(REFLECTIONS.map(() => ''));
  const [copied, setCopied] = useState<'idle' | 'ok' | 'manual'>('idle');

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const perTp = useMemo(() => {
    const result: Record<TpKey, { correct: number; total: number }> = {
      tp1: { correct: 0, total: 0 },
      tp2: { correct: 0, total: 0 },
      tp3: { correct: 0, total: 0 },
    };
    QUESTIONS.forEach((q) => {
      result[q.tp].total += 1;
      if (answers[q.id] === q.answer) result[q.tp].correct += 1;
    });
    return result;
  }, [answers]);

  const totalCorrect = QUESTIONS.filter((q) => answers[q.id] === q.answer).length;

  const submit = () => {
    sound.playSuccess();
    setSubmitted(true);
    if (totalCorrect >= QUESTIONS.length - 1) confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    sound.playClick();
    setAnswers({});
    setSubmitted(false);
    setCopied('idle');
  };

  const summary = useMemo(() => {
    const lines = [
      'HASIL BELAJAR BILANGAN BULAT (Media Sungai Musi)',
      `Nama  : ${name || '-'}`,
      `Kelas : ${kelas || '-'}`,
      `Waktu : ${new Date().toLocaleString('id-ID')}`,
      '',
      'Tahap belajar (benar pada percobaan pertama):',
      ...(['tp1', 'tp2', 'tp3'] as TpKey[]).map((tp) => {
        const s = stageScores[tp];
        return `- ${TP_LABEL[tp]}: ${s ? `${s.correct}/${s.total}` : 'belum dikerjakan'}`;
      }),
      '',
      `Latihan penguatan: ${totalCorrect}/${QUESTIONS.length}`,
      ...(['tp1', 'tp2', 'tp3'] as TpKey[]).map((tp) => `- ${TP_LABEL[tp]}: ${perTp[tp].correct}/${perTp[tp].total}`),
      '',
      'Refleksi:',
      ...REFLECTIONS.map((r, i) => `${i + 1}. ${r}\n   Jawaban: ${reflections[i].trim() || '-'}`),
    ];
    return lines.join('\n');
  }, [name, kelas, stageScores, perTp, totalCorrect, reflections]);

  const copySummary = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(summary);
      setCopied('ok');
    } catch {
      setCopied('manual');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-2">
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          Tahap 4 · Latihan Penguatan & Refleksi
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">Latihan Penguatan untuk Ketiga TP</h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Jawab semua soal tanpa bantuan garis bilangan di layar. Gambarlah garis bilangan sendiri di kertas atau LKPD jika
          perlu. Setelah dikumpulkan, kamu akan melihat skor untuk setiap TP.
        </p>
      </div>

      {submitted && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold text-slate-100">Hasil latihan</h3>
            <span className="font-mono font-extrabold text-2xl text-emerald-300">
              {totalCorrect}/{QUESTIONS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['tp1', 'tp2', 'tp3'] as TpKey[]).map((tp) => {
              const ok = perTp[tp].correct >= MIN_BENAR_PER_TP;
              return (
                <div
                  key={tp}
                  className={`p-3 rounded-xl border text-sm ${
                    ok ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-300">{TP_LABEL[tp]}</span>
                  <span className="font-mono font-extrabold text-lg text-slate-100">
                    {perTp[tp].correct}/{perTp[tp].total}
                  </span>
                  {!ok && (
                    <button onClick={() => onGoTo(tp)} className="block mt-1 text-xs font-semibold text-amber-300 underline">
                      Ulangi tahap {tp.toUpperCase()}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {QUESTIONS.map((q, n) => (
          <div key={q.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow space-y-3">
            <p className="text-sm font-semibold text-slate-100">
              <span className="text-amber-300 font-mono mr-1.5">{n + 1}.</span>
              {q.question}
            </p>
            <div className={`grid gap-2 ${q.options.length === 3 ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                const isAnswer = opt === q.answer;
                let style = selected
                  ? 'bg-cyan-900 border-cyan-400 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600';
                if (submitted) {
                  style = isAnswer
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-100'
                    : selected
                    ? 'bg-rose-950 border-rose-500 text-rose-100'
                    : 'bg-slate-950 border-slate-900 text-slate-500';
                }
                return (
                  <button
                    key={opt}
                    disabled={submitted}
                    onClick={() => {
                      sound.playClick();
                      setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                    }}
                    className={`text-left p-3 rounded-xl border-2 font-mono text-sm transition-all flex items-center justify-between gap-2 ${style}`}
                  >
                    <span>{opt}</span>
                    {submitted && isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {submitted && selected && !isAnswer && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {submitted && <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-2.5">{q.explanation}</p>}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          disabled={!allAnswered}
          onClick={submit}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm"
        >
          {allAnswered
            ? 'Kumpulkan jawaban'
            : `Jawab semua soal dulu (${Object.keys(answers).length}/${QUESTIONS.length})`}
        </button>
      ) : (
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Kerjakan latihan lagi</span>
        </button>
      )}

      {submitted && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100">Refleksi</h3>
          {REFLECTIONS.map((r, i) => (
            <label key={r} className="block space-y-1.5">
              <span className="text-sm text-slate-200">
                {i + 1}. {r}
              </span>
              <textarea
                value={reflections[i]}
                onChange={(e) => setReflections((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                rows={3}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none p-3 text-sm text-slate-100"
              />
            </label>
          ))}

          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Salin ringkasan di bawah, lalu tempelkan sebagai jawaban atau komentar pribadi pada tugas di Google Classroom.
            </p>
            <button
              onClick={copySummary}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm"
            >
              <ClipboardCopy className="w-4 h-4" />
              <span>{copied === 'ok' ? 'Tersalin. Tempelkan di Google Classroom' : 'Salin hasil untuk Google Classroom'}</span>
            </button>
            {copied === 'manual' && (
              <p className="text-xs text-rose-300">Penyalinan otomatis diblokir peramban. Pilih teks di bawah lalu salin manual.</p>
            )}
            <textarea
              readOnly
              value={summary}
              rows={12}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-300"
              aria-label="Ringkasan hasil belajar"
            />
          </div>
        </div>
      )}
    </div>
  );
};
