import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import logger from '@/lib/logger';

const execFileAsync = promisify(execFile);

function isInstagramCdnUrl(url) {
  try {
    const { hostname } = new URL(url);
    return (
      hostname.endsWith('cdninstagram.com') ||
      hostname.endsWith('instagram.com') ||
      hostname.endsWith('fbcdn.net')
    );
  } catch {
    return false;
  }
}

const CDN_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: 'https://www.instagram.com/',
  Origin: 'https://www.instagram.com',
  Range: 'bytes=0-',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('videoUrl');
  const audioUrl = searchParams.get('audioUrl');

  if (!videoUrl || !audioUrl) {
    return NextResponse.json({ error: 'Missing videoUrl or audioUrl' }, { status: 400 });
  }

  if (!isInstagramCdnUrl(videoUrl) || !isInstagramCdnUrl(audioUrl)) {
    return NextResponse.json({ error: 'Only Instagram CDN URLs are allowed' }, { status: 403 });
  }

  logger.info('Merge requested', {
    video: videoUrl.substring(0, 80),
    audio: audioUrl.substring(0, 80),
  });

  let ffmpegPath;
  try {
    const mod = await import('ffmpeg-static');
    ffmpegPath = mod.default ?? mod;
  } catch {
    return NextResponse.json(
      { error: 'ffmpeg-static is not installed. Run: npm install ffmpeg-static' },
      { status: 500 }
    );
  }

  // Download video and audio concurrently
  const [videoResp, audioResp] = await Promise.all([
    fetch(videoUrl, { headers: CDN_HEADERS }),
    fetch(audioUrl, { headers: CDN_HEADERS }),
  ]);

  if (!videoResp.ok && videoResp.status !== 206) {
    logger.error('Failed to fetch video track', { status: videoResp.status });
    return NextResponse.json({ error: 'Failed to fetch video track' }, { status: 502 });
  }
  if (!audioResp.ok && audioResp.status !== 206) {
    logger.error('Failed to fetch audio track', { status: audioResp.status });
    return NextResponse.json({ error: 'Failed to fetch audio track' }, { status: 502 });
  }

  const id = randomBytes(8).toString('hex');
  const videoPath = join(tmpdir(), `ig-v-${id}.mp4`);
  const audioPath = join(tmpdir(), `ig-a-${id}.m4a`);
  const outputPath = join(tmpdir(), `ig-merged-${id}.mp4`);

  try {
    await Promise.all([
      writeFile(videoPath, Buffer.from(await videoResp.arrayBuffer())),
      writeFile(audioPath, Buffer.from(await audioResp.arrayBuffer())),
    ]);

    await execFileAsync(
      ffmpegPath,
      ['-i', videoPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'copy', '-movflags', '+faststart', '-y', outputPath],
      { timeout: 120000 }
    );

    const merged = await readFile(outputPath);
    logger.info('Merge complete', { bytes: merged.length });

    return new Response(merged, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="instagram-reel.mp4"',
        'Content-Length': String(merged.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    logger.error('Merge failed', { message: err.message });
    return NextResponse.json({ error: `Merge failed: ${err.message}` }, { status: 500 });
  } finally {
    await Promise.all([
      unlink(videoPath).catch(() => {}),
      unlink(audioPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}
