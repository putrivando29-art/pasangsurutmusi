export type LearningStage = 'context' | 'simulation' | 'symbolic' | 'comparison' | 'quiz';

export interface WaterScenario {
  id: string;
  title: string;
  description: string;
  startLevel: number; // in meters, -5 to +5
  delta: number; // e.g. +3, -2
  actionType: 'rain' | 'sun' | 'drain';
  label: string;
}

export interface SymbolicProblem {
  id: string;
  contextStory: string;
  startLevel: number;
  operation: '+' | '-';
  changeAmount: number;
  expectedResult: number;
  explanation: string;
}

export interface ComparisonProblem {
  id: string;
  stationA: {
    name: string;
    level: number;
    description: string;
  };
  stationB: {
    name: string;
    level: number;
    description: string;
  };
  relation: '<' | '>' | '=';
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  contextHint?: string;
  stationALevel?: number;
  stationBLevel?: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
