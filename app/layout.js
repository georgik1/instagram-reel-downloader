import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://instagram-reel-downloader-gq2x.onrender.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Instagram Reel Downloader — Free, No Watermark, No Login',
    template: '%s | Instagram Reel Downloader',
  },
  description: 'Download Instagram reels and videos for free in HD quality. No watermark, no login required. Fast and private — works on any device.',
  keywords: [
    'instagram reel downloader',
    'download instagram reels',
    'instagram video downloader',
    'save instagram reels',
    'download instagram video without watermark',
    'instagram reel saver',
    'free instagram downloader',
  ],
  authors: [{ name: 'Reel Downloader' }],
  creator: 'Reel Downloader',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Instagram Reel Downloader',
    title: 'Instagram Reel Downloader — Free, No Watermark, No Login',
    description: 'Download Instagram reels and videos for free in HD quality. No watermark, no login required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Instagram Reel Downloader' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Reel Downloader — Free, No Watermark, No Login',
    description: 'Download Instagram reels and videos for free in HD quality. No watermark, no login required.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
