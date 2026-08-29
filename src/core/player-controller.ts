import { AmbientMode } from '../features/ambient-mode/ambient-mode';
import { PageAppearance } from '../features/appearance/page-appearance';
import { QuietChrome } from '../features/quiet-chrome/quiet-chrome';
import { createAdapter } from '../platforms/create-adapter';
import { detectPlatform } from '../platforms/detect';
import type { PlayerAdapter } from '../platforms/player-adapter';
import { type LowCortisolSettings, normalizeSettings } from '../settings/model';

const REFRESH_DELAY_MS = 140;

export class PlayerController {
  readonly #ambientMode = new AmbientMode();
  readonly #appearance = new PageAppearance();
  readonly #quietChrome = new QuietChrome();
  #adapter: PlayerAdapter | null = null;
  #observer: MutationObserver | null = null;
  #observedTarget: HTMLElement | null = null;
  #refreshTimeoutId: number | null = null;
  #settings: LowCortisolSettings;

  constructor(settings: LowCortisolSettings) {
    this.#settings = normalizeSettings(settings);
  }

  start(): void {
    this.refresh();
  }

  updateSettings(settings: LowCortisolSettings): void {
    this.#settings = normalizeSettings(settings);
    this.refresh();
  }

  handleNavigation(): void {
    this.#destroyAdapter();
    this.refresh();
  }

  refresh(): void {
    this.#cancelScheduledRefresh();
    if (!this.#settings.enabled) {
      this.#deactivateFeatures();
      this.#disconnectObserver();
      return;
    }

    const platform = detectPlatform(window.location.href);
    if (!platform) {
      this.#destroyAdapter();
      return;
    }

    if (!this.#adapter || this.#adapter.platform !== platform) {
      this.#destroyAdapter();
      this.#adapter = createAdapter(platform);
    }

    if (!this.#adapter.isSupportedPage()) {
      this.#deactivateFeatures();
      this.#disconnectObserver();
      return;
    }

    this.#appearance.apply(this.#adapter);
    this.#quietChrome.apply(this.#adapter);
    const video = this.#adapter.getVideoElement();
    const player = this.#adapter.getPlayerContainer();
    if (video && player) {
      if (this.#adapter.platform === 'twitch') {
        this.#ambientMode.mount(video, player);
      } else {
        this.#ambientMode.destroy();
      }
    } else {
      this.#ambientMode.destroy();
    }

    this.#observePlayerLifecycle(player);
  }

  destroy(): void {
    this.#cancelScheduledRefresh();
    this.#destroyAdapter();
  }

  #scheduleRefresh = (): void => {
    if (this.#refreshTimeoutId !== null) return;
    this.#refreshTimeoutId = window.setTimeout(() => {
      this.#refreshTimeoutId = null;
      this.refresh();
    }, REFRESH_DELAY_MS);
  };

  #observePlayerLifecycle(player: HTMLElement | null): void {
    const target = player?.parentElement ?? this.#adapter?.getObservationRoot() ?? null;
    if (!target || target === this.#observedTarget) return;

    this.#disconnectObserver();
    this.#observedTarget = target;
    this.#observer = new MutationObserver((records) => {
      if (!player) {
        this.#scheduleRefresh();
        return;
      }

      const videoChanged = records.some((record) =>
        [...record.addedNodes, ...record.removedNodes].some(
          (node) =>
            node instanceof HTMLVideoElement ||
            (node instanceof Element && node.querySelector('video') !== null),
        ),
      );
      if (!player.isConnected || videoChanged) this.#scheduleRefresh();
    });
    this.#observer.observe(target, { childList: true, subtree: true });
  }

  #deactivateFeatures(): void {
    this.#ambientMode.destroy();
    this.#quietChrome.destroy();
    this.#appearance.destroy();
  }

  #destroyAdapter(): void {
    this.#disconnectObserver();
    this.#deactivateFeatures();
    this.#adapter = null;
  }

  #disconnectObserver(): void {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#observedTarget = null;
  }

  #cancelScheduledRefresh(): void {
    if (this.#refreshTimeoutId === null) return;
    window.clearTimeout(this.#refreshTimeoutId);
    this.#refreshTimeoutId = null;
  }
}
