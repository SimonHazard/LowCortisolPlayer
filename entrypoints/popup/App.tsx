import { useEffect, useState } from 'react';
import { browser } from '#imports';
import { detectPlatform } from '../../src/platforms/detect';
import type { Platform } from '../../src/settings/model';
import { PanelHeader, SwitchRow } from '../../src/ui/components';
import { useSettings } from '../../src/ui/use-settings';

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
};

export function App() {
  const { settings, ready, update } = useSettings();
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    let active = true;
    void browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (active) setPlatform(detectPlatform(tab?.url ?? ''));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="popup-shell" data-ready={ready}>
      <PanelHeader eyebrow="Mode calme" />

      <section className="power-surface" aria-label="État de LowCortisolPlayer">
        <SwitchRow
          label={settings.enabled ? 'Actif' : 'Désactivé'}
          description={
            settings.enabled
              ? 'Le bruit disparaît automatiquement.'
              : 'Les pages restent inchangées.'
          }
          checked={settings.enabled}
          disabled={!ready}
          prominent
          onChange={(enabled) => update({ enabled })}
        />
      </section>

      <footer className="popup-note" role="status">
        <strong>{platform ? PLATFORM_LABELS[platform] : 'Page non prise en charge'}</strong>
        <span>Solarized s’adapte automatiquement au système.</span>
      </footer>
    </main>
  );
}
