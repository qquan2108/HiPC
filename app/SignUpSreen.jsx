import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

// Components
import InputField from "../compomentSignup/InputField";
import PasswordInput from "../compomentSignup/PasswordInput";
import RedirectText from "../compomentSignup/RedirectText";
import SocialLogin from "../compomentSignup/SocialLogin";

const { width } = Dimensions.get("window");

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fullName || !email || !pass || !confirmPass || !phone || !address) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }
    if (pass.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }
    if (pass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/users/register", {
        full_name: fullName,
        email,
        password: pass,
        phone,
        address,
      });

      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công!',
        text2: res.data.message || 'Chào mừng bạn đến với HIPC 🎉',
        visibilityTime: 2000,
        position: 'top',
        autoHide: true,
      });
      setTimeout(() => {
        router.push("/LoginScreen");
      }, 1500);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Đăng ký thất bại',
        text2: err.response?.data?.message || "Có lỗi xảy ra.",
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            {/* Logo + thương hiệu */}
            <View style={styles.brandSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="cloud" size={40} color="#fff" />
              </View>
              <Text style={styles.brandName}>HIPC</Text>
              <Text style={styles.tagline}>Chào mừng bạn đến với HIPC</Text>
            </View>

            {/* Card nội dung */}
            <View style={styles.contentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.welcomeTitle}>Tạo tài khoản</Text>
                <Text style={styles.welcomeSubtitle}>
                  Nhập thông tin của bạn để bắt đầu
                </Text>
              </View>

              <InputField
                icon={<FontAwesome name="user" size={20} color="#aaa" style={{ marginRight: 10 }} />}
                placeholder="Họ và tên"
                value={fullName}
                onChangeText={setFullName}
              />
              <InputField
                icon={<FontAwesome name="phone" size={20} color="#aaa" style={{ marginRight: 10 }} />}
                placeholder="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <InputField
                icon={<FontAwesome name="map-marker" size={20} color="#aaa" style={{ marginRight: 10 }} />}
                placeholder="Địa chỉ"
                value={address}
                onChangeText={setAddress}
              />
              <InputField
                icon={<FontAwesome name="envelope" size={20} color="#aaa" style={{ marginRight: 10 }} />}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
              <PasswordInput
                placeholder="Mật khẩu"
                value={pass}
                onChangeText={setPass}
                show={showPass}
                toggleShow={() => setShowPass(!showPass)}
              />
              <PasswordInput
                placeholder="Nhập lại mật khẩu"
                value={confirmPass}
                onChangeText={setConfirmPass}
                show={showConfirmPass}
                toggleShow={() => setShowConfirmPass(!showConfirmPass)}
              />

              <Text style={styles.termText}>
                Bằng cách nhấn "Tạo tài khoản", bạn đồng ý với điều khoản sử dụng.
              </Text>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.registerText}>
                    {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                <View style={styles.dividerLine} />
              </View>

              <SocialLogin />

              <RedirectText
                label="Đã có tài khoản? "
                linkLabel="Đăng nhập"
                onPress={() => router.push("/LoginScreen")}
              />
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
  cardHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  termText: {
    color: '#999',
    fontSize: 13,
    marginVertical: 20,
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  buttonGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default SignUpScreen;
