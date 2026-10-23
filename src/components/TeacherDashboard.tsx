import React, { useEffect, useMemo, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Download, LogOut, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { deleteStudent, studentsRef, type StudentDoc } from '../services/progress';
import { buildReport, downloadExcel, STAGE_LABEL, type StudentReport } from '../services/report';
import { MIN_BENAR_PER_TP, QUESTIONS, REFLECTIONS, TP_LABEL } from './PracticeStage';
import type { TpKey } from '../types';

const TP_KEYS: TpKey[] = ['tp1', 'tp2', 'tp3'];

const Mark: React.FC<{ value: boolean | null }> = ({ value }) => (
  <span
    className={`inline-flex w-6 h-6 items-center justify-center rounded-md text-[11px] font-bold ${
      value === true
        ? 'bg-emerald-900 text-emerald-200'
        : value === false
        ? 'bg-rose-900 text-rose-200'
        : 'bg-slate-800 text-slate-500'
    }`}
    title={value === true ? 'Benar' : value === false ? 'Salah' : 'Belum dijawab'}
  >
    {value === true ? 'B' : value === false ? 'S' : '-'}
  </span>
);

const Detail: React.FC<{ r: StudentReport; onDelete: () => void; deleting: boolean }> = ({ r, onDelete, deleting }) => (
  <div className="p-4 space-y-4 bg-slate-950 text-sm">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {TP_KEYS.map((tp) => (
        <div key={tp}>
          <span className="block text-xs font-bold text-slate-400 mb-1.5">Tahap {TP_LABEL[tp]}</span>
          <div className="flex flex-wrap gap-1">
            {r.tahapSoal[tp].map((v, i) => (
              <Mark key={i} value={v} />
            ))}
          </div>
        </div>
      ))}
    </div>
    <div>
      <span className="block text-xs font-bold text-slate-400 mb-1.5">
        Latihan {r.dikumpulkan ? `(dikumpulkan ${r.dikumpulkan})` : '(belum dikumpulkan)'}
      </span>
      <ol className="space-y-1">
        {QUESTIONS.map((q, i) => {
          const jawab = r.latihanJawaban[q.id];
          const benar = jawab === q.answer;
          return (
            <li key={q.id} className="flex items-start gap-2 text-xs">
              <Mark value={r.dikumpulkan && jawab ? benar : null} />
              <span className="text-slate-300">
                {i + 1}. ({q.tp.toUpperCase()}) {jawab ? <span className="font-mono">{jawab}</span> : 'belum dijawab'}
                {r.dikumpulkan && jawab && !benar && <span className="text-slate-500"> · kunci: {q.answer}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
    <div className="space-y-2">
      <span className="block text-xs font-bold text-slate-400">Refleksi</span>
      {REFLECTIONS.map((q, i) => (
        <div key={q} className="text-xs">
          <span className="text-slate-500 block">
            {i + 1}. {q}
          </span>
          <span className="text-slate-200 whitespace-pre-wrap">{r.refleksi[i]?.trim() || '-'}</span>
        </div>
      ))}
    </div>
    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-xs text-slate-500">
        Akun: {r.akun}. Menghapus data tidak dapat dibatalkan; akun login siswa tetap ada di Firebase Authentication.
      </span>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-600/70 text-rose-300 hover:bg-rose-950 disabled:opacity-50 text-xs font-bold"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {deleting ? 'Menghapus...' : 'Hapus data siswa ini'}
      </button>
    </div>
  </div>
);

interface TeacherDashboardProps {
  email: string;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ email, onLogout }) => {
  const [reports, setReports] = useState<StudentReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kelas, setKelas] = useState('semua');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const removeStudent = async (r: StudentReport) => {
    const sure = window.confirm(
      `Hapus semua data ${r.nama} (${r.kelas}, akun ${r.akun})?\n\nJawaban, nilai, dan refleksinya akan hilang permanen dan tidak bisa dikembalikan.`,
    );
    if (!sure) return;
    setDeleting(r.uid);
    try {
      await deleteStudent(r.uid);
      setOpen(null);
    } catch (e) {
      console.error(e);
      window.alert(
        'Data gagal dihapus. Pastikan aturan Firestore terbaru (yang mengizinkan guru menghapus) sudah di-Publish dan internet tersambung.',
      );
    } finally {
      setDeleting(null);
    }
  };

  // Data diperbarui langsung setiap kali ada siswa yang menjawab.
  useEffect(
    () =>
      onSnapshot(
        studentsRef(),
        (snap) => {
          setError(null);
          setReports(
            snap.docs
              .map((d) => buildReport(d.id, d.data() as StudentDoc))
              .sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)),
          );
        },
        (e) => {
          console.error(e);
          setError(
            'Data siswa tidak dapat dibaca. Pastikan email ini sudah ditulis di aturan Firestore (firestore.rules) dan internet tersambung.',
          );
        },
      ),
    [],
  );

  const kelasList = useMemo(() => Array.from(new Set((reports ?? []).map((r) => r.kelas))).sort(), [reports]);

  const shown = useMemo(
    () =>
      (reports ?? []).filter(
        (r) =>
          (kelas === 'semua' || r.kelas === kelas) &&
          (query.trim() === '' || r.nama.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [reports, kelas, query],
  );

  const submitted = shown.filter((r) => r.dikumpulkan);
  const average = (tp: TpKey) =>
    submitted.length === 0 ? null : submitted.reduce((sum, r) => sum + r.latihanPerTp[tp], 0) / submitted.length;
  const belowTarget = (tp: TpKey) => submitted.filter((r) => r.latihanPerTp[tp] < MIN_BENAR_PER_TP).length;

  const exportExcel = async () => {
    setExporting(true);
    try {
      await downloadExcel(shown, kelas === 'semua' ? 'semua-kelas' : kelas);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold">Laporan Guru · Bilangan Bulat Sungai Musi</h1>
            <p className="text-xs text-slate-400">Masuk sebagai {email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {error && (
          <p role="alert" className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-sm text-rose-100">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2 px-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama siswa"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
              aria-label="Cari nama siswa"
            />
          </label>
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm"
            aria-label="Pilih kelas"
          >
            <option value="semua">Semua kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <button
            onClick={exportExcel}
            disabled={exporting || shown.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-sm font-bold"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Menyiapkan...' : 'Unduh Excel'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Siswa
            </span>
            <span className="text-2xl font-extrabold font-mono">{shown.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block">Sudah kumpul latihan</span>
            <span className="text-2xl font-extrabold font-mono">{submitted.length}</span>
          </div>
          {TP_KEYS.map((tp) => {
            const avg = average(tp);
            return (
              <div key={tp} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Rata-rata latihan {TP_LABEL[tp]}</span>
                <span className="text-2xl font-extrabold font-mono">{avg === null ? '-' : `${avg.toFixed(1)}/3`}</span>
                {avg !== null && (
                  <span className="block text-[11px] text-amber-300">{belowTarget(tp)} siswa di bawah {MIN_BENAR_PER_TP}/3</span>
                )}
              </div>
            );
          })}
        </div>

        {reports === null && !error ? (
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Memuat data siswa...
          </p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data siswa.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-slate-900 text-xs text-slate-400 text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Nama</th>
                  <th className="px-3 py-2.5 font-semibold">Kelas</th>
                  <th className="px-3 py-2.5 font-semibold">Posisi</th>
                  <th className="px-3 py-2.5 font-semibold">Tahap TP1</th>
                  <th className="px-3 py-2.5 font-semibold">Tahap TP2</th>
                  <th className="px-3 py-2.5 font-semibold">Tahap TP3</th>
                  <th className="px-3 py-2.5 font-semibold">Latihan (TP1/TP2/TP3)</th>
                  <th className="px-3 py-2.5 font-semibold">Total</th>
                  <th className="px-3 py-2.5 font-semibold">Terakhir aktif</th>
                  <th className="px-3 py-2.5" aria-label="Rincian" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const isOpen = open === r.uid;
                  return (
                    <React.Fragment key={r.uid}>
                      <tr className="border-t border-slate-800 hover:bg-slate-900/60">
                        <td className="px-3 py-2.5 font-semibold">{r.nama}</td>
                        <td className="px-3 py-2.5">{r.kelas}</td>
                        <td className="px-3 py-2.5 text-slate-300">{STAGE_LABEL[r.tahap]}</td>
                        {TP_KEYS.map((tp) => (
                          <td key={tp} className="px-3 py-2.5 font-mono">
                            {r.tahapSkor[tp] ? `${r.tahapSkor[tp]!.correct}/${r.tahapSkor[tp]!.total}` : '-'}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 font-mono">
                          {r.dikumpulkan ? TP_KEYS.map((tp) => r.latihanPerTp[tp]).join(' / ') : 'belum kumpul'}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold">{r.dikumpulkan ? `${r.latihanBenar}/9` : '-'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-400">{r.diperbarui?.toLocaleString('id-ID') ?? '-'}</td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => setOpen(isOpen ? null : r.uid)}
                            aria-expanded={isOpen}
                            className="flex items-center gap-1 text-xs text-amber-300 font-semibold"
                          >
                            Rincian {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-t border-slate-800">
                          <td colSpan={10}>
                            <Detail r={r} deleting={deleting === r.uid} onDelete={() => removeStudent(r)} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-slate-500">
          B = benar, S = salah, - = belum dijawab. Nilai latihan baru dihitung setelah siswa menekan "Kumpulkan jawaban".
        </p>
      </main>
    </div>
  );
};
