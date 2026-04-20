import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { getVideoFromUrl, extractInstagramId } from '@/lib/instagram';
import logger from '@/lib/logger';

/**
 * POST /api/download
 * Download video from Instagram reel/post URL
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Extract post ID for cache key
    const postId = extractInstagramId(url);
    if (!postId) {
      return NextResponse.json(
        { error: 'Invalid Instagram URL. Please provide a valid reel or post URL.' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `instagram:${postId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      logger.info('Cache hit', { postId, url });
      return NextResponse.json({ source: 'cache', ...cachedData });
    }

    // Fetch fresh data
    try {
      logger.info('Cache miss — fetching live', { postId, url });
      const videoData = await getVideoFromUrl(url);

      const dataToCache = {
        thumbnail: videoData.thumbnail,
        videos: videoData.videos,
        videoUrl: videoData.videoUrl,
        audioUrl: videoData.audioUrl || null,
      };
      cache.set(cacheKey, dataToCache);

      logger.info('Request completed successfully', { postId });
      return NextResponse.json({ source: 'live', ...dataToCache });
    } catch (fetchError) {
      logger.error('Video fetch failed', { url, postId, message: fetchError.message, stack: fetchError.stack });

      if (fetchError.message.includes('No video found')) {
        return NextResponse.json(
          { error: 'No video found. Make sure the URL is a video or reel post.' },
          { status: 404 }
        );
      }

      if (fetchError.message.includes('Failed to fetch')) {
        return NextResponse.json(
          { error: 'Failed to fetch post. The post may be private, deleted, or unavailable.' },
          { status: 404 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    logger.error('Unhandled API error', error);
    return NextResponse.json(
      {
        error: 'An error occurred while processing your request. Please try again.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/download
 * Return method not allowed for GET requests
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST request.' },
    { status: 405 }
  );
}
