import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { navFor } from '../state/access';
import { useRole } from '../state/RoleContext';

const MAX_TABS = 5;

export function SideNav() {
  const { role } = useRole();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {navFor(role).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-xl px-3 font-bold transition-colors ${
              isActive ? 'bg-soil-50 text-leaf-900' : 'text-leaf-100 hover:bg-leaf-700'
            }`
          }
        >
          <Icon aria-hidden className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const { role } = useRole();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const items = navFor(role);
  const overflow = items.length > MAX_TABS;
  const tabs = overflow ? items.slice(0, MAX_TABS - 1) : items;
  const more = overflow ? items.slice(MAX_TABS - 1) : [];

  useEffect(() => setMoreOpen(false), [pathname]);

  // Close the More menu on a click outside the nav, or on Escape from anywhere.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (e: Event) => {
      if (!navRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  const tabClass = (active: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
      active ? 'text-leaf-900' : 'text-soil-700'
    }`;

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-soil-200 bg-soil-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
    >
      {moreOpen && (
        <ul aria-label="More pages" className="absolute bottom-full right-2 mb-2 w-56 rounded-2xl border border-soil-200 bg-white p-2 shadow-lg">
          {more.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-bold text-soil-900 hover:bg-soil-100">
                <Icon aria-hidden className="h-5 w-5 text-leaf-700" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => tabClass(isActive)}>
            {({ isActive }) => (
              <>
                <span className={`rounded-full px-4 py-1 ${isActive ? 'bg-leaf-100' : ''}`}>
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        {overflow && (
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={tabClass(more.some((m) => pathname.startsWith(m.to)))}
          >
            <span className="rounded-full px-4 py-1">
              <Ellipsis aria-hidden className="h-5 w-5" />
            </span>
            More
          </button>
        )}
      </div>
    </nav>
  );
}
