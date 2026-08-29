import type { PlayerAdapter } from '../../platforms/player-adapter';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
const COMMENTS_ATTRIBUTES = ['role', 'aria-modal', 'aria-label', 'aria-hidden'] as const;
const COMMENTS_EXTENSION_ATTRIBUTE = 'data-lcp-extension-surface';
const EXTENSION_UI_ATTRIBUTE = 'data-lcp-extension-ui';

type CommentsSnapshot = {
  attributes: Record<(typeof COMMENTS_ATTRIBUTES)[number], string | null>;
  element: HTMLElement;
  inert: boolean;
};

export function cleanPageTitle(title: string, platform: PlayerAdapter['platform']): string {
  const suffix = platform === 'youtube' ? /\s*-\s*YouTube\s*$/i : /\s*-\s*Twitch\s*$/i;
  return title.replace(suffix, '').trim();
}

export class QuietChrome {
  #adapter: PlayerAdapter | null = null;
  #backdrop: HTMLButtonElement | null = null;
  #comments: HTMLElement | null = null;
  #commentsObserver: MutationObserver | null = null;
  #commentsSnapshot: CommentsSnapshot | null = null;
  #isOpen = false;
  #listeners: AbortController | null = null;
  #title: HTMLParagraphElement | null = null;
  #titleBar: HTMLDivElement | null = null;
  #titleObserver: MutationObserver | null = null;
  #toolbar: HTMLDivElement | null = null;
  #trigger: HTMLButtonElement | null = null;

  apply(adapter: PlayerAdapter): void {
    if (this.#adapter !== adapter || !this.#titleBar?.isConnected) {
      this.destroy();
      this.#adapter = adapter;
      this.#mountTitle(adapter);
      this.#observeTitle();
    } else {
      this.#updateTitle();
    }

    const shouldMountComments = adapter.platform === 'youtube';
    if (shouldMountComments) this.#mountCommentsUi();
    else this.#unmountCommentsUi();
  }

  destroy(): void {
    this.#unmountCommentsUi();
    this.#titleObserver?.disconnect();
    this.#titleObserver = null;
    this.#titleBar?.remove();
    this.#titleBar = null;
    this.#title = null;
    this.#adapter = null;
  }

  #mountTitle(adapter: PlayerAdapter): void {
    const player = adapter.getPlayerContainer();
    const anchor = adapter.platform === 'youtube' ? player?.closest('#player') : null;
    if (!anchor?.parentElement) return;

    this.#titleBar = document.createElement('div');
    this.#titleBar.className = 'lcp-quiet-title-bar';
    this.#titleBar.setAttribute('aria-live', 'polite');
    this.#title = document.createElement('p');
    this.#title.className = 'lcp-quiet-title';
    this.#titleBar.append(this.#title);
    anchor.insertAdjacentElement('afterend', this.#titleBar);
    this.#updateTitle();
  }

  #observeTitle(): void {
    const titleElement = document.querySelector('title');
    if (!titleElement) return;
    this.#titleObserver = new MutationObserver(() => this.#updateTitle());
    this.#titleObserver.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  #updateTitle(): void {
    if (!this.#title || !this.#adapter) return;
    this.#title.textContent =
      this.#adapter.getTitle() ?? cleanPageTitle(document.title, this.#adapter.platform);
  }

  #mountCommentsUi(): void {
    if (!this.#listeners) {
      this.#listeners = new AbortController();
      const { signal } = this.#listeners;
      document.addEventListener('keydown', this.#handleDocumentKeydown, { signal });
    }

    if (!this.#trigger) {
      this.#trigger = document.createElement('button');
      this.#trigger.type = 'button';
      this.#trigger.className = 'lcp-comments-trigger';
      this.#trigger.setAttribute(EXTENSION_UI_ATTRIBUTE, '');
      this.#trigger.setAttribute('aria-label', 'Ouvrir les commentaires');
      this.#trigger.setAttribute('aria-expanded', 'false');
      this.#trigger.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span>';
      this.#trigger.addEventListener('click', () => this.#openComments(), {
        signal: this.#listeners.signal,
      });
      document.body.append(this.#trigger);
    }

