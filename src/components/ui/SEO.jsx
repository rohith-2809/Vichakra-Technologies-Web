import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, url, image }) {
  const siteName = 'Vichakra Technologies';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Tech Solutions`;
  const defaultDescription = 'Vichakra Technologies delivers end-to-end technology solutions, from web and application development to AI-driven automation, helping businesses scale efficiently.';
  const pageDescription = description || defaultDescription;
  const defaultKeywords = 'technology solutions, web development, application development, AI-driven automation, scale business efficiently, Vichakra Technologies, premium tech solutions, enterprise technology, global tech brand';
  const pageKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const canonicalUrl = url ? `https://www.vichakratechnologies.com${url}` : 'https://www.vichakratechnologies.com';
  const ogImage = image || 'https://www.vichakratechnologies.com/logo.jpeg';

  // Structured Data (JSON-LD)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vichakra Technologies",
    "alternateName": "Vichakra",
    "url": "https://www.vichakratechnologies.com",
    "logo": "https://www.vichakratechnologies.com/logo.png",
    "sameAs": [], // Add social links here if available
    "description": defaultDescription,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@vichakratechnologies.com",
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vichakra Technologies",
    "url": "https://www.vichakratechnologies.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.vichakratechnologies.com/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="author" content={siteName} />
      
      {/* Crawling Control */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
}
