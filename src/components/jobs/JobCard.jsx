import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, Building2, ArrowRight, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const sectorColors = {
  education: 'bg-blue-50 text-blue-700',
  health: 'bg-red-50 text-red-700',
  environment: 'bg-green-50 text-green-700',
  human_rights: 'bg-purple-50 text-purple-700',
  poverty: 'bg-orange-50 text-orange-700',
  gender_equality: 'bg-pink-50 text-pink-700',
  disaster_relief: 'bg-amber-50 text-amber-700',
  governance: 'bg-indigo-50 text-indigo-700',
  livelihood: 'bg-teal-50 text-teal-700',
  child_welfare: 'bg-cyan-50 text-cyan-700',
  water_sanitation: 'bg-sky-50 text-sky-700',
  other: 'bg-gray-50 text-gray-700',
};

const sectorLabels = {
  education: 'Education', health: 'Health', environment: 'Environment',
  human_rights: 'Human Rights', poverty: 'Poverty', gender_equality: 'Gender Equality',
  disaster_relief: 'Disaster Relief', governance: 'Governance', livelihood: 'Livelihood',
  child_welfare: 'Child Welfare', water_sanitation: 'Water & Sanitation', other: 'Other',
};

const jobTypeLabels = {
  full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract',
  internship: 'Internship', volunteer: 'Volunteer', consultant: 'Consultant',
};

export default function JobCard({ job, featured = false }) {
  const timeAgo = job.created_date
    ? formatDistanceToNow(new Date(job.created_date), { addSuffix: true })
    : '';

  return (
    <Link to={createPageUrl(`JobDetail?id=${job.id}`)}>
      <article className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group p-5 ${
        featured ? 'border-blue-200 shadow-sm' : 'border-gray-200'
      }`}>
        {featured && (
          <span className="inline-block mb-3 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            ⭐ Featured
          </span>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {job.title}
            </h3>

            {job.organization && (
              <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-sm">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{job.organization}</span>
              </div>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
        </div>

        {job.description && (
          <p className="mt-2.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {job.description.replace(/[#*_]/g, '').substring(0, 120)}...
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          {job.sector && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sectorColors[job.sector] || sectorColors.other}`}>
              {sectorLabels[job.sector] || job.sector}
            </span>
          )}
          {job.job_type && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {jobTypeLabels[job.job_type]}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {job.location && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{job.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}