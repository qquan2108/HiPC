import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import axiosInstance from '../utils/AxiosInstance';

const TAB_CONFIG = {
  pending:   { label: 'Chờ xác nhận', icon: 'clock-outline', gradient: ['#FF6B6B', '#FF8E8E'] },
  packed:    { label: 'Chờ lấy hàng', icon: 'package-variant-closed', gradient: ['#4ECDC4', '#6EDDD6'] },
  shipping:  { label: 'Đang giao', icon: 'truck-fast-outline', gradient: ['#45B7D1', '#96CEB4'] },
  delivered: { label: 'Hoàn thành', icon: 'check-circle-outline', gradient: ['#96CEB4', '#FFEAA7'] },
  return_requested: { label: 'Trả hàng', icon: 'backup-restore', gradient: ['#A29BFE', '#74B9FF'] },
  cancelled: { label: 'Đã huỷ', icon: 'close-circle-outline', gradient: ['#FD79A8', '#E17055'] },
};
const API_URL = '/orders';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

const OrderCard = React.memo(({ order, tab, onCancel, onStatusChange, onReview }) => {
  const router = useRouter();
  const [cardAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(cardAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const itemCount =
    (order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0) +
    (order.combos?.reduce((sum, c) => sum + (c.quantity || 0), 0) || 0);

  const getStatusStyle = (status) => {
    const styles = {
      pending: { 
        bg: 'rgba(255, 107, 107, 0.1)', 
        text: '#FF6B6B', 
        border: 'rgba(255, 107, 107, 0.2)',
        shadow: '#FF6B6B'
      },
      confirmed: { 
        bg: 'rgba(78, 205, 196, 0.1)', 
        text: '#4ECDC4', 
        border: 'rgba(78, 205, 196, 0.2)',
        shadow: '#4ECDC4'
      },
      packed: { 
        bg: 'rgba(116, 185, 255, 0.1)', 
        text: '#74B9FF', 
        border: 'rgba(116, 185, 255, 0.2)',
        shadow: '#74B9FF'
      },
      picked: { 
        bg: 'rgba(162, 155, 254, 0.1)', 
        text: '#A29BFE', 
        border: 'rgba(162, 155, 254, 0.2)',
        shadow: '#A29BFE'
      },
      shipping: { 
        bg: 'rgba(69, 183, 209, 0.1)', 
        text: '#45B7D1', 
        border: 'rgba(69, 183, 209, 0.2)',
        shadow: '#45B7D1'
      },
      delivered: { 
        bg: 'rgba(150, 206, 180, 0.1)', 
        text: '#96CEB4', 
        border: 'rgba(150, 206, 180, 0.2)',
        shadow: '#96CEB4'
      },
      cancelled: { 
        bg: 'rgba(253, 121, 168, 0.1)', 
        text: '#FD79A8', 
        border: 'rgba(253, 121, 168, 0.2)',
        shadow: '#FD79A8'
      },
    };
    return styles[status] || { 
      bg: 'rgba(99, 102, 241, 0.1)', 
      text: '#6366F1', 
      border: 'rgba(99, 102, 241, 0.2)',
      shadow: '#6366F1'
    };
  };

  const statusStyle = getStatusStyle(order.status);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: cardAnimation,
          transform: [{
            translateY: cardAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.95}
        onPress={() => router.push({ pathname: '/chitietdonhang', params: { orderId: order._id } })}
      >
        {/* Premium Header with Gradient */}
        <LinearGradient
          colors={tab ? tab.gradient : ['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeaderGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.shopSection}>
              <View style={styles.shopIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.shopIconGradient}
                >
                  <MaterialCommunityIcons name="store" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.shopName}>{order.shopName || 'Tech Store'}</Text>
            </View>
            
            <View style={[styles.statusBadge, { 
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 1
            }]}>
              {tab && (
                <>
                  <MaterialCommunityIcons name={tab.icon} size={16} color="#FFFFFF" />
                  <Text style={[styles.statusText, { color: '#221f1fff' }]}>{tab.label}</Text>
                </>
              )}
              {!tab && (
                <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{order.status}</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Premium Products Section */}
        <View style={styles.productsContainer}>
          {/* Individual Products */}
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
                    <View style={styles.productImageOverlay} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text numberOfLines={2} style={styles.productName}>
                      {prod.productId?.name ?? 'Premium PC Component'}
                    </Text>
                    <View style={styles.productPriceContainer}>
                      <Text style={styles.productPrice}>
                        {formatCurrency(prod.productId?.price ?? 0)}
                      </Text>
                      <View style={styles.techBadge}>
                        <MaterialCommunityIcons name="cpu-64-bit" size={12} color="#6366F1" />
                        <Text style={styles.techBadgeText}>TECH</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.quantityContainer}>
                    <LinearGradient
                      colors={['#F8FAFC', '#E2E8F0']}
                      style={styles.quantityBadge}
                    >
                      <Text style={styles.productQty}>×{prod.quantity}</Text>
                    </LinearGradient>
                  </View>
                </View>
              ))
          )}

          {/* Combo Products */}
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
                <View style={styles.comboOverlay}>
                  <MaterialCommunityIcons name="gift" size={16} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={[styles.productName, styles.comboName]}>
                  🎁 {combo.comboId?.name || 'Premium PC Combo'}
                </Text>
                <Text style={styles.comboDescription}>
                  {combo.comboId?.productIds?.length || 0} 
                </Text>
                <View style={styles.productPriceContainer}>
                  <Text style={styles.productPrice}>
                    {formatCurrency(combo.price)}
                  </Text>
                  <View style={styles.comboBadge}>
                    <Text style={styles.comboBadgeText}>COMBO</Text>
                  </View>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <LinearGradient
                  colors={['#FEF3C7', '#F59E0B']}
                  style={styles.quantityBadge}
                >
                  <Text style={[styles.productQty, { color: '#92400E' }]}>×{combo.quantity}</Text>
                </LinearGradient>
              </View>
            </View>
          ))}

          {/* Empty State */}
          {(!order.products || order.products.length === 0) &&
            (!order.combos || order.combos.length === 0) && (
              <View style={styles.noProductContainer}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons name="package-variant" size={32} color="#CBD5E1" />
                </View>
                <Text style={styles.noProduct}>Không có sản phẩm</Text> 
              </View>
          )}
        </View>

        {/* Premium Divider */}
        <View style={styles.premiumDivider}>
          <LinearGradient
            colors={['transparent', '#E2E8F0', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.dividerGradient}
          />
        </View>

        {/* Enhanced Footer Section */}
        <View style={styles.cardFooter}>
          <View style={styles.totalSection}>
            <View>
              <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
              <View style={styles.orderMeta}>
                <MaterialCommunityIcons name="calendar" size={12} color="#94A3B8" />
                <Text style={styles.orderDate}>
                  {new Date(order.order_date).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.totalPrice}>{formatCurrency(order.total)}</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>VND</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  const [headerAnimation] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) {
        const user = JSON.parse(data);
        setUserId(user.id || user._id);
      }
    });
  }, []);

  useEffect(() => {
    axiosInstance.get('/orders/status-tabs')
      .then(res => {
        const allowed = Object.keys(TAB_CONFIG);
        const apiTabs = res.data.filter(tab => allowed.includes(tab.key));
        const enhancedTabs = apiTabs.map(tab => ({
          ...tab,
          ...TAB_CONFIG[tab.key]
        }));
        setTabs(enhancedTabs);
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
      Alert.alert('Error', 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
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
      Alert.alert('Success', 'Order cancelled successfully');
      setActiveTab('cancelled');
      await fetchOrders();
    } catch (error) {
      console.error('Cancel order error:', error);
      let errorMessage = 'Unable to cancel order';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot cancel order in current status';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (orderId, orderStatus) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel this order?${
        orderStatus === 'confirmed'
          ? ' Products will be returned to inventory.'
          : ''
      }`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelOrder(orderId) },
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

  const routes = tabs.map(tab => ({
    key: tab.key,
    title: tab.label,
    icon: tab.icon,
    gradient: tab.gradient,
  }));

  const renderScene = ({ route }) => {
    const filtered = orders
      .filter(o => !(o.status === 'pending' && (!o.products || o.products.length === 0)))
      .filter(o => o.status === route.key);

    return (
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => (
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
            <LinearGradient
              colors={['#F8FAFC', '#E2E8F0']}
              style={styles.emptyIconContainer}
            >
              <MaterialCommunityIcons 
                name="clipboard-text-outline" 
                size={64} 
                color="#CBD5E1" 
              />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Không có đơn hàng</Text> 
            <Text style={styles.emptyText}>
              Bạn chưa có đơn hàng nào ở trạng thái này
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.emptyActionGradient}
              >
                <Text style={styles.emptyActionText}>Mua sắm ngay</Text> 
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#6366F1']}
            tintColor="#6366F1"
            progressBackgroundColor="#FFFFFF"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderTabBar = (props) => (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.tabBarGradient}
      >
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
              <LinearGradient
                colors={focused ? route.gradient || ['#6366F1', '#8B5CF6'] : ['transparent', 'transparent']}
                style={[styles.tabIconContainer, !focused && { backgroundColor: '#F1F5F9' }]}
              >
                <MaterialCommunityIcons
                  name={route.icon}
                  size={18}
                  color={focused ? '#FFFFFF' : '#64748B'}
                />
              </LinearGradient>
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? '#1E293B' : '#64748B' },
                  focused && styles.tabLabelActive
                ]}
                numberOfLines={1}
              >
                {route.title}
              </Text>
            </View>
          )}
        />
      </LinearGradient>
    </View>
  );

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
      
      {/* Premium Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F1F5F9', '#E2E8F0']}
                style={styles.headerButtonGradient}
              >
                <Feather name="arrow-left" size={24} color="#1E293B" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Đơn Hàng Của Tôi</Text>
              <Text style={styles.headerSubtitle}>Trạng thái đơn hàng</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <LinearGradient
                colors={['#F1F5F9', '#E2E8F0']}
                style={styles.headerButtonGradient}
              >
                <MaterialCommunityIcons name="bell-outline" size={24} color="#1E293B" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
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
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading your orders...</Text>
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
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.modalHeaderGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Product Review</Text>
                  <TouchableOpacity 
                    onPress={() => setReviewModal({ visible: false, product: null, orderId: null })}
                    style={styles.modalCloseButton}
                  >
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalProductName}>{reviewModal.product?.name}</Text>
                
                <TextInput
                  placeholder="Share your experience with this product..."
                  style={styles.modalTextInput}
                  multiline
                  numberOfLines={4}
                  value={reviewModal.text || ''}
                  onChangeText={text => setReviewModal(r => ({ ...r, text }))}
                  textAlignVertical="top"
                />
                
                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={async () => {
                    await axiosInstance.post('/product/review', {
                      productId: reviewModal.product._id,
                      orderId: reviewModal.orderId,
                      text: reviewModal.text,
                    });
                    Alert.alert('Success', 'Thank you for your review!');
                    setReviewModal({ visible: false, product: null, orderId: null });
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.modalSubmitGradient}
                  >
                    <Text style={styles.modalSubmitButtonText}>Submit Review</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },

  // Premium Header Styles
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  
  // Premium TabBar Styles
  tabBarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBarGradient: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBarStyle: {
    backgroundColor: 'gray',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabStyle: {
    width: 'auto',
    paddingHorizontal: 8,
  },
  tabIndicator: {
    backgroundColor: '#6366F1',
    height: 4,
    borderRadius: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  tabLabelContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontWeight: '700',
  },

  // List Styles
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyActionGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Premium Card Styles
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  shopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  shopIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.3,
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: { 
    marginLeft: 6, 
    fontSize: 12, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Premium Products Section
  productsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  productRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImg: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 16,
  },
  productImageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderBottomLeftRadius: 8,
  },
  comboOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { 
    flex: 1, 
    marginLeft: 16,
    marginRight: 12,
  },
  productName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 6,
  },
  comboName: {
    color: '#F59E0B',
  },
  comboDescription: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#DC2626',
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  techBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  comboBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comboBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  quantityContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productQty: { 
    fontSize: 14, 
    fontWeight: '700',
    color: '#475569',
  },
  noProductContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  noProduct: { 
    textAlign: 'center', 
    color: '#64748B', 
    fontSize: 16,
    fontWeight: '500',
  },

  // Premium Divider
  premiumDivider: {
    marginHorizontal: 20,
    marginVertical: 16,
    height: 1,
  },
  dividerGradient: {
    height: '100%',
  },

  // Enhanced Footer
  cardFooter: { 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: { 
    fontSize: 14, 
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginLeft: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  totalPrice: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#DC2626',
    marginBottom: 4,
  },
  currencyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
    letterSpacing: 0.5,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  modalTextInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    backgroundColor: '#F8FAFC',
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  modalSubmitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalSubmitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});