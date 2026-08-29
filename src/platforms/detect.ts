import type { Platform } from '../settings/model';

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const TWITCH_HOSTS = new Set(['twitch.tv', 'www.twitch.tv']);
const TWITCH_NON_CHANNEL_ROUTES = new Set([
  '',
  'directory',
  'downloads',
  'inventory',
  'jobs',
  'login',
  'messages',
  'p',
  'search',
  'settings',
  'signup',
  'subscriptions',
  'turbo',
  'wallet',
]);

export function detectPlatform(input: string | URL): Platform | null {
  let url: URL;
  try {
    url = input instanceof URL ? input : new URL(input);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(hostname)) return 'youtube';
  if (TWITCH_HOSTS.has(hostname)) return 'twitch';
  return null;
}

export function isSupportedPlayerPage(input: string | URL): boolean {
  let url: URL;
  try {
    url = input instanceof URL ? input : new URL(input);
  } catch {
    return false;
  }

  const platform = detectPlatform(url);
  if (platform === 'youtube') {
    return url.pathname === '/watch' || url.pathname.startsWith('/live/');
  }

  if (platform === 'twitch') {
    const firstSegment = url.pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
    return !TWITCH_NON_CHANNEL_ROUTES.has(firstSegment);
  }

  return false;
}
