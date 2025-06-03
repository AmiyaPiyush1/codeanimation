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

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary colors
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    const baseFontSize = fontSizeMap[theme.fontSize] || '16px';
    root.style.setProperty('--font-size-base', baseFontSize);
    
    // Apply font size to body
    document.body.style.fontSize = baseFontSize;

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