import React from 'react';
import { useClientId } from '../hooks/useClientId';

const REACTIONS = {
  '👍': 'thumbs up',
  '😭': 'sob',
  '🎉': 'party',
  '😐': 'neutral',
  '😠': 'angry'
};

interface ReactionsProps {
  reactions: { [clientId: string]: string };
  onToggleReaction: (emoji: string) => void;
}

export default function Reactions({ reactions, onToggleReaction }: ReactionsProps) {
  const clientId = useClientId();
  
  const reactionCounts = Object.values(reactions || {}).reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const userReaction = reactions?.[clientId];

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(REACTIONS).map(([emoji, label]) => {
        const count = reactionCounts[emoji] || 0;
        const isSelected = userReaction === emoji;
        
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
              isSelected
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={label}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}