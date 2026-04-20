import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const download = searchParams.get('download') === '1';

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }

  // Only allow Instagram CDN URLs
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!parsed.hostname.endsWith('cdninstagram.com') && !parsed.hostname.endsWith('instagram.com') && !parsed.hostname.endsWith('fbcdn.net')) {
    logger.warn('Proxy blocked non-Instagram URL', { url, hostname: parsed.hostname, protocol: parsed.protocol });
    return NextResponse.json({ error: `Only Instagram URLs are allowed (got ${parsed.protocol}//${parsed.hostname})` }, { status: 403 });
  }

  try {
    logger.info('Proxying URL', { url, download });

    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Origin': 'https://www.instagram.com',
        // Force full-file download — Instagram CDN serves DASH by byte-ranges;
        // without this the CDN may only return the small init segment.
        'Range': 'bytes=0-',
      },
    });

    if (!upstream.ok) {
      logger.error('Upstream fetch failed', { url, status: upstream.status });
      return NextResponse.json({ error: 'Failed to fetch resource' }, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Cache-Control', 'public, max-age=3600');

    if (download) {
      headers.set('Content-Disposition', 'attachment; filename="instagram-reel.mp4"');
    }

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    logger.error('Proxy error', { url, message: err.message });
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
