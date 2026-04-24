const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://instagram-reel-downloader-gq2x.onrender.com';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
