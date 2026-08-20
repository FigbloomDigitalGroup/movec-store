import { useEffect } from 'react';

const SITE_NAME = 'Movec Store';
const DEFAULT_DESCRIPTION =
  'Starlink kits, CCTV systems, and networking gear in Kenya — shop online with nationwide delivery and installation.';

interface SeoOptions {
  title: string;
  description?: string;
  /** Full page title as-is, skipping the " | Movec Store" suffix. */
  appendSiteName?: boolean;
  /** Overrides the canonical path (defaults to the current pathname, query stripped). */
  canonicalPath?: string;
}

function setMetaDescription(content: string) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'description');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/** Sets document title, meta description, and canonical link for the current page. */
export function useSeo({ title, description, appendSiteName = true, canonicalPath }: SeoOptions) {
  useEffect(() => {
    document.title = appendSiteName ? `${title} | ${SITE_NAME}` : title;
    setMetaDescription(description || DEFAULT_DESCRIPTION);
    const path = canonicalPath ?? window.location.pathname;
    setCanonical(`${window.location.origin}${path}`);
  }, [title, description, appendSiteName, canonicalPath]);
}
