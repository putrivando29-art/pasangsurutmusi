// Data pendaftaran disimpan sementara di sini, karena akun Firebase baru selesai
// dibuat sebelum profil siswa (nama dan kelas) sempat ditulis ke Firestore.
export interface PendingProfile {
  nama: string;
  kelas: string;
  akun: string;
}

let pending: PendingProfile | null = null;

export const setPendingProfile = (p: PendingProfile | null) => {
  pending = p;
};

export const takePendingProfile = (): PendingProfile | null => {
  const p = pending;
  pending = null;
  return p;
};
