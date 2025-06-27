import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  PanResponder,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderStatusStepper from '../components/OrderStatusStepper';
import axiosInstance from '../utils/AxiosInstance';



const API_URL = '/orders';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

const OrderCard = React.memo(({ order, tab, onCancel, onStatusChange }) => {
  const itemCount = order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.shopName}>{order.shopName || 'Cửa hàng'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]}>
          {tab && (
            <>
              <MaterialCommunityIcons name={tab.icon} size={16} color="#1976FF" />
              <Text style={[styles.statusText, { color: '#1976FF' }]}>{tab.label}</Text>
            </>
          )}
          {!tab && (
            <Text style={styles.statusText}>{order.status}</Text>
          )}
        </View>
      </View>

      {order.products && order.products.length > 0 ? (
        order.products.map(prod => (
          <View style={styles.productRow} key={prod._id || prod.productId._id}>
            <Image
              source={
                prod.productId.image
                  ? { uri: prod.productId.image }
                  : (prod.productId.images && prod.productId.images.length > 0
                      ? { uri: prod.productId.images[0] }
                      : require('../assets/images/pc1.png'))
              }
              style={styles.productImg}
            />
            <View style={styles.productInfo}>
              <Text numberOfLines={1} style={styles.productName}>{prod.productId.name}</Text>
              <Text style={styles.productPrice}>{formatCurrency(prod.productId.price)}</Text>
            </View>
            <Text style={styles.productQty}>x{prod.quantity}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noProduct}>Không có sản phẩm.</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Tổng ({itemCount} sp):</Text>
        <Text style={styles.totalPrice}>{formatCurrency(order.total)}</Text>
      </View>

      

      <OrderStatusStepper
        orderId={order._id}
        initialStatus={order.status}
        onStatusChange={onStatusChange}
      />
    </View>
  );
});

export default function TrackOrderScreen() {
  const [activeTab, setActiveTab] = useState('pending');
  const [tabs, setTabs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) {
        const user = JSON.parse(data);
        setUserId(user.id || user._id);
      }
    });
  }, []);

  useEffect(() => {
    axiosInstance.get('/orders/status-tabs').then(res => setTabs(res.data));
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_URL}/user/${userId}`, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
      });
      const data = res.data || [];
      data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(data);
    } catch (e) {
      console.error('Fetch orders error', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchOrders();
    }, [userId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // Tách hàm cancelOrder để xử lý API và UI
  const cancelOrder = async (orderId) => {
    setLoading(true);
    try {
      await axiosInstance.put(`${API_URL}/${orderId}/cancel`);
      Alert.alert('Thành công', 'Đã hủy đơn hàng thành công');
      setActiveTab('cancelled');
      await fetchOrders();
    } catch (error) {
      console.error('Cancel order error:', error);
      let errorMessage = 'Không thể hủy đơn hàng';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Không thể hủy đơn hàng ở trạng thái hiện tại';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy đơn hàng';
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ show dialog xác nhận, gọi cancelOrder bên trong
  const handleCancel = (orderId, orderStatus) => {
    Alert.alert(
      'Xác nhận hủy đơn',
      `Bạn có chắc chắn muốn hủy đơn hàng này?${
        orderStatus === 'confirmed'
          ? ' Số lượng sản phẩm sẽ được hoàn về kho.'
          : ''
      }`,
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có, hủy đơn', style: 'destructive', onPress: () => cancelOrder(orderId) },
      ],
      { cancelable: false }
    );
  };

  const filtered = orders
    .filter(o => !(o.status === 'pending' && (!o.products || o.products.length === 0)))
    .filter(o => o.status === activeTab);

  // Tìm index của tab hiện tại
  const currentTabIndex = tabs.findIndex(t => t.key === activeTab);

  // PanResponder cho swipe tab
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Bắt đầu nhận swipe nếu trượt ngang đủ xa
        return Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 12;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 && currentTabIndex < tabs.length - 1) {
          // Trượt sang trái: sang tab phải
          setActiveTab(tabs[currentTabIndex + 1].key);
        } else if (gestureState.dx > 40 && currentTabIndex > 0) {
          // Trượt sang phải: sang tab trái
          setActiveTab(tabs[currentTabIndex - 1].key);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1976FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? '#1976FF' : '#888'}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bọc FlatList bằng View nhận gesture */}
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {loading && !refreshing ? (
          <ActivityIndicator style={styles.loader} size="large" color="#1976FF" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                tab={tabs.find(t => t.key === item.status)}
                onCancel={handleCancel}
                onStatusChange={fetchOrders}
              />
            )}
            contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng.</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976FF']} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 42, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#FFF', elevation: 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1976FF' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', elevation: 1 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#1976FF' },
  tabLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  tabLabelActive: { color: '#1976FF', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  card: { backgroundColor: '#FFF', margin: 12, borderRadius: 8, padding: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#333' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { marginLeft: 4, fontSize: 12, fontWeight: '600' },
  productRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  productImg: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#EEE' },
  productInfo: { flex: 1, marginLeft: 10 },
  productName: { fontSize: 14, fontWeight: '600', color: '#333' },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#F44336', marginTop: 4 },
  productQty: { fontSize: 13, color: '#555' },
  noProduct: { textAlign: 'center', color: '#888', marginVertical: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { fontSize: 13, color: '#555' },
  totalPrice: { fontSize: 15, fontWeight: '700', color: '#F44336' },
  cancelBtn: { marginTop: 10, alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: '#F44336' },
  cancelText: { color: '#F44336', fontWeight: '600' },
});
