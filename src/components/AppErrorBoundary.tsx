import { Component, type ReactNode } from 'react';
import { STORAGE_KEY } from '../state/storage';
import { btnPrimary } from './ui';

export function clearStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the reload still starts from the sample data.
  }
}

function resetAndReload() {
  clearStoredData();
  window.location.reload();
}

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

export class AppErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-leaf-900">Something went wrong</h1>
        <p className="mt-3 text-soil-700">The demo data saved in this browser could not be read. Resetting brings back the sample data.</p>
        <button type="button" className={`${btnPrimary} mt-6`} onClick={this.props.onReset ?? resetAndReload}>
          Reset to sample data
        </button>
      </main>
    );
  }
}
