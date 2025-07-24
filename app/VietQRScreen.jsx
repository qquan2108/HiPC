import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function VietQRScreen() {
  const { acc, bank, amount, des } = useLocalSearchParams();

  if (!acc || !bank) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Thiếu tham số tài khoản hoặc ngân hàng</Text>
      </View>
    );
  }

  const query = [
    `acc=${encodeURIComponent(acc)}`,
    `bank=${encodeURIComponent(bank)}`,
  ];
  if (amount) query.push(`amount=${encodeURIComponent(amount)}`);
  if (des) query.push(`des=${encodeURIComponent(des)}`);

  const qrUrl = `https://qr.sepay.vn/img?${query.join('&')}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quét mã để thanh toán</Text>
      <Image source={{ uri: qrUrl }} style={styles.qrImage} />
      {amount ? (
        <Text style={styles.text}>Số tiền: {amount}</Text>
      ) : null}
      {des ? (
        <Text style={styles.text}>Nội dung: {decodeURIComponent(des)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrImage: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});
