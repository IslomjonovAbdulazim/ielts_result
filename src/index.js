import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { logger } from './services/logger';

// Initialize logger
logger.info('APP', 'Application starting');
logger.logEnvironmentInfo();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    logger.info('APP', 'Page fully loaded');
  });
}