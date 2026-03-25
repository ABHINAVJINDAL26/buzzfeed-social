import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PointsProvider } from './context/PointsContext';
import './styles.css';
import './notif.css';
import './nav.css';
import './responsive.css';
import './premium.css';





ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PointsProvider>
          <App />
        </PointsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
