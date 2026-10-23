import { useEffect, useState } from 'react';

// Versi dinaikkan setiap kali bentuk data berubah agar data lama tidak terbaca keliru.
const PREFIX = 'bilangan-bulat-musi-v3:';

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

// State yang ikut tersimpan di peramban, sehingga kemajuan dan jawaban yang sudah
// dikunci tetap ada walaupun halaman dimuat ulang atau peramban ditutup.
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Penyimpanan tidak tersedia (mode privat); media tetap berjalan tanpa menyimpan.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
