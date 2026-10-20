import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { screen, within } from '@testing-library/react';
import postcss from 'postcss';
import { describe, expect, test } from 'vitest';
import { renderApp } from './render';

// Vitest blanks CSS imports, even with ?raw, so read the file itself.
const css = readFileSync(join(__dirname, '../index.css'), 'utf8');

// Surface colours from tailwind.config.js.
const SOIL_50 = '#FAF6F0';
const WHITE = '#FFFFFF';
const LEAF_900 = '#1F3B2C';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The outline colour index.css gives a focused element matched by `selector`, if any. */
function outlineColour(selector: string): string | undefined {
  let colour: string | undefined;
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls(/^outline(-color)?$/, (decl) => {
      colour = decl.value.match(/#[0-9a-f]{6}/i)?.[0] ?? colour;
    });
  });
  return colour;
}

describe('focus outline', () => {
  const base = outlineColour(':focus-visible');
  const onDark = outlineColour('.on-dark :focus-visible') ?? base;

  test('has at least 3:1 contrast on light surfaces', () => {
    expect(base).toBeDefined();
    expect(contrast(base!, SOIL_50)).toBeGreaterThanOrEqual(3);
    expect(contrast(base!, WHITE)).toBeGreaterThanOrEqual(3);
  });

  test('has at least 3:1 contrast on the dark header and sidebar', () => {
    expect(contrast(onDark!, LEAF_900)).toBeGreaterThanOrEqual(3);
  });

  test('the header and sidebar controls sit on a dark surface', async () => {
    await renderApp();
    expect(screen.getByLabelText('Demo role').closest('.on-dark')).not.toBeNull();
    for (const link of within(screen.getByRole('complementary')).getAllByRole('link')) {
      expect(link.closest('.on-dark')).not.toBeNull();
    }
  });
});
