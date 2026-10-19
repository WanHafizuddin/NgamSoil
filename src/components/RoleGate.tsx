import { Link } from 'react-router-dom';
import { useRole } from '../state/RoleContext';
import { useData } from '../state/DataContext';

export function RoleGate() {
  const { role } = useRole();
  const { data } = useData();
  const firstTree = data.trees[0];

  return (
    <section className="mx-auto max-w-lg py-10 text-center">
      <h1 className="text-3xl font-semibold text-leaf-900">Not available for this role</h1>
      {role === 'public' ? (
        <>
          <p className="mt-3 text-soil-700">Residents open tree pages by scanning a QR tag.</p>
          {firstTree && (
            <Link
              to={`/tree/${firstTree.id}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-leaf-700 px-5 font-bold text-white hover:bg-leaf-900"
            >
              Open an example tree page
            </Link>
          )}
        </>
      ) : (
        <p className="mt-3 text-soil-700">Switch role in the demo picker to see this screen.</p>
      )}
    </section>
  );
}
