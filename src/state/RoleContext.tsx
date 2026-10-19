import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role } from '../types';
import { loadRole, saveRole } from './storage';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children, initialRole }: { children: ReactNode; initialRole?: Role }) {
  const [role, setRoleState] = useState<Role>(() => initialRole ?? loadRole());

  const setRole = (next: Role) => {
    saveRole(next);
    setRoleState(next);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const value = useContext(RoleContext);
  if (!value) throw new Error('useRole must be used inside RoleProvider');
  return value;
}
