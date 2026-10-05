import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Experiments } from './Experiments';
import './experiments.css';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="error" role="alert">The experiment view could not render. <button className="button" onClick={() => location.reload()}>Reload workspace</button></div> : this.props.children; }
}
const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
const container = document.getElementById('experiments-root');
if (container) createRoot(container).render(<Boundary><QueryClientProvider client={client}><Experiments /></QueryClientProvider></Boundary>);
