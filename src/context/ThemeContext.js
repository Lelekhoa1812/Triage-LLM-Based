// src/context/ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  background: '#FFFFFF',
  primary: '#007BFF',   // Blue
  text: '#333333',
};

const darkTheme = {
  mode: 'dark',
  background: '#001F3F', // Dark Blue
  primary: '#800000',    // Maroon
  text: '#FFFFFF',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
