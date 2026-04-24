const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://instagram-reel-downloader-gq2x.onrender.com';

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
