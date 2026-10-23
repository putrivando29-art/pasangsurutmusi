import type { ScoreBoard, StageId, TpKey } from '../types';
import { QUESTIONS, REFLECTIONS } from '../components/PracticeStage';
import type { StudentDoc } from './progress';

const TP_KEYS: TpKey[] = ['tp1', 'tp2', 'tp3'];

export const STAGE_LABEL: Record<StageId, string> = {
  orientasi: 'Mulai',
  tp1: 'TP 1: Letak',
  tp2: 'TP 2: Bandingkan',
  tp3: 'TP 3: Urutkan',
  latihan: 'Latihan',
};

const parse = <T,>(state: Record<string, string>, key: string, fallback: T): T => {
  try {
    return key in state ? (JSON.parse(state[key]) as T) : fallback;
  } catch {
    return fallback;
  }
};

export interface StudentReport {
  uid: string;
  nama: string;
  kelas: string;
  akun: string;
  tahap: StageId;
  // Hasil per soal tahap belajar: true benar, false salah, null belum dijawab.
  tahapSoal: Record<TpKey, (boolean | null)[]>;
  tahapSkor: ScoreBoard;
  latihanJawaban: Record<string, string>;
  latihanPerTp: Record<TpKey, number>;
  latihanBenar: number;
  dikumpulkan: string | null;
  refleksi: string[];
  diperbarui: Date | null;
}

const STAGE_TOTAL: Record<TpKey, number> = { tp1: 7, tp2: 7, tp3: 4 };

export function buildReport(uid: string, data: StudentDoc): StudentReport {
  const state = data.state ?? {};
  const tahapSoal = {} as Record<TpKey, (boolean | null)[]>;
  // Skor tahap dihitung ulang dari hasil per soal, bukan dari ringkasan skor milik siswa,
  // karena tahap yang sudah selesai dikunci oleh aturan Firestore.
  const tahapSkor: ScoreBoard = { tp1: null, tp2: null, tp3: null };
  TP_KEYS.forEach((tp) => {
    const flow = parse<{ results?: (boolean | null)[]; finished?: boolean }>(state, tp, {});
    tahapSoal[tp] = Array.from({ length: STAGE_TOTAL[tp] }, (_, i) => flow.results?.[i] ?? null);
    if (flow.finished) tahapSkor[tp] = { correct: tahapSoal[tp].filter((r) => r === true).length, total: STAGE_TOTAL[tp] };
  });

  const latihanJawaban = parse<Record<string, string>>(state, 'latihan-jawaban', {});
  const dikumpulkan = parse<string | null>(state, 'latihan-dikumpulkan', null);
  const latihanPerTp: Record<TpKey, number> = { tp1: 0, tp2: 0, tp3: 0 };
  // Nilai latihan hanya dihitung setelah dikumpulkan, agar pilihan sementara tidak terbaca sebagai nilai.
  if (dikumpulkan) {
    QUESTIONS.forEach((q) => {
      if (latihanJawaban[q.id] === q.answer) latihanPerTp[q.tp] += 1;
    });
  }

  return {
    uid,
    nama: data.nama,
    kelas: data.kelas,
    akun: data.akun,
    tahap: parse<StageId>(state, 'tahap', 'orientasi'),
    tahapSoal,
    tahapSkor,
    latihanJawaban,
    latihanPerTp,
    latihanBenar: latihanPerTp.tp1 + latihanPerTp.tp2 + latihanPerTp.tp3,
    dikumpulkan,
    refleksi: parse<string[]>(state, 'latihan-refleksi', REFLECTIONS.map(() => '')),
    diperbarui: data.diperbarui ? data.diperbarui.toDate() : null,
  };
}

const formatDate = (d: Date | null) => (d ? d.toLocaleString('id-ID') : '');

const mark = (r: boolean | null) => (r === true ? 'B' : r === false ? 'S' : '');

export async function downloadExcel(reports: StudentReport[], label: string) {
  // Dimuat hanya saat guru mengunduh, agar halaman siswa tetap ringan.
  const XLSX = await import('xlsx');

  const rekap = reports.map((r, i) => ({
    No: i + 1,
    Nama: r.nama,
    Kelas: r.kelas,
    Akun: r.akun,
    'Tahap terakhir': STAGE_LABEL[r.tahap],
    'TP1 Letak (benar/7)': r.tahapSkor.tp1?.correct ?? '',
    'TP2 Bandingkan (benar/7)': r.tahapSkor.tp2?.correct ?? '',
    'TP3 Urutkan (benar/4)': r.tahapSkor.tp3?.correct ?? '',
    'Latihan TP1 (benar/3)': r.dikumpulkan ? r.latihanPerTp.tp1 : '',
    'Latihan TP2 (benar/3)': r.dikumpulkan ? r.latihanPerTp.tp2 : '',
    'Latihan TP3 (benar/3)': r.dikumpulkan ? r.latihanPerTp.tp3 : '',
    'Latihan total (benar/9)': r.dikumpulkan ? r.latihanBenar : '',
    'Latihan dikumpulkan': r.dikumpulkan ?? 'Belum',
    'Terakhir aktif': formatDate(r.diperbarui),
  }));

  const perSoal = reports.map((r) => {
    const row: Record<string, string> = { Nama: r.nama, Kelas: r.kelas };
    TP_KEYS.forEach((tp) =>
      r.tahapSoal[tp].forEach((res, i) => {
        row[`${tp.toUpperCase()} soal ${i + 1}`] = mark(res);
      }),
    );
    QUESTIONS.forEach((q, i) => {
      const jawab = r.latihanJawaban[q.id];
      row[`Latihan ${i + 1} (${q.tp.toUpperCase()})`] = jawab
        ? `${r.dikumpulkan ? (jawab === q.answer ? 'B' : 'S') : 'belum dikumpulkan'}: ${jawab}`
        : '';
    });
    return row;
  });

  const refleksi = reports.map((r) => {
    const row: Record<string, string> = { Nama: r.nama, Kelas: r.kelas };
    REFLECTIONS.forEach((q, i) => {
      row[`${i + 1}. ${q}`] = r.refleksi[i] ?? '';
    });
    return row;
  });

  const kunci = QUESTIONS.map((q, i) => ({ No: i + 1, TP: q.tp.toUpperCase(), Soal: q.question, Kunci: q.answer }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rekap), 'Rekap');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perSoal), 'Per Soal');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refleksi), 'Refleksi');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kunci), 'Kunci Latihan');
  const tanggal = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan-Bilangan-Bulat-${label.replace(/[^\w-]+/g, '_')}-${tanggal}.xlsx`);
}
