export function treeUrl(id: string, origin: string = window.location.origin): string {
  return `${origin}/tree/${encodeURIComponent(id)}`;
}
