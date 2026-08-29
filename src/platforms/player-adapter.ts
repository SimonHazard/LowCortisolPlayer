import type { Platform } from '../settings/model';

export interface PlayerAdapter {
  readonly platform: Platform;

  isSupportedPage(): boolean;
  getTitle(): string | null;
  getVideoElement(): HTMLVideoElement | null;
  getPlayerContainer(): HTMLElement | null;
  getCommentsContainer(): HTMLElement | null;
  getObservationRoot(): HTMLElement;
}

export function queryFirst<T extends Element>(selectors: readonly string[]): T | null {
  for (const selector of selectors) {
    const element = document.querySelector<T>(selector);
    if (element) return element;
  }
  return null;
}
