import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);
