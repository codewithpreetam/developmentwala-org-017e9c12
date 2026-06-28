import React from 'react';
import { BRAND_GRADIENT } from '@/lib/auth/roles';
import { SITE_NAME } from '@/lib/brand';

export function AuthBrandPanel({ logoUrl, active }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 text-white"
      style={{ background: BRAND_GRADIENT }}
    >
      <div>
        <img src={logoUrl} alt={SITE_NAME} className="h-10 brightness-0 invert opacity-95 mb-10" />
        <h2 className="text-2xl font-bold leading-snug mb-3">{active.headline}</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-sm">{active.subline}</p>
      </div>
      {active.perks?.length > 0 && (
        <ul className="space-y-4 mt-10">
          {active.perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-white/80">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RoleToggle({ role, onChange, roles }) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
      {roles.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            role === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{id === 'employer' ? 'Employer' : 'Seeker'}</span>
        </button>
      ))}
    </div>
  );
}

export default function AuthShell({ logoUrl, active, children, legalNote }) {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <AuthBrandPanel logoUrl={logoUrl} active={active} />
        <div className="p-8 sm:p-10">{children}</div>
      </div>
      {legalNote && (
        <p className="text-center text-xs text-gray-400 mt-6 max-w-md mx-auto leading-relaxed">{legalNote}</p>
      )}
    </div>
  );
}
