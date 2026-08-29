export type Platform = 'youtube' | 'twitch';

export type LowCortisolSettings = {
  enabled: boolean;
};

export type SettingsPatch = Partial<LowCortisolSettings>;

export const DEFAULT_SETTINGS: LowCortisolSettings = {
  enabled: true,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const booleanOr = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export function normalizeSettings(value: unknown): LowCortisolSettings {
  const source = isRecord(value) ? value : {};

  return {
    enabled: booleanOr(source.enabled, DEFAULT_SETTINGS.enabled),
  };
}

export function mergeSettings(
  current: LowCortisolSettings,
  patch: SettingsPatch,
): LowCortisolSettings {
  return normalizeSettings({ ...current, ...patch });
}
