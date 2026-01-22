
export enum GameStatus {
  START = 'START',
  READY = 'READY',
  PLAYING = 'PLAYING',
  QUESTION = 'QUESTION',
  GAMEOVER = 'GAMEOVER',
  PAUSED = 'PAUSED'
}

export type Subject = 'Science' | 'Maths' | 'English' | 'Social Science';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type GameDifficulty = 'Relaxed' | 'Normal' | 'Challenging';

export interface Question {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Profile {
  name: string;
  birdColor: string;
  avatar: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  birdColor: string;
  isUser?: boolean;
}

export interface GameSettings {
  subjects: Subject[];
  difficulty: Difficulty;
  gameDifficulty: GameDifficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}
