import { expect, test } from 'vitest';
import { treeUrl } from './treeUrl';

test('treeUrl builds the public tree address', () => {
  expect(treeUrl('NS-T-0001', 'https://ngamsoil.vercel.app')).toBe('https://ngamsoil.vercel.app/tree/NS-T-0001');
});

test('treeUrl defaults to the current origin', () => {
  expect(treeUrl('NS-T-0002')).toBe(`${window.location.origin}/tree/NS-T-0002`);
});
