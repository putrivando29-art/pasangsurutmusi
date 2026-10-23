# Panduan Login Siswa dan Laporan Guru (Firebase)

Media ini dapat berjalan dalam dua mode:

1. **Mode lokal** (bawaan, tanpa pengaturan): tidak ada login. Kemajuan siswa hanya tersimpan di peramban HP masing-masing, dan guru menerima hasil lewat ringkasan yang ditempel siswa di Google Classroom.
2. **Mode login** (setelah Firebase dipasang): setiap siswa punya akun, semua jawaban tersimpan di server, dan guru membuka halaman laporan di link yang sama.

Mode login aktif otomatis setelah `src/firebase-config.ts` diisi.

## Cara kerja mode login

| Bagian | Perilaku |
|---|---|
| Login siswa | Akun Google, **atau** nama pengguna + kata sandi yang dibuat siswa sendiri di menu "Buat akun baru" |
| Profil | Nama dan kelas diisi sekali saat membuat akun dan tidak dapat diubah lagi |
| Penyimpanan | Setiap jawaban langsung dikirim ke Firestore. Di kanan atas tampil status "Tersimpan", "Mengirim...", atau "Offline, disimpan di HP" |
| Tanpa internet | Jawaban disimpan sementara di HP dan terkirim otomatis saat internet tersambung lagi |
| Pindah perangkat | Siswa login dengan akun yang sama dan melanjutkan dari soal terakhir |
| Login guru | Akun Google yang emailnya didaftarkan. Guru langsung masuk ke halaman laporan, bukan halaman belajar |
| Laporan guru | Daftar siswa dengan filter kelas dan pencarian nama, rata-rata latihan per TP, jumlah siswa di bawah 2/3, rincian benar/salah per soal, jawaban latihan, refleksi, dan tombol **Unduh Excel**. Data diperbarui langsung tanpa memuat ulang |
| File Excel | Empat sheet: Rekap, Per Soal, Refleksi, Kunci Latihan |

## Langkah pemasangan (sekali saja)

### 1. Buat proyek Firebase

1. Buka https://console.firebase.google.com dengan akun Google guru, lalu klik **Create a project**.
2. Beri nama, misalnya `bilangan-bulat-musi`. Google Analytics boleh dimatikan.

### 2. Aktifkan metode login

1. Menu **Build > Authentication > Get started**.
2. Tab **Sign-in method**: aktifkan **Google** (isi email dukungan dengan email guru) dan **Email/Password**.
3. Tab **Settings > Authorized domains**: klik **Add domain** lalu isi `putrivando29-art.github.io`.

### 3. Buat database

1. Menu **Build > Firestore Database > Create database**.
2. Pilih lokasi `asia-southeast2 (Jakarta)` dan mode **production**.
3. Buka tab **Rules**, hapus isinya, lalu tempel seluruh isi file `firestore.rules` dari repo ini.
4. Pada fungsi `isTeacher`, ganti `'guru@contoh.sch.id'` dengan email Google guru (huruf kecil). Untuk beberapa guru, pisahkan dengan koma: `['guru1@gmail.com', 'guru2@gmail.com']`.
5. Klik **Publish**.

### 4. Hubungkan website ke Firebase

1. Klik ikon roda gigi > **Project settings**. Pada bagian **Your apps**, klik ikon **</>** (Web), beri nama, lalu **Register app**.
2. Salin nilai di dalam `firebaseConfig`.
3. Di GitHub, buka `src/firebase-config.ts`, klik ikon pensil, lalu isi nilainya dan email guru:

```ts
export const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'bilangan-bulat-musi.firebaseapp.com',
  projectId: 'bilangan-bulat-musi',
  storageBucket: 'bilangan-bulat-musi.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
};

export const TEACHER_EMAILS: string[] = ['emailguru@gmail.com'];
```

4. Klik **Commit changes**. GitHub Pages menerbitkan ulang website dalam beberapa menit.

### 5. Uji sebelum dipakai di kelas

1. Buka website, pilih **Siswa > Buat akun baru**, lalu buat satu akun uji dan jawab beberapa soal.
2. Buka website di perangkat lain, pilih **Guru > Masuk dengan akun Google** memakai email guru. Akun uji tadi harus tampil di laporan.
3. Uji juga **Masuk dengan akun Google** memakai satu akun siswa sungguhan. Akun sekolah (misalnya `@belajar.id`) bisa saja diblokir admin sekolah untuk aplikasi pihak ketiga. Jika gagal, minta siswa memakai nama pengguna + kata sandi.

## Hal yang perlu diketahui

- **Lupa kata sandi**: siswa dengan nama pengguna tidak bisa memulihkan kata sandinya sendiri karena akunnya tidak memakai email asli. Guru dapat menghapus akun itu di **Authentication > Users**. Setelah itu siswa membuat akun baru, dan data akun lama tetap ada di laporan sebagai baris terpisah.
- **Satu siswa, dua akun**: jika siswa membuat akun kedua, laporan menampilkan dua baris. Periksa kolom "Terakhir aktif".
- **Penguncian jawaban di server**: tahap yang sudah selesai dan latihan yang sudah dikumpulkan tidak dapat diubah lagi, termasuk lewat cara teknis di luar website. Jawaban per soal di tengah tahap yang belum selesai hanya dikunci oleh website, sehingga siswa yang paham teknis masih mungkin mengubahnya lewat konsol peramban.
- **Tanpa internet sama sekali**: login pertama dan membuka halaman tetap membutuhkan internet. Mode offline hanya menjaga jawaban yang diberikan setelah halaman terbuka.
- **Keluar akun**: jika masih ada jawaban yang belum terkirim, website meminta konfirmasi sebelum keluar, karena jawaban itu bisa hilang.
- **Biaya**: paket gratis Firebase (Spark) memberi kuota harian Firestore 50.000 baca dan 20.000 tulis ([Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)). Satu kelas 32 siswa diperkirakan memakai sekitar 1.000 sampai 2.000 tulis per pertemuan. Angka ini perkiraan penyusun, bukan hasil pengukuran.
- **Data pribadi**: laporan memuat nama, kelas, dan email siswa. Bagikan file Excel hanya kepada pihak yang berwenang.
