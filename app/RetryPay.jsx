import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import PayStatusModal from '../compomentPay/PayStatusModal';
import StripeModal from '../compomentPay/StripeModal';
import VnPayModal from '../compomentPay/Vnpaymodal';
import axiosInstance from "../utils/AxiosInstance";

const { width, height } = Dimensions.get('window');

export default function PaymentRetryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPayMethodModal, setShowPayMethodModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [payStatus, setPayStatus] = useState(null);
  const [vnpayData, setVnpayData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const router = useRouter();

  const fetchUnpaidOrders = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      
      const res = await axiosInstance.get(`/orders/unpaid?user_id=${userId}`);
      setOrders(res.data || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchUnpaidOrders();
      setLoading(false);
      
      // Animation cho các phần tử
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUnpaidOrders();
    setRefreshing(false);
  };

  const handlePayAgain = (order) => {
    setSelectedOrder(order);
    setShowPayMethodModal(true);
    setShowOtherMethods(false);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': 
        return {
          color: '#FF6B35',
          bgColor: '#FFF4F0',
          icon: 'time-outline',
          text: 'Chờ thanh toán'
        };
      case 'paid': 
        return {
          color: '#00C851',
          bgColor: '#F0FFF4',
          icon: 'checkmark-circle-outline',
          text: 'Đã thanh toán'
        };
      case 'cancelled': 
        return {
          color: '#FF3547',
          bgColor: '#FFF0F0',
          icon: 'close-circle-outline',
          text: 'Đã hủy'
        };
      default: 
        return {
          color: '#9E9E9E',
          bgColor: '#F5F5F5',
          icon: 'help-circle-outline',
          text: status
        };
    }
  };

  const renderOrderItem = ({ item, index }) => {
    const statusConfig = getStatusConfig(item.status);
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim, // Use slideAnim directly, not interpolate
        },
      ],
    };

    return (
      <Animated.View
        style={[
          styles.orderCard,
          animatedStyle,
          {
            opacity: loading ? 0.7 : 1,
            // Kết hợp transform đúng cách:
            transform: [
              ...(animatedStyle.transform || []),
              { scale: loading ? 0.98 : 1 }
            ]
          }
        ]}
      >
        {/* Gradient Background Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Premium Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle} numberOfLines={1}>
                Đơn #{item._id.slice(-8).toUpperCase()}
              </Text>
              <View style={styles.timeRow}>
                <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
                <Text style={styles.orderTime}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Elegant Divider with Gradient */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <View style={styles.dividerGlow} />
        </View>

        {/* Enhanced Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location" size={16} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Địa chỉ giao hàng</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {item.address || 'Địa chỉ giao hàng'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="card" size={16} color="#34C759" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phương thức</Text>
                <Text style={styles.detailValue}>
                  {item.paymentMethod || 'Chuyển khoản'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="cube" size={16} color="#FF9500" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Sản phẩm</Text>
                <Text style={styles.detailValue}>
                  {item.products?.length || 0} món
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Footer with Enhanced Price Display */}
        <View style={styles.orderFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>₫</Text>
              <Text style={styles.priceValue}>
                {item.total?.toLocaleString("vi-VN")}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.premiumPayButton}
            onPress={() => handlePayAgain(item)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient}>
              <Ionicons name="flash" size={20} color="#fff" style={styles.payButtonIcon} />
              <Text style={styles.payButtonText}>Thanh toán</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconBackground}>
          <Ionicons name="receipt-outline" size={60} color="#007AFF" />
        </View>
        <View style={styles.emptyIconGlow} />
      </View>
      
      <Text style={styles.emptyTitle}>Tất cả đơn hàng đã thanh toán</Text>
      <Text style={styles.emptySubtitle}>
        Không còn đơn hàng nào cần thanh toán.{'\n'}
        Hãy tiếp tục mua sắm để có trải nghiệm tuyệt vời!
      </Text>
      
      <TouchableOpacity 
        style={styles.premiumShopButton} 
        onPress={() => router.push('/')}
        activeOpacity={0.8}
      >
        <View style={styles.shopButtonGradient}>
          <Ionicons name="storefront" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.shopNowText}>Khám phá ngay</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerBackground} />
      <Text style={styles.headerTitle}>Thanh toán lại</Text>
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>đơn hàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ₫{orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.statLabel}>tổng giá trị</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#007AFF" />
            <View style={styles.loadingGlow} />
          </View>
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng chờ trong giây lát</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={renderOrderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          !orders.length && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
            progressBackgroundColor="#fff"
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

      {/* Enhanced Payment Method Modal */}
      <Modal
        visible={showPayMethodModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPayMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <Text style={styles.modalSubtitle}>
                Đơn hàng #{selectedOrder?._id?.slice(-8).toUpperCase()}
              </Text>
            </View>
            
            {!showOtherMethods ? (
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#007AFF' }]}
                  onPress={async () => {
                    setShowPayMethodModal(false);
                    try {
                      const res = await axiosInstance.get(`/orders/${selectedOrder._id}/pay-info`);
                      const { acc, bank, amount, des, orderId } = res.data;
                      router.push({
                        pathname: "/VietQRScreen",
                        params: {
                          acc, bank, amount, des, orderId,
                          total: selectedOrder.total,
                          products: JSON.stringify(selectedOrder.products),
                          address: selectedOrder.address,
                          paymentMethod: selectedOrder.paymentMethod,
                        },
                      });
                    } catch (err) {
                      alert("Không thể lấy thông tin thanh toán. Vui lòng thử lại.");
                    }
                  }}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="card" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Phương thức hiện tại</Text>
                      <Text style={styles.paymentOptionSubtitle}>
                        {selectedOrder?.paymentMethod || "Chuyển khoản"}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#34C759' }]}
                  onPress={() => setShowOtherMethods(true)}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="swap-horizontal" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Phương thức khác</Text>
                      <Text style={styles.paymentOptionSubtitle}>
                        QR, COD, Thẻ tín dụng...
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.paymentOptions}>
                {/* COD */}
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#FF9500' }]}
                  onPress={() => {
                    setShowPayMethodModal(false);
                    router.push({
                      pathname: "/CheckoutSuccess",
                      params: {
                        orderId: selectedOrder._id,
                        total: selectedOrder.total,
                        products: JSON.stringify(selectedOrder.products),
                        address: selectedOrder.address,
                        paymentMethod: "cod",
                      },
                    });
                  }}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="cash" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Thanh toán khi nhận hàng</Text>
                      <Text style={styles.paymentOptionSubtitle}>COD - Trả tiền khi nhận hàng</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* Chuyển khoản ngân hàng (VietQR) */}
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#34C759' }]}
                  onPress={() => {
                    setShowPayMethodModal(false);
                    router.push({
                      pathname: "/VietQRScreen",
                      params: {
                        acc: "699496",
                        bank: "MBBank",
                        amount: selectedOrder.total,
                        des: selectedOrder._id,
                        orderId: selectedOrder._id,
                        total: selectedOrder.total,
                        products: JSON.stringify(selectedOrder.products),
                        address: selectedOrder.address,
                        paymentMethod: "sepay",
                      },
                    });
                  }}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="card" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Chuyển khoản ngân hàng</Text>
                      <Text style={styles.paymentOptionSubtitle}>VietQR - Nhanh & bảo mật</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* VNPAY */}
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#007AFF' }]}
                  onPress={() => {
                    setShowPayMethodModal(false);
                    setVnpayData({
                      orderId: selectedOrder._id,
                      amount: selectedOrder.total,
                      orderInfo: `Thanh toán đơn hàng ${selectedOrder._id}`,
                    });
                    setShowVnPayModal(true);
                  }}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="wallet" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Ví điện tử VNPAY</Text>
                      <Text style={styles.paymentOptionSubtitle}>Thanh toán qua VNPAY</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* Stripe */}
                <TouchableOpacity
                  style={[styles.premiumPayOption, { backgroundColor: '#6772E5' }]}
                  onPress={() => {
                    if (selectedOrder.total > 99000000) {
                      Toast.show({
                        type: "error",
                        text1: "Stripe không hỗ trợ thanh toán đơn hàng trên 99 triệu.",
                        text2: "Vui lòng chọn phương thức khác.",
                      });
                      return;
                    }
                    setShowPayMethodModal(false);
                    setOrderId(selectedOrder._id);
                    setOrderAmount(selectedOrder.total);
                    setShowStripe(true);
                  }}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionIcon}>
                      <Ionicons name="card-outline" size={24} color="#fff" />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Thẻ tín dụng/ghi nợ</Text>
                      <Text style={styles.paymentOptionSubtitle}>Visa, Mastercard...</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* Quay lại */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowOtherMethods(false)}
                >
                  <Ionicons name="arrow-back" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowPayMethodModal(false)}
            >
              <Text style={styles.closeModalText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <VnPayModal
        visible={showVnPayModal}
        orderId={vnpayData?.orderId}
        amount={vnpayData?.amount}
        orderInfo={vnpayData?.orderInfo}
        onClose={() => setShowVnPayModal(false)}
      />
      <StripeModal
        visible={showStripe}
        amount={orderAmount}
        orderId={orderId}
        onClose={(result) => {
          setShowStripe(false);
          if (result?.success) {
            setPayStatus("success");
            router.push({
              pathname: "/CheckoutSuccess",
              params: {
                orderId,
                total: orderAmount,
                products: JSON.stringify(selectedOrder.products),
                address: selectedOrder.address,
                paymentMethod: "stripe",
              },
            });
          } else if (result?.message) {
            setPayStatus("fail");
          }
        }}
      />
      <PayStatusModal
        visible={payStatus !== null}
        status={payStatus}
        onClose={() => setPayStatus(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    opacity: 0.1,
  },
  loadingText: {
    fontSize: 18,
    color: "#1D1D1F",
    fontWeight: "700",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  header: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.03,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1D1D1F",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  orderCard: {
    position: 'relative',
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    marginTop: 20, // Thêm dòng này để tạo khoảng cách
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #007AFF 0%, #34C759 50%, #FF9500 100%)',
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D1D1F",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTime: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'currentColor',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dividerContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
  },
  dividerGlow: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 1,
    backgroundColor: '#007AFF',
    opacity: 0.2,
  },
  orderDetails: {
    marginBottom: 24,
  },
  detailGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: "#1D1D1F",
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginRight: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#007AFF",
    letterSpacing: -0.5,
  },
  premiumPayButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 16, // Thêm margin trái để tách khỏi giá
    width: 140,     // Giới hạn chiều rộng nút
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // căn giữa nội dung
    paddingHorizontal: 0,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    width: '100%',
  },
  payButtonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  emptyIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: '#007AFF',
    opacity: 0.05,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    fontWeight: "500",
  },
  premiumShopButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
  },
  shopNowText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: 'blur(10px)',
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D1D1F",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "600",
  },
  paymentOptions: {
    padding: 24,
    gap: 16,
  },
  premiumPayOption: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  paymentOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  closeModalButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  closeModalText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FF3B30",
  },
});