import type { Relation } from '../types';

export const fmt = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

export const relationOf = (a: number, b: number): Relation => (a < b ? '<' : a > b ? '>' : '=');

export const relationWord = (rel: Relation): string =>
  rel === '<' ? 'kurang dari' : rel === '>' ? 'lebih dari' : 'sama dengan';

// Jawaban yang muncul bila siswa membandingkan angka tanpa memperhatikan tanda,
// misalnya mengira -5 > -2 karena 5 > 2.
export const absoluteValueRelation = (a: number, b: number): Relation =>
  relationOf(Math.abs(a), Math.abs(b));

export const sortValues = (values: number[], direction: 'naik' | 'turun'): number[] =>
  [...values].sort((x, y) => (direction === 'naik' ? x - y : y - x));
