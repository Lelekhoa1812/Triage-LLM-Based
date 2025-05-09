import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

// Update icon paths if necessary
import chatbotIcon from '../../assets/icons/chatbot.png';
import profileIcon from '../../assets/icons/profile.png';
import emergencyIcon from '../../assets/icons/emergency.png';
import qrwalletIcon from '../../assets/icons/qrwallet.png';
import settingsIcon from '../../assets/icons/settings.png';

const {width} = Dimensions.get('window');

const TabBar = ({state, descriptors, navigation}) => {
  const height = 70;
  const tabWidth = width / state.routes.length;

  const tabConfig = {
    Chatbot: {icon: chatbotIcon, activeColor: 'black', activeBgColor: 'white'},
    Profile: {icon: profileIcon, activeColor: 'black', activeBgColor: 'white'},
    Emergency: {
      icon: emergencyIcon,
      activeColor: 'white',
      activeBgColor: '#FF3B30',
    },
    QRWallet: {
      icon: qrwalletIcon,
      activeColor: 'black',
      activeBgColor: 'white',
    },
    Settings: {
      icon: settingsIcon,
      activeColor: 'black',
      activeBgColor: 'white',
    },
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} style={styles.svgStyle}>
        <Path d={`M0 0 H${width} V${height} H0 Z`} fill="#0047AB" />
      </Svg>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const config = tabConfig[route.name] || {};

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const isEmergency = route.name === 'Emergency';

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, isEmergency && styles.emergencyTab]}
              activeOpacity={0.7}>
              <View
                style={[
                  isFocused ? styles.focusedIconWrapper : styles.iconWrapper,
                  {
                    backgroundColor: isFocused
                      ? config.activeBgColor
                      : 'transparent',
                  },
                  isEmergency && isFocused && styles.emergencyFocused,
                ]}>
                <Image
                  source={config.icon}
                  style={{
                    width: isFocused ? 24 : 20,
                    height: isFocused ? 24 : 20,
                    tintColor: isFocused ? config.activeColor : 'white',
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {fontSize: isFocused ? 11 : 9},
                  isEmergency && styles.emergencyLabel,
                ]}>
                {label}
              </Text>
              {isEmergency && <View style={styles.emergencyDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: 'transparent',
  },
  svgStyle: {
    position: 'absolute',
    top: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 6,
  },
  focusedIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 23,
    marginBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconWrapper: {
    padding: 6,
    marginBottom: 2,
  },
  tabLabel: {
    color: 'white',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Inter-SemiBold',
  },
  emergencyTab: {
    position: 'relative',
  },
  emergencyFocused: {
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  emergencyLabel: {
    fontWeight: 'bold',
  },
  emergencyDot: {
    position: 'absolute',
    top: 3,
    right: '30%',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: 'white',
  },
});

export default TabBar;
