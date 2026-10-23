import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  FieldPath,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getFirebase } from './firebase';
import { subscribeQueue } from '../utils/storage';

export const STUDENT_COLLECTION = 'siswa';

// Satu dokumen per siswa. Nilai `state` disimpan sebagai teks JSON per kunci,
// karena Firestore tidak menerima larik bersarang (misalnya urutan kartu Tahap 3).
export interface StudentDoc {
  nama: string;
  kelas: string;
  akun: string;
  dibuat?: Timestamp | null;
  diperbarui?: Timestamp | null;
  state: Record<string, string>;
}

export const studentRef = (uid: string) => doc(getFirebase().db, STUDENT_COLLECTION, uid);

export const studentsRef = () => collection(getFirebase().db, STUDENT_COLLECTION);

export async function loadStudent(uid: string): Promise<StudentDoc | null> {
  const snap = await getDoc(studentRef(uid));
  return snap.exists() ? (snap.data() as StudentDoc) : null;
}

export async function createStudent(uid: string, nama: string, kelas: string, akun: string) {
  const data = {
    nama: nama.trim(),
    kelas: kelas.trim(),
    akun,
    dibuat: serverTimestamp(),
    diperbarui: serverTimestamp(),
    state: {},
  };
  // Tidak ditunggu sampai server membalas, agar pendaftaran tetap jalan saat sinyal lemah.
  setDoc(studentRef(uid), data).catch((e) => console.error('Gagal membuat profil siswa', e));
}

export const makeRemoteWriter = (uid: string, onError: (e: unknown) => void) => (key: string, json: string) => {
  updateDoc(studentRef(uid), new FieldPath('state', key), json, 'diperbarui', serverTimestamp()).catch(onError);
};

export type SyncStatus = 'tersimpan' | 'menunggu' | 'offline';

// Memantau apakah semua perubahan milik siswa sudah sampai ke server.
export function useSyncStatus(uid: string | null): SyncStatus {
  const [pending, setPending] = useState(false);
  const [queued, setQueued] = useState(false);

  useEffect(() => subscribeQueue(setQueued), []);
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(studentRef(uid), { includeMetadataChanges: true }, (snap) =>
      setPending(snap.metadata.hasPendingWrites),
    );
  }, [uid]);

  if (!online) return 'offline';
  return pending || queued ? 'menunggu' : 'tersimpan';
}
