import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Mount the React application into the root element. We wait for the DOM to
// be fully loaded before executing; in most modern environments modules run
// after the DOMContentLoaded event by default.
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);