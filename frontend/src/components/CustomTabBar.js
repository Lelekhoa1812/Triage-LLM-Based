// src/components/CustomTabBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Icons
import { Image } from 'react-native';
import chatbotIcon from '../components/icons/chatbot.png';
import profileIcon from '../components/icons/profile.png';
import emergencyIcon from '../components/icons/emergency.png';
import qrwalletIcon from '../components/icons/qrwallet.png';
import settingsIcon from '../components/icons/settings.png';

const { width } = Dimensions.get('window');

// Tab design
const TabBar = ({ state, descriptors, navigation }) => {
  const height = 80;
  const radius = 30;
  const tabWidth = width / state.routes.length;

  return (
    <View style={{ position: 'absolute', bottom: 0, width, height }}>
      <Svg width={width} height={height} style={styles.svgStyle}>
        <Path
          d={`
            M0 0
            H${width}
            V${height}
            H0
            Z
          `}
          fill="#0047AB"
        />
      </Svg>

      // Stylings
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          // Trigger focus
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Define icons
          const iconMap = {
            Chatbot: chatbotIcon,
            Profile: profileIcon,
            Emergency: emergencyIcon,
            QRWallet: qrwalletIcon,
            Settings: settingsIcon,
          };
          const focusedIcon = route.name === 'Emergency' ? 'white' : '#00008B'; // Dark red for Emergency
          const focusedBackground = route.name === 'Emergency' ? '#8B0000' : 'white'; // Dark red for Emergency
          // Button stylings
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              // On focus
              <View
              // Focus emergency as red
              style={
                    isFocused
                      ? [styles.focusedIconWrapper, { backgroundColor: focusedBackground }]
                      : styles.iconWrapper
                  }
                >
                <Image
                  source={iconMap[route.name]}
                  style={{
                    width: isFocused ? 28 : 24,
                    height: isFocused ? 28 : 24,
                    tintColor: isFocused ? focusedIcon : 'white',
                  }}
                  resizeMode="contain"
                />
              </View>
              // Text focus
              <Text style={{ fontSize: isFocused ? 15 : 11, color: 'white' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  svgStyle: {
    position: 'absolute',
    top: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  focusedIconWrapper: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    padding: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconWrapper: {
    padding: 6,
  },
});

export default TabBar;
