import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderStatusStepper from '../components/OrderStatusStepper';
import axiosInstance from '../utils/AxiosInstance';

function formatCurrency(num) {
  return typeof num === 'number' ? num.toLocaleString('vi-VN') + ' đ' : '';
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId || params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    if (!orderId) return;
    setLoading(true);
    axiosInstance
      .get(`/orders/${orderId}`)
      .then((res) => {
        if (!ignore) setOrder(res.data);
      })
      .catch((err) => {
        console.error('Fetch order detail error:', err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [orderId]);

  const renderProduct = ({ item }) => (
    <View style={styles.productRow}>
      <Image
        source={
          item.productId?.image
            ? { uri: item.productId.image }
            : item.productId?.images?.length > 0
            ? { uri: item.productId.images[0] }
            : require('../assets/images/pc1.png')
        }
        style={styles.productImg}
      />
      <View style={styles.productInfo}>
        <Text numberOfLines={2} style={styles.productName}>
          {item.productId?.name || 'Sản phẩm'}
        </Text>
        <Text style={styles.productPrice}>
          {formatCurrency(item.productId?.price ?? 0)}
        </Text>
      </View>
      <Text style={styles.productQty}>x{item.quantity}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <OrderStatusStepper
          orderId={order._id}
          initialStatus={order.status}
          onStatusChange={(status) =>
            setOrder((prev) => ({ ...prev, status }))
          }
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mã đơn hàng</Text>
            <Text style={styles.value}>{order._id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày đặt</Text>
            <Text style={styles.value}>{orderDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phương thức thanh toán</Text>
            <Text style={styles.value}>{order.paymentMethod || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>
              {formatCurrency(order.shippingFee || 0)}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Giảm giá</Text>
              <Text style={styles.value}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <Text style={styles.addressText}>
            {order.shippingAddress?.recipientName}
          </Text>
          <Text style={styles.addressText}>
            {order.shippingAddress?.phoneNumber}
          </Text>
          <Text style={styles.addressText}>
            {order.shippingAddress?.address}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          <FlatList
            data={order.products || []}
            keyExtractor={(item) => item._id}
            renderItem={renderProduct}
            scrollEnabled={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  productImg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  productQty: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
});
