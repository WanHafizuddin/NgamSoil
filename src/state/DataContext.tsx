import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AppData } from '../types';
import { reducer, type Action } from './reducer';
import { loadData, saveData } from './storage';

interface DataContextValue {
  data: AppData;
  dispatch: Dispatch<Action>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children, initialData }: { children: ReactNode; initialData?: AppData }) {
  const [data, dispatch] = useReducer(reducer, null, () => initialData ?? loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  return <DataContext.Provider value={{ data, dispatch }}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
