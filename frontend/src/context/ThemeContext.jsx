import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Default to true (dark mode) as requested by premium theme guidelines
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nova_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return true; 
  });

  useEffect(() => {
    localStorage.setItem('nova_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
