import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { StationProvider } from '@context/StationContext.tsx';

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <StationProvider>
          <App />
        </StationProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw new Error('Root element not found');
}
