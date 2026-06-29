import React from 'react';
import { Link } from '@/lib/router-adapter';
import {
  Building2, Globe, MapPin, Users, Calendar, Mail, Phone,
  Linkedin, Twitter, Facebook, Instagram, ExternalLink, Briefcase,
} from 'lucide-react';
import { orgProfileUrl } from '@/utils/orgProfileUrl';

function prettify(value) {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function MetaRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
       className="text-sm font-medium text-gray-800 hover:text-blue-600 break-words">
      {value}
    </a>
  ) : (
    <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
  );
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
        <div className="mt-0.5">{content}</div>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon: Icon, label, color }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
      style={{ color }}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

export default function OrganizationInfoSection({ orgData, fallbackOrgName }) {
  const orgName = orgData?.org_name || orgData?.name || fallbackOrgName;
  if (!orgName) return null;

  const logo = orgData?.logo_url || orgData?.logo;
  const about = orgData?.about;
  const website = orgData?.website;
  const sector = prettify(orgData?.sector || orgData?.tags);
  const orgType = prettify(orgData?.ngo_type);
  const location = orgData?.location || orgData?.city;
  const founded = orgData?.founded;
  const size = orgData?.company_size;
  const email = orgData?.contact_email || orgData?.email;
  const phone = orgData?.phone;
  const profileUrl = orgProfileUrl(orgData, orgName);

  const linkedin = orgData?.linkedin_url || orgData?.social_linkedin;
  const twitter = orgData?.twitter_url || orgData?.social_twitter;
  const facebook = orgData?.facebook_url || orgData?.social_facebook;
  const instagram = orgData?.instagram_url || orgData?.social_instagram;

  const hasSocials = linkedin || twitter || facebook || instagram;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header banner */}
      <div className="h-20 bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500" />
      <div className="px-6 sm:px-8 pb-8 -mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt={orgName} className="w-full h-full object-contain p-1.5" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {orgName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 sm:pb-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">About the organization</p>
            <h2 className="text-2xl font-bold text-gray-900 truncate">{orgName}</h2>
            {orgData?.tagline && (
              <p className="text-sm text-gray-500 mt-1">{orgData.tagline}</p>
            )}
          </div>
          {profileUrl && (
            <Link
              to={profileUrl}
              className="self-start sm:self-end inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-colors"
            >
              View profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {about && (
          <p className="mt-6 text-gray-600 leading-relaxed whitespace-pre-line">{about}</p>
        )}

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MetaRow icon={Globe} label="Website" value={website?.replace(/^https?:\/\//, '')} href={website} />
          <MetaRow icon={Briefcase} label="Industry / Sector" value={sector} />
          <MetaRow icon={Building2} label="Organization Type" value={orgType} />
          <MetaRow icon={MapPin} label="Headquarters" value={location} />
          <MetaRow icon={Calendar} label="Year Established" value={founded} />
          <MetaRow icon={Users} label="Organization Size" value={size} />
          <MetaRow icon={Mail} label="Email" value={email} href={email ? `mailto:${email}` : null} />
          <MetaRow icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone}` : null} />
        </div>

        {hasSocials && (
          <div className="mt-7 pt-6 border-t border-gray-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Connect</p>
            <div className="flex items-center gap-2 flex-wrap">
              <SocialIcon href={linkedin} icon={Linkedin} label="LinkedIn" color="#0A66C2" />
              <SocialIcon href={twitter} icon={Twitter} label="Twitter / X" color="#1DA1F2" />
              <SocialIcon href={facebook} icon={Facebook} label="Facebook" color="#1877F2" />
              <SocialIcon href={instagram} icon={Instagram} label="Instagram" color="#E4405F" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
