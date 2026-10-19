import { expect, test } from 'vitest';

const files = import.meta.glob(['/src/**/*.{ts,tsx}', '!/src/test/copyGuard.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

test('source never claims sterile compost or carbon savings', () => {
  expect(Object.keys(files).length).toBeGreaterThan(20);
  for (const [path, text] of Object.entries(files)) {
    expect(text, path).not.toMatch(/carbon|germ[- ]?free|pathogen[- ]free|sterili[sz]/i);
  }
});
