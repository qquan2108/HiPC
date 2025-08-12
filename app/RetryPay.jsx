import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from "../utils/AxiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get('window');

export default function PaymentRetryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUnpaidOrders();
    setRefreshing(false);
  };

  const handlePayAgain = async (order) => {
    try {
      const res = await axiosInstance.get(`/orders/${order._id}/pay-info`);
      const { acc, bank, amount, des, orderId } = res.data;

      router.push({
        pathname: "/VietQRScreen",
        params: {
          acc,
          bank,
          amount,
          des,
          orderId,
          total: order.total,
          products: JSON.stringify(order.products),
          address: order.address,
          paymentMethod: order.paymentMethod,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Không thể lấy thông tin thanh toán. Vui lòng thử lại.");
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF6B35';
      case 'paid': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderOrderItem = ({ item, index }) => (
    <View style={[styles.orderCard, { opacity: loading ? 0.7 : 1 }]}>
      {/* Header với icon và thời gian */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="receipt-outline" size={20} color="#2979FF" />
          </View>
          <View>
            <Text style={styles.orderTitle}>Đơn hàng #{item._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderTime}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Order details */}
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={2}>
            {item.address || 'Địa chỉ giao hàng'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.paymentMethod || 'Chuyển khoản'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.products?.length || 0} sản phẩm
          </Text>
        </View>
      </View>

      {/* Price and action */}
      <View style={styles.orderFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng thanh toán</Text>
          <Text style={styles.priceValue}>
            {item.total?.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayAgain(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="card" size={18} color="#fff" style={styles.payButtonIcon} />
          <Text style={styles.payButtonText}>Thanh toán ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>Không có đơn hàng chờ thanh toán</Text>
      <Text style={styles.emptySubtitle}>
        Tất cả đơn hàng của bạn đã được thanh toán hoặc đã hủy
      </Text>
      <TouchableOpacity style={styles.shopNowButton} onPress={() => router.push('/')}>
        <Text style={styles.shopNowText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Thanh toán lại</Text>
      <Text style={styles.headerSubtitle}>
        {orders.length} đơn hàng chờ thanh toán
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#2979FF" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
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
            colors={['#2979FF']}
            tintColor="#2979FF"
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2979FF15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  orderDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2979FF",
  },
  payButton: {
    backgroundColor: "#2979FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2979FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  payButtonIcon: {
    marginRight: 6,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: "#2979FF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});