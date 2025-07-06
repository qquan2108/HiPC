import { Feather } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

export default function StripeModal({ visible, amount, orderId, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const { confirmPayment } = useStripe();

  useEffect(() => {
    if (!visible) {
      setClientSecret(null);
      setErrorMsg('');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    axiosInstance
      .post('/stripe/create-payment-intent', {
        amount,
        currency: 'vnd',
        metadata: { orderId },
      })
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(err => {
        console.error('Stripe error response:', err.response || err);
        const msg =
          err.response?.data?.error ||
          JSON.stringify(err.response?.data) ||
          err.message ||
          'Lỗi không xác định';
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  }, [visible, amount, orderId]);

  const handlePay = async () => {
    if (!clientSecret) return;
    setLoading(true);
    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: { billingDetails: {} },
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      onClose({ success: true, paymentIntent });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => onClose({ success: false })}>
              <Feather name="x" size={24} color="#222222" />
            </TouchableOpacity>
            <Text style={styles.title}>Thanh toán Stripe</Text>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.center}>
              <Text>Stripe chưa hỗ trợ trên nền tảng web.</Text>
            </View>
          ) : loading ? (
            <ActivityIndicator style={styles.center} size="large" color="#0000ff" />
          ) : errorMsg ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity style={styles.payBtn} onPress={() => onClose({ success: false })}>
                <Text style={styles.payBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          ) : clientSecret ? (
            <View style={styles.content}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: '4242 4242 4242 4242' }}
                cardStyle={styles.cardStyle}
                style={styles.cardField}
                onCardChange={details => setCardDetails(details)}
              />
              <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                <Text style={styles.payBtnText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    padding: 16,
  },
  content: {
    padding: 16,
    minHeight: 180,
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 24,
  },
  payBtn: {
    backgroundColor: '#1976ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 30,
  },
  cardStyle: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
});
