import { describe, expect, it } from 'vitest';
import { detectPlatform, isSupportedPlayerPage } from './detect';

describe('platform detection', () => {
  it('recognizes supported hosts without matching lookalikes', () => {
    expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe('youtube');
    expect(detectPlatform('https://www.twitch.tv/example')).toBe('twitch');
    expect(detectPlatform('https://youtube.com.example.test/watch')).toBeNull();
  });

  it('distinguishes player routes from unsupported pages', () => {
    expect(isSupportedPlayerPage('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isSupportedPlayerPage('https://www.youtube.com/')).toBe(false);
    expect(isSupportedPlayerPage('https://www.twitch.tv/cozy_stream')).toBe(true);
    expect(isSupportedPlayerPage('https://www.twitch.tv/directory')).toBe(false);
  });

  it('handles invalid URLs', () => {
    expect(detectPlatform('not a url')).toBeNull();
    expect(isSupportedPlayerPage('not a url')).toBe(false);
  });
});
