import { isSupportedPlayerPage } from '../detect';
import type { PlayerAdapter } from '../player-adapter';
import { queryFirst } from '../player-adapter';
import { TWITCH_SELECTORS } from './selectors';

export class TwitchAdapter implements PlayerAdapter {
  readonly platform = 'twitch' as const;

  isSupportedPage(): boolean {
    return isSupportedPlayerPage(window.location.href);
  }

  getTitle(): string | null {
    const title = queryFirst<HTMLElement>(TWITCH_SELECTORS.title)?.textContent?.trim();
    return title || document.title.replace(/\s*-\s*Twitch\s*$/i, '').trim() || null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return queryFirst<HTMLVideoElement>(TWITCH_SELECTORS.video);
  }

  getPlayerContainer(): HTMLElement | null {
    return queryFirst<HTMLElement>(TWITCH_SELECTORS.player);
  }

  getCommentsContainer(): HTMLElement | null {
    return null;
  }

  getObservationRoot(): HTMLElement {
    return queryFirst<HTMLElement>(TWITCH_SELECTORS.app) ?? document.body;
  }
}
