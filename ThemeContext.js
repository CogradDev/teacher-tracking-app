import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from './themes'; // Import your themes

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => subscription.remove();
  }, []);

  const value = { theme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
