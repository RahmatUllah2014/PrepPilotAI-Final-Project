import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from 'next-themes';
import App from './App';
import './index.css';

const ThemeProviderComponent = ThemeProvider as unknown as React.ComponentType<any>;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderComponent attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProviderComponent>
  </StrictMode>,
);

