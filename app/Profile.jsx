// components/Profile.js
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(userStr => {
      if (userStr) {
        const u = JSON.parse(userStr);
        fetchUser(u.id || u._id);
      } else {
        setShowLoginDialog(true);
      }
    });
  }, []);

  const fetchUser = async (userId) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không lấy được thông tin người dùng');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('./LoginScreen');
  };

  return (
    <>
      {/* Modal luôn hiển thị nếu showLoginDialog true */}
      <Modal
        visible={showLoginDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginDialog(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 28,
            alignItems: 'center',
            width: 320,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5
          }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>😺</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#1976ff' }}>
              Bạn chưa đăng nhập!
            </Text>
            <Text style={{ color: '#444', textAlign: 'center', marginBottom: 18 }}>
              Hãy đăng nhập để sử dụng đầy đủ chức năng của ứng dụng nhé!
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#1976ff',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  marginRight: 8
                }}
                onPress={() => {
                  setShowLoginDialog(false);
                  router.replace('./LoginScreen');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f0f4fa',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22
                }}
                onPress={() => setShowLoginDialog(false)}
              >
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nếu chưa có user và không show dialog thì chỉ hiện loading */}
      {!user && !showLoginDialog ? (
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      ) : null}

      {/* Nếu đã có user thì mới render profile */}
      {user && (
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
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <Text style={styles.name}>{user.full_name}</Text>
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
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      )}
    </>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#b0b9c8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 18
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1976ff'
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 18
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: '#eaf2ff'
  },
  avatarPlaceholder: {
    backgroundColor: 'transparent'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginTop: 2,
    marginBottom: 8
  },
  menu: {
    marginTop: 8
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4fa',
    backgroundColor: '#fff'
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '500'
  }
});
