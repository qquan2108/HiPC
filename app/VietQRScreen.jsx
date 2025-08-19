import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from "react-native-toast-message";
import { io } from 'socket.io-client';
import axiosInstance from '../utils/AxiosInstance';

const { width, height } = Dimensions.get('window');

const socket = io(axiosInstance.defaults.baseURL);

export default function VietQRScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const {
    acc,
    bank,
    amount,
    des,
    orderId,
    total,
    products,
    address,
    paymentMethod,
  } = useLocalSearchParams();

  // Pulse animation for QR code
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => pulse.stop();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          Alert.alert(
            'Hết thời gian',
            'Phiên thanh toán đã hết hạn. Vui lòng thử lại.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.on('payment_success', (data) => {
      // Kiểm tra orderId nếu cần
      Toast.show({
        type: 'success',
        text1: 'Thanh toán thành công!',
        text2: `Đơn hàng ${data.orderId} đã được xác nhận.`,
      });
      // Chuyển trang sau khi toast
      setTimeout(() => {
        router.replace('/CheckoutSuccess');
      }, 1500);
    });

    return () => {
      socket.off('payment_success');
    };
  }, []);

  if (!acc || !bank) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>Thiếu thông tin thanh toán</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
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
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Thêm hàm lấy tên ngân hàng từ mã
  const BANK_NAMES = {
    'VCB': 'Vietcombank',
    'MBBank': 'MBBANK',
    'TCB': 'Techcombank',
    // Thêm các mã khác nếu cần
  };
  const getBankName = (code) => BANK_NAMES[code] || code;

  const handleCopy = async (text, label = '') => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: 'success',
      text1: 'Đã sao chép',
      text2: label ? `${label} đã được sao chép` : 'Đã sao chép vào clipboard',
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5B8C']}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Thanh toán QR</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              <Text style={styles.timerText}>
                Thời gian còn lại: {formatTime(countdown)}
              </Text>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
                <Text style={styles.qrSubtitle}>
                  Sử dụng ứng dụng ngân hàng để quét mã
                </Text>
                
                <Animated.View 
                  style={[
                    styles.qrImageContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Image source={{ uri: qrUrl }} style={styles.qrImage} />
                  <View style={styles.qrOverlay}>
                    <Ionicons name="scan-outline" size={30} color="#4A90E2" />
                  </View>
                </Animated.View>

                {/* Payment Info */}
                <View style={styles.paymentInfo}>
                  {amount && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Ionicons name="card-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>Số tiền</Text>
                      </View>
                      <Text style={styles.amountText}>
                        {formatAmount(amount)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="business-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Ngân hàng</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                      <Text style={styles.infoValue}>{getBankName(bank)}</Text>
                      <TouchableOpacity onPress={() => handleCopy(bank, 'Mã ngân hàng')}>
                        <Ionicons name="copy-outline" size={18} color="#4A90E2" style={{ marginLeft: 8 }} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="person-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Tài khoản</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                      <Text style={styles.infoValue}>{acc}</Text>
                      <TouchableOpacity onPress={() => handleCopy(acc, 'Số tài khoản')}>
                        <Ionicons name="copy-outline" size={18} color="#4A90E2" style={{ marginLeft: 8 }} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {des && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Ionicons name="document-text-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>Nội dung</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={styles.infoValue}>
                          {decodeURIComponent(des)}
                        </Text>
                        <TouchableOpacity onPress={() => handleCopy(decodeURIComponent(des), 'Nội dung chuyển khoản')}>
                          <Ionicons name="copy-outline" size={18} color="#4A90E2" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Hướng dẫn thanh toán</Text>
              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Mở ứng dụng ngân hàng trên điện thoại
                </Text>
              </View>
              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Chọn tính năng quét QR Code
                </Text>
              </View>
              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Quét mã QR và xác nhận thanh toán
                </Text>
              </View>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />
                <Text style={styles.statusText}>Đang chờ thanh toán...</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
        <Toast />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrImageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  qrOverlay: {
    position: 'absolute',
    top: -30,
    right: -30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});