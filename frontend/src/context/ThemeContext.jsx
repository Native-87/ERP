import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  const [companySettings, setCompanySettings] = useState({
    company_name: 'Sistema de Gestión',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#10B981',
    logo_path: null,
    sectors: ['Mantenimiento', 'Producción', 'Administración', 'Logística'],
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const { data } = await settingsAPI.get();
          if (data.settings) {
            setCompanySettings(data.settings);
            // Apply custom colors as CSS variables
            const root = document.documentElement;
            root.style.setProperty('--color-primary', data.settings.primary_color);
            root.style.setProperty('--color-secondary', data.settings.secondary_color);
            root.style.setProperty('--color-accent', data.settings.accent_color);
          }
        }
      } catch {
        // Use defaults if settings can't be loaded
      }
    };
    loadSettings();
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const updateSettings = (newSettings) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, companySettings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};
