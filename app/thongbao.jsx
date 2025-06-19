import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,width 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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
  },customTabBar: {
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
});

export default NotificationScreen;
