import { Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<h1>RootLoop</h1>} />
    </Routes>
  );
}
