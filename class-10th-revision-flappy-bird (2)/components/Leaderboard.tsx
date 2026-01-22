
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, Profile } from '../types';

interface LeaderboardProps {
  userScore: number;
  userProfile: Profile;
  isVisible: boolean;
  onToggle: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userScore, userProfile, isVisible, onToggle }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // Load scores from localStorage
  const loadScores = () => {
    const saved = localStorage.getItem('flappy_revision_hall_of_fame');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        setEntries([]);
      }
    } else {
      // Initial empty state
      setEntries([]);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  // Update leaderboard when a new score is achieved (usually called on game over)
  useEffect(() => {
    if (userScore > 0) {
      const newEntry: LeaderboardEntry = {
        name: userProfile.name,
        score: userScore,
        birdColor: userProfile.birdColor,
        isUser: true
      };

      setEntries(prev => {
        const combined = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Keep top 10
        
        localStorage.setItem('flappy_revision_hall_of_fame', JSON.stringify(combined));
        return combined;
      });
    }
  }, [userScore]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={onToggle}
        className="lg:hidden fixed bottom-24 right-6 z-[60] bg-indigo-600 text-white p-4 rounded-full shadow-2xl border-4 border-white/20 active:scale-90 transition-transform"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
        </svg>
      </button>

      {/* Leaderboard Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-72 bg-slate-900/95 backdrop-blur-2xl z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 transition-transform duration-500 ease-in-out
        lg:relative lg:translate-x-0 lg:w-64 lg:inset-auto lg:h-auto lg:rounded-[2rem] lg:overflow-hidden lg:shadow-2xl lg:bg-white/5
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-white font-black text-[12px] uppercase tracking-widest game-font italic">Hall of Fame</h3>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Personal Best Records</p>
          </div>
          <button onClick={onToggle} className="lg:hidden text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="divide-y divide-white/5 max-h-[calc(100vh-120px)] lg:max-h-80 overflow-y-auto custom-scrollbar">
          {entries.length === 0 ? (
            <div className="p-10 text-center">
               <div className="w-12 h-12 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center opacity-20">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                  </svg>
               </div>
               <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">No Records Yet</p>
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div 
                key={`${entry.name}-${idx}`} 
                className={`p-4 flex items-center gap-4 transition-all hover:bg-white/5 ${idx === 0 ? 'bg-indigo-600/10' : ''}`}
              >
                <div className="w-5 text-center font-black text-white/30 text-[10px]">{idx + 1}</div>
                <div 
                  className="w-10 h-10 rounded-2xl shrink-0 shadow-inner flex items-center justify-center text-lg border-2 border-white/10"
                  style={{ backgroundColor: entry.birdColor }}
                >
                  {userProfile.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate uppercase tracking-wide text-white">
                    {entry.name}
                  </p>
                  <p className="text-[7px] text-white/30 font-bold uppercase mt-0.5">Rank: {idx === 0 ? 'Legend' : idx < 3 ? 'Elite' : 'Pilot'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white leading-none tabular-nums">{entry.score}</p>
                  <p className="text-[7px] text-white/30 font-black uppercase mt-0.5">PTS</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-black/20 p-4 text-center border-t border-white/5">
           <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em]">Session History</p>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
