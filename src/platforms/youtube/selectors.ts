export const YOUTUBE_SELECTORS = {
  app: ['ytd-app', '#content'] as const,
  video: ['#movie_player video.html5-main-video', 'video.html5-main-video'] as const,
  title: [
    'ytd-watch-metadata h1 yt-formatted-string',
    'ytd-watch-metadata h1',
    '#title h1 yt-formatted-string',
  ] as const,
  player: [
    '#movie_player',
    'ytd-player #container',
    '#player-container-inner',
    '#player-container',
  ] as const,
  comments: ['ytd-watch-flexy ytd-comments#comments', 'ytd-comments#comments'] as const,
} as const;
