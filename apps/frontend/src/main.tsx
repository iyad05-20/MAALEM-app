import './styles/index.css';
import './i18n/config'; // Initialiser i18next avant l'application
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}
