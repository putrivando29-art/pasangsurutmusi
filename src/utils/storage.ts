import { useEffect, useState } from 'react';

// Versi dinaikkan setiap kali bentuk data berubah agar data lama tidak terbaca keliru.
const PREFIX = 'bilangan-bulat-musi-v3:';

// Dalam mode login, setiap akun siswa memakai ruang penyimpanan sendiri di peramban
// dan setiap perubahan juga dikirim ke server lewat remoteWrite.
let scope = '';
let remoteWrite: ((key: string, json: string) => void) | null = null;

const fullKey = (key: string) => PREFIX + (scope ? `${scope}:` : '') + key;

// Pengiriman ke server ditunda sebentar per kunci, agar mengetik refleksi tidak
// menghabiskan kuota tulis untuk setiap huruf.
const SEND_DELAY_MS = 700;
const queued = new Map<string, { json: string; timer: ReturnType<typeof setTimeout> }>();

// Pemberi tahu untuk indikator status: ada perubahan yang belum diserahkan ke Firestore.
const queueListeners = new Set<(waiting: boolean) => void>();
const notifyQueue = () => queueListeners.forEach((fn) => fn(queued.size > 0));

export function subscribeQueue(fn: (waiting: boolean) => void) {
  queueListeners.add(fn);
  return () => {
    queueListeners.delete(fn);
  };
}

export function flushRemote() {
  queued.forEach(({ json, timer }, key) => {
    clearTimeout(timer);
    remoteWrite?.(key, json);
  });
  queued.clear();
  notifyQueue();
}

const sendRemote = (key: string, json: string) => {
  if (!remoteWrite) return;
  const prev = queued.get(key);
  if (prev) clearTimeout(prev.timer);
  const timer = setTimeout(() => {
    queued.delete(key);
    remoteWrite?.(key, json);
    notifyQueue();
  }, SEND_DELAY_MS);
  queued.set(key, { json, timer });
  notifyQueue();
};

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushRemote);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushRemote();
  });
}

export function configureStorage(newScope: string, writer: ((key: string, json: string) => void) | null) {
  flushRemote();
  scope = newScope;
  remoteWrite = writer;
}

// Menimpa salinan di peramban dengan data dari server (sumber utama saat login).
export function seedStorage(state: Record<string, string>) {
  try {
    Object.entries(state).forEach(([key, json]) => localStorage.setItem(fullKey(key), json));
  } catch {
    // Penyimpanan peramban tidak tersedia; data tetap dibaca dari server berikutnya.
  }
}

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(fullKey(key));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

// State yang ikut tersimpan di peramban (dan di server dalam mode login), sehingga
// kemajuan dan jawaban yang sudah dikunci tetap ada walaupun halaman dimuat ulang.
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));

  useEffect(() => {
    const json = JSON.stringify(value);
    try {
      if (localStorage.getItem(fullKey(key)) === json) return;
      localStorage.setItem(fullKey(key), json);
    } catch {
      // Penyimpanan peramban tidak tersedia (mode privat); server tetap menerima data.
    }
    sendRemote(key, json);
  }, [key, value]);

  return [value, setValue] as const;
}
