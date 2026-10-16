import React from 'react';
import { X, BookOpen, Compass, Award, CheckCircle, Info } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Panduan Pembelajaran & Informasi Konteks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed">
          {/* Konsep Kurikulum */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-xs block">
              Tujuan Pembelajaran (Kurikulum Merdeka - Matematika)
            </span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>
                Memahami konsep <strong>bilangan bulat</strong> (positif, nol, dan negatif) menggunakan titik acuan nyata (ketinggian normal Sungai Musi).
              </li>
              <li>
                Memodelkan operasi <strong>penjumlahan dan pengurangan</strong> bilangan bulat melalui aksi manipulatif (hujan lebat dan air surut) pada garis bilangan vertikal (peil schaal).
              </li>
              <li>
                Memahami fenomena <strong>melintasi titik nol</strong> (misalnya dari -2 meter surut naik 5 meter menjadi +3 meter pasang).
              </li>
              <li>
                <strong>Membandingkan dua bilangan bulat</strong> menggunakan tanda relasi (&lt;, &gt;, =) berdasarkan posisi relatif pada tiang ukur.
              </li>
            </ul>
          </div>

          {/* Konteks Nyata Palembang */}
          <div className="space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Mengapa Pasang Surut Sungai Musi?</span>
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm">
              Sungai Musi di Palembang memiliki panjang 750 km dan bermuara ke Selat Bangka. Efek gravitasi bulan menghasilkan pasang surut laut yang mendorong air tawar Sungai Musi naik dan turun secara teratur hingga belasan kilometer ke pedalaman.
            </p>
            <p className="text-slate-300 text-xs sm:text-sm">
              <strong>Peil Schaal</strong> (tiang duga air) sangat vital bagi nakhoda kapal tongkang batubara dan perahu ketek agar dapat memperkirakan <em>air draft</em> (ketinggian kapal) ketika melintas di bawah kolong Jembatan Ampera tanpa menabrak tiang atau girder jembatan.
            </p>
          </div>

          {/* Alur Tahapan Media */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Alur 5 Tahap Pembelajaran:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-rose-400 block mb-1">Tahap 1: Konteks Musi</strong>
                Membaca situasi kontekstual, mengenal titik acuan nol dan fungsi tiang skala peil schaal.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-cyan-400 block mb-1">Tahap 2: Simulasi Pasang Surut</strong>
                Menyeret awan hujan (+) atau katup/terik surut (-) untuk melihat pergerakan air melintasi nol.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-amber-400 block mb-1">Tahap 3: Simbolik Matematika</strong>
                Menyusun kalimat matematika formal penjumlahan dan pengurangan berdasarkan fenomena fisik.
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-emerald-400 block mb-1">Tahap 4: Bandingkan Ketinggian</strong>
                Mengamati dua dermaga (BKB & Seberang Ulu) lalu menghubungkan dengan simbol &lt;, &gt;, atau =.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
