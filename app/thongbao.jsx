import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const notifications = [
  {
    id: '1',
    status: 'Đặt hàng thành công',
    message: 'Cảm ơn bạn! Đơn hàng #A1023 đã được đặt thành công.',
    time: '5 phút trước',
    icon: 'check-circle',
    color: '#2ecc71',
  },
  {
    id: '2',
    status: 'Mã giảm giá mới!',
    message: 'Bạn vừa nhận được mã giảm giá 10% cho đơn hàng tiếp theo.',
    time: '15 phút trước',
    icon: 'gift',
    color: '#f39c12',
  },
  {
    id: '3',
    status: 'Đang chuẩn bị hàng',
    message: 'Đơn hàng #A1023 đang được người bán chuẩn bị.',
    time: '1 giờ trước',
    icon: 'box',
    color: '#3498db',
  },
  {
    id: '4',
    status: 'Thanh toán thất bại',
    message: 'Thanh toán cho đơn hàng #A1024 thất bại. Vui lòng thử lại.',
    time: '2 giờ trước',
    icon: 'x-octagon',
    color: '#e74c3c',
  },
  {
    id: '5',
    status: 'Giao hàng thất bại',
    message: 'Không thể giao đơn #A1022. Vui lòng kiểm tra địa chỉ hoặc đặt lại.',
    time: '1 ngày trước',
    icon: 'truck',
    color: '#e67e22',
  },
];

const NotificationScreen = () => {
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (!token) {
        setShowLoginDialog(true);
        setLoading(false);
        return;
      }
      AsyncStorage.getItem("user").then((userStr) => {
        if (!userStr || userStr === "undefined") {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        let stored;
        try {
          stored = JSON.parse(userStr);
        } catch (e) {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        const userId = stored.id || stored._id;
        if (!userId) {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        setShowLoginDialog(false);
        setLoading(false);
      });
    });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationCard}>
      <View style={[styles.iconWrapper, { backgroundColor: item.color + '22' }]}>
        <Feather name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.status}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  if (showLoginDialog) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>😺</Text>
            <Text style={styles.modalTitle}>Bạn chưa đăng nhập!</Text>
            <Text style={styles.modalMessage}>
              Hãy đăng nhập để sử dụng đầy đủ chức năng của ứng dụng nhé!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => {
                  setShowLoginDialog(false);
                  router.replace("./LoginScreen");
                }}
              >
                <Text style={styles.btnTextWhite}>Đăng nhập ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  setShowLoginDialog(false);
                  setLoading(false);
                  router.replace("/HomeScreen");
                }}
              >
                <Text style={styles.btnTextPrimary}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
       <View style={styles.customTabBarContainer}>
                <View style={styles.customTabBar}>
                  <TouchableOpacity style={styles.tabItemCustom}>
                    <Feather name="home" size={22} color="#4a90e2" />
                    <Text style={styles.tabLabelActive}>Trang chủ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tabItemCustom}>
                    <Feather name="heart" size={22} color="#4a90e2" />
                    <Text style={styles.tabLabel}>Yêu thích</Text>
                  </TouchableOpacity>
                  <View style={styles.tabCartWrapperCustom}>
                    <TouchableOpacity style={styles.tabCartBtnCustom}onPress={() => router.push('./search')}>
                      <Feather name="search" size={32} color="#4a90e2" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.tabItemCustom} onPress={() => router.push('./cart')}>
                    <Feather name="shopping-cart" size={22} color="#4a90e2" />
                    <Text style={styles.tabLabel}>Tìm kiếm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tabItemCustom}onPress={() => router.push('./Profile')}>
                    <Feather name="settings" size={22} color="#4a90e2" />
                    <Text style={styles.tabLabel}>Cài đặt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
    
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  message: {
    color: '#666',
    fontSize: 13,
    marginVertical: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 40,
    height: 70,
    marginHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    width: width - 36,
  },
  tabItemCustom: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#222',
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginTop: 2,
  },
  tabCartWrapperCustom: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    shadowColor: '#f55858',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 20,
  },
  tabCartBtnCustom: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: 350,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  modalMessage: {
    color: "#444",
    textAlign: "center",
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#2979ff" },
  btnSecondary: { backgroundColor: "#f0f4fa" },
  btnTextWhite: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnTextPrimary: { color: "#2979ff", fontWeight: "bold", fontSize: 16 },
});

export default NotificationScreen;
