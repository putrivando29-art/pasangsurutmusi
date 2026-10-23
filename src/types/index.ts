export type StageId = 'orientasi' | 'tp1' | 'tp2' | 'tp3' | 'latihan';

export type TpKey = 'tp1' | 'tp2' | 'tp3';

export type Relation = '<' | '>' | '=';

// Skor tiap tahap: jumlah soal yang dijawab benar, sebagai bukti ketercapaian TP.
export interface StageScore {
  correct: number;
  total: number;
}

export type ScoreBoard = Record<TpKey, StageScore | null>;

export interface LocateItem {
  id: string;
  mode: 'baca' | 'tempatkan';
  line: 'tegak' | 'mendatar';
  context: string;
  target: number;
}

export interface CompareItem {
  id: string;
  context: string;
  labelA: string;
  labelB: string;
  a: number;
  b: number;
}

export interface OrderItem {
  id: string;
  context: string;
  direction: 'naik' | 'turun';
  values: number[];
  labels?: string[];
}

export interface PracticeQuestion {
  id: string;
  tp: TpKey;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}
