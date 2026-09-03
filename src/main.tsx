import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './cast-mode.css';
import './semantic-score-controls.css';
import './inspect-actions.css';
import './recent-names.css';
import './cast-workbench.css';
import './inspector-evidence.css';
import './cast-interactions.css';
import './adaptive-name-rail.css';
import './cast-lifecycle.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Name Forge root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
