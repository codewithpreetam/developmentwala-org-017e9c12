import React, { useEffect } from 'react';

/**
 * @typedef {Object} SEOHeadProps
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [canonical]
 * @property {Record<string, unknown>} [job]
 * @property {Record<string, unknown>} [structuredData]
 */

/** @param {SEOHeadProps} [props] */
export default function SEOHead({ title, description, canonical, job, structuredData } = {}) {
  useEffect(() => {
    // Title
    document.title = title || 'DevelopmentWala.org — Find NGO & Social Impact Jobs in India';

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'Find NGO and social sector jobs in India on DevelopmentWala.org. Browse positions in education, health, environment, human rights, and more.';

    // OG tags
    const setMeta = (prop, content, type = 'property') => {
      let tag = document.querySelector(`meta[${type}="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(type, prop);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const pageUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : 'https://developmentwala.org');
    setMeta('og:title', title || 'DevelopmentWala.org');
    setMeta('og:description', description || 'Find NGO jobs in India');
    setMeta('og:type', job ? 'article' : 'website');
    setMeta('og:url', pageUrl);
    setMeta('og:site_name', 'DevelopmentWala.org');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title || 'DevelopmentWala.org', 'name');
    setMeta('twitter:description', description || '', 'name');

    // Canonical (self-referencing, no www to match SEOHead convention)
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageUrl);


    // Custom structured data (overrides job schema)
    if (structuredData) {
      let script = document.querySelector('#opportunity-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'opportunity-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Job schema
    if (job && !structuredData) {
      let script = document.querySelector('#job-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'job-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      const schema = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.created_date ? new Date(job.created_date).toISOString().split('T')[0] : undefined,
        validThrough: job.deadline || undefined,
        employmentType: ({ full_time: 'FULL_TIME', part_time: 'PART_TIME', contract: 'CONTRACTOR', internship: 'INTERN', volunteer: 'VOLUNTEER' })[job.job_type] || 'FULL_TIME',
        hiringOrganization: { '@type': 'Organization', name: job.organization || 'DevelopmentWala.org', sameAs: 'https://developmentwala.org' },
        jobLocation: job.location
          ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'IN' } }
          : undefined,
        jobLocationType: !job.location ? 'TELECOMMUTE' : undefined,
      };
      script.textContent = JSON.stringify(schema);
    }

    // Site schema
    let siteScript = document.querySelector('#site-schema');
    if (!siteScript) {
      siteScript = document.createElement('script');
      siteScript.id = 'site-schema';
      siteScript.type = 'application/ld+json';
      document.head.appendChild(siteScript);
      siteScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'DevelopmentWala.org',
        url: 'https://developmentwala.org',
        potentialAction: { '@type': 'SearchAction', target: 'https://developmentwala.org/jobs?q={search_term_string}', 'query-input': 'required name=search_term_string' },
      });
    }

    return () => {
      const s = document.querySelector('#job-schema');
      if (s) s.remove();
      const o = document.querySelector('#opportunity-schema');
      if (o) o.remove();
    };

  }, [title, description, canonical, job]);

  return null;
}