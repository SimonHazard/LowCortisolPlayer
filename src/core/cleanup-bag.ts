export type Cleanup = () => void;

export class CleanupBag {
  readonly #cleanups = new Set<Cleanup>();
  #destroyed = false;

  add(cleanup: Cleanup): Cleanup {
    if (this.#destroyed) {
      cleanup();
      return cleanup;
    }

    this.#cleanups.add(cleanup);
    return cleanup;
  }

  delete(cleanup: Cleanup): void {
    this.#cleanups.delete(cleanup);
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;

    let firstError: unknown;
    let hasError = false;
    for (const cleanup of [...this.#cleanups].reverse()) {
      try {
        cleanup();
      } catch (error) {
        if (!hasError) {
          firstError = error;
          hasError = true;
        }
      } finally {
        this.#cleanups.delete(cleanup);
      }
    }

    if (hasError) throw firstError;
  }
}
