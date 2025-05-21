// import React from 'react';
// import {NavigationContainer} from '@react-navigation/native';
// import {Text as RNText, TextInput as RNTextInput} from 'react-native';
// import {ThemeProvider} from './src/context/ThemeContext';
// import {LanguageProvider} from './src/context/LanguageContext';
// import AppNavigator from './src/navigation/AppNavigator';

// // Create a custom Text component to apply default font family
// const Text = (props: any) => (
//   <RNText {...props} style={[{fontFamily: 'Inter-Regular'}, props.style]} />
// );

// // Create a custom TextInput component to apply default font family
// const TextInput = (props: any) => (
//   <RNTextInput
//     {...props}
//     style={[{fontFamily: 'Inter-Regular'}, props.style]}
//   />
// );

// export default function App() {
//   return (
//     <ThemeProvider>
//       <LanguageProvider>
//         <NavigationContainer>
//           <AppNavigator />
//         </NavigationContainer>
//       </LanguageProvider>
//     </ThemeProvider>
//   );
// }
