export const TWITCH_SELECTORS = {
  app: ['#root', '.root-scrollable__wrapper'] as const,
  title: [
    '[data-a-target="stream-title"]',
    'h2[data-a-target="stream-title"]',
    '[data-test-selector="stream-title"]',
  ] as const,
  video: [
    '[data-a-target="video-player"] video',
    '.video-player__container video',
    'video[data-a-target="video-player"]',
  ] as const,
  player: [
    '.persistent-player',
    '[data-a-target="video-player"]',
    '.video-player',
    '.video-player__container',
  ] as const,
} as const;
