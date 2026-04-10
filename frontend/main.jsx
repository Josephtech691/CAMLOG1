import { StrictMode } from 'react';
import React from 'react';
import ReactDom from 'react-dom/client'
import AppRouter from './router/AppRouter.jsx';
import './index.css'
import useAuthStore from './stores/authStore.js';
useAuthStore.getState().initAuth();


ReactDom.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);