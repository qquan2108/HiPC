import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSendRecoveryCode = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      alert('Đã gửi link đặt lại mật khẩu đến email của bạn!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return;
    setIsSendingOtp(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmResult(confirmation);
      alert('OTP đã được gửi!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmResult || !otp) return;
    setIsVerifyingOtp(true);
    try {
      await confirmResult.confirm(otp);
      alert('Xác thực OTP thành công! Bạn có thể đặt lại mật khẩu.');
    } catch (err) {
      alert('Mã OTP không chính xác hoặc đã hết hạn! ' + err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand / Logo */}
            <View style={styles.brandSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="cloud" size={40} color="#fff" />
              </View>
              <Text style={styles.brandName}>HIPC</Text>
              <Text style={styles.tagline}>Phục hồi mật khẩu</Text>
            </View>

            {/* Content Card */}
            <View style={styles.contentCard}>
              <Text style={styles.title}>Quên mật khẩu?</Text>

              <View style={styles.inputContainer}>
                <FontAwesome name="envelope" size={20} color="#aaa" style={styles.icon} />
                <TextInput
                  placeholder="Nhập email của bạn."
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.note}>
                * Chúng tôi sẽ gửi mã khôi phục đến email bạn đã đăng ký.
              </Text>

              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.6 }]}
                onPress={handleSendRecoveryCode}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Đang gửi...' : 'Nhận mã khôi phục'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Hoặc dùng số điện thoại</Text>

              <View style={styles.inputContainer}>
                <FontAwesome name="phone" size={20} color="#aaa" style={styles.icon} />
                <TextInput
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

                <TouchableOpacity
                  style={[styles.button, isSendingOtp && { opacity: 0.6 }]}
                  onPress={handleSendOtp}
                  disabled={isSendingOtp}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isSendingOtp ? 'Đang gửi...' : 'Gửi OTP'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {confirmResult && (
                  <>
                    <View style={styles.inputContainer}>
                      <FontAwesome name="key" size={20} color="#aaa" style={styles.icon} />
                      <TextInput
                        placeholder="Nhập mã OTP"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.button, isVerifyingOtp && { opacity: 0.6 }]}
                      onPress={handleVerifyOtp}
                      disabled={isVerifyingOtp}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>
                          {isVerifyingOtp ? 'Đang xác thực...' : 'Xác thực OTP'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

              <TouchableOpacity onPress={() => router.push('/LoginScreen')}>
                <Text style={styles.backToLogin}>← Quay về đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  note: {
    color: '#999',
    fontSize: 13,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backToLogin: {
    color: '#667eea',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
});


