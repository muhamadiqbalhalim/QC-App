import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Ini import dari fail App.jsx kau
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <ThemeProvider> {/* Provider kena duduk dalam BrowserRouter supaya navigation berfungsi */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);