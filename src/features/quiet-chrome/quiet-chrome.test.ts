import { describe, expect, it } from 'vitest';
import { cleanPageTitle } from './quiet-chrome';

describe('quiet chrome title', () => {
  it('removes the platform suffix without changing the title', () => {
    expect(cleanPageTitle('A calm video - YouTube', 'youtube')).toBe('A calm video');
    expect(cleanPageTitle('Slow stream - Twitch', 'twitch')).toBe('Slow stream');
  });

  it('keeps titles that do not include a platform suffix', () => {
    expect(cleanPageTitle('Lo-fi session', 'youtube')).toBe('Lo-fi session');
  });
});
