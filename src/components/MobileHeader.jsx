import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MobileHeader({ title }) {
  const navigate = useNavigate();
  return (
    <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 px-3 py-2 flex items-center gap-2 sticky top-0 z-40">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0 -ml-1"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {title && (
        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
      )}
    </div>
  );
}