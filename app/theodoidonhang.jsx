import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import OrderStatusStepper from '../components/OrderStatusStepper';
import axiosInstance from '../utils/AxiosInstance';


const TAB_CONFIG = {
  pending:   { label: 'Chờ xác nhận', icon: 'clock-outline' },
  confirmed: { label: 'Chờ lấy hàng', icon: 'truck-outline' },
  packed:    { label: 'Đã đóng gói', icon: 'package-variant-closed' },
  picked:    { label: 'Đã lấy hàng', icon: 'cube-send' },
  shipping:  { label: 'Đang giao', icon: 'truck-fast-outline' },
  delivered: { label: 'Đã giao', icon: 'check-circle-outline' },
  cancelled: { label: 'Đã huỷ', icon: 'close-circle-outline' },
};
const API_URL = '/orders';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

const OrderCard = React.memo(({ order, tab, onCancel, onStatusChange, onReview }) => {
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

      {order.status === 'delivered' && (
        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: '#2979ff',
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center'
          }}
          onPress={() => onReview(order)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đánh giá sản phẩm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const initialLayout = { width: Dimensions.get('window').width };

export default function TrackOrderScreen() {
  const [activeTab, setActiveTab] = useState('pending');
  const [tabs, setTabs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [index, setIndex] = React.useState(0);
  const [reviewModal, setReviewModal] = useState({ visible: false, product: null, orderId: null });
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
    // Fetch tabs từ API hoặc sử dụng config cố định
    axiosInstance.get('/orders/status-tabs')
      .then(res => {
        setTabs(res.data);
      })
      .catch(() => {
        // Fallback về config cố định nếu API lỗi
        const defaultTabs = Object.keys(TAB_CONFIG).map(key => ({
          key,
          ...TAB_CONFIG[key]
        }));
        setTabs(defaultTabs);
      });
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

  const handleReview = (order) => {
    // Lấy userId từ state, lấy sản phẩm đầu tiên hoặc cho phép chọn từng sản phẩm
    const product = order.products[0]?.productId;
    router.push({
      pathname: '/danhgia',
      params: {
        product_id: product._id,
        product_name: product.name,
        product_image: product.image, // truyền thêm ảnh sản phẩm
        order_id: order._id,
        user_id: userId,
      }
    });
  };

  // Tạo routes từ tabs với đầy đủ thông tin
  const routes = tabs.map(tab => ({
    key: tab.key,
    title: tab.label,
    icon: tab.icon,
  }));

  // Tạo scenes cho từng tab
  const renderScene = ({ route }) => {
    const filtered = orders
      .filter(o => !(o.status === 'pending' && (!o.products || o.products.length === 0)))
      .filter(o => o.status === route.key);

    return (
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            tab={tabs.find(t => t.key === item.status)}
            onCancel={handleCancel}
            onStatusChange={fetchOrders}
            onReview={handleReview}
          />
        )}
        contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976FF']} />
        }
      />
    );
  };

  // Custom TabBar render với style tốt hơn
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled={true}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBarStyle}
      tabStyle={styles.tabStyle}
      renderLabel={({ route, focused }) => (
        <View style={styles.tabLabelContainer}>
          <MaterialCommunityIcons
            name={route.icon}
            size={20}
            color={focused ? '#1976FF' : '#888'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? '#1976FF' : '#888' },
              focused && styles.tabLabelActive
            ]}
            numberOfLines={1}
          >
            {route.title}
          </Text>
        </View>
      )}
    />
  );

  // Sync activeTab với index
  React.useEffect(() => {
    const idx = tabs.findIndex(t => t.key === activeTab);
    if (idx !== -1 && idx !== index) setIndex(idx);
  }, [activeTab, tabs]);

  React.useEffect(() => {
    if (tabs[index] && tabs[index].key !== activeTab) setActiveTab(tabs[index].key);
  }, [index, tabs]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1976FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {tabs.length > 0 ? (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={renderTabBar}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {reviewModal.visible && (
        <Modal
          visible={reviewModal.visible}
          transparent
          animationType="slide"
          onRequestClose={() => setReviewModal({ visible: false, product: null, orderId: null })}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              width: 320,
              alignItems: 'center'
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Đánh giá sản phẩm</Text>
              <Text style={{ marginBottom: 8 }}>{reviewModal.product?.name}</Text>
              <TextInput
                placeholder="Nhập đánh giá của bạn..."
                style={{
                  borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                  padding: 8, width: '100%', marginBottom: 12
                }}
                multiline
                numberOfLines={3}
                value={reviewModal.text || ''}
                onChangeText={text => setReviewModal(r => ({ ...r, text }))}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#2979ff',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  marginBottom: 8
                }}
                onPress={async () => {
                  // Gửi đánh giá lên server
                  await axiosInstance.post('/product/review', {
                    productId: reviewModal.product._id,
                    orderId: reviewModal.orderId,
                    text: reviewModal.text,
                    // Có thể thêm rating, userId...
                  });
                  Alert.alert('Thành công', 'Đã gửi đánh giá!');
                  setReviewModal({ visible: false, product: null, orderId: null });
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gửi đánh giá</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReviewModal({ visible: false, product: null, orderId: null })}>
                <Text style={{ color: '#2979ff' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F2' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 42, 
    paddingBottom: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#FFF', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1976FF' 
  },
  
  // TabBar styles
  tabBarStyle: {
    backgroundColor: 'gray',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabStyle: {
    width: 'auto',
    paddingHorizontal: 8,
  },
  tabIndicator: {
    backgroundColor: 'blue',
    height: 3,
  },
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '600',
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // List styles
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#999',
    textAlign: 'center',
  },

  // Card styles
  card: { 
    backgroundColor: '#FFF', 
    margin: 12, 
    borderRadius: 8, 
    padding: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  shopName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#333' 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusText: { 
    marginLeft: 4, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  productRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 6 
  },
  productImg: { 
    width: 60, 
    height: 60, 
    borderRadius: 6, 
    backgroundColor: '#EEE' 
  },
  productInfo: { 
    flex: 1, 
    marginLeft: 10 
  },
  productName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333' 
  },
  productPrice: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#F44336', 
    marginTop: 4 
  },
  productQty: { 
    fontSize: 13, 
    color: '#555' 
  },
  noProduct: { 
    textAlign: 'center', 
    color: '#888', 
    marginVertical: 8 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  totalLabel: { 
    fontSize: 13, 
    color: '#555' 
  },
  totalPrice: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#F44336' 
  },
  cancelBtn: { 
    marginTop: 10, 
    alignSelf: 'flex-end', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 4, 
    borderWidth: 1, 
    borderColor: '#F44336' 
  },
  cancelText: { 
    color: '#F44336', 
    fontWeight: '600' 
  },
});