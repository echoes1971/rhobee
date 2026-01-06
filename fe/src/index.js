import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import { ThemeProvider } from "./ThemeContext";
import { app_cfg } from './app.cfg';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

// Set page title from runtime config
document.title = app_cfg.site_title;

// Parse OAuth fragment (if present) and store token + user info in localStorage
function parseOAuthFragment() {
  const hash = window.location.hash || '';
  if (!hash || hash.indexOf('provider=') === -1) return;
  // remove leading #
  const fragment = hash.substring(1);
  const parts = fragment.split('&');
  const params = {};
  parts.forEach(p => {
    const kv = p.split('=');
    if (kv.length === 2) {
      params[kv[0]] = decodeURIComponent(kv[1]);
    }
  });
  if (params.access_token) {
    localStorage.setItem('token', params.access_token);
  }
  if (params.expires_at) {
    localStorage.setItem('expires_at', params.expires_at);
  }
  if (params.user_id) {
    localStorage.setItem('user_id', params.user_id);
  }
  if (params.login) {
    localStorage.setItem('username', params.login);
  }
  if (params.groups) {
    const groupsArr = params.groups.split(',').filter(g => g !== '');
    localStorage.setItem('groups', JSON.stringify(groupsArr));
  }
  // remove fragment from URL
  try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch(e){}
}

parseOAuthFragment();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register();
