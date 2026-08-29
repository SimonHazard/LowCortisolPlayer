import type { Platform } from '../settings/model';
import type { PlayerAdapter } from './player-adapter';
import { TwitchAdapter } from './twitch/twitch-adapter';
import { YouTubeAdapter } from './youtube/youtube-adapter';

export function createAdapter(platform: Platform): PlayerAdapter {
  return platform === 'youtube' ? new YouTubeAdapter() : new TwitchAdapter();
}
