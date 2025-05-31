import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#8b5cf6',
      fontSize: 'medium',
      codeEditorTheme: 'vs-dark'
    };
  });

  // Apply theme changes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex colors to RGB for better opacity support
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Set color variables
    const primaryRgb = hexToRgb(theme.primary);
    const secondaryRgb = hexToRgb(theme.secondary);
    const accentRgb = hexToRgb(theme.accent);

    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    
    // Set RGB values for opacity support
    if (primaryRgb) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }
    if (secondaryRgb) {
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }
    if (accentRgb) {
      root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }

    // Set font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[theme.fontSize] || '16px');

    // Apply code editor theme
    if (window.monaco) {
      window.monaco.editor.setTheme(theme.codeEditorTheme);
    }

    // Save theme to localStorage
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (newTheme) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  const resetTheme = () => {
    setTheme({
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#8b5cf6',
      fontSize: 'medium',
      codeEditorTheme: 'vs-dark'
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 