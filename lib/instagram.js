import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';

// Hardcoded session cookies — replace if they expire
const COOKIE_FILE = `
.instagram.com	TRUE	/	TRUE	1783722484	ds_user_id	2986323391
.instagram.com	TRUE	/	TRUE	1800086922	ig_did	2EDD487B-C1F7-4230-97B1-062E398798D7
.instagram.com	TRUE	/	TRUE	1810506484	csrftoken	ytW68-NcmHCHyGtRWlI1ny
.instagram.com	TRUE	/	TRUE	1805026017	mid	aYcq4AALAAEXQ3hEtlvw-noS9hyO
.instagram.com	TRUE	/	TRUE	1807481002	sessionid	2986323391%3ATlgvP52rMCRzaF%3A15%3AAYjMYkhNspSq6fYL0wEFjtyBl6xy6CqZnbfVATMflgs
.instagram.com	TRUE	/	TRUE	1776551280	wd	2560x1289
.instagram.com	TRUE	/	TRUE	0	rur	"RVA\\0542986323391\\0541807482486:01feb92abb8dbd084d8d9c7ccd56bdb7c8491cc4b3173a40658faebb0afadb026a862221"
`;

function parseNetscapeCookies(cookieString) {
  const cookies = [];
  for (const line of cookieString.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 7) continue;
    cookies.push({
      domain: parts[0],
      httpOnly: parts[1] === 'TRUE',
      path: parts[2],
      secure: parts[3] === 'TRUE',
      expires: Number(parts[4]),
      name: parts[5],
      value: parts[6].trim(),
    });
  }
  return cookies;
}

function isRealHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://');
}

function saveDebugHtml(postId, html) {
  try {
    const dir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `debug-${postId}.html`), html, 'utf8');
    logger.info('Debug HTML saved', { file: `logs/debug-${postId}.html` });
  } catch (_) {}
}

// Parse Instagram's DASH manifest XML to extract video and audio BaseURLs.
// Instagram uses MPEG-DASH on-demand profile with separate video and audio AdaptationSets.
// Each Representation has a BaseURL pointing to a complete single-file MP4 (not segments).
function parseDashManifest(manifestXml) {
  const result = { videoUrl: null, audioUrl: null, videoBandwidth: 0 };
  try {
    // Match all <Representation> blocks including their BaseURL child
    const repRegex = /<Representation\b([^>]*)>([\s\S]*?)<\/Representation>/g;
    let m;
    while ((m = repRegex.exec(manifestXml)) !== null) {
      const attrs = m[1];
      const body = m[2];
      const baseUrlMatch = body.match(/<BaseURL>([^<]+)<\/BaseURL>/);
      if (!baseUrlMatch) continue;
      // Decode XML/HTML entities — BaseURL text content uses &amp; for &
      const url = baseUrlMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (!isRealHttpsUrl(url)) continue;

      const mimeMatch = attrs.match(/mimeType="([^"]+)"/);
      const bwMatch = attrs.match(/bandwidth="(\d+)"/);
      const mime = mimeMatch ? mimeMatch[1] : '';
      const bw = bwMatch ? parseInt(bwMatch[1], 10) : 0;

      if (mime.startsWith('audio/')) {
        if (!result.audioUrl) result.audioUrl = url;
      } else if (mime.startsWith('video/') || mime === 'application/mp4') {
        // Keep the highest-bandwidth video representation
        if (bw > result.videoBandwidth) {
          result.videoBandwidth = bw;
          result.videoUrl = url;
        }
      }
    }
  } catch (_) {}
  return result;
}

