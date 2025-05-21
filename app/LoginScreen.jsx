import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chào Mừng</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={26} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Tên người dùng hoặc Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={26} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Feather name={showPass ? 'eye' : 'eye-off'} size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Quên mật khẩu */}
        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Nút đăng nhập */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Đăng Nhập</Text>
        </TouchableOpacity>

        {/* Dòng phân cách */}
        <Text style={styles.orText}>— Hoặc tiếp tục với —</Text>

        {/* Icon mạng xã hội */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialIcon}>
            <Image source={require('../assets/images/Google.png')} style={styles.socialImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Image source={require('../assets/images/apple.png')} style={styles.socialImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Image source={require('../assets/images/Facebook.png')} style={styles.socialImage} />
          </TouchableOpacity>
        </View>

        {/* Tạo tài khoản */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/SignUp')}>
            <Text style={styles.registerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    color: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 22,
    backgroundColor: '#f1f1f1',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  icon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#333',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotText: {
    color: '#f55858',
    fontSize: 17,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#f55858',
    paddingVertical: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  loginText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 17,
    marginBottom: 30,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 35,
  },
  socialIcon: {
    borderWidth: 1.5,
    borderColor: '#f55858',
    borderRadius: 100,
    padding: 18,
    marginHorizontal: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  socialImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  registerText: {
    color: '#555',
    fontSize: 17,
  },
  registerLink: {
    color: '#f55858',
    fontWeight: '800',
    fontSize: 17,
  },
});

export default LoginScreen;
