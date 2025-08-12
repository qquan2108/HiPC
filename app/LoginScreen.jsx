// screens/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthInput from '../compomentLogin/AuthInput';
import RegisterPrompt from '../compomentLogin/RegisterPrompt';
import SocialButtons from '../compomentLogin/SocialButtons';
import axiosInstance from '../utils/AxiosInstance';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/users/login', { email, password });
      console.log("🧩 res.data:", res.data);
      if (res.data?.token) {
        await AsyncStorage.setItem('token', res.data.token);
        const user = res.data.user;
        console.log("👤 res.data.user:", user);
        console.log("🆔 user._id:", user?._id);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('user_id', user.id);
        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công!',
          text2: 'Chào mừng bạn quay trở lại 👋',
          visibilityTime: 2000,
          position: 'top',
          autoHide: true,
        });
        setTimeout(() => {
          if (router.params?.redirect) {
            router.replace(router.params.redirect);
          } else {
            router.replace('/HomeScreen');
          }
        }, 1500);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi đăng nhập',
        text2: err.response?.data?.message || 'Đăng nhập thất bại',
        visibilityTime: 3000,
        position: 'top',
        autoHide: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header Wave Design */}
            <View style={styles.headerWave}>
              <View style={styles.waveShape} />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Logo/Brand Section */}
              <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                  <Ionicons name="cloud" size={40} color="#fff" />
                </View>
                <Text style={styles.brandName}>HIPC</Text>
                <Text style={styles.tagline}>Chào mừng trở lại</Text>
              </View>

              {/* Main Content Card */}
              <View style={styles.contentCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.welcomeTitle}>Đăng Nhập</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Tiếp tục hành trình của bạn
                  </Text>
                </View>

                <AuthInput
                  icon={
                    <Ionicons
                      name="mail-outline"
                      size={24}
                      color="#8B5CF6"
                    />
                  }
                  placeholder="Email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />

                <AuthInput
                  ref={passwordRef}
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={24}
                      color="#8B5CF6"
                    />
                  }
                  placeholder="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  showPass={showPass}
                  setShowPass={setShowPass}
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() => router.push('/ForgotPasswordScreen')}
                >
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.loginButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loginText}>Đang xử lý...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginText}>Đăng Nhập</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <SocialButtons />

                <RegisterPrompt onPress={() => router.push('/SignUpSreen')} />
              </View>
            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  headerWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  waveShape: {
    position: 'absolute',
    top: 150,
    left: -50,
    right: -50,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    transform: [{ scaleX: 2 }],
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    marginBottom: 40,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 4,
  },
  forgotText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default LoginScreen;