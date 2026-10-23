// Isi dengan blok `firebaseConfig` dari Firebase Console:
// Project settings > Your apps > (aplikasi Web) > SDK setup and configuration.
// Nilai ini memang dipasang di kode web dan aman dibagikan; keamanan data diatur
// oleh aturan Firestore di file firestore.rules.
//
// Selama apiKey kosong, media berjalan dalam mode lokal tanpa login
// (kemajuan hanya tersimpan di peramban masing-masing).
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Email akun Google guru yang boleh membuka halaman laporan.
// Daftar yang sama juga harus ditulis di firestore.rules (fungsi isTeacher),
// karena daftar di sini hanya menentukan tampilan, bukan hak akses data.
export const TEACHER_EMAILS: string[] = [
  'mazizalhakimr@gmail.com',
  'oktadwilestarii03@gmail.com',
  'ahmadassiddiq176@gmail.com',
  'dehya1801@gmail.com',
  'thevandointengsukendro@gmail.com',
];
