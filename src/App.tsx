import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { waitForPendingWrites } from 'firebase/firestore';
import { Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react';
import StudentApp from './StudentApp';
import { LoginPage } from './components/LoginPage';
import { ProfileForm } from './components/ProfileForm';
import { TeacherDashboard } from './components/TeacherDashboard';
import { emailToUsername, firebaseEnabled, getFirebase, isTeacherEmail } from './services/firebase';
import { createStudent, loadStudent, makeRemoteWriter, useSyncStatus, type StudentDoc } from './services/progress';
import { takePendingProfile } from './services/session';
import { configureStorage, flushRemote, seedStorage } from './utils/storage';

type Phase =
  | { kind: 'memuat' }
  | { kind: 'keluar'; notice?: string }
  | { kind: 'guru'; user: User }
  | { kind: 'profil'; user: User }
  | { kind: 'siswa'; user: User; profile: Pick<StudentDoc, 'nama' | 'kelas'> }
  | { kind: 'gagal'; user: User; message: string };

const Loading: React.FC<{ text: string }> = ({ text }) => (
  <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center gap-2 text-sm">
    <RefreshCw className="w-4 h-4 animate-spin" />
    {text}
  </div>
);

const SyncBadge: React.FC<{ uid: string }> = ({ uid }) => {
  const status = useSyncStatus(uid);
  const style =
    status === 'tersimpan'
      ? 'text-emerald-300 border-emerald-700/60'
      : status === 'menunggu'
      ? 'text-amber-300 border-amber-600/60'
      : 'text-rose-300 border-rose-600/60';
  const text =
    status === 'tersimpan' ? 'Tersimpan' : status === 'menunggu' ? 'Mengirim...' : 'Offline, disimpan di HP';
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border text-xs font-semibold ${style}`}
      data-sync={status}
      aria-live="polite"
    >
      {status === 'offline' ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
      {text}
    </span>
  );
};

const clearScopedStorage = (uid: string) => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.includes(`:${uid}:`))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Tidak masalah; data utama ada di server.
  }
};

function OnlineApp() {
  const [phase, setPhase] = useState<Phase>({ kind: 'memuat' });

  const enterStudent = (user: User, profile: StudentDoc) => {
    configureStorage(user.uid, makeRemoteWriter(user.uid, (e) => console.error('Gagal menyimpan ke server', e)));
    // Data server menjadi sumber utama: salinan lama di peramban (misalnya dari data
    // yang sudah dihapus guru) dibuang dulu agar tidak terkirim ulang.
    clearScopedStorage(user.uid);
    seedStorage(profile.state ?? {});
    setPhase({ kind: 'siswa', user, profile });
  };

  useEffect(() => {
    const { auth } = getFirebase();
    return onAuthStateChanged(auth, async (user) => {
      configureStorage('', null);
      if (!user) {
        setPhase((prev) => (prev.kind === 'keluar' ? prev : { kind: 'keluar' }));
        return;
      }
      let intended: string | null = null;
      try {
        intended = sessionStorage.getItem('peran-login');
        sessionStorage.removeItem('peran-login');
      } catch {
        // sessionStorage tidak tersedia.
      }
      if (isTeacherEmail(user.email)) {
        setPhase({ kind: 'guru', user });
        return;
      }
      if (intended === 'guru') {
        await signOut(auth);
        setPhase({ kind: 'keluar', notice: `Email ${user.email} tidak terdaftar sebagai guru.` });
        return;
      }
      setPhase({ kind: 'memuat' });
      try {
        const pending = takePendingProfile();
        if (pending) {
          await createStudent(user.uid, pending.nama, pending.kelas, pending.akun);
          enterStudent(user, { ...pending, state: {} });
          return;
        }
        const profile = await loadStudent(user.uid);
        if (profile) enterStudent(user, profile);
        else setPhase({ kind: 'profil', user });
      } catch (e) {
        console.error(e);
        setPhase({
          kind: 'gagal',
          user,
          message: 'Data akun belum bisa diambil. Pastikan internet tersambung, lalu muat ulang halaman.',
        });
      }
    });
  }, []);

  const logout = async (uid?: string) => {
    if (uid) {
      flushRemote();
      // Tunggu sebentar sampai semua jawaban sampai di server sebelum keluar.
      const sent = await Promise.race([
        waitForPendingWrites(getFirebase().db).then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 4000)),
      ]);
      if (
        !sent &&
        !window.confirm(
          'Masih ada jawaban yang belum terkirim ke server karena koneksi internet. Jika keluar sekarang, jawaban itu baru terkirim setelah kamu masuk lagi di perangkat ini. Tetap keluar?',
        )
      )
        return;
    }
    await signOut(getFirebase().auth);
    if (uid) clearScopedStorage(uid);
  };

  if (phase.kind === 'memuat') return <Loading text="Memuat akun..." />;
  if (phase.kind === 'keluar') return <LoginPage notice={phase.notice} />;
  if (phase.kind === 'guru') return <TeacherDashboard email={phase.user.email ?? ''} onLogout={() => logout()} />;
  if (phase.kind === 'gagal')
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm max-w-sm">{phase.message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-slate-800 text-sm font-semibold">
          Muat ulang
        </button>
        <button onClick={() => logout()} className="text-xs text-slate-400 underline">
          Keluar
        </button>
      </div>
    );
  if (phase.kind === 'profil')
    return (
      <ProfileForm
        defaultName={phase.user.displayName ?? ''}
        email={phase.user.email ?? ''}
        onLogout={() => logout()}
        onSubmit={(nama, kelas) => {
          const akun = phase.user.email ?? phase.user.uid;
          createStudent(phase.user.uid, nama, kelas, akun);
          enterStudent(phase.user, { nama: nama.trim(), kelas: kelas.trim(), akun, state: {} });
        }}
      />
    );

  const { user, profile } = phase;
  const akun = emailToUsername(user.email) ?? user.email ?? '';
  return (
    <StudentApp
      key={user.uid}
      account={{
        nama: profile.nama,
        kelas: profile.kelas,
        navExtra: (
          <>
            <SyncBadge uid={user.uid} />
            <button
              onClick={() => logout(user.uid)}
              title={`Masuk sebagai ${akun}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              Keluar
            </button>
          </>
        ),
      }}
    />
  );
}

export default function App() {
  // Tanpa konfigurasi Firebase, media tetap bisa dipakai dalam mode lokal seperti sebelumnya.
  return firebaseEnabled ? <OnlineApp /> : <StudentApp />;
}
