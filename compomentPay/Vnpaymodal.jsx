import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import axiosInstance from '../utils/AxiosInstance';

export default function VnPayModal({ visible, orderId, amount, orderInfo, onClose }) {
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) { setPaymentUrl(null); return; }
    setLoading(true);
    axiosInstance.post('/vnpay/create_payment', { orderId, amount, orderInfo })
      .then(res => {
        const data = res.data;
        if (data.code === 0 && data.data.paymentUrl) {
          setPaymentUrl(data.data.paymentUrl);
        } else {
          throw new Error(data.message || 'Không có URL thanh toán');
        }
      })
      .catch(err => onClose({ success: false, message: err.message }))
      .finally(() => setLoading(false));
  }, [visible]);

  const onNavChange = ({ url }) => {
    if (url.startsWith(process.env.VNPAY_RETURNURL)) {
      const match = url.match(/vnp_ResponseCode=([^&]+)/);
      const code = match ? match[1] : null;
      onClose({ success: code === '00', code });
    }
  };

  return (
    <Modal visible={visible} animationType='slide'>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onClose({ success: false })}>
          <Feather name='x' size={24} color='#222' />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán VNPAY</Text>
      </View>
      {loading && <ActivityIndicator style={{ flex: 1 }} size='large' />}
      {!loading && paymentUrl && (
        <WebView source={{ uri: paymentUrl }} onNavigationStateChange={onNavChange} startInLoadingState />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f7f7f7' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
});