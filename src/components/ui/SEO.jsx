import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, url }) {
  const siteName = 'Vichakra Technologies';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Tech Solutions`;
  const defaultDescription = 'Vichakra Technologies delivers end-to-end technology solutions, from web and application development to AI-driven automation, helping businesses scale efficiently.';
  const pageDescription = description || defaultDescription;
  const defaultKeywords = 'technology solutions, web development, application development, AI-driven automation, scale business efficiently, Vichakra Technologies, premium tech solutions, enterprise technology, global tech brand';
  const pageKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const canonicalUrl = url ? `https://www.vichakratechnologies.com${url}` : 'https://www.vichakratechnologies.com';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  );
}
