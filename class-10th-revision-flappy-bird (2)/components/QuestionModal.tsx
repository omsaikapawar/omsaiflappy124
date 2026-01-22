
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionModalProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(idx === question.correctIndex);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300 border-b-8 border-slate-200">
        {/* Header */}
        <div className="bg-indigo-600 p-5 sm:p-6 text-white shrink-0">
          <div className="flex justify-between items-center mb-3">
             <span className="px-3 py-1 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider">{question.subject}</span>
             <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/20 ${
               question.difficulty === 'Hard' ? 'bg-red-500' : question.difficulty === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
             }`}>
               {question.difficulty} Mode
             </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">REVIVAL CHALLENGE</h2>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <p className="text-lg sm:text-xl text-slate-800 font-bold mb-6 leading-snug">{question.text}</p>
          
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {question.options.map((opt, idx) => {
              let style = "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200";
              if (showFeedback) {
                if (idx === question.correctIndex) {
                  style = "bg-green-50 border-green-500 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                } else if (idx === selected) {
                  style = "bg-red-50 border-red-500 text-red-700";
                } else {
                  style = "opacity-40 border-slate-100";
                }
              } else if (selected === idx) {
                style = "bg-indigo-50 border-indigo-500 text-indigo-700";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSubmit(idx)}
                  disabled={showFeedback}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 font-bold transition-all flex items-center gap-3 sm:gap-4 active:scale-[0.98] ${style}`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 ${
                    showFeedback && idx === question.correctIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className={`p-5 sm:p-6 border-t-4 shrink-0 animate-in slide-in-from-bottom-5 ${selected === question.correctIndex ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected === question.correctIndex ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                 {selected === question.correctIndex ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                 ) : (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                 )}
               </div>
               <div>
                  <h4 className={`font-black text-sm uppercase tracking-widest ${selected === question.correctIndex ? 'text-green-700' : 'text-red-700'}`}>
                    {selected === question.correctIndex ? 'CORRECT! Keep Flying' : 'WRONG! Score Reset'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{question.explanation}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;
