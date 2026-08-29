import '../src/features/appearance/base.css';
import '../src/platforms/twitch/twitch.css';
import '../src/platforms/youtube/youtube.css';
import { PlayerController } from '../src/core/player-controller';
import { readSettings, settingsStorage } from '../src/settings/storage';

export default defineContentScript({
  matches: [
    'https://*.youtube.com/*',
    'https://youtube.com/*',
    'https://*.twitch.tv/*',
    'https://twitch.tv/*',
  ],
  runAt: 'document_idle',
  async main(ctx) {
    const controller = new PlayerController(await readSettings());
    controller.start();

    const unwatchSettings = settingsStorage.watch((settings) => {
      controller.updateSettings(settings);
    });

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      controller.handleNavigation();
    });

    ctx.onInvalidated(() => {
      unwatchSettings();
      controller.destroy();
    });
  },
});
