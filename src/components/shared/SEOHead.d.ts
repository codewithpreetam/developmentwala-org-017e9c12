import * as React from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  job?: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
}

declare const SEOHead: React.FC<SEOHeadProps>;
export default SEOHead;
