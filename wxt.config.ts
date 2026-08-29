import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LowCortisolPlayer',
    description: 'A calmer, softer viewing mode for YouTube and Twitch.',
    minimum_chrome_version: '120',
    permissions: ['storage', 'activeTab'],
    action: {
      default_title: 'LowCortisolPlayer',
    },
  },
});
