import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1976ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar + Name */}
      <View style={styles.avatarWrapper}>
        <View>
          <Image
            source={require('../assets/images/avatar.png')}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Feather name="edit-2" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Nguyễn Văn A</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem
          icon={<Feather name="user" size={22} color="#1976ff" />}
          label="Thông tin cá nhân"
          onPress={() => router.push('./UserInfo')}
        />
        <MenuItem
          icon={<Feather name="heart" size={22} color="#1976ff" />}
          label="Yêu thích"
          onPress={() => router.push('./favorite')}
        />
        <MenuItem
          icon={<Feather name="credit-card" size={22} color="#1976ff" />}
          label="Phương thức thanh toán"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Feather name="package" size={22} color="#1976ff" />}
          label="Theo dõi đơn hàng"
          onPress={() => router.push('./theodoidonhang')}
        />
        <MenuItem
          icon={<Ionicons name="lock-closed-outline" size={22} color="#1976ff" />}
          label="Chính sách bảo mật"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Feather name="settings" size={22} color="#1976ff" />}
          label="Cài đặt"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Feather name="help-circle" size={22} color="#1976ff" />}
          label="Chăm sóc khách hàng"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Feather name="log-out" size={22} color="#1976ff" />}
          label="Đăng xuất"
          onPress={async () => {
            await AsyncStorage.removeItem('token');
            // Nếu bạn lưu thông tin user, cũng nên xóa luôn:
            await AsyncStorage.removeItem('user');
            router.push('./LoginScreen');
          }}
        />
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#b0b9c8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 18,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1976ff',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: '#eaf2ff',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    backgroundColor: '#1976ff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginTop: 2,
    marginBottom: 8,
  },
  menu: {
    marginTop: 8,
    paddingHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4fa',
    backgroundColor: '#fff',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});