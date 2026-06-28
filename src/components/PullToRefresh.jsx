import React, { useState, useRef } from 'react';
import { RotateCw } from 'lucide-react';

const THRESHOLD = 65;

export default function PullToRefresh({ children, onRefresh }) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const onTouchStart = (e) => {
    if (window.scrollY > 2) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 2) {
      pulling.current = true;
      setDistance(Math.min(dy * 0.45, THRESHOLD + 20));
    }
  };

  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (distance >= THRESHOLD) {
      setRefreshing(true);
      setDistance(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setDistance(0);
    startY.current = null;
  };

  const progress = Math.min(distance / THRESHOLD, 1);
  const show = distance > 8 || refreshing;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-150"
        style={{ height: show ? `${Math.max(distance, refreshing ? THRESHOLD : 0)}px` : 0 }}
      >
        <div
          className={`w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: refreshing ? undefined : `rotate(${progress * 270}deg)`, opacity: Math.max(progress, 0.3) }}
        >
          <RotateCw className="w-4 h-4 text-indigo-500" />
        </div>
      </div>
      {children}
    </div>
  );
}