import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  const handleSendRecoveryCode = () => {
    // Xử lý gửi mã phục hồi tại đây
    console.log('Email khôi phục:', email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên{'\n'}mật khẩu?</Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          placeholder="Nhập email của bạn."
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.note}>
        * Chúng tôi sẽ gửi mã khôi phục đến Email bạn đã điền.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleSendRecoveryCode}>
        <Text style={styles.buttonText}>Nhận mã khôi phục</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    marginBottom: 40,
    marginTop: 40,
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
    marginBottom: 14,
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
  },
  button: {
    backgroundColor: '#f55858',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;
