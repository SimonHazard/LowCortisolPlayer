import { isSupportedPlayerPage } from '../detect';
import type { PlayerAdapter } from '../player-adapter';
import { queryFirst } from '../player-adapter';
import { YOUTUBE_SELECTORS } from './selectors';

export class YouTubeAdapter implements PlayerAdapter {
  readonly platform = 'youtube' as const;

  isSupportedPage(): boolean {
    return isSupportedPlayerPage(window.location.href);
  }

  getTitle(): string | null {
    const title = queryFirst<HTMLElement>(YOUTUBE_SELECTORS.title)?.textContent?.trim();
    return title || document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim() || null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return queryFirst<HTMLVideoElement>(YOUTUBE_SELECTORS.video);
  }

  getPlayerContainer(): HTMLElement | null {
    return queryFirst<HTMLElement>(YOUTUBE_SELECTORS.player);
  }

  getCommentsContainer(): HTMLElement | null {
    return queryFirst<HTMLElement>(YOUTUBE_SELECTORS.comments);
  }

  getObservationRoot(): HTMLElement {
    return queryFirst<HTMLElement>(YOUTUBE_SELECTORS.app) ?? document.body;
  }
}
