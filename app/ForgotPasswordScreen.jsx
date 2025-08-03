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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const [confirmResult, setConfirmResult] = useState(null);
  const [resetStep, setResetStep] = useState('email'); // 'email', 'phone', 'verify_otp', 'new_password'
  const [userPhoneCredential, setUserPhoneCredential] = useState(null);

  // Reset mật khẩu qua email
  const handleSendRecoveryCode = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }

    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert(
        'Thành công', 
        'Đã gửi link đặt lại mật khẩu đến email của bạn! Vui lòng kiểm tra email và làm theo hướng dẫn.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/LoginScreen')
          }
        ]
      );
    } catch (error) {
      console.error('Send password reset email error:', error);
      let errorMessage = 'Có lỗi xảy ra khi gửi email khôi phục.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email này chưa được đăng ký trong hệ thống.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
          break;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi OTP qua số điện thoại
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }

    // Định dạng số điện thoại (thêm +84 nếu cần)
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+84' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+84' + formattedPhone;
    }

    setIsSendingOtp(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setConfirmResult(confirmation);
      setResetStep('verify_otp');
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến số điện thoại của bạn!');
    } catch (error) {
      console.error('Send OTP error:', error);
      let errorMessage = 'Có lỗi xảy ra khi gửi OTP.';
      
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Số điện thoại không hợp lệ.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'Đã vượt quá giới hạn gửi SMS. Vui lòng thử lại sau.';
          break;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async () => {
    if (!confirmResult || !otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const credential = await confirmResult.confirm(otp.trim());
      setUserPhoneCredential(credential);
      setResetStep('new_password');
      Alert.alert('Thành công', 'Xác thực OTP thành công! Bây giờ bạn có thể đặt mật khẩu mới.');
    } catch (error) {
      console.error('Verify OTP error:', error);
      let errorMessage = 'Mã OTP không chính xác hoặc đã hết hạn.';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Mã OTP không chính xác.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
          break;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Đặt mật khẩu mới
  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const user = userPhoneCredential.user;
      
      // Cập nhật mật khẩu trên Firebase
      await user.updatePassword(newPassword);

      // Cập nhật mật khẩu trong database
      await updatePasswordInDatabase(user.uid || user.phoneNumber, newPassword);

      Alert.alert(
        'Thành công', 
        'Mật khẩu đã được đặt lại thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Đăng xuất user sau khi reset password
              auth().signOut();
              router.push('/LoginScreen');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Cập nhật mật khẩu trong database
  const updatePasswordInDatabase = async (identifier, newPassword) => {
    try {
      const response = await fetch('http://your-server.com/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier, // có thể là uid hoặc phone
          newPassword
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password in database');
      }

      return await response.json();
    } catch (error) {
      console.error('Update password in database error:', error);
      throw error;
    }
  };

  const renderEmailReset = () => (
    <>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Nhập email của bạn"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.note}>
        * Chúng tôi sẽ gửi link khôi phục đến email bạn đã đăng ký.
      </Text>

      <TouchableOpacity
        style={[styles.button, isLoading && { opacity: 0.6 }]}
        onPress={handleSendRecoveryCode}
        disabled={isLoading}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Nhận link khôi phục</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => setResetStep('phone')}
      >
        <Text style={styles.switchText}>Hoặc dùng số điện thoại</Text>
      </TouchableOpacity>
    </>
  );

  const renderPhoneReset = () => (
    <>
      <Text style={styles.title}>Khôi phục qua SĐT</Text>
      
      <View style={styles.inputContainer}>
        <FontAwesome name="phone" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Nhập số điện thoại (0xxxxxxxxx)"
          placeholderTextColor="#999"
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.note}>
        * Chúng tôi sẽ gửi mã OTP đến số điện thoại của bạn.
      </Text>

      <TouchableOpacity
        style={[styles.button, isSendingOtp && { opacity: 0.6 }]}
        onPress={handleSendOtp}
        disabled={isSendingOtp}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
          {isSendingOtp ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gửi mã OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => setResetStep('email')}
      >
        <Text style={styles.switchText}>Hoặc dùng email</Text>
      </TouchableOpacity>
    </>
  );

  const renderVerifyOtp = () => (
    <>
      <Text style={styles.title}>Xác thực OTP</Text>
      
      <View style={styles.inputContainer}>
        <FontAwesome name="key" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Nhập mã OTP (6 số)"
          placeholderTextColor="#999"
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <Text style={styles.note}>
        * Mã OTP đã được gửi đến số điện thoại {phoneNumber}
      </Text>

      <TouchableOpacity
        style={[styles.button, isVerifyingOtp && { opacity: 0.6 }]}
        onPress={handleVerifyOtp}
        disabled={isVerifyingOtp}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
          {isVerifyingOtp ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác thực OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.switchButton}
        onPress={handleSendOtp}
        disabled={isSendingOtp}
      >
        <Text style={styles.switchText}>
          {isSendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderNewPassword = () => (
    <>
      <Text style={styles.title}>Đặt mật khẩu mới</Text>
      
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
          placeholderTextColor="#999"
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Xác nhận mật khẩu mới"
          placeholderTextColor="#999"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isResettingPassword && { opacity: 0.6 }]}
        onPress={handleResetPassword}
        disabled={isResettingPassword}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
          {isResettingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderCurrentStep = () => {
    switch (resetStep) {
      case 'email':
        return renderEmailReset();
      case 'phone':
        return renderPhoneReset();
      case 'verify_otp':
        return renderVerifyOtp();
      case 'new_password':
        return renderNewPassword();
      default:
        return renderEmailReset();
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
              {renderCurrentStep()}

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
  gradientBackground: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 40 
  },
  brandSection: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  logoContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  brandName: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 3, 
    marginBottom: 4 
  },
  tagline: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.8)' 
  },
  contentCard: { 
    backgroundColor: '#fff', 
    borderRadius: 28, 
    padding: 28, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20, 
    elevation: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1F2937', 
    marginBottom: 24, 
    textAlign: 'center' 
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
    marginBottom: 12 
  },
  icon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000' 
  },
  note: { 
    color: '#999', 
    fontSize: 13, 
    marginBottom: 30, 
    textAlign: 'center',
    lineHeight: 18
  },
  button: { 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 24 
  },
  buttonGradient: { 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 20
  },
  switchText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  backToLogin: { 
    color: '#667eea', 
    textAlign: 'center', 
    fontSize: 15, 
    fontWeight: '600', 
    textDecorationLine: 'underline' 
  },
});

export default ForgotPasswordScreen;