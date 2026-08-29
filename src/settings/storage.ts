import { storage } from '#imports';
import {
  DEFAULT_SETTINGS,
  type LowCortisolSettings,
  mergeSettings,
  normalizeSettings,
  type SettingsPatch,
} from './model';

export const settingsStorage = storage.defineItem<LowCortisolSettings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
});

export async function readSettings(): Promise<LowCortisolSettings> {
  return normalizeSettings(await settingsStorage.getValue());
}

export async function writeSettings(settings: LowCortisolSettings): Promise<void> {
  await settingsStorage.setValue(normalizeSettings(settings));
}

export async function patchSettings(patch: SettingsPatch): Promise<LowCortisolSettings> {
  const next = mergeSettings(await readSettings(), patch);
  await writeSettings(next);
  return next;
}
