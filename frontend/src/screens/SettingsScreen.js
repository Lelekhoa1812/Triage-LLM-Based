// src/screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, Switch, Picker, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

// If you'd like a global LanguageContext, define a similar context as ThemeContext
// For brevity, let's do local state and pass it to chatbot calls

export default function SettingsScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LanguageContext);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
};


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={theme.mode === 'dark'}
          onValueChange={() => toggleTheme()}
          trackColor={{ false: '#767577', true: '#800000' }}
          thumbColor={theme.mode === 'dark' ? '#FFF' : '#007BFF'}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Language</Text>
        <Picker
          selectedValue={language}
          style={{ flex: 1, color: theme.text }}
          onValueChange={(itemValue) => handleLanguageChange(itemValue)}
        >
          <Picker.Item label="English" value="EN" />
          <Picker.Item label="Tiếng Việt" value="VI" />
          <Picker.Item label="中文" value="ZH" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20,
  },
  label: { flex: 1, fontSize: 16 },
});
