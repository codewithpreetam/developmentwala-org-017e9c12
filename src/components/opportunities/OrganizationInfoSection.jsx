import React, { useState } from 'react';
import { Link } from '@/lib/router-adapter';
import {
  Building2, Globe, MapPin, Mail, Info, Tag, Users,
  Linkedin, Facebook, Instagram, ExternalLink, BadgeCheck, Twitter,
} from 'lucide-react';
import { orgProfileUrl } from '@/utils/orgProfileUrl';

function prettify(value) {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function GridItem({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-gray-900 break-words">{children}</div>
      </div>
    </div>
  );
}

function SocialIcon({ href, label, children, bgClass }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm hover:scale-105 transition-transform ${bgClass}`}
    >
      {children}
    </a>
  );
}

function AboutText({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 280;
  const display = expanded || !isLong ? text : `${text.slice(0, 280).trimEnd()}…`;
  return (
    <div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function OrganizationInfoSection({ orgData, fallbackOrgName }) {
  const orgName = orgData?.org_name || orgData?.name || fallbackOrgName;
  if (!orgName) return null;

  const logo = orgData?.logo_url || orgData?.logo;
  const about = orgData?.about;
  const website = orgData?.website;
  const sector = prettify(orgData?.sector || orgData?.tags);
  const orgType = prettify(orgData?.ngo_type) || 'Organization';
  const location = orgData?.location || orgData?.city;
  const email = orgData?.contact_email || orgData?.email;
  const size = orgData?.company_size;
  const profileUrl = orgProfileUrl(orgData, orgName);

  const linkedin = orgData?.linkedin_url || orgData?.social_linkedin;
  const twitter = orgData?.twitter_url || orgData?.social_twitter;
  const facebook = orgData?.facebook_url || orgData?.social_facebook;
  const instagram = orgData?.instagram_url || orgData?.social_instagram;
  const hasSocials = linkedin || twitter || facebook || instagram;

  const websiteHref = website
    ? (website.startsWith('http') ? website : `https://${website}`)
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: orgName,
    ...(websiteHref ? { url: websiteHref } : {}),
    ...(logo ? { logo } : {}),
    ...(email ? { email } : {}),
    ...(about ? { description: about } : {}),
    ...(location ? { address: { '@type': 'PostalAddress', addressLocality: location } } : {}),
    ...(hasSocials
      ? { sameAs: [linkedin, twitter, facebook, instagram].filter(Boolean) }
      : {}),
  };

  const NameTag = profileUrl ? Link : 'span';
  const nameProps = profileUrl
    ? { to: profileUrl, className: 'text-2xl sm:text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors' }
    : { className: 'text-2xl sm:text-3xl font-bold text-gray-900' };

  return (
    <section aria-labelledby="about-the-organization" className="mt-8">
      <h2 id="about-the-organization" className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        About the Organization
      </h2>

      <article
        itemScope
        itemType="https://schema.org/Organization"
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7"
      >
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:items-start sm:gap-6">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5 col-span-2 sm:col-span-1 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt={`${orgName} logo`}
                  loading="lazy"
                  decoding="async"
                  itemProp="logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {orgName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <NameTag {...nameProps} itemProp="name">{orgName}</NameTag>
                <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-100 shrink-0" aria-label="Verified organization" />
              </div>

              <div className="mt-2 flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-gray-600">
                {orgType && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{orgType}</span>
                  </span>
                )}
                {location && (
                  <>
                    <span className="text-gray-300" aria-hidden="true">•</span>
                    <span className="inline-flex items-center gap-1.5" itemProp="address">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{location}</span>
                    </span>
                  </>
                )}
                {email && (
                  <>
                    <span className="text-gray-300" aria-hidden="true">•</span>
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-blue-600" itemProp="email">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{email}</span>
                    </a>
                  </>
                )}
              </div>

              {orgData?.tagline && (
                <p className="mt-2 text-sm text-gray-500">{orgData.tagline}</p>
              )}
            </div>
          </div>

          {websiteHref && (
            <div className="sm:ml-auto sm:shrink-0">
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                itemProp="url"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Visit Website</span>
                <span className="sm:hidden">Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <GridItem icon={Building2} label="Organization Name">{orgName}</GridItem>
          {orgType && <GridItem icon={Users} label="Organization Type">{orgType}</GridItem>}
          {location && <GridItem icon={MapPin} label="Location">{location}</GridItem>}
          {websiteHref && (
            <GridItem icon={Globe} label="Website">
              <a href={websiteHref} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all">
                {website.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </GridItem>
          )}
          {sector && <GridItem icon={Tag} label="Sector">{sector}</GridItem>}
          {email && (
            <GridItem icon={Mail} label="Contact Email">
              <a href={`mailto:${email}`} className="text-gray-900 hover:text-blue-600 break-all">{email}</a>
            </GridItem>
          )}
          {size && <GridItem icon={Users} label="Organization Size">{size}</GridItem>}
        </div>

        {about && (
          <div className="mt-6 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">About Organization</p>
              <div itemProp="description">
                <AboutText text={about} />
              </div>
            </div>
          </div>
        )}

        {hasSocials && (
          <>
            <div className="border-t border-gray-100 my-6" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Follow Us</p>
              <div className="flex items-center gap-3 flex-wrap">
                <SocialIcon href={linkedin} label="LinkedIn" bgClass="bg-[#0A66C2]">
                  <Linkedin className="w-4 h-4" />
                </SocialIcon>
                <SocialIcon href={twitter} label="X (Twitter)" bgClass="bg-black">
                  <Twitter className="w-4 h-4" />
                </SocialIcon>
                <SocialIcon href={facebook} label="Facebook" bgClass="bg-[#1877F2]">
                  <Facebook className="w-4 h-4" />
                </SocialIcon>
                <SocialIcon href={instagram} label="Instagram"
                            bgClass="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <Instagram className="w-4 h-4" />
                </SocialIcon>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-blue-700">
            Information is provided by the organization and synced across all opportunities.
          </p>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>
    </section>
  );
}
