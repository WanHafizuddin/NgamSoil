import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// Route pages are lazy; their first import can take over a second in a busy test run.
configure({ asyncUtilTimeout: 5000 });

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