    if (!this.#backdrop) {
      this.#backdrop = document.createElement('button');
      this.#backdrop.type = 'button';
      this.#backdrop.tabIndex = -1;
      this.#backdrop.className = 'lcp-comments-backdrop';
      this.#backdrop.setAttribute(EXTENSION_UI_ATTRIBUTE, '');
      this.#backdrop.setAttribute('aria-label', 'Fermer les commentaires');
      this.#backdrop.addEventListener('click', () => this.#closeComments(), {
        signal: this.#listeners.signal,
      });
      document.body.append(this.#backdrop);
    }

    if (!this.#toolbar) {
      this.#toolbar = document.createElement('div');
      this.#toolbar.className = 'lcp-comments-toolbar';
      this.#toolbar.setAttribute(EXTENSION_UI_ATTRIBUTE, '');
      const heading = document.createElement('strong');
      heading.textContent = 'Commentaires';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'lcp-comments-close';
      close.textContent = 'Fermer';
      close.addEventListener('click', () => this.#closeComments(), {
        signal: this.#listeners.signal,
      });
      this.#toolbar.append(heading, close);
      document.body.append(this.#toolbar);
    }

    if (!this.#connectComments()) this.#observeComments();
  }

  #connectComments(): boolean {
    const comments = this.#adapter?.getCommentsContainer();
    if (!comments) return false;
    if (this.#comments === comments && comments.isConnected) return true;

    if (this.#comments && this.#comments !== comments) this.#restoreComments(this.#comments);

    this.#comments = comments;
    this.#commentsSnapshot = {
      attributes: Object.fromEntries(
        COMMENTS_ATTRIBUTES.map((attribute) => [attribute, comments.getAttribute(attribute)]),
      ) as CommentsSnapshot['attributes'],
      element: comments,
      inert: comments.inert,
    };
    comments.setAttribute(COMMENTS_EXTENSION_ATTRIBUTE, '');
    comments.classList.add('lcp-comments-sheet-ready');
    comments.setAttribute('role', 'dialog');
    comments.setAttribute('aria-modal', 'true');
    comments.setAttribute('aria-label', 'Commentaires');
    this.#setCommentsVisibility(comments, this.#isOpen);
    if (this.#backdrop && comments.parentElement) comments.parentElement.prepend(this.#backdrop);
    if (comments.id) this.#trigger?.setAttribute('aria-controls', comments.id);
    else this.#trigger?.removeAttribute('aria-controls');
    this.#commentsObserver?.disconnect();
    this.#commentsObserver = null;
    return true;
  }

  #observeComments(): void {
    if (this.#commentsObserver) return;
    const root = document.querySelector('ytd-watch-flexy') ?? document.body;
    this.#commentsObserver = new MutationObserver(() => this.#connectComments());
    this.#commentsObserver.observe(root, { childList: true, subtree: true });
  }

  #openComments(): void {
    if (!this.#connectComments() || !this.#comments || !this.#trigger) return;
    this.#isOpen = true;
    document.documentElement.classList.add('lcp-comments-open');
    this.#comments.inert = false;
    this.#comments.setAttribute('aria-hidden', 'false');
    this.#trigger.setAttribute('aria-expanded', 'true');
    this.#trigger.setAttribute('aria-label', 'Fermer les commentaires');
    requestAnimationFrame(() => {
      this.#toolbar?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    });
  }

  #closeComments({ restoreFocus = true } = {}): void {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    document.documentElement.classList.remove('lcp-comments-open');
    if (this.#comments) this.#setCommentsVisibility(this.#comments, false);
    this.#trigger?.setAttribute('aria-expanded', 'false');
    this.#trigger?.setAttribute('aria-label', 'Ouvrir les commentaires');
    if (restoreFocus) this.#trigger?.focus({ preventScroll: true });
  }

  #handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.#isOpen || !this.#comments) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#closeComments();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [
      ...(this.#toolbar?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []),
      ...this.#comments.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ].filter((element) => !element.inert && element.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  #unmountCommentsUi(): void {
    this.#closeComments({ restoreFocus: false });
    this.#commentsObserver?.disconnect();
    this.#commentsObserver = null;
    this.#listeners?.abort();
    this.#listeners = null;
    this.#toolbar?.remove();
    this.#toolbar = null;
    if (this.#comments) {
      this.#restoreComments(this.#comments);
    }
    this.#comments = null;
    this.#commentsSnapshot = null;
    this.#trigger?.remove();
    this.#trigger = null;
    this.#backdrop?.remove();
    this.#backdrop = null;
  }

  #setCommentsVisibility(comments: HTMLElement, open: boolean): void {
    comments.setAttribute('aria-hidden', String(!open));
    comments.inert = !open;
  }

  #restoreComments(comments: HTMLElement): void {
    comments.removeAttribute(COMMENTS_EXTENSION_ATTRIBUTE);
    comments.classList.remove('lcp-comments-sheet-ready');
    const snapshot = this.#commentsSnapshot?.element === comments ? this.#commentsSnapshot : null;
    for (const attribute of COMMENTS_ATTRIBUTES) {
      const value = snapshot?.attributes[attribute] ?? null;
      if (value === null) comments.removeAttribute(attribute);
      else comments.setAttribute(attribute, value);
    }
    comments.inert = snapshot?.inert ?? false;
    if (snapshot) this.#commentsSnapshot = null;
  }
}
