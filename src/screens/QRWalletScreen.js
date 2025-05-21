import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {ThemeContext} from '../context/ThemeContext';

// Hardcoded user data (TODO: Replace with auth context or backend fetch)
const user = {
  user_id: 'bda550aa4e88',
  name: 'Khoa',
  emergency_contact: 'Jane Le (0400765432)',
};

const QRWalletScreen = () => {
  const {theme} = useContext(ThemeContext);

  // Function to share QR code ID
  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `My Medical QR ID: ${user.user_id}`,
      });
    } catch (error) {
      console.error('Share QR error:', error);
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
            // TODO: Call API to refresh the QR code
            Alert.alert('Success', 'Your QR code has been refreshed');
          },
        },
      ],
    );
  };

  // Theme-based colors
  const isDark = theme?.mode === 'dark';
  const backgroundColor = isDark ? '#121212' : '#F8FAFC';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const secondaryTextColor = isDark ? '#A0A0A0' : '#6B7280';
  const cardBackground = isDark ? '#2C2C2E' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';
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
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.user_id}`,
              }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.qrText, {color: textColor}]}>
            ID: {user.user_id}
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
        <View style={styles.bottomSpacer} />
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
    marginBottom: 10,
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
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 14,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginLeft: 10,
  },
  qrContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  qrImage: {
    width: 150,
    height: 150,
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
    borderRadius: 12,
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
    elevation: 2,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
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
  bottomSpacer: {
    height: 100,
  },
});

export default QRWalletScreen;
