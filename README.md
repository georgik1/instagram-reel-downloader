# 📸 Instagram Reel Downloader

A production-ready Instagram reel and video downloader built with Next.js 14 (App Router). Download Instagram reels and videos in high quality with a sleek, modern UI.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🚀 **Lightning Fast**: Optimized processing with in-memory caching
- 🎨 **Modern UI**: Instagram-inspired design with beautiful gradients
- 📱 **Fully Responsive**: Works seamlessly on all devices
- 🔒 **Privacy First**: No data stored, all processing happens in real-time
- 💾 **Smart Caching**: 15-minute TTL cache to reduce processing time
- 🎬 **High Quality**: Download videos in original quality with audio
- ⚡ **Real-time Processing**: Instant feedback and smooth animations
- 🎯 **Error Handling**: Comprehensive error messages and validation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Hooks
- **Caching**: In-memory Map with TTL

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Usage

1. **Copy an Instagram reel or video URL**
   - Example: `https://www.instagram.com/reel/ABC123/`
   - Or: `https://www.instagram.com/p/ABC123/`

2. **Paste into the input field**
   - Use the paste button or Ctrl+V / Cmd+V

3. **Click "Download Video"**
   - Wait for processing (usually 2-5 seconds)

4. **Download**
   - Video downloads to your device with audio

## 📁 Project Structure

```
instagram-reel-downloader/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.js          # API endpoint
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Main page
│   └── globals.css                # Global styles
├── components/
│   ├── InputForm.jsx              # URL input form
│   ├── VideoResult.jsx            # Results display
│   ├── VideoCard.jsx              # Download button
│   └── AdBanner.jsx               # Ad placements
├── lib/
│   ├── cache.js                   # Caching system
│   └── instagram.js               # Instagram API helper
└── package.json
```

## 🎨 Design

**Instagram-Inspired Theme:**
- Pink (#E1306C) - Primary accent
- Purple (#C13584) - Secondary accent
- Orange (#F77737) - Tertiary accent
- Dark backgrounds with smooth gradients
- Glassmorphism cards
- Smooth animations

## 🔧 Configuration

### Cache Settings

Edit `/lib/cache.js`:
```javascript
this.defaultTTL = 15 * 60 * 1000; // 15 minutes
```

### Theme Customization

Edit `/tailwind.config.js`:
```javascript
colors: {
  'neon-pink': '#E1306C',
  'neon-purple': '#C13584',
  // ...
}
```

## 📖 API Reference

### POST `/api/download`

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/ABC123/"
}
```

**Success Response (200):**
```json
{
  "source": "cache" | "live",
  "thumbnail": "https://...",
  "videoUrl": "https://...",
  "videos": [{
    "url": "https://...",
    "quality": "Original Quality",
    "type": "video/mp4"
  }]
}
```

## ⚠️ Important Notes

### What Works
- ✅ Public Instagram reels
- ✅ Public Instagram video posts
- ✅ Original quality with audio
- ✅ Fast caching system

### What Doesn't Work
- ❌ Private accounts (requires login)
- ❌ Stories (temporary content)
- ❌ IGTV videos (different format)
- ❌ Image-only posts

### Legal & Compliance

**This tool is for personal use only:**
- ✅ Downloading your own content
- ✅ Educational purposes
- ✅ Archiving with permission
- ❌ Redistributing copyrighted content
- ❌ Commercial use without permission

**Always respect content creators and copyright holders.**

## 🐛 Troubleshooting

### "No video found"
- Make sure the URL is a video/reel post (not image)
- Check if the post is public
- Try a different Instagram video

### "Failed to fetch post"
- Post may be private or deleted
- Instagram might be blocking requests
- Try again in a few seconds

### Download doesn't start
- Check browser's download settings
- Try different browser
- Video URL might be restricted

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Build for Production
```bash
npm run build
npm start
```

## 📊 Performance

- **Response Times**: Cache hit <50ms, miss <3s
- **Bundle Size**: ~100-150 KB first load
- **Lighthouse Score**: 90+ target

## 🤝 Contributing

Contributions welcome! This is an open-source project.

## 📄 License

For educational and personal use only. Please respect copyright and content creators.

## ⚡ Tips

- The app works best with public Instagram reels
- Cached downloads are much faster
- Works with both `/reel/` and `/p/` URLs
- Original quality includes audio

---

**Happy Downloading! 📸**
