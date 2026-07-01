export const SITE_NAME = 'DevelopmentWala.org';
export const SITE_URL = 'https://developmentwala.org';
export const SITE_TAGLINE = "India's social impact career platform";

export const DEFAULT_LOGO =
  '/logo.png';

export function getLogoUrl(siteSettings) {
  return siteSettings?.logo_url || DEFAULT_LOGO;
}

export function getSiteName(siteSettings) {
  return siteSettings?.site_name || SITE_NAME;
}
