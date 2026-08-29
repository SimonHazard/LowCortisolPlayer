import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  type LowCortisolSettings,
  mergeSettings,
  normalizeSettings,
  type SettingsPatch,
} from '../settings/model';
import { readSettings, settingsStorage, writeSettings } from '../settings/storage';

type SettingsState = {
  settings: LowCortisolSettings;
  ready: boolean;
  update: (patch: SettingsPatch) => void;
};

export function useSettings(): SettingsState {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    void readSettings().then((storedSettings) => {
      if (!active) return;
      setSettings(storedSettings);
      setReady(true);
    });

    const unwatch = settingsStorage.watch((value) => {
      if (active) setSettings(normalizeSettings(value));
    });

    return () => {
      active = false;
      unwatch();
    };
  }, []);

  const queueWrite = useCallback((next: LowCortisolSettings) => {
    writeQueue.current = writeQueue.current.then(() => writeSettings(next));
  }, []);

  const update = useCallback(
    (patch: SettingsPatch) => {
      setSettings((current) => {
        const next = mergeSettings(current, patch);
        queueWrite(next);
        return next;
      });
    },
    [queueWrite],
  );

  return { settings, ready, update };
}
