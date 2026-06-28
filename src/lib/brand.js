export const SITE_NAME = 'DevelopmentWala.org';
export const SITE_URL = 'https://developmentwala.org';
export const SITE_TAGLINE = "India's social impact career platform";

export const DEFAULT_LOGO =
  'https://media.base44.com/images/public/69b1780f308798c9112e1851/407d68969_DevelopmentwalalogoaplatformforhiringsocialsectornonprofitngocsrjobsinternshipscholarshipinIndia.png';

export function getLogoUrl(siteSettings) {
  return siteSettings?.logo_url || DEFAULT_LOGO;
}

export function getSiteName(siteSettings) {
  return siteSettings?.site_name || SITE_NAME;
}
