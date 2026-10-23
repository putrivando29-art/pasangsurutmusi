import React, { useState } from 'react';
import { ArrowRight, Compass, ListChecks } from 'lucide-react';
import { AmperaCanvas } from './AmperaCanvas';
import { NumberLine } from './NumberLine';
import { fmt } from '../utils/number';
import { sound } from '../utils/audio';

interface OrientationStageProps {
  name: string;
  kelas: string;
  ready: boolean;
  onIdentity: (name: string, kelas: string) => void;
  onContinue: () => void;
}

const TUJUAN = [
  'Menentukan letak bilangan bulat pada garis bilangan dengan tepat.',
  'Dengan bantuan garis bilangan, membandingkan nilai dua bilangan bulat menggunakan simbol <, >, atau =.',
  'Mengurutkan beberapa bilangan bulat dari yang terkecil ke terbesar atau sebaliknya berdasarkan hasil perbandingan.',
];

const ALUR = [
  {
    tahap: 'Mulai',
    waktu: '15 menit',
    langkah: [
      'Isi nama dan kelas.',
      'Baca tujuan pembelajaran.',
      'Klik angka pada papan duga, lalu amati titik yang berpindah pada garis bilangan.',
    ],
  },
  {
    tahap: 'TP 1: Letak',
    waktu: '25 menit',
    langkah: [
      'Klik posisi bilangan pada papan duga atau garis bilangan, lalu tekan Kunci jawaban.',
      'Pada soal membaca titik, pilih bilangan yang ditunjukkan titik merah, lalu kunci.',
      'Kerjakan 7 soal, lalu catat skornya di LKPD.',
    ],
  },
  {
    tahap: 'TP 2: Bandingkan',
    waktu: '30 menit',
    langkah: [
      'Amati dua titik pada garis bilangan.',
      'Pilih dan kunci simbol <, =, atau >. Jika simbolnya benar, pilih dan kunci alasannya.',
      'Kerjakan 7 soal, lalu tulis tiga kalimat perbandingan di LKPD.',
    ],
  },
  {
    tahap: 'TP 3: Urutkan',
    waktu: '25 menit',
    langkah: [
      'Ketuk kartu bilangan sesuai urutan yang diminta, lalu tekan Kunci urutan.',
      'Jika perlu, tekan Tampilkan di garis bilangan.',
      'Kerjakan 4 soal, lalu salin satu urutan ke LKPD.',
    ],
  },
  {
    tahap: 'Akhir',
    waktu: '25 menit',
    langkah: [
      'Jawab 9 soal latihan, periksa lagi, lalu tekan Kumpulkan jawaban.',
      'Isi 3 pertanyaan refleksi.',
      'Tekan Salin hasil, lalu tempel di tugas Google Classroom.',
    ],
  },
];

export const OrientationStage: React.FC<OrientationStageProps> = ({ name, kelas, ready, onIdentity, onContinue }) => {
  const [level, setLevel] = useState(-2);

  const choose = (lvl: number) => {
    sound.playWaterSplash();
    setLevel(lvl);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-rose-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Matematika Kelas VII · Fase D · Bilangan Bulat</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
            Membaca, Membandingkan, dan Mengurutkan Bilangan Bulat lewat Pasang Surut Sungai Musi
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Permukaan air Sungai Musi naik saat pasang dan turun saat surut. Untuk mencatat ketinggiannya dipakai papan duga
            (peil schaal): tiang berskala dengan satu garis yang disepakati sebagai <strong>titik acuan 0</strong>. Papan itu
            sebenarnya sebuah <strong>garis bilangan tegak</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" /> Setelah belajar dengan media ini, kamu diharapkan mampu:
            </span>
            <ol className="list-decimal list-inside text-sm text-slate-200 space-y-1">
              {TUJUAN.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-100">Sebelum mulai</h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5">
            <li>Tahap dapat dipilih dari baris di atas. Tanda centang berarti tahap itu sudah selesai.</li>
            <li>Setiap soal hanya dapat dijawab satu kali. Setelah kamu menekan tombol kunci, jawaban tidak bisa diubah, jadi kerjakan dengan teliti.</li>
            <li>Jangan menutup atau memuat ulang halaman selama mengerjakan. Jika halaman tertutup tanpa sengaja, buka lagi di peramban yang sama: jawabanmu tetap tersimpan.</li>
          </ul>
          <p className="text-xs text-slate-400">Wajib diisi sebelum mulai. Nama dan kelas ikut tercantum di ringkasan hasil.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="sm:col-span-2 block">
              <span className="text-xs font-semibold text-slate-400">Nama lengkap</span>
              <input
                value={name}
                onChange={(e) => onIdentity(e.target.value, kelas)}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none px-3 py-2 text-sm text-slate-100"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400">Kelas</span>
              <input
                value={kelas}
                onChange={(e) => onIdentity(name, e.target.value)}
                placeholder="VII-A"
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
              />
            </label>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="alur-title"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="alur-title" className="text-base font-bold text-slate-100">
            Alur pengerjaan
          </h3>
          <span className="text-xs text-slate-400">Total 3 JP (120 menit)</span>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {ALUR.map((step, i) => (
            <li key={step.tahap} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300">
                  {i + 1}. {step.tahap}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{step.waktu}</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {step.langkah.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Eksplorasi: dari papan duga ke garis bilangan</h3>
          <p className="text-sm text-slate-300 mt-1">
            Klik angka pada papan duga atau tombol di bawah. Amati letak permukaan air pada papan tegak dan titik yang sama
            pada garis bilangan mendatar.
          </p>
        </div>

        <AmperaCanvas
          waterLevel={level}
          interactiveGauge
          onSelectLevel={choose}
          showClearanceInfo={false}
          locationName="Papan duga · Sungai Musi"
        />

        <div className="flex flex-wrap gap-1.5 justify-center">
          {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => choose(lvl)}
              aria-pressed={level === lvl}
              className={`w-11 h-9 rounded-lg font-mono font-bold text-xs transition-all ${
                level === lvl
                  ? 'bg-amber-400 text-slate-950'
                  : lvl > 0
                  ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900'
                  : lvl === 0
                  ? 'bg-slate-800 border border-amber-500/50 text-amber-300 hover:bg-slate-700'
                  : 'bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900'
              }`}
            >
              {fmt(lvl)}
            </button>
          ))}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 sm:p-3">
          <NumberLine min={-5} max={5} labels="all" points={[{ value: level, label: `${fmt(level)} m`, tone: 'neutral' }]} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-100">
            <strong className="block">Di atas titik acuan</strong>
            ditulis bilangan positif. Pada garis mendatar letaknya di sebelah <strong>kanan</strong> 0.
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-100">
            <strong className="block">Tepat di titik acuan</strong>
            ditulis 0. Nol bukan bilangan positif dan bukan bilangan negatif.
          </div>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-100">
            <strong className="block">Di bawah titik acuan</strong>
            ditulis bilangan negatif. Pada garis mendatar letaknya di sebelah <strong>kiri</strong> 0.
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Catatan: skala -5 m sampai +5 m dan angka ketinggian di seluruh media ini adalah model untuk belajar, bukan hasil
          pengukuran sebenarnya. Sumber fakta tentang Sungai Musi ada di menu Panduan & Info.
        </p>

        <button
          disabled={!ready}
          onClick={() => {
            sound.playClick();
            onContinue();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm"
        >
          <span>{ready ? 'Mulai Tahap 1: Menentukan Letak' : 'Isi nama dan kelas terlebih dahulu'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
