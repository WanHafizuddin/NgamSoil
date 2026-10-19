import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver;
URL.createObjectURL = () => 'blob:preview';
URL.revokeObjectURL = () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
