import { lazy, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicTreePage } from './pages/PublicTreePage';

// Staff pages load on demand so the public tree page, opened from a QR tag on
// a phone, does not download the chart and QR code libraries.
function lazyPage<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}

const AboutPage = lazyPage(() => import('./pages/AboutPage'), 'AboutPage');
const BatchDetailPage = lazyPage(() => import('./pages/BatchDetailPage'), 'BatchDetailPage');
const BatchesPage = lazyPage(() => import('./pages/BatchesPage'), 'BatchesPage');
const DashboardPage = lazyPage(() => import('./pages/DashboardPage'), 'DashboardPage');
const IntakePage = lazyPage(() => import('./pages/IntakePage'), 'IntakePage');
const MaturityTestPage = lazyPage(() => import('./pages/MaturityTestPage'), 'MaturityTestPage');
const RecommendationsPage = lazyPage(() => import('./pages/RecommendationsPage'), 'RecommendationsPage');
const TreesPage = lazyPage(() => import('./pages/TreesPage'), 'TreesPage');
const TrialDetailPage = lazyPage(() => import('./pages/TrialDetailPage'), 'TrialDetailPage');
const TrialsPage = lazyPage(() => import('./pages/TrialsPage'), 'TrialsPage');

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/batches/:id" element={<BatchDetailPage />} />
        <Route path="/batches/:id/test" element={<MaturityTestPage />} />
        <Route path="/trials" element={<TrialsPage />} />
        <Route path="/trials/:id" element={<TrialDetailPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/trees" element={<TreesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="/tree/:id" element={<PublicTreePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
