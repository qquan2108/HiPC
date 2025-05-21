import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="arrow-left" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cá nhân</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={require('../assets/images/avatar.png')}
          style={styles.avatar}
        />
      </View>

      {/* Thông tin cá nhân */}
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <TouchableOpacity>
            <Text style={styles.changePass}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Số địa chỉ */}
      <Text style={styles.sectionTitle}>Số địa chỉ</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tỉnh/Thành phố</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quận/Huyện</Text>
        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Xã/Phường/Thị trấn</Text>
        <TextInput
          style={styles.input}
          value={ward}
          onChangeText={setWard}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    color: '#222',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    color: '#222',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePass: {
    color: '#f55858',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#f55858',
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 18,
    marginBottom: 30,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 17,
  },
});