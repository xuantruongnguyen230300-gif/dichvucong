import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import './core/i18n';
import { datCheDoKiosk } from './core/kiosk/cheDoKiosk';
import { datLaiCachXemChoTest } from './core/hooks/useCachXem';
import { caiMatchMedia, datKhoMan } from './test-utils/khoMan';

// Máy chậm hoặc đang chạy song song: lần nạp đầu của chunk lười (TanStack Table) có thể quá 1 giây
configure({ asyncUtilTimeout: 5000 });

// jsdom thiếu matchMedia, scrollIntoView, ResizeObserver
caiMatchMedia();
Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn(); // ScrollRestoration của React Router

class ResizeObserverGia {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverGia as unknown as typeof ResizeObserver;

beforeEach(() => {
  datKhoMan(1280);
});

afterEach(() => {
  cleanup();
  document.documentElement.className = '';
  window.localStorage.clear();
  window.sessionStorage.clear();
  datCheDoKiosk(false);
  datLaiCachXemChoTest();
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
});
