import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, mergeSettings, normalizeSettings } from './model';

describe('settings model', () => {
  it('restores defaults for missing and invalid values', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ enabled: 'yes' })).toEqual(DEFAULT_SETTINGS);
  });

  it('migrates legacy preferences to the single enabled state', () => {
    expect(
      normalizeSettings({ enabled: false, appearance: { theme: 'latte' }, cleanup: false }),
    ).toEqual({ enabled: false });
  });

  it('merges the only user-facing preference', () => {
    expect(mergeSettings(DEFAULT_SETTINGS, { enabled: false })).toEqual({ enabled: false });
  });
});
