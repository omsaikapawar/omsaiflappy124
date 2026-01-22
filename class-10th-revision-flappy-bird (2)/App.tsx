
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameSettings, Subject, Question, Difficulty, Profile } from './types';
import GameCanvas from './components/GameCanvas';
import SettingsModal from './components/SettingsModal';
import QuestionModal from './components/QuestionModal';
import ProfileModal from './components/ProfileModal';
import Leaderboard from './components/Leaderboard';
import { fetchRevisionQuestion } from './services/geminiService';
import { audioService } from './services/audioService';

const DEFAULT_SETTINGS: GameSettings = {
  subjects: ['Science', 'Maths', 'English', 'Social Science'],
  difficulty: 'Easy',
  gameDifficulty: 'Relaxed',
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.5,
};

const DEFAULT_PROFILE: Profile = {
  name: 'Pilot',
  birdColor: '#fde047',
  avatar: '🐤',
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.READY);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastFinishedScore, setLastFinishedScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);

  const requestToken = useRef(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappy_revision_highscores');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));

    const savedProfile = localStorage.getItem('flappy_revision_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappy_revision_highscores', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    const isMusicNeeded = settings.musicEnabled && 
      (status === GameStatus.PLAYING || status === GameStatus.READY);
    
    if (isMusicNeeded) {
      audioService.startMusic(settings.volume);
    } else {
      audioService.stopMusic();
    }
  }, [settings.musicEnabled, status, settings.volume]);

  const prefetch = useCallback(async (currentSubjects: Subject[], currentDifficulty: Difficulty) => {
    if (isFetchingNext) return;
    const currentToken = ++requestToken.current;
    setIsFetchingNext(true);

    try {
      const q = await fetchRevisionQuestion(currentSubjects, currentDifficulty, askedQuestionIds);
      if (currentToken === requestToken.current) {
        setNextQuestion(q);
      }
    } catch (e) {
      console.error("Prefetch failed", e);
    } finally {
      if (currentToken === requestToken.current) {
        setIsFetchingNext(false);
      }
    }
  }, [askedQuestionIds, isFetchingNext]);

  useEffect(() => {
    if (!nextQuestion && !isFetchingNext) {
      prefetch(settings.subjects, settings.difficulty);
    }
  }, [settings.subjects, settings.difficulty, nextQuestion, isFetchingNext, prefetch]);

  const handleActualPlayStart = () => {
    setStatus(GameStatus.PLAYING);
    setShowLeaderboard(false); // Auto-hide leaderboard on start
  };

  const handleCollision = useCallback(async () => {
    setStatus(GameStatus.QUESTION);
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setAskedQuestionIds(prev => [...prev, nextQuestion.id]);
      setNextQuestion(null);
    } else {
      setIsFetchingNext(true);
      try {
        const q = await fetchRevisionQuestion(settings.subjects, settings.difficulty, askedQuestionIds);
        setCurrentQuestion(q);
        setAskedQuestionIds(prev => [...prev, q.id]);
      } catch (e) {
        setStatus(GameStatus.GAMEOVER);
      } finally {
        setIsFetchingNext(false);
      }
    }
  }, [nextQuestion, settings.subjects, settings.difficulty, askedQuestionIds]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      if (settings.soundEnabled) audioService.playSfx('correct', settings.volume);
      setStatus(GameStatus.READY);
      prefetch(settings.subjects, settings.difficulty);
    } else {
      if (settings.soundEnabled) audioService.playSfx('wrong', settings.volume);
      setStatus(GameStatus.GAMEOVER);
      setLastFinishedScore(score); // Trigger leaderboard update
    }
    setCurrentQuestion(null);
  };

  const restartGame = () => {
    setScore(0);
    setLastFinishedScore(0);
    setStatus(GameStatus.READY);
    setNextQuestion(null);
    prefetch(settings.subjects, settings.difficulty);
  };

  const updateSettings = (newSettings: GameSettings) => {
    const subjectsChanged = JSON.stringify(newSettings.subjects) !== JSON.stringify(settings.subjects);
    const difficultyChanged = newSettings.difficulty !== settings.difficulty;
    setSettings(newSettings);
    if (subjectsChanged || difficultyChanged) {
      requestToken.current++;
      setNextQuestion(null);
      setIsFetchingNext(false);
    }
  };

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
    localStorage.setItem('flappy_revision_profile', JSON.stringify(newProfile));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-4 sm:p-6 overflow-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent_70%)]" />
      </div>

      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-6 relative z-10 items-stretch h-full">
        
        {/* Leaderboard - Collapsible on Mobile */}
        <div className="order-2 lg:order-1 lg:block">
           <Leaderboard 
            userScore={lastFinishedScore} 
            userProfile={profile} 
            isVisible={showLeaderboard}
            onToggle={() => setShowLeaderboard(!showLeaderboard)}
           />
        </div>

        {/* Game Viewport */}
        <div className="flex-1 w-full max-w-[800px] order-1 lg:order-2 flex flex-col">
          {/* Header Controls */}
          <div className="w-full flex justify-between items-center mb-4 px-1 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-xl backdrop-blur-xl border border-white/10 active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </button>
            </div>
            
            <div className="text-center absolute left-1/2 -translate-x-1/2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tighter game-font uppercase italic">
                FLAPPY <span className="text-indigo-500">REVISION</span>
              </h1>
            </div>

            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-right min-w-[70px]">
              <p className="text-[8px] text-indigo-400 font-black uppercase mb-0.5">BEST</p>
              <p className="text-lg font-black text-white leading-none">{highScore}</p>
            </div>
          </div>

          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl flex-1 min-h-0">
            <GameCanvas 
              status={status} 
              settings={settings} 
              score={score}
              birdColor={profile.birdColor}
              onScoreUpdate={setScore}
              onCollision={handleCollision}
              onGameStart={handleActualPlayStart}
              shouldReset={status === GameStatus.READY && score === 0}
            />

            {/* Overlays */}
            {status === GameStatus.READY && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                  <div className="bg-black/70 backdrop-blur-md px-10 py-6 rounded-[2.5rem] border border-white/20 animate-pulse shadow-2xl pointer-events-auto cursor-pointer text-center" onClick={handleActualPlayStart}>
                     <p className="text-white font-black text-lg sm:text-2xl game-font flex items-center justify-center gap-4 uppercase mb-2">
                       <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                       TAP TO FLY
                     </p>
                     <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Physics: {settings.gameDifficulty} | Quiz: {settings.difficulty}</p>
                  </div>
               </div>
            )}

            {status === GameStatus.GAMEOVER && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl z-20">
                 <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center max-w-sm w-full animate-in zoom-in duration-300 pointer-events-auto border-b-8 border-red-200">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 game-font italic uppercase tracking-tight">GAME OVER</h2>
                    <div className="my-6 bg-slate-50 py-6 rounded-3xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">SCORE</p>
                      <p className="text-7xl font-black text-slate-900 leading-none tabular-nums">{score}</p>
                    </div>
                    <button
                      onClick={restartGame}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase"
                    >
                      FLY AGAIN
                    </button>
                 </div>
              </div>
            )}

            {status === GameStatus.QUESTION && !currentQuestion && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl z-30">
                 <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full animate-pulse border-b-8 border-indigo-200">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                       <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 game-font italic uppercase">TUTOR IS READY</h2>
                    <p className="text-slate-500 font-bold text-sm tracking-tight leading-relaxed px-4">
                      Preparing your <span className="text-indigo-600">Revision Task</span>...
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal 
          settings={settings} 
          profile={profile}
          onUpdate={updateSettings} 
          onOpenProfile={() => { setShowSettings(false); setShowProfile(true); }}
          onClose={() => setShowSettings(false)} 
        />
      )}

      {showProfile && (
        <ProfileModal
          profile={profile}
          onUpdate={updateProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {status === GameStatus.QUESTION && currentQuestion && (
        <QuestionModal 
          question={currentQuestion} 
          onAnswer={handleAnswer} 
        />
      )}

      {/* Footer Branding & Copyright */}
      <footer className="mt-auto py-6 flex flex-col items-center gap-3 shrink-0">
        <a 
          href="https://instagram.com/omsaikapawarog" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95"
        >
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Made by</span>
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest group-hover:text-indigo-300 transition-colors">Omsai Kapawar</span>
          <svg className="w-3 h-3 text-indigo-500 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </footer>
    </div>
  );
};

export default App;
