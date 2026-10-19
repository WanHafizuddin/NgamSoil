import { Link } from 'react-router-dom';
import { Strata } from '../components/Strata';

export function NotFoundPage() {
  return (
    <main className="min-h-screen">
      <Strata />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-leaf-900">Page not found</h1>
        <p className="mt-3 text-soil-700">This address does not match any RootLoop screen.</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-leaf-700 px-5 font-bold text-white hover:bg-leaf-900"
        >
          Go to the start
        </Link>
      </div>
    </main>
  );
}
