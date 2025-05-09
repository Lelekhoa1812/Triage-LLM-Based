import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {ThemeContext} from '../context/ThemeContext';

const QRWalletScreen = () => {
  const {theme} = useContext(ThemeContext);
  const [qrSize, setQrSize] = useState(220);

  // Mocked user data - would come from your backend/auth system
  const user = {
    qr_id: 'USER-12345-QR',
    name: 'John Doe',
    emergency_contact: 'Jane Doe (555-123-4567)',
  };

  // Function to share QR code ID
  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `My Medical QR ID: ${user.qr_id}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share QR code');
    }
  };

  // Function to download QR code (mock implementation)
  const handleDownloadQR = () => {
    Alert.alert(
      'QR Code Downloaded',
      'Your QR code has been saved to your device gallery.',
      [{text: 'OK'}],
    );
  };

  // Function to refresh QR code (mock implementation)
  const handleRefreshQR = () => {
    Alert.alert(
      'Refresh QR Code',
      'Are you sure you want to generate a new QR code? This will invalidate your current code.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Refresh',
          onPress: () => {
            // In a real app, you would call an API to refresh the QR code
            Alert.alert('Success', 'Your QR code has been refreshed');
          },
        },
      ],
    );
  };

  // Colors based on theme
  const isDark = theme?.mode === 'dark';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const secondaryTextColor = isDark ? '#A0A0A0' : '#6B7280';
  const cardBackground = isDark ? '#2C2C2E' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3C' : '#E5E5EA';
  const qrBackground = isDark ? '#FFFFFF' : '#FFFFFF';
  const qrForeground = isDark ? '#1F2937' : '#1F2937';
  const buttonBackground = isDark ? '#2C2C2E' : '#F2F2F7';
  const buttonTextColor = isDark ? '#FFFFFF' : '#1F2937';
  const iconColor = isDark ? '#8E8E93' : '#3A3A3C';

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: textColor}]}>My QR Wallet</Text>
          <Text style={[styles.subtitle, {color: secondaryTextColor}]}>
            Scan to share your medical information
          </Text>
        </View>

        <View
          style={[
            styles.qrCardContainer,
            {backgroundColor: cardBackground, borderColor},
          ]}>
          <View style={styles.userInfoContainer}>
            <FontAwesome5 name="user-circle" size={24} color={iconColor} />
            <Text style={[styles.userName, {color: textColor}]}>
              {user.name}
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={user.qr_id}
              size={qrSize}
              color={qrForeground}
              backgroundColor={qrBackground}
              // logo={require('../../assets/images/logo.png')} // Add your logo here
              logoSize={qrSize * 0.2}
              logoBackgroundColor="white"
              logoBorderRadius={5}
            />
          </View>

          <Text style={[styles.qrText, {color: textColor}]}>
            ID: {user.qr_id}
          </Text>

          <View style={styles.emergencyInfo}>
            <FontAwesome5
              name="exclamation-circle"
              size={14}
              color={isDark ? '#FF9F0A' : '#FF9500'}
            />
            <Text style={[styles.emergencyText, {color: secondaryTextColor}]}>
              Emergency Contact: {user.emergency_contact}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: buttonBackground}]}
            onPress={handleShareQR}>
            <FontAwesome5 name="share-alt" size={16} color={iconColor} />
            <Text style={[styles.actionText, {color: buttonTextColor}]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: buttonBackground}]}
            onPress={handleDownloadQR}>
            <FontAwesome5 name="download" size={16} color={iconColor} />
            <Text style={[styles.actionText, {color: buttonTextColor}]}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: buttonBackground}]}
            onPress={handleRefreshQR}>
            <FontAwesome5 name="sync" size={16} color={iconColor} />
            <Text style={[styles.actionText, {color: buttonTextColor}]}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.infoCard,
            {backgroundColor: cardBackground, borderColor},
          ]}>
          <Text style={[styles.infoTitle, {color: textColor}]}>
            About Your QR Wallet
          </Text>
          <Text style={[styles.infoText, {color: secondaryTextColor}]}>
            Your QR code provides secure access to your medical profile during
            emergencies. Healthcare providers can scan this code to access your
            vital medical information.
          </Text>
          <Text
            style={[
              styles.infoText,
              {color: secondaryTextColor, marginTop: 8},
            ]}>
            For security reasons, refresh your QR code periodically or if you
            believe it has been compromised.
          </Text>
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  qrCardContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginLeft: 10,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  emergencyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    marginLeft: 8,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default QRWalletScreen;
