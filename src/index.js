import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Suppress console logs in production, but keep errors for debugging
if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.warn = () => { };
    console.info = () => { };
    console.debug = () => { };
    // Keep console.error for production error tracking
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
