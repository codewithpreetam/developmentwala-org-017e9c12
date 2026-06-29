import React from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { opportunityDetailUrl } from '@/utils/opportunityUrl';
import { MapPin, Clock, Building2, ArrowRight, Calendar, Star, Globe, IndianRupee, GraduationCap, Users } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import { formatDistanceToNow, format, isPast } from 'date-fns';

export const typeColors = {
  job: 'bg-blue-50 text-blue-700',
  internship: 'bg-purple-50 text-purple-700',
  fellowship: 'bg-indigo-50 text-indigo-700',
  scholarship: 'bg-yellow-50 text-yellow-700',
  grant: 'bg-green-50 text-green-700',
  event: 'bg-pink-50 text-pink-700',
};

export const typeLabels = {
  job: 'Job', internship: 'Internship', fellowship: 'Fellowship',
  scholarship: 'Scholarship', grant: 'Grant', event: 'Event',
};

export const sectorLabels = {
  education: 'Education', health: 'Health', environment: 'Environment',
  human_rights: 'Human Rights', poverty: 'Poverty', gender_equality: 'Gender Equality',
  disaster_relief: 'Disaster Relief', governance: 'Governance', livelihood: 'Livelihood',
  child_welfare: 'Child Welfare', water_sanitation: 'Water & Sanitation',
  climate: 'Climate', livelihoods: 'Livelihoods', other: 'Other',
};

const fundingTypeLabels = {
  fully_funded: 'Fully Funded', partially_funded: 'Partially Funded',
  stipend: 'Stipend', unpaid: 'Unpaid', paid: 'Paid',
};

const locationTypeLabels = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

export default function OpportunityCard({ opportunity, compact = false, isSaved = false, onToggleSave = null }) {
  const timeAgo = opportunity.created_date
    ? formatDistanceToNow(new Date(opportunity.created_date), { addSuffix: true })
    : '';
  const type = opportunity.opportunity_type || 'job';
  const detailHref = opportunityDetailUrl(opportunity, type);
  const deadline = opportunity.deadline || opportunity.event_date || opportunity.application_deadline;
  const isDeadlineSoon = deadline && !isPast(new Date(deadline)) &&
    (new Date(deadline) - new Date()) < 7 * 24 * 60 * 60 * 1000;

  const orgName = opportunity.organization || opportunity.funding_agency || opportunity.organizer;
  const bannerImage = opportunity.banner_image
    || (type === 'event' ? (opportunity.poster_url || opportunity.logo_url) : null);

  const showImageSection = !['internship', 'fellowship'].includes(type) && (opportunity.banner_image || type === 'event');

  return (
    <Link to={detailHref}>
      <article className={`bg-white rounded-xl border hover:shadow-md transition-all duration-200 group h-full flex flex-col overflow-hidden ${opportunity.featured ? 'border-yellow-300 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
        {showImageSection && (
          <>
            {opportunity.banner_image ? (
              <div className="w-full aspect-video overflow-hidden shrink-0 bg-gray-50">
                <img
                  src={bannerImage}
                  alt={opportunity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shrink-0">
                <Calendar className="w-10 h-10 text-pink-400" />
              </div>
            )}
          </>
        )}

        <div className="p-5 flex flex-col flex-1">
        {opportunity.featured && (
          <div className="flex items-center gap-1 mb-2.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600">Featured</span>
          </div>
        )}

        {/* Logo (non-event or when no banner) */}
        {opportunity.logo_url && !bannerImage && type !== 'event' && (
          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden mb-3 flex items-center justify-center bg-gray-50 shrink-0">
            <img src={opportunity.logo_url} alt={orgName} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-2.5 flex-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {opportunity.title}
            </h3>
            {orgName && (
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{orgName}</span>
              </div>
            )}
            {opportunity.submitted_by_name && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                Posted by {opportunity.submitted_by_name}
                {opportunity.posted_by_designation ? ` · ${opportunity.posted_by_designation}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSave && <BookmarkButton isSaved={isSaved} onToggle={onToggleSave} />}
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {!compact && opportunity.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {opportunity.description.replace(/[#*_[\]]/g, '').substring(0, 120)}...
          </p>
        )}

        {/* Type-specific metadata badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[type] || typeColors.job}`}>
            {typeLabels[type]}
          </span>
          {opportunity.sector && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {sectorLabels[opportunity.sector] || opportunity.sector}
            </span>
          )}
          {opportunity.funding_type && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {fundingTypeLabels[opportunity.funding_type] || opportunity.funding_type}
            </span>
          )}
          {opportunity.location_type && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
              {locationTypeLabels[opportunity.location_type]}
            </span>
          )}
          {opportunity.scholarship_level && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {opportunity.scholarship_level.charAt(0).toUpperCase() + opportunity.scholarship_level.slice(1)}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {opportunity.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opportunity.location}</span>
            )}
            {opportunity.country && !opportunity.location && (
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{opportunity.country}</span>
            )}
            {type === 'event' && opportunity.event_date && (
              <span className="flex items-center gap-1 text-pink-500 font-medium">
                <Calendar className="w-3 h-3" />{format(new Date(opportunity.event_date), 'dd MMM yyyy')}
              </span>
            )}
            {opportunity.duration && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opportunity.duration}</span>
            )}
            {(type === 'grant' || type === 'scholarship' || type === 'fellowship') && (opportunity.grant_amount || opportunity.stipend_amount || opportunity.salary) && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <IndianRupee className="w-3 h-3" />{opportunity.grant_amount || opportunity.stipend_amount || opportunity.salary}
              </span>
            )}
          </div>
          {deadline && !isPast(new Date(deadline)) && (
            <span className={`flex items-center gap-1 font-medium ${isDeadlineSoon ? 'text-red-500' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3" />
              {isDeadlineSoon ? 'Closes soon' : `Due ${format(new Date(deadline), 'dd MMM')}`}
            </span>
          )}
          {!deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>}
        </div>
        </div>
      </article>
    </Link>
  );
}