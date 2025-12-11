import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

// 1. Define your custom MUI Theme
// This is where you would customize colors, typography, and dark mode settings.
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Enables dark mode
    primary: {
      main: '#4FC3F7', // Light blue, vibrant primary color
    },
    secondary: {
      main: '#FFB74D', // Orange, for accents
    },
    background: {
      default: '#d5eafcff', // Very dark background
      paper: '#1f4155ff', // Slightly lighter for cards/surfaces (where glassmorphism will be applied)
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. ThemeProvider wraps the entire app */}
    <ThemeProvider theme={darkTheme}>
      {/* 3. CssBaseline provides a clean slate and resets default browser styles based on the theme (e.g., dark background) */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);