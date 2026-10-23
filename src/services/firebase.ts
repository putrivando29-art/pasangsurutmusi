import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithCredential, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig, TEACHER_EMAILS } from '../firebase-config';

const useEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === 'true';

export const firebaseEnabled = useEmulator || firebaseConfig.apiKey !== '';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseEnabled) {
  app = initializeApp(
    useEmulator ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-bilangan', appId: 'demo' } : firebaseConfig,
  );
  auth = getAuth(app);
  // Cache di perangkat membuat jawaban tetap tersimpan saat internet putus dan
  // terkirim otomatis ketika tersambung lagi.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  if (useEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    // Khusus uji di emulator: meniru login Google tanpa jendela pop-up.
    const emulatorAuth = auth;
    (window as unknown as Record<string, unknown>).__loginGoogleUji = (email: string, name: string) =>
      signInWithCredential(
        emulatorAuth,
        GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true, name })),
      );
  }
}

export const getFirebase = () => {
  if (!auth || !db) throw new Error('Firebase belum dikonfigurasi.');
  return { auth, db };
};

const teacherList = useEmulator ? ['guru@contoh.sch.id'] : TEACHER_EMAILS;

export const isTeacherEmail = (email: string | null | undefined) =>
  !!email && teacherList.map((e) => e.toLowerCase()).includes(email.toLowerCase());

// Akun siswa dengan nama pengguna disimpan di Firebase sebagai email buatan.
// example.com adalah domain cadangan untuk contoh, sehingga tidak ada email yang terkirim.
export const STUDENT_EMAIL_DOMAIN = 'siswa.example.com';

export const usernameToEmail = (username: string) => `${username.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;

export const emailToUsername = (email: string | null | undefined) =>
  email && email.endsWith(`@${STUDENT_EMAIL_DOMAIN}`) ? email.split('@')[0] : null;
