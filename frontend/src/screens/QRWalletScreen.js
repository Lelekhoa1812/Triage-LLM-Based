// src/screens/QRWalletScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRWalletScreen() {
  const user = { qr_id: 'USER-12345-QR' };  // from your backend eventually

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My QR Wallet</Text>
      <QRCode value={user.qr_id} size={200} />
      <Text>Your QR Code ID: {user.qr_id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
});
