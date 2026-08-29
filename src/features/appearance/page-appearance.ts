import type { PlayerAdapter } from '../../platforms/player-adapter';

const ROOT_CLASSES = [
  'lcp-enabled',
  'lcp-focus',
  'lcp-soft',
  'lcp-cleanup',
  'lcp-youtube-hide-recommendations',
  'lcp-youtube-hide-comments',
  'lcp-youtube-hide-shorts',
  'lcp-twitch-hide-sidebar',
  'lcp-twitch-chat-panel',
] as const;

export class PageAppearance {
  #player: HTMLElement | null = null;
  #playerHost: HTMLElement | null = null;

  apply(adapter: PlayerAdapter): void {
    this.#clearPlayerAttributes();

    const root = document.documentElement;
    root.dataset.lcpPlatform = adapter.platform;
    root.dataset.lcpTheme = 'solarized';
    root.classList.add('lcp-enabled', 'lcp-focus', 'lcp-soft', 'lcp-cleanup');
    root.classList.toggle('lcp-youtube-hide-recommendations', adapter.platform === 'youtube');
    root.classList.toggle('lcp-youtube-hide-comments', adapter.platform === 'youtube');
    root.classList.toggle('lcp-youtube-hide-shorts', adapter.platform === 'youtube');
    root.classList.toggle('lcp-twitch-hide-sidebar', adapter.platform === 'twitch');
    root.classList.toggle('lcp-twitch-chat-panel', adapter.platform === 'twitch');
    root.style.setProperty('--lcp-player-radius', '16px');
    root.style.setProperty('--lcp-ambient-intensity', '0.42');

    this.#player = adapter.getPlayerContainer();
    this.#playerHost = this.#player?.parentElement ?? null;
    this.#player?.setAttribute('data-lcp-player', '');
    this.#playerHost?.setAttribute('data-lcp-player-host', '');
  }

  destroy(): void {
    this.#clearPlayerAttributes();
    const root = document.documentElement;
    root.classList.remove(...ROOT_CLASSES);
    delete root.dataset.lcpPlatform;
    delete root.dataset.lcpTheme;
    root.style.removeProperty('--lcp-player-radius');
    root.style.removeProperty('--lcp-ambient-intensity');
  }

  #clearPlayerAttributes(): void {
    this.#player?.removeAttribute('data-lcp-player');
    this.#playerHost?.removeAttribute('data-lcp-player-host');
    this.#player = null;
    this.#playerHost = null;
  }
}
