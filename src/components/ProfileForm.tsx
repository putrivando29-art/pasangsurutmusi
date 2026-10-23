import React, { useState } from 'react';

interface ProfileFormProps {
  defaultName: string;
  email: string;
  onSubmit: (nama: string, kelas: string) => void;
  onLogout: () => void;
}

const inputClass =
  'mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none px-3 py-2.5 text-sm text-slate-100';

// Ditampilkan sekali untuk siswa yang masuk dengan Google dan belum punya profil.
export const ProfileForm: React.FC<ProfileFormProps> = ({ defaultName, email, onSubmit, onLogout }) => {
  const [nama, setNama] = useState(defaultName);
  const [kelas, setKelas] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (nama.trim() && kelas.trim()) onSubmit(nama, kelas);
        }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4"
      >
        <div>
          <h1 className="text-lg font-extrabold">Lengkapi data diri</h1>
          <p className="text-sm text-slate-400 mt-1">
            Masuk sebagai <span className="text-slate-200">{email}</span>. Nama dan kelas tidak dapat diubah setelah disimpan,
            jadi periksa dengan teliti.
          </p>
        </div>
        <label className="block">
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
        <button
          type="submit"
          disabled={!nama.trim() || !kelas.trim()}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm"
        >
          Simpan dan mulai belajar
        </button>
        <button type="button" onClick={onLogout} className="w-full text-xs text-slate-400 underline">
          Bukan akun saya, keluar
        </button>
      </form>
    </div>
  );
};
