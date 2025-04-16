import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import BottomTabs from './src/navigation/BottomTabs';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <BottomTabs />
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
}
