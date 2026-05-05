import { useState } from 'react';
import { MoodType } from '@/types/decision';

interface MoodSelectorProps {
  value?: MoodType;
  onChange: (mood: MoodType) => void;
}

const moodOptions: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: 'confident', emoji: '💪', label: 'Confident', color: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30' },
  { value: 'hopeful', emoji: '✨', label: 'Hopeful', color: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30' },
  { value: 'excited', emoji: '🎉', label: 'Excited', color: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30' },
  { value: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30' },
  { value: 'uncertain', emoji: '🤔', label: 'Uncertain', color: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' },
  { value: 'stressed', emoji: '😫', label: 'Stressed', color: 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30' },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMood = moodOptions.find(m => m.value === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/80 mb-2">
        How are you feeling about this decision?
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-left flex items-center gap-3 hover:bg-white/15 transition-colors"
      >
        {selectedMood ? (
          <>
            <span className="text-2xl">{selectedMood.emoji}</span>
            <span className="text-white">{selectedMood.label}</span>
          </>
        ) : (
          <span className="text-white/50">Select your mood (optional)</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#1a1438] border border-white/20 rounded-lg shadow-xl p-3 grid grid-cols-4 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => {
                onChange(mood.value);
                setIsOpen(false);
              }}
              className={`p-3 rounded-lg border ${mood.color} transition-all flex flex-col items-center gap-1 ${
                value === mood.value ? 'ring-2 ring-white' : ''
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs text-white/80">{mood.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
