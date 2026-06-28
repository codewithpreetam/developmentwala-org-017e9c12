import React from 'react';
import { X, Mail, Phone, MapPin, GraduationCap, Briefcase, Building2, Globe, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function UserProfileModal({ user, profile, onClose }) {
  if (!user) return null;

  const isEmployer = profile?.user_type === 'employer';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">User Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 bg-indigo-600">
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.full_name || '(No name)'}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isEmployer ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                {isEmployer ? 'Employer' : 'Job Seeker'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Contact Information</h4>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{user.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile?.location && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Joined: {user.created_date ? format(new Date(user.created_date), 'dd MMM yyyy') : 'Unknown'}</span>
            </div>
          </div>

          {/* Profile Details */}
          {profile && (
            <div className="space-y-3">
              {profile.summary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.summary}</p>
                </div>
              )}

              {profile.education && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Education</p>
                    <p className="text-sm text-gray-700">{profile.education}</p>
                  </div>
                </div>
              )}

              {profile.experience && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Experience</p>
                    <p className="text-sm text-gray-700">{profile.experience}</p>
                  </div>
                </div>
              )}

              {profile.skills && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                      <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile.sector_interests?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Sector Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.sector_interests.map(s => (
                      <span key={s} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {isEmployer && profile.org_name && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Organization</p>
                    <p className="text-sm text-gray-700">{profile.org_name}</p>
                  </div>
                </div>
              )}

              {profile.cv_url && (
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <Globe className="w-4 h-4" /> View CV / Resume
                </a>
              )}
            </div>
          )}

          {!profile && (
            <div className="text-center py-6 text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No profile information available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}