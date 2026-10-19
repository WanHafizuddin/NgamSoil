import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { BatchesPage } from './pages/BatchesPage';
import { DashboardPage } from './pages/DashboardPage';
import { IntakePage } from './pages/IntakePage';
import { MaturityTestPage } from './pages/MaturityTestPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicTreePage } from './pages/PublicTreePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { TreesPage } from './pages/TreesPage';
import { TrialDetailPage } from './pages/TrialDetailPage';
import { TrialsPage } from './pages/TrialsPage';

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
