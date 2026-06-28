import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

export default function BookmarkButton({ isSaved, onToggle, className = '' }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      title={isSaved ? 'Remove bookmark' : 'Save for later'}
      className={`p-1.5 rounded-lg transition-all ${
        isSaved
          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
          : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50'
      } ${className}`}
    >
      {isSaved
        ? <BookmarkCheck className="w-4 h-4" />
        : <Bookmark className="w-4 h-4" />
      }
    </button>
  );
}