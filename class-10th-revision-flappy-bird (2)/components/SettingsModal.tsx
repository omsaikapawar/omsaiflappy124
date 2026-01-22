
import React from 'react';
import { GameSettings, Subject, Difficulty, GameDifficulty, Profile } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  profile: Profile;
  onUpdate: (settings: GameSettings) => void;
  onOpenProfile: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, profile, onUpdate, onOpenProfile, onClose }) => {
  const subjects: Subject[] = ['Science', 'Maths', 'English', 'Social Science'];
  const quizDifficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const gameDifficulties: GameDifficulty[] = ['Relaxed', 'Normal', 'Challenging'];

  const toggleSubject = (sub: Subject) => {
    const newSubjects = settings.subjects.includes(sub)
      ? settings.subjects.filter((s) => s !== sub)
      : [...settings.subjects, sub];
    if (newSubjects.length > 0) {
      onUpdate({ ...settings, subjects: newSubjects });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[70] p-4 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 border-b-8 border-slate-200 flex flex-col">
        <div className="bg-slate-900 p-6 sm:p-8 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black game-font italic text-white uppercase tracking-tight">Game Center</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure your experience</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white/10 rounded-2xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh] flex-1">
          {/* Profile Quick Link */}
          <button 
            onClick={onOpenProfile}
            className="w-full p-4 bg-indigo-50 border-2 border-indigo-100 rounded-3xl flex items-center gap-4 hover:bg-indigo-100 transition-all group active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0" style={{ backgroundColor: profile.birdColor }}>
              {profile.avatar}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest truncate">Logged in as</p>
              <p className="text-lg font-black text-slate-900 leading-tight truncate">{profile.name}</p>
            </div>
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Game Physics Difficulty */}
          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Movement Difficulty (Physics)</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {gameDifficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdate({ ...settings, gameDifficulty: diff })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                    settings.gameDifficulty === diff
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Difficulty */}
          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Quiz Difficulty (Syllabus)</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {quizDifficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdate({ ...settings, difficulty: diff })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                    settings.difficulty === diff
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Active Subjects</label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`py-3 px-3 rounded-2xl text-[10px] font-black transition-all border-2 text-center ${
                    settings.subjects.includes(sub)
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Toggles */}
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <span className="font-black text-slate-900 text-[10px] uppercase tracking-wider mb-2">Sound SFX</span>
                <button
                  onClick={() => onUpdate({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
             <div className="flex flex-col items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <span className="font-black text-slate-900 text-[10px] uppercase tracking-wider mb-2">Background Music</span>
                <button
                  onClick={() => onUpdate({ ...settings, musicEnabled: !settings.musicEnabled })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${settings.musicEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-wide"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
