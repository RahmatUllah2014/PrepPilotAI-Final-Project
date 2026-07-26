import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from 'next-themes';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const ThemeProviderComponent = ThemeProvider as unknown as React.ComponentType<any>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProviderComponent attribute="class" defaultTheme="system" enableSystem>
        <App />
      </ThemeProviderComponent>
    </ErrorBoundary>
  </StrictMode>,
);


