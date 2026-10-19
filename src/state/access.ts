import { Award, Info, LayoutDashboard, Leaf, QrCode, Sprout, Thermometer, type LucideIcon } from 'lucide-react';
import type { Role } from '../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { to: '/intake', label: 'Intake', icon: Leaf, roles: ['admin', 'staff'] },
  { to: '/batches', label: 'Batches', icon: Thermometer, roles: ['admin', 'staff'] },
  { to: '/trials', label: 'Trials', icon: Sprout, roles: ['admin', 'staff'] },
  { to: '/recommendations', label: 'Recommendations', icon: Award, roles: ['admin'] },
  { to: '/trees', label: 'Tree tags', icon: QrCode, roles: ['admin'] },
  { to: '/about', label: 'About', icon: Info, roles: ['admin', 'staff'] },
];

export function navFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function canAccess(role: Role, pathname: string): boolean {
  if (pathname.startsWith('/tree/')) return true;
  const section = `/${pathname.split('/')[1] ?? ''}`;
  const item = NAV_ITEMS.find((i) => i.to === section);
  return item ? item.roles.includes(role) : true;
}

export function homeFor(role: Role, firstTreeId?: string): string {
  if (role === 'admin') return '/';
  if (role === 'staff') return '/intake';
  return firstTreeId ? `/tree/${firstTreeId}` : '/';
}
