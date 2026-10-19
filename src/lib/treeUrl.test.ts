import { expect, test } from 'vitest';
import { treeUrl } from './treeUrl';

test('treeUrl builds the public tree address', () => {
  expect(treeUrl('RL-T-0001', 'https://rootloop.vercel.app')).toBe('https://rootloop.vercel.app/tree/RL-T-0001');
});

test('treeUrl defaults to the current origin', () => {
  expect(treeUrl('RL-T-0002')).toBe(`${window.location.origin}/tree/RL-T-0002`);
});
