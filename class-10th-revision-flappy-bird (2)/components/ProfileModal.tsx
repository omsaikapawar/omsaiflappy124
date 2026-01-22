
import React, { useState } from 'react';
import { Profile } from '../types';

interface ProfileModalProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
  onClose: () => void;
}

const BIRD_COLORS = [
  { name: 'Classic Yellow', value: '#fde047' },
  { name: 'Sky Blue', value: '#38bdf8' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Ruby Red', value: '#ef4444' },
  { name: 'Royal Purple', value: '#a855f7' },
  { name: 'Pink Frost', value: '#f472b6' },
];

const AVATARS = ['🐤', '🐦', '🦅', '🦉', '🦜', '🦇', '🦋'];

const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onUpdate, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [selectedColor, setSelectedColor] = useState(profile.birdColor);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const handleSave = () => {
    onUpdate({
      name: name.trim() || 'New Pilot',
      birdColor: selectedColor,
      avatar: selectedAvatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-b-8 border-slate-200">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black game-font italic">PILOT PROFILE</h2>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">Identity & Style</p>
          </div>
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg border-4 border-white/20 transition-all duration-500"
            style={{ backgroundColor: selectedColor }}
          >
            {selectedAvatar}
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Pilot Callsign</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
              placeholder="Enter your name..."
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Bird Hue</label>
            <div className="grid grid-cols-3 gap-3">
              {BIRD_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`h-12 rounded-2xl border-4 transition-all flex items-center justify-center ${
                    selectedColor === c.value ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {selectedColor === c.value && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-black mb-3 uppercase tracking-widest text-[10px]">Spirit Animal</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAvatar(a)}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === a ? 'bg-indigo-50 border-2 border-indigo-500 scale-110' : 'bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-3xl font-black text-lg hover:bg-slate-300 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
