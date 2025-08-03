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
  View,
  StatusBar
} from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import axiosInstance from '../utils/AxiosInstance';

const TAB_CONFIG = {
  pending:   { label: 'Chờ xác nhận', icon: 'clock-outline' },
  packed:    { label: 'Chờ lấy hàng', icon: 'package-variant-closed' },
  shipping:  { label: 'Chờ giao hàng', icon: 'truck-fast-outline' },
  delivered: { label: 'Đã giao', icon: 'check-circle-outline' },
  return_requested: { label: 'Trả hàng', icon: 'backup-restore' },
  cancelled: { label: 'Đã huỷ', icon: 'close-circle-outline' },
};
const API_URL = '/orders';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

const OrderCard = React.memo(({ order, tab, onCancel, onStatusChange, onReview }) => {
  const router = useRouter();
  const itemCount =
    (order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0) +
    (order.combos?.reduce((sum, c) => sum + (c.quantity || 0), 0) || 0);

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FFF3E0', text: '#F57C00', border: '#FFB74D' },
      confirmed: { bg: '#E8F5E8', text: '#2E7D32', border: '#66BB6A' },
      packed: { bg: '#E3F2FD', text: '#1976D2', border: '#64B5F6' },
      picked: { bg: '#F3E5F5', text: '#7B1FA2', border: '#BA68C8' },
      shipping: { bg: '#E0F2F1', text: '#00796B', border: '#4DB6AC' },
      delivered: { bg: '#E8F5E8', text: '#2E7D32', border: '#66BB6A' },
      cancelled: { bg: '#FFEBEE', text: '#D32F2F', border: '#EF5350' },
    };
    return colors[status] || { bg: '#F5F5F5', text: '#757575', border: '#BDBDBD' };
  };

  const statusColor = getStatusColor(order.status);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/chitietdonhang', params: { orderId: order._id } })}
    >
      {/* Gradient Header */}
      <View style={styles.cardHeader}>
        <View style={styles.shopSection}>
          <View style={styles.shopIconContainer}>
            <MaterialCommunityIcons name="store" size={18} color="#6366F1" />
          </View>
          <Text style={styles.shopName}>{order.shopName || 'Cửa hàng'}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: statusColor.bg,
          borderColor: statusColor.border,
          borderWidth: 1
        }]}>
          {tab && (
            <>
              <MaterialCommunityIcons name={tab.icon} size={14} color={statusColor.text} />
              <Text style={[styles.statusText, { color: statusColor.text }]}>{tab.label}</Text>
            </>
          )}
          {!tab && (
            <Text style={[styles.statusText, { color: statusColor.text }]}>{order.status}</Text>
          )}
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.productsContainer}>
        {/* Sản phẩm lẻ */}
        {order.products && order.products.filter(p => p.productId).length > 0 && (
          order.products
            .filter(prod => prod.productId)
            .map(prod => (
              <View key={prod._id} style={styles.productRow}>
                <View style={styles.productImageContainer}>
                  <Image
                    source={
                      prod.productId?.image
                        ? { uri: prod.productId.image }
                        : prod.productId?.images?.length > 0
                          ? { uri: prod.productId.images[0] }
                          : require('../assets/images/pc1.png')
                    }
                    style={styles.productImg}
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {prod.productId?.name ?? 'Sản phẩm không xác định'}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(prod.productId?.price ?? 0)}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <Text style={styles.productQty}>x{prod.quantity}</Text>
                </View>
              </View>
            ))
        )}

        {/* Combo sản phẩm */}
        {order.combos && order.combos.length > 0 && order.combos.map((combo, idx) => (
          <View key={combo._id || idx} style={styles.productRow}>
            <View style={styles.productImageContainer}>
              <Image
                source={
                  combo.comboId?.image
                    ? { uri: combo.comboId.image }
                    : require('../assets/images/pc1.png')
                }
                style={styles.productImg}
              />
            </View>
            <View style={styles.productInfo}>
              <Text numberOfLines={2} style={[styles.productName, { color: '#ff6b35' }]}>
                🎁 {combo.comboId?.name || 'Combo sản phẩm'}
              </Text>
              <Text style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>
                {combo.comboId?.productIds?.length || 0} sản phẩm trong combo
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(combo.price)}
              </Text>
            </View>
            <View style={styles.quantityContainer}>
              <Text style={styles.productQty}>x{combo.quantity}</Text>
            </View>
          </View>
        ))}

        {/* Nếu không có sản phẩm và combo */}
        {(!order.products || order.products.length === 0) &&
          (!order.combos || order.combos.length === 0) && (
            <View style={styles.noProductContainer}>
              <MaterialCommunityIcons name="package-variant" size={32} color="#E0E0E0" />
              <Text style={styles.noProduct}>Không có sản phẩm.</Text>
            </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Footer Section */}
      <View style={styles.cardFooter}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Tổng cộng ({itemCount} sản phẩm)</Text>
          <Text style={styles.totalPrice}>{formatCurrency(order.total)}</Text>
        </View>
      </View>



    </TouchableOpacity>
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
        // Lọc chỉ giữ các key hợp lệ
        const allowed = Object.keys(TAB_CONFIG);
        setTabs(res.data.filter(tab => allowed.includes(tab.key)));
      })
      .catch(() => {
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

 

  useEffect(() => {
    // Chạy lại khi activeTab đổi
    fetchOrders(activeTab);
  }, [activeTab]);

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

  const handleReview = (order, product) => {
    router.push({ 
      pathname: '/danhgia', 
      params: { 
        product_id: product._id, 
        product_name: product.name, 
        product_image: product.image, 
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
            onReview={(order, product) => handleReview(order, product)}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          filtered.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons 
              name="clipboard-text-outline" 
              size={64} 
              color="#E0E0E0" 
            />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
            <Text style={styles.emptyText}>
              Bạn chưa có đơn hàng nào trong trạng thái này
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
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
        <View style={[
          styles.tabLabelContainer,
          focused && styles.tabLabelContainerActive
        ]}>
          <MaterialCommunityIcons
            name={route.icon}
            size={18}
            color={focused ? '#6366F1' : '#9CA3AF'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? '#6366F1' : '#6B7280' },
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.headerButton} />
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
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {/* Enhanced Review Modal */}
      {reviewModal.visible && (
        <Modal
          visible={reviewModal.visible}
          transparent
          animationType="slide"
          onRequestClose={() => setReviewModal({ visible: false, product: null, orderId: null })}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Đánh giá sản phẩm</Text>
                <TouchableOpacity 
                  onPress={() => setReviewModal({ visible: false, product: null, orderId: null })}
                  style={styles.modalCloseButton}
                >
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalProductName}>{reviewModal.product?.name}</Text>
              
              <TextInput
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                style={styles.modalTextInput}
                multiline
                numberOfLines={4}
                value={reviewModal.text || ''}
                onChangeText={text => setReviewModal(r => ({ ...r, text }))}
                textAlignVertical="top"
              />
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={async () => {
                    await axiosInstance.post('/product/review', {
                      productId: reviewModal.product._id,
                      orderId: reviewModal.orderId,
                      text: reviewModal.text,
                    });
                    Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!');
                    setReviewModal({ visible: false, product: null, orderId: null });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSubmitButtonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F9FAFB' 
  },

  // Header Styles
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 50, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
    backgroundColor: '#FFFFFF', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  
  // TabBar Styles
  tabBarStyle: {
    backgroundColor: 'blue',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabStyle: {
    width: 'auto',
    paddingHorizontal: 4,
  },
  tabIndicator: {
    backgroundColor: '#6366F1',
    height: 3,
    borderRadius: 2,
  },
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    borderRadius: 8,
  },
  tabLabelContainerActive: {
    backgroundColor: '#F0F0FF',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '600',
  },

  // List Styles
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: { 
    fontSize: 14, 
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Card Styles
  card: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16, 
    marginVertical: 6,
    borderRadius: 16, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  shopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shopName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  statusText: { 
    marginLeft: 4, 
    fontSize: 11, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Products Section
  productsContainer: {
    paddingHorizontal: 16,
  },
  productRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 8,
    paddingVertical: 4,
  },
  productImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  productImg: { 
    width: 56, 
    height: 56, 
    borderRadius: 12,
  },
  productInfo: { 
    flex: 1, 
    marginLeft: 12,
    marginRight: 8,
  },
  productName: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  productPrice: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#DC2626',
  },
  quantityContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productQty: { 
    fontSize: 12, 
    fontWeight: '500',
    color: '#6B7280',
  },
  noProductContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noProduct: { 
    textAlign: 'center', 
    color: '#9CA3AF', 
    marginTop: 8,
    fontSize: 14,
  },

  // Card Footer
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  cardFooter: { 
    paddingHorizontal: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { 
    fontSize: 13, 
    color: '#6B7280',
    fontWeight: '500',
  },
  totalPrice: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#DC2626',
  },
  // Review Section
  reviewSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  modalButtonContainer: {
    padding: 20,
  },
  modalSubmitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});