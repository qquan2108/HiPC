import { Feather } from '@expo/vector-icons';
import { CardField, useStripe } from './stripeNativeWrapper.native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

const { width } = Dimensions.get('window');

export default function StripeModal({ visible, amount, orderId, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { confirmPayment } = useStripe();

  useEffect(() => {
    if (!visible) {
      setClientSecret(null);
      setErrorMsg('');
      setPaymentProcessing(false);
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
    if (!clientSecret || !cardDetails?.complete) return;
    setPaymentProcessing(true);
    setErrorMsg('');
    
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: {} },
      });
      
      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose({ success: true, paymentIntent });
      }
    } catch (err) {
      setErrorMsg('Đã xảy ra lỗi trong quá trình thanh toán');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => onClose({ success: false })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.stripeIcon}>
                <Text style={styles.stripeText}>stripe</Text>
              </View>
              <Text style={styles.title}>Thanh toán an toàn</Text>
            </View>
          </View>

          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.content}>
              <View style={styles.webNotSupported}>
                <Feather name="monitor" size={48} color="#E5E7EB" />
                <Text style={styles.webNotSupportedText}>
                  Stripe chưa hỗ trợ trên nền tảng web
                </Text>
                <Text style={styles.webNotSupportedSubtext}>
                  Vui lòng sử dụng ứng dụng di động
                </Text>
              </View>
            </View>
          ) : loading ? (
            <View style={styles.content}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Đang khởi tạo thanh toán...</Text>
              </View>
            </View>
          ) : errorMsg ? (
            <View style={styles.content}>
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Feather name="alert-circle" size={24} color="#EF4444" />
                </View>
                <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity 
                  style={styles.errorButton} 
                  onPress={() => onClose({ success: false })}
                >
                  <Text style={styles.errorButtonText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : clientSecret ? (
            <View style={styles.content}>
              {/* Card Input */}
              <View style={styles.cardContainer}>
                <Text style={styles.cardLabel}>Thông tin thẻ</Text>
                <View style={styles.cardFieldWrapper}>
                  <CardField
                    postalCodeEnabled={false}
                    placeholders={{ 
                      number: '1234 1234 1234 1234',
                      expiry: 'MM/YY',
                      cvc: 'CVC'
                    }}
                    cardStyle={styles.cardStyle}
                    style={styles.cardField}
                    onCardChange={(details) => {
                      setCardDetails(details);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
                {cardDetails?.complete && (
                  <View style={styles.cardValidIndicator}>
                    <Feather name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.cardValidText}>Thông tin thẻ hợp lệ</Text>
                  </View>
                )}
              </View>

              {/* Security Info */}
              <View style={styles.securityInfo}>
                <Feather name="shield" size={16} color="#6B7280" />
                <Text style={styles.securityText}>
                  Được mã hóa và bảo mật bởi Stripe
                </Text>
              </View>

              {/* Payment Button */}
              <TouchableOpacity 
                style={[
                  styles.payButton,
                  (!cardDetails?.complete || paymentProcessing) && styles.payButtonDisabled
                ]} 
                onPress={handlePay}
                disabled={!cardDetails?.complete || paymentProcessing}
              >
                {paymentProcessing ? (
                  <View style={styles.payButtonLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Đang xử lý...</Text>
                  </View>
                ) : (
                  <>
                    <Feather name="credit-card" size={18} color="#FFFFFF" />
                    <Text style={styles.payButtonText}>
                      Thanh toán {formatAmount(amount)}
                    </Text>
                  </>
                )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginRight: 32, // Balance the close button
  },
  stripeIcon: {
    backgroundColor: '#635BFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  stripeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    minHeight: 200,
  },
  webNotSupported: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  webNotSupportedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  webNotSupportedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  cardFieldWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardField: {
    width: '100%',
    height: 56,
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontSize: 16,
    placeholderColor: '#999999',
    borderWidth: 0,
  },
  cardValidIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardValidText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  payButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  payButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});