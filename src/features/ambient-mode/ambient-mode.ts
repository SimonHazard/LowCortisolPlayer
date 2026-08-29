const SAMPLE_WIDTH = 12;
const SAMPLE_HEIGHT = 7;
const SAMPLE_INTERVAL_MS = 900;
const DEFAULT_COLOR = [111, 131, 140] as const;

type Rgb = [number, number, number];

export class AmbientMode {
  #abortController: AbortController | null = null;
  #canvas: HTMLCanvasElement | null = null;
  #context: CanvasRenderingContext2D | null = null;
  #currentColor: Rgb = [...DEFAULT_COLOR];
  #host: HTMLElement | null = null;
  #layer: HTMLDivElement | null = null;
  #timeoutId: number | null = null;
  #video: HTMLVideoElement | null = null;

  mount(video: HTMLVideoElement, player: HTMLElement): void {
    if (this.#video === video && this.#host === player.parentElement && this.#layer?.isConnected) {
      return;
    }

    this.destroy();
    this.#video = video;
    this.#host = player.parentElement ?? player;
    this.#host.setAttribute('data-lcp-ambient-host', '');

    this.#layer = document.createElement('div');
    this.#layer.className = 'lcp-ambient-layer';
    this.#layer.setAttribute('aria-hidden', 'true');
    this.#host.prepend(this.#layer);

    this.#canvas = document.createElement('canvas');
    this.#canvas.width = SAMPLE_WIDTH;
    this.#canvas.height = SAMPLE_HEIGHT;
    this.#context = this.#canvas.getContext('2d', { alpha: false, willReadFrequently: true });

    this.#abortController = new AbortController();
    const options = { signal: this.#abortController.signal };
    video.addEventListener('playing', this.#scheduleSample, options);
    video.addEventListener('pause', this.#stopSampling, options);
    video.addEventListener('emptied', this.#stopSampling, options);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange, options);

    this.#renderColor(this.#currentColor);
    this.#scheduleSample();
  }

  destroy(): void {
    this.#stopSampling();
    this.#abortController?.abort();
    this.#layer?.remove();
    this.#host?.removeAttribute('data-lcp-ambient-host');
    this.#host?.style.removeProperty('--lcp-ambient-color');
    this.#abortController = null;
    this.#canvas = null;
    this.#context = null;
    this.#host = null;
    this.#layer = null;
    this.#video = null;
    this.#currentColor = [...DEFAULT_COLOR];
  }

  #handleVisibilityChange = (): void => {
    if (document.hidden) this.#stopSampling();
    else this.#scheduleSample();
  };

  #scheduleSample = (): void => {
    this.#stopSampling();
    if (
      document.hidden ||
      !this.#context ||
      !this.#video ||
      this.#video.paused ||
      this.#video.readyState < 2
    ) {
      return;
    }
    this.#sample();
    this.#timeoutId = window.setTimeout(this.#scheduleSample, SAMPLE_INTERVAL_MS);
  };

  #stopSampling = (): void => {
    if (this.#timeoutId === null) return;
    window.clearTimeout(this.#timeoutId);
    this.#timeoutId = null;
  };

  #sample(): void {
    if (!this.#context || !this.#video) return;

    try {
      this.#context.drawImage(this.#video, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      const pixels = this.#context.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let weight = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index] ?? 0;
        const g = pixels[index + 1] ?? 0;
        const b = pixels[index + 2] ?? 0;
        const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
        if (luminance < 10) continue;

        const pixelWeight = Math.min(1, 0.35 + luminance / 255);
        red += r * pixelWeight;
        green += g * pixelWeight;
        blue += b * pixelWeight;
        weight += pixelWeight;
      }

      if (weight === 0) return;
      const target: Rgb = [red / weight, green / weight, blue / weight];
      this.#currentColor = this.#currentColor.map((channel, index) =>
        Math.round(channel + ((target[index] ?? channel) - channel) * 0.22),
      ) as Rgb;
      this.#renderColor(this.#currentColor);
    } catch {
      // Cross-origin video frames can reject canvas reads. The calm neutral fallback remains active.
      this.#renderColor(this.#currentColor);
    }
  }

  #renderColor([red, green, blue]: Rgb): void {
    this.#host?.style.setProperty('--lcp-ambient-color', `${red} ${green} ${blue}`);
  }
}
