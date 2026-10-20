import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BottomNav, SideNav } from './Nav';
import { Logo } from './Logo';
import { RoleGate } from './RoleGate';
import { RolePicker } from './RolePicker';
import { Strata } from './Strata';
import { useRole } from '../state/RoleContext';
import { canAccess } from '../state/access';

export function Layout() {
  const { role } = useRole();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="on-dark hidden bg-leaf-900 text-soil-50 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-8 md:px-4 md:py-6 print:hidden">
        <Link to="/" className="rounded-lg px-2">
          <Logo tagline />
        </Link>
        <SideNav />
      </aside>

      <div className="min-w-0">
        <header className="on-dark sticky top-0 z-20 bg-leaf-900 text-soil-50 print:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2 md:justify-end md:px-8">
            <Link to="/" className="rounded-lg md:hidden">
              <Logo />
            </Link>
            <RolePicker />
          </div>
          <Strata />
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:px-8 md:pb-12">
          <Suspense fallback={<p role="status" className="text-soil-700">Loading…</p>}>
            {canAccess(role, pathname) ? <Outlet /> : <RoleGate />}
          </Suspense>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
