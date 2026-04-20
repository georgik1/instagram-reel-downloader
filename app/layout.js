import './globals.css'

export const metadata = {
  title: 'Instagram Reel Downloader - Download Instagram Videos & Reels',
  description: 'Fast, free, and privacy-focused Instagram reel downloader. Download Instagram videos and reels in high quality with audio.',
  keywords: 'instagram downloader, reel downloader, instagram video downloader, download instagram reels, save instagram videos',
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
