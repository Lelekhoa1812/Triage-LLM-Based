import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './src/context/ThemeContext';
import {LanguageProvider} from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import {Text as RNText, TextInput as RNTextInput} from 'react-native';
import BottomTabs from './src/navigation/BottomTabs';

RNText.defaultProps = RNText.defaultProps || {};
RNText.defaultProps.style = [{fontFamily: 'Inter-Regular'}];

RNTextInput.defaultProps = RNTextInput.defaultProps || {};
RNTextInput.defaultProps.style = [{fontFamily: 'Inter-Regular'}];

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
}
