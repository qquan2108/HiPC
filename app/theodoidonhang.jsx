import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

const TABS = [
  { key: 'pending',    label: 'Chờ xác nhận',    icon: 'clock-outline' },
  { key: 'confirmed',  label: 'Chờ lấy hàng',   icon: 'check-circle-outline' },
  { key: 'shipping',   label: 'Chờ giao hàng',  icon: 'truck-delivery-outline' },
  { key: 'delivered',  label: 'Đã giao',         icon: 'home-outline' },
  { key: 'returned',   label: 'Trả hàng',        icon: 'archive-arrow-down-outline' },
  { key: 'cancelled',  label: 'Đã huỷ',         icon: 'close-circle-outline' },
];

const STATUS_META = {
  pending:    { label: 'Chờ xác nhận', color: '#FFC107', icon: 'clock-outline' },
  confirmed:  { label: 'Chờ lấy hàng',  color: '#2196F3', icon: 'check-circle-outline' },
  shipping:   { label: 'Đang giao',     color: '#4CAF50', icon: 'truck-delivery-outline' },
  delivered:  { label: 'Đã giao',       color: '#4CAF50', icon: 'home-outline' },
  returned:   { label: 'Đã trả hàng',   color: '#9C27B0', icon: 'archive-arrow-down-outline' },
  cancelled:  { label: 'Đã huỷ',        color: '#F44336', icon: 'close-circle-outline' },
};

const API_URL = '/orders';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

const OrderCard = React.memo(({ order, onCancel }) => {
  const itemCount = order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  const meta = STATUS_META[order.status] || {};

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.shopName}>{order.shopName || 'Cửa hàng'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: meta.color + '20' }]}>  {/* 20 suffix for transparency */}
          <MaterialCommunityIcons name={meta.icon} size={16} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {order.products && order.products.length > 0 ? (
        order.products.map(prod => (
          <View style={styles.productRow} key={prod._id || prod.productId._id}>
            <Image
              source={
                // Nếu có prod.productId.image thì dùng luôn
                prod.productId.image
                  ? { uri: prod.productId.image }
                  // Nếu không có, thử lấy từ prod.productId.images[0] (nếu backend trả về mảng images)
                  : (prod.productId.images && prod.productId.images.length > 0
                      ? { uri: prod.productId.images[0] }
                      // Nếu vẫn không có, dùng ảnh mẫu
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

      {order.status === 'pending' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(order._id)}>
          <Text style={styles.cancelText}>Hủy đơn</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default function TrackOrderScreen() {
  const [activeTab, setActiveTab]       = useState('pending');
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [userId, setUserId]             = useState(null);
  const router = useRouter();

  // Load user ID from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) {
        const user = JSON.parse(data);
        setUserId(user.id || user._id);
      }
    });
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_URL}/user/${userId}`, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
      });
      const data = res.data || [];
      // Sort newest orders first
      data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(data);
    } catch (e) {
      console.error('Fetch orders error', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial & focus fetch
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchOrders();
    }, [userId])
  );

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // Handle cancel order
  const handleCancel = async (orderId) => {
    try {
      await axiosInstance.put(`${API_URL}/${orderId}/cancel`);
      fetchOrders();
    } catch (e) {
      console.error('Cancel order error', e);
    }
  };

  // Filter by current tab
  const filtered = orders.filter(o => o.status === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1976FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
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

      {/* Content */}
      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1976FF" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <OrderCard order={item} onCancel={handleCancel} />}
          contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976FF']} />}
        />
      )}
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