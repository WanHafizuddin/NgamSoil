import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './index.css';
import { AppRoutes } from './App';
import { DataProvider } from './state/DataContext';
import { RoleProvider } from './state/RoleContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <RoleProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RoleProvider>
    </DataProvider>
  </StrictMode>,
);