export function extractInstagramId(url) {
  const patterns = [
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function getVideoFromUrl(url) {
  const postId = extractInstagramId(url);
  if (!postId) throw new Error('Invalid Instagram URL');

  logger.info('Fetching Instagram post', { postId, url });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    await context.addCookies(parseNetscapeCookies(COOKIE_FILE));

    const page = await context.newPage();

    // ── Strategy 1a/b: JSON API response interception ──────────────────────
    // Catches responses from older Instagram API (/api/v1/media/info) or GraphQL
    let interceptedVideoUrl = null;
    let interceptedThumbnail = null;

    page.on('response', async (response) => {
      if (interceptedVideoUrl) return;
      const responseUrl = response.url();
      const ct = response.headers()['content-type'] || '';

      if (ct.includes('application/json') && responseUrl.includes('instagram.com')) {
        try {
          const json = await response.json();
          const item = json?.items?.[0];
          if (item?.video_versions?.[0]?.url) {
            interceptedVideoUrl = item.video_versions[0].url;
            interceptedThumbnail = item.image_versions2?.candidates?.[0]?.url || null;
            logger.info('Strategy 1a: API v1 JSON', { postId, url: interceptedVideoUrl.substring(0, 80) });
            return;
          }
          const xdt = json?.data?.xdt_shortcode_v2 || json?.data?.shortcode_media;
          if (xdt?.video_url) {
            interceptedVideoUrl = xdt.video_url;
            interceptedThumbnail = xdt.display_url || null;
            logger.info('Strategy 1b: GraphQL JSON', { postId });
          }
        } catch (_) {}
      }
    });

    const targetUrl = `https://www.instagram.com/reel/${postId}/`;
    await page.goto(targetUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);

    // ── Strategy 2: Parse DASH manifest embedded in page HTML ──────────────
    // Instagram embeds "video_dash_manifest" JSON field in the page HTML.
    // The DASH manifest contains separate video and audio AdaptationSets.
    // We extract the highest-quality video BaseURL and the audio BaseURL.
    const html = await page.content();
    saveDebugHtml(postId, html);

    let dashVideoUrl = null;
    let dashAudioUrl = null;
    let htmlThumbnail = null;

    if (!interceptedVideoUrl) {
      // The manifest value is a JSON string: "video_dash_manifest":"<?xml..."
      const dashMatch = html.match(/"video_dash_manifest"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      if (dashMatch) {
        try {
          // The captured group is a JSON-encoded string; parse it to get raw XML
          const manifestXml = JSON.parse('"' + dashMatch[1] + '"');
          const parsed = parseDashManifest(manifestXml);
          if (parsed.videoUrl) {
            dashVideoUrl = parsed.videoUrl;
            dashAudioUrl = parsed.audioUrl;
            logger.info('Strategy 2: DASH manifest', {
              postId,
              bandwidth: parsed.videoBandwidth,
              hasAudio: !!parsed.audioUrl,
              videoUrl: parsed.videoUrl.substring(0, 80),
            });
          }
        } catch (e) {
          logger.warn('Strategy 2: DASH manifest parse failed', { postId, error: e.message });
        }
      }

      // Extract thumbnail from page HTML
      const thumbPatterns = [
        /"display_url"\s*:\s*"(https:[^"]+)"/,
        /"thumbnail_src"\s*:\s*"(https:[^"]+)"/,
      ];
      for (const pattern of thumbPatterns) {
        const match = html.match(pattern);
        if (match) {
          const candidate = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '"');
          if (isRealHttpsUrl(candidate)) { htmlThumbnail = candidate; break; }
        }
      }
    }

    // ── Strategy 3: OG meta tags ────────────────────────────────────────────
    const ogData = await page.evaluate(() => ({
      video:
        document.querySelector('meta[property="og:video:secure_url"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:video"]')?.getAttribute('content') ||
        null,
      thumbnail:
        document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
    }));
    if (ogData.video) logger.info('Strategy 3: OG meta video', { postId });

    // ── Strategy 4: DOM <video> src — real https only, never blob:// ────────
    const domVideoUrl = await page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) return null;
      const src = v.src || v.querySelector('source')?.src || null;
      return src && src.startsWith('https://') ? src : null;
    });
    if (domVideoUrl) logger.info('Strategy 4: DOM video src', { postId, url: domVideoUrl.substring(0, 80) });

    await browser.close();
    browser = null;

    const videoUrl = interceptedVideoUrl || dashVideoUrl || ogData.video || domVideoUrl;
    const audioUrl = dashAudioUrl || null;
    const thumbnail = interceptedThumbnail || htmlThumbnail || ogData.thumbnail || null;

    logger.info('Strategy results', {
      postId,
      s1_api: interceptedVideoUrl ? interceptedVideoUrl.substring(0, 60) : null,
      s2_dash: dashVideoUrl ? dashVideoUrl.substring(0, 60) : null,
      s2_audio: dashAudioUrl ? dashAudioUrl.substring(0, 60) : null,
      s3_og: ogData.video ? ogData.video.substring(0, 60) : null,
      s4_dom: domVideoUrl ? domVideoUrl.substring(0, 60) : null,
      chosen: videoUrl ? videoUrl.substring(0, 60) : null,
    });

    if (!videoUrl) {
      logger.error('All strategies failed — debug HTML saved', { postId, debugFile: `logs/debug-${postId}.html` });
      throw new Error('Could not extract video URL from Instagram page');
    }

    logger.info('Successfully extracted video', { postId });

    // Build video options: if we got separate audio track, expose it as a second option
    const videos = [{ url: videoUrl, quality: 'Video Track (no audio)', type: 'video/mp4' }];
    if (audioUrl) {
      videos.push({ url: audioUrl, quality: 'Audio Track', type: 'audio/mp4' });
    }

    // If API returned a muxed URL (strategy 1a/1b), override quality label
    if (interceptedVideoUrl) {
      videos[0].quality = 'Original Quality';
      videos.splice(1); // drop audio-only entry if we have a muxed file
    }

    return { videoUrl, audioUrl, thumbnail, videos };
  } catch (err) {
    if (browser) await browser.close();
    logger.error('getVideoFromUrl failed', { postId, message: err.message });
    throw new Error(`Error fetching Instagram data: ${err.message}`);
  }
}
