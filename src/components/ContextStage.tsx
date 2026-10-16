import React, { useState } from 'react';
import { AmperaCanvas } from './AmperaCanvas';
import { BookOpen, CheckCircle, ArrowRight, Info, AlertTriangle, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface ContextStageProps {
  onContinue: () => void;
}

export const ContextStage: React.FC<ContextStageProps> = ({ onContinue }) => {
  const [demoLevel, setDemoLevel] = useState<number>(0);
  const [selectedQuiz, setSelectedQuiz] = useState<{ [key: string]: number | null }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: boolean }>({});

  const handleLevelChange = (lvl: number) => {
    sound.playWaterSplash();
    setDemoLevel(lvl);
  };

  const handleCheckQuestion = (qId: string, value: number, expected: number) => {
    setSelectedQuiz((prev) => ({ ...prev, [qId]: value }));
    const isCorrect = value === expected;
    setFeedback((prev) => ({ ...prev, [qId]: isCorrect }));
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Introduction Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-rose-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Konteks Pembelajaran Berakar Budaya Palembang</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Fenomena Pasang Surut Sungai Musi & Jembatan Ampera
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Sungai Musi di Kota Palembang adalah urat nadi kehidupan masyarakat Sumatera Selatan. Setiap hari, 
              ketinggian air Sungai Musi selalu berubah karena dipengaruhi oleh <strong>pasang surut air laut Selat Bangka</strong> dan 
              debit hujan dari hulu <strong>Pegunungan Bukit Barisan</strong>.
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Di dekat pilar <strong>Jembatan Ampera</strong> yang ikonik, dipasang sebuah <strong>tiang skala ukur (peil schaal)</strong>. 
              Tiang ini berfungsi sangat mirip dengan <strong>garis bilangan vertikal</strong> dalam matematika untuk memantau keselamatan pelayaran kapal tongkang batubara dan perahu ketek warga!
            </p>
          </div>

          {/* Quick Concept Box */}
          <div className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Kesepakatan Matematika</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <span className="font-bold text-emerald-300 block">Air Pasang = Bilangan Positif</span>
                <span className="text-slate-300">
                  Ketinggian air di atas normal: <strong>+1, +2, +3, +4, +5 meter</strong>.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <span className="font-bold text-amber-300 block">Permukaan Normal = Bilangan Nol (0)</span>
                <span className="text-slate-300">
                  Titik acuan standar perairan Sungai Musi disepakati sebagai <strong>0</strong>.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30">
                <span className="font-bold text-rose-300 block">Air Surut = Bilangan Negatif</span>
                <span className="text-slate-300">
                  Ketinggian air di bawah normal: <strong>-1, -2, -3, -4, -5 meter</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Exploration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Simulasi Visual Langsung
            </span>
            <span className="text-xs text-slate-400">
              Pilih ketinggian di bawah atau klik peil schaal
            </span>
          </div>

          <AmperaCanvas
            waterLevel={demoLevel}
            interactiveGauge={true}
            onSelectLevel={handleLevelChange}
            locationName="Sungai Musi · Jembatan Ampera Palembang"
          />

          {/* Quick Buttons to test levels */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Uji Ketinggian Air Sungai Musi:</span>
              <span className="text-xs font-mono text-cyan-300">
                Saat ini: <strong>{demoLevel > 0 ? `+${demoLevel}` : demoLevel} meter</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`w-11 h-9 rounded-lg font-mono font-bold text-xs transition-all ${
                    demoLevel === lvl
                      ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                      : lvl > 0
                      ? 'bg-cyan-950 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900'
                      : lvl === 0
                      ? 'bg-slate-800 border border-amber-500/50 text-amber-300 hover:bg-slate-700'
                      : 'bg-rose-950 border border-rose-800/80 text-rose-300 hover:bg-rose-900'
                  }`}
                >
                  {lvl > 0 ? `+${lvl}` : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Checkpoint & Comprehension Questions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Cek Pemahaman Awal</span>
            </div>

            <p className="text-xs text-slate-400">
              Pilihlah bilangan bulat yang tepat untuk memodelkan fenomena berikut:
            </p>

            {/* Question 1 */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs text-slate-200 block font-medium">
                1. Ketinggian air Sungai Musi berada <strong>2 meter di bawah</strong> permukaan normal (surut). Bilangan apakah itu?
              </span>
              <div className="flex gap-2">
                {[-2, 0, 2].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleCheckQuestion('q1', opt, -2)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      selectedQuiz['q1'] === opt
                        ? opt === -2
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt > 0 ? `+${opt}` : opt}
                  </button>
                ))}
              </div>
              {feedback['q1'] !== undefined && (
                <div className={`text-[11px] font-medium ${feedback['q1'] ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {feedback['q1']
                    ? '✓ Tepat sekali! Karena di bawah normal (surut), ditulis sebagai -2.'
                    : '✗ Coba lagi! Air surut berada di bawah normal sehingga bernilai negatif.'}
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs text-slate-200 block font-medium">
                2. Air laut pasang naik setinggi <strong>3 meter di atas</strong> permukaan normal. Bilangan apakah itu?
              </span>
              <div className="flex gap-2">
                {[-3, 0, 3].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleCheckQuestion('q2', opt, 3)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      selectedQuiz['q2'] === opt
                        ? opt === 3
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt > 0 ? `+${opt}` : opt}
                  </button>
                ))}
              </div>
              {feedback['q2'] !== undefined && (
                <div className={`text-[11px] font-medium ${feedback['q2'] ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {feedback['q2']
                    ? '✓ Benar! Ketinggian di atas normal dilambangkan dengan bilangan positif (+3).'
                    : '✗ Belum tepat. Di atas titik acuan normal adalah positif (+3).'}
                </div>
              )}
            </div>

            {/* Question 3 */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs text-slate-200 block font-medium">
                3. Jika air berada <strong>tepat rata</strong> pada batas acuan normal, bilangan berapakah itu?
              </span>
              <div className="flex gap-2">
                {[-1, 0, 1].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleCheckQuestion('q3', opt, 0)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      selectedQuiz['q3'] === opt
                        ? opt === 0
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt > 0 ? `+${opt}` : opt}
                  </button>
                ))}
              </div>
              {feedback['q3'] !== undefined && (
                <div className={`text-[11px] font-medium ${feedback['q3'] ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {feedback['q3']
                    ? '✓ Sempurna! Garis batas normal adalah titik acuan nol (0).'
                    : '✗ Titik acuan normal dilambangkan dengan bilangan 0.'}
                </div>
              )}
            </div>

            {/* Next stage button */}
            <button
              onClick={() => {
                sound.playClick();
                onContinue();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02]"
            >
              <span>Lanjut ke Tahap 2: Simulasi Pasang Surut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
