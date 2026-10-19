import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';
import { useRole } from '../state/RoleContext';
import { useData } from '../state/DataContext';
import { homeFor } from '../state/access';

const OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin (SDP)' },
  { value: 'staff', label: 'Staff (nursery)' },
  { value: 'public', label: 'Public (resident)' },
];

export function RolePicker({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { role, setRole } = useRole();
  const { data } = useData();
  const navigate = useNavigate();

  const selectStyle =
    tone === 'dark'
      ? 'border-leaf-500 bg-leaf-700 text-white'
      : 'border-soil-200 bg-white text-soil-900';

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className={tone === 'dark' ? 'text-leaf-100' : 'text-soil-700'}>Demo role</span>
      <select
        value={role}
        onChange={(e) => {
          const next = e.target.value as Role;
          setRole(next);
          navigate(homeFor(next, data.trees[0]?.id));
        }}
        className={`min-h-11 rounded-lg border px-2 text-sm font-bold ${selectStyle}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
