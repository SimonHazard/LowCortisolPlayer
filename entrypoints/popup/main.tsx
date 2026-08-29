import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/ui/theme.css';
import './style.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Popup root is missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
