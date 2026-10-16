import React from 'react';
import { X, BookOpen, Compass, ExternalLink } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCES = [
  {
    fact: 'Sungai Musi berhulu di Pegunungan Bukit Barisan dan bermuara di Selat Bangka.',
    source: 'detikSumbagsel, "Berapa Panjang Sungai Musi? Simak 7 Faktanya"',
    url: 'https://www.detik.com/sumbagsel/berita/d-7915826/berapa-panjang-sungai-musi-simak-7-faktanya',
  },
  {
    fact: 'Di muara Sungai Musi, tunggang pasang surut tercatat sekitar 0,46 m (pasang perbani) sampai 3,42 m (pasang purnama).',
    source: 'Surbakti, Jurnal Penelitian Sains, FMIPA Universitas Sriwijaya',
    url: 'https://ejurnal.mipa.unsri.ac.id/index.php/jps/article/download/92/86',
  },
  {
    fact: 'Jembatan Ampera memiliki ketinggian 11,5 m dari permukaan air dan tinggi menara 63 m.',
    source: 'Balai Keamanan Jembatan dan Terowongan Khusus, Ditjen Bina Marga PUPR',
    url: 'https://binamarga.pu.go.id/balai-kjtk/berita/pemeriksaan-bersama-menara-jembatan-ampera',
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <BookOpen className="w-5 h-5" />
            <h3 id="guide-title" className="text-base sm:text-lg font-bold text-white">
              Panduan & Info
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panduan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm leading-relaxed">
          <section className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-xs block">
              Tujuan pembelajaran (Matematika Kelas VII, Fase D)
            </span>
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300">
              <li>Menentukan letak bilangan bulat pada garis bilangan dengan tepat.</li>
              <li>
                Dengan bantuan garis bilangan, membandingkan nilai dua bilangan bulat menggunakan simbol matematis (&lt;, &gt;,
                =) dengan benar.
              </li>
              <li>
                Mengurutkan beberapa bilangan bulat dari yang terkecil ke terbesar atau sebaliknya berdasarkan hasil
                perbandingan dengan tepat.
              </li>
            </ol>
            <p className="text-xs text-slate-400">
              Capaian Pembelajaran: membaca, menulis, dan membandingkan bilangan bulat. Operasi hitung bilangan bulat tidak
              termasuk tujuan pertemuan ini.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Alur media</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-rose-400 block mb-1">Mulai: Orientasi</strong>
                Mengenal titik acuan 0 pada papan duga dan mengaitkan garis bilangan tegak dengan garis bilangan mendatar.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-cyan-400 block mb-1">Tahap 1 (TP 1): Letak</strong>
                Menempatkan dan membaca bilangan bulat pada papan duga dan pada garis bilangan -10 sampai 10.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-amber-400 block mb-1">Tahap 2 (TP 2): Bandingkan</strong>
                Memilih simbol &lt;, &gt;, atau = untuk dua bilangan yang ditampilkan pada garis bilangan, lalu memilih
                alasannya.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-emerald-400 block mb-1">Tahap 3 (TP 3): Urutkan</strong>
                Menyusun 4 sampai 5 bilangan secara naik atau turun dan menuliskannya sebagai rantai perbandingan.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg sm:col-span-2">
                <strong className="text-slate-100 block mb-1">Tahap 4: Latihan penguatan & refleksi</strong>
                Sembilan soal (tiga per TP) dengan skor per TP, tiga pertanyaan refleksi, dan ringkasan hasil yang dapat disalin
                ke Google Classroom.
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Catatan data dan sumber</span>
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm">
              Skala -5 m sampai +5 m dan semua angka ketinggian air pada soal adalah <strong>model untuk belajar</strong>, bukan
              hasil pengukuran. Fakta konteks yang dipakai dan sumbernya:
            </p>
            <ul className="space-y-2">
              {SOURCES.map((s) => (
                <li key={s.url} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                  <span className="block text-slate-200">{s.fact}</span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 underline break-all"
                  >
                    {s.source}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
