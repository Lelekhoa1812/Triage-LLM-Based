import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {ThemeContext} from '../context/ThemeContext';

import {useNavigation} from '@react-navigation/native';

const SettingsScreen = props => {
  const navigation = props.navigation || useNavigation();
  const {theme, toggleTheme} = useContext(ThemeContext);
  const [notifications, setNotifications] = useState({
    chatbot: true,
    emergency: true,
    qrWallet: false,
  });

  const handleToggleNotification = key => {
    setNotifications(prev => ({...prev, [key]: !prev[key]}));
    Alert.alert(
      'Notification Updated',
      `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
        notifications[key] ? 'disabled' : 'enabled'
      }.`,
    );
  };

  const handleBackupQRWallet = () => {
    Alert.alert(
      'Backup QR Wallet',
      'QR Wallet backup initiated. Check your email for the backup file.',
    );
  };

  const handleUpdateEmergencyContact = () => {
    Alert.alert(
      'Update Emergency Contact',
      'Navigate to emergency contact update screen.',
    );
    // navigation.navigate('UpdateEmergencyContact');
  };

  const handleViewProfile = () => {
    Alert.alert('View Profile', 'Navigate to profile screen.');
    // navigation.navigate('ProfileScreen');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Navigate to password change screen.');
    // navigation.navigate('ChangePassword');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Account Deleted', 'Your account has been deleted.'),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Logged Out', 'You have been logged out.');
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}], // Reset navigation stack to LoginScreen
          });
        },
      },
    ]);
  };

  // Enhanced row styles with better light/dark mode differentiation
  const rowStyle = [
    styles.row,
    {
      backgroundColor: theme.mode === 'dark' ? '#2C2C2E' : '#F2F2F7',
      borderColor: theme.mode === 'dark' ? '#3A3A3C' : '#E5E5EA',
      borderWidth: 1,
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: theme.mode === 'dark' ? '#121212' : '#FFFFFF'},
      ]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.title,
            {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
          ]}>
          Settings
        </Text>

        {/* Dark Mode */}
        <View style={rowStyle}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="moon"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={theme.mode === 'dark'}
            trackColor={{
              false: '#D1D1D6',
              true: '#5E5CE6',
            }}
            thumbColor={theme.mode === 'dark' ? '#FFFFFF' : '#FFFFFF'}
            onValueChange={toggleTheme}
          />
        </View>

        {/* Notification Settings */}
        <Text
          style={[
            styles.sectionTitle,
            {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
          ]}>
          Notifications
        </Text>
        <View style={rowStyle}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="robot"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Chatbot Alerts
            </Text>
          </View>
          <Switch
            value={notifications.chatbot}
            trackColor={{
              false: '#D1D1D6',
              true: '#5E5CE6',
            }}
            thumbColor="#FFFFFF"
            onValueChange={() => handleToggleNotification('chatbot')}
          />
        </View>
        <View style={rowStyle}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="exclamation-circle"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Emergency Alerts
            </Text>
          </View>
          <Switch
            value={notifications.emergency}
            trackColor={{
              false: '#D1D1D6',
              true: '#5E5CE6',
            }}
            thumbColor="#FFFFFF"
            onValueChange={() => handleToggleNotification('emergency')}
          />
        </View>
        <View style={rowStyle}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="qrcode"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              QR Wallet Updates
            </Text>
          </View>
          <Switch
            value={notifications.qrWallet}
            trackColor={{
              false: '#D1D1D6',
              true: '#5E5CE6',
            }}
            thumbColor="#FFFFFF"
            onValueChange={() => handleToggleNotification('qrWallet')}
          />
        </View>

        {/* Emergency Settings */}
        <Text
          style={[
            styles.sectionTitle,
            {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
          ]}>
          Emergency
        </Text>
        <TouchableOpacity
          style={rowStyle}
          onPress={handleUpdateEmergencyContact}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="phone-alt"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Update Emergency Contact
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>

        {/* QR Wallet Settings */}
        <Text
          style={[
            styles.sectionTitle,
            {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
          ]}>
          QR Wallet
        </Text>
        <TouchableOpacity style={rowStyle} onPress={handleBackupQRWallet}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="cloud-upload-alt"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Backup QR Wallet
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>

        {/* Account Settings */}
        <Text
          style={[
            styles.sectionTitle,
            {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
          ]}>
          Account
        </Text>
        <TouchableOpacity style={rowStyle} onPress={handleViewProfile}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="user"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              View Profile
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={rowStyle} onPress={handleChangePassword}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="lock"
              size={18}
              color={theme.mode === 'dark' ? '#8E8E93' : '#3A3A3C'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'},
              ]}>
              Change Password
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={rowStyle} onPress={handleDeleteAccount}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="trash"
              size={18}
              color={theme.mode === 'dark' ? '#FF453A' : '#FF3B30'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FF453A' : '#FF3B30'},
              ]}>
              Delete Account
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={rowStyle} onPress={handleLogout}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="sign-out-alt"
              size={18}
              color={theme.mode === 'dark' ? '#FF9F0A' : '#FF9500'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {color: theme.mode === 'dark' ? '#FF9F0A' : '#FF9500'},
              ]}>
              Logout
            </Text>
          </View>
          <FontAwesome5
            name="chevron-right"
            size={18}
            color={theme.mode === 'dark' ? '#8E8E93' : '#8E8E93'}
          />
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  bottomPadding: {
    height: 60,
  },
});

export default SettingsScreen;
