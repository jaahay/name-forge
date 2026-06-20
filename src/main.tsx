import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './card-locks.css';
import './cast-interaction.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Name Forge root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
