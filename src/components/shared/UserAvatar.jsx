import React, { useState } from 'react';
import { User } from 'lucide-react';

const SIZE_PRESETS = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

/**
 * Renders a user's profile picture with graceful fallback to initials.
 * Looks at common fields: profile_image, profile_picture, profile_picture_url, avatar_url.
 */
export default function UserAvatar({
  user,
  profile,
  size = 'sm',
  className = '',
  background = '#1f2937',
  showIcon = false,
}) {
  const [errored, setErrored] = useState(false);

  const src =
    user?.profile_image ||
    user?.profile_picture ||
    user?.profile_picture_url ||
    user?.avatar_url ||
    profile?.profile_picture_url ||
    profile?.profile_picture ||
    profile?.profile_image ||
    profile?.avatar_url ||
    null;

  const name = user?.full_name || user?.first_name || user?.email || '';
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const sizeClasses = SIZE_PRESETS[size] || SIZE_PRESETS.sm;

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name ? `${name} profile picture` : 'Profile picture'}
        onError={() => setErrored(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 bg-gray-100 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ background }}
      aria-label={name ? `${name} profile placeholder` : 'Profile placeholder'}
    >
      {showIcon ? <User className="w-1/2 h-1/2" /> : initial}
    </div>
  );
}
