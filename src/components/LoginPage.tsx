import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { GraduationCap, LogIn, UserPlus, Users } from 'lucide-react';
import { getFirebase, usernameToEmail } from '../services/firebase';
import { setPendingProfile } from '../services/session';

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;

export const authErrorText = (e: unknown): string => {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Nama pengguna atau kata sandi salah.';
  if (code.includes('email-already-in-use')) return 'Nama pengguna ini sudah dipakai. Pilih nama pengguna lain.';
  if (code.includes('weak-password')) return 'Kata sandi minimal 6 karakter.';
  if (code.includes('network-request-failed')) return 'Tidak ada koneksi internet. Sambungkan internet lalu coba lagi.';
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) return 'Jendela login ditutup sebelum selesai.';
  if (code.includes('popup-blocked')) return 'Jendela login diblokir peramban. Izinkan pop-up untuk situs ini lalu coba lagi.';
  if (code.includes('too-many-requests')) return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (code.includes('unauthorized-domain')) return 'Alamat situs ini belum didaftarkan di Firebase (Authorized domains).';
  if (code.includes('operation-not-allowed')) return 'Metode login ini belum diaktifkan di Firebase Authentication.';
  return 'Login gagal. Coba lagi beberapa saat lagi.';
};

const inputClass =
  'mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none px-3 py-2.5 text-sm text-slate-100';

export const LoginPage: React.FC<{ notice?: string | null }> = ({ notice }) => {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [mode, setMode] = useState<'masuk' | 'daftar'>('masuk');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      sessionStorage.setItem('peran-login', role);
    } catch {
      // Tidak masalah jika sessionStorage tidak tersedia.
    }
    try {
      await signInWithPopup(getFirebase().auth, new GoogleAuthProvider());
    } catch (e) {
      setError(authErrorText(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const user = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(user)) {
      setError('Nama pengguna 3 sampai 30 karakter: huruf kecil, angka, titik, garis bawah, atau tanda minus, tanpa spasi.');
      return;
    }
    if (mode === 'daftar' && (!nama.trim() || !kelas.trim())) {
      setError('Nama lengkap dan kelas wajib diisi.');
      return;
    }
    setBusy(true);
    try {
      const { auth } = getFirebase();
      if (mode === 'daftar') {
        setPendingProfile({ nama: nama.trim(), kelas: kelas.trim(), akun: user });
        await createUserWithEmailAndPassword(auth, usernameToEmail(user), password);
      } else {
        await signInWithEmailAndPassword(auth, usernameToEmail(user), password);
      }
    } catch (err) {
      setPendingProfile(null);
      setError(authErrorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center border border-red-400/30">
            <span className="font-extrabold text-white text-xl font-serif">M</span>
          </div>
          <h1 className="text-xl font-extrabold">Bilangan Bulat Sungai Musi</h1>
          <p className="text-sm text-slate-400">Masuk agar semua jawabanmu tersimpan dan terkirim ke guru.</p>
        </div>

        {notice && (
          <p role="alert" className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-sm text-amber-100">
            {notice}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Masuk sebagai">
          {(
            [
              { id: 'siswa', label: 'Siswa', icon: GraduationCap },
              { id: 'guru', label: 'Guru', icon: Users },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={role === id}
              onClick={() => {
                setRole(id);
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold ${
                role === id
                  ? 'bg-amber-400 border-amber-300 text-slate-950'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <button
            onClick={google}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold text-sm"
          >
            <LogIn className="w-4 h-4" />
            Masuk dengan akun Google
          </button>

          {role === 'guru' ? (
            <p className="text-xs text-slate-400">
              Halaman laporan hanya terbuka untuk email Google guru yang sudah didaftarkan di pengaturan media.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-slate-800" />
                atau dengan nama pengguna
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(['masuk', 'daftar'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    aria-pressed={mode === m}
                    className={`py-2 rounded-lg text-sm font-semibold ${
                      mode === m ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 'masuk' ? 'Sudah punya akun' : 'Buat akun baru'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === 'daftar' && (
                  <div className="grid grid-cols-3 gap-2">
                    <label className="col-span-2 block">
                      <span className="text-xs font-semibold text-slate-400">Nama lengkap</span>
                      <input value={nama} onChange={(e) => setNama(e.target.value)} className={inputClass} autoComplete="name" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">Kelas</span>
                      <input
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        placeholder="VII-A"
                        className={`${inputClass} placeholder:text-slate-600`}
                      />
                    </label>
                  </div>
                )}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Nama pengguna</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="username"
                    placeholder="contoh: siti.7a"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Kata sandi (minimal 6 karakter)</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                  />
                </label>
                {mode === 'daftar' && (
                  <p className="text-xs text-amber-200/90">
                    Catat nama pengguna dan kata sandimu. Kata sandi yang lupa tidak dapat dipulihkan sendiri; minta bantuan
                    guru.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold text-sm"
                >
                  {mode === 'daftar' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {busy ? 'Memproses...' : mode === 'daftar' ? 'Buat akun dan mulai' : 'Masuk'}
                </button>
              </form>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
