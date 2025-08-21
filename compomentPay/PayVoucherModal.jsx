import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import axiosInstance from '../utils/AxiosInstance';

const { width } = Dimensions.get('window');

export default function PayVoucherModal({ 
  visible, 
  selectedVoucher, 
  setSelectedVoucher, 
  setShowVoucher,
  orderAmount = 0,
  voucherType = 'order', // Thêm prop này
  onVoucherApplied 
}) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(null);
  const slideAnim = useState(new Animated.Value(0))[0];

  // Fetch vouchers from API
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vouchers/active');
      // Đảm bảo lấy đúng mảng voucher
      let vouchersArr = [];
      if (Array.isArray(response.data)) {
        vouchersArr = response.data;
      } else if (Array.isArray(response.data.vouchers)) {
        vouchersArr = response.data.vouchers;
      }
      setVouchers(vouchersArr);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  // Apply voucher through API
  const applyVoucher = async (voucher) => {
    setApplying(voucher.code);
    try {
      const response = await axiosInstance.post('/vouchers/apply', {
        code: voucher.code,
        orderAmount: orderAmount
      });

      const data = response.data;

      setSelectedVoucher(voucher);
      onVoucherApplied?.(voucher, data);
      Alert.alert('Thành công', 'Áp dụng voucher thành công!');
      // Refresh voucher list to update quantities
      fetchVouchers();
    } catch (error) {
      const msg = error?.response?.data?.error || 'Không thể áp dụng voucher';
      Alert.alert('Lỗi', msg);
    } finally {
      setApplying(null);
    }
  };

  // Calculate discount amount
  const calculateDiscount = (voucher) => {
    if (voucher.discount_type === 'percentage') {
      const discount = (orderAmount * voucher.discount_value) / 100;
      return Math.min(discount, voucher.max_discount || discount);
    }
    return voucher.discount_value || 0;
  };

  // Check if voucher is applicable
  const isVoucherApplicable = (voucher) => {
    const now = new Date();
    const minOrder = voucher.min_order_amount || voucher.min_order_value || 0;
    
    return (
      voucher.quantity > 0 &&
      orderAmount >= minOrder &&
      (!voucher.start_date || now >= new Date(voucher.start_date)) &&
      (!voucher.end_date || now <= new Date(voucher.end_date))
    );
  };

  // Get voucher status
  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const minOrder = voucher.min_order_amount || voucher.min_order_value || 0;
    
    if (voucher.quantity <= 0) return { status: 'out_of_stock', message: 'Đã hết lượt' };
    if (orderAmount < minOrder) return { status: 'min_order', message: `Thiếu ${(minOrder - orderAmount).toLocaleString('vi-VN')}đ` };
    if (voucher.start_date && now < new Date(voucher.start_date)) return { status: 'not_started', message: 'Chưa bắt đầu' };
    if (voucher.end_date && now > new Date(voucher.end_date)) return { status: 'expired', message: 'Đã hết hạn' };
    return { status: 'applicable', message: 'Có thể áp dụng' };
  };

  useEffect(() => {
    if (visible) {
      fetchVouchers();
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderVoucherItem = ({ item: voucher, index }) => {
    const voucherStatus = getVoucherStatus(voucher);
    const isApplicable = voucherStatus.status === 'applicable';
    const isSelected = selectedVoucher?.code === voucher.code;
    const isCurrentlyApplying = applying === voucher.code;
    const discountAmount = calculateDiscount(voucher);

    return (
      <Animated.View
        style={[
          styles.voucherCard,
          {
            opacity: isApplicable ? 1 : 0.6,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50 * (index + 1), 0],
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={isSelected ? ['#667eea', '#764ba2'] : ['#ffffff', '#f8f9ff']}
          style={styles.voucherGradient}
        >
          {/* Voucher Header */}
          <View style={styles.voucherHeader}>
            <View style={styles.voucherIconContainer}>
              <MaterialIcons 
                name="local-offer" 
                size={24} 
                color={isSelected ? "#fff" : "#667eea"} 
              />
            </View>
            <View style={styles.voucherInfo}>
              <Text style={[styles.voucherCode, { color: isSelected ? "#fff" : "#333" }]}>
                {voucher.code}
              </Text>
              <Text style={[styles.voucherTitle, { color: isSelected ? "#f0f0f0" : "#666" }]}>
                {voucher.title || voucher.description}
              </Text>
            </View>
            {isSelected && (
              <MaterialIcons name="check-circle" size={24} color="#fff" />
            )}
          </View>

          {/* Discount Amount */}
          <View style={styles.discountContainer}>
            <Text style={[styles.discountLabel, { color: isSelected ? "#f0f0f0" : "#888" }]}>
              Giảm
            </Text>
            <Text style={[styles.discountAmount, { color: isSelected ? "#fff" : "#667eea" }]}>
              {voucher.discount_type === 'percentage' ||
               (!voucher.discount_type && voucher.discount_value > 0 && voucher.discount_value <= 100)
                ? `${voucher.discount_value}%`
                : `${voucher.discount_value?.toLocaleString('vi-VN')}đ`}
            </Text>
            {voucher.discount_type === 'percentage' && voucher.max_discount && (
              <Text style={[styles.maxDiscount, { color: isSelected ? "#f0f0f0" : "#888" }]}>
                Tối đa {voucher.max_discount.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>

          {/* Voucher Details */}
          <View style={styles.voucherDetails}>
            <View style={styles.detailRow}>
              <Feather name="shopping-cart" size={14} color={isSelected ? "#f0f0f0" : "#888"} />
              <Text style={[styles.detailText, { color: isSelected ? "#f0f0f0" : "#888" }]}>
                Đơn tối thiểu: {(voucher.min_order_amount || voucher.min_order_value || 0).toLocaleString('vi-VN')}đ
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Feather name="package" size={14} color={isSelected ? "#f0f0f0" : "#888"} />
              <Text style={[styles.detailText, { color: isSelected ? "#f0f0f0" : "#888" }]}>
                Còn lại: {voucher.quantity}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Feather name="calendar" size={14} color={isSelected ? "#f0f0f0" : "#888"} />
              <Text style={[styles.detailText, { color: isSelected ? "#f0f0f0" : "#888" }]}>
                HSD: {voucher.end_date ? new Date(voucher.end_date).toLocaleDateString('vi-VN') : 'Không xác định'}
              </Text>
            </View>
          </View>

          {/* Status/Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isSelected 
                  ? 'rgba(255,255,255,0.2)' 
                  : isApplicable 
                    ? '#667eea' 
                    : '#e0e0e0'
              }
            ]}
            disabled={isSelected || !isApplicable || isCurrentlyApplying}
            onPress={() => applyVoucher(voucher)}
          >
            {isCurrentlyApplying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[
                  styles.actionButtonText,
                  {
                    color: isSelected 
                      ? "#fff" 
                      : isApplicable 
                        ? "#fff" 
                        : "#999"
                  }
                ]}>
                  {isSelected ? "Đã áp dụng" : voucherStatus.message}
                </Text>
                {isApplicable && !isSelected && (
                  <Feather name="arrow-right" size={16} color="#fff" />
                )}
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Lọc voucher theo loại
  const filteredVouchers = vouchers.filter(v => v.apply_for === voucherType);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.voucherModal,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                })
              }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {voucherType === 'order' ? 'Chọn mã giảm giá đơn hàng' : 'Chọn mã giảm giá phí vận chuyển'}
            </Text>
            <Text style={styles.orderAmount}>
              {voucherType === 'order' ? 'Đơn hàng' : 'Phí vận chuyển'}: {orderAmount.toLocaleString('vi-VN')}đ
            </Text>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowVoucher(false)}
            >
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Voucher List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Đang tải voucher...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVouchers}
              keyExtractor={(item, idx) => item?._id?.toString() || item?.code?.toString() || idx.toString()}
              renderItem={renderVoucherItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.voucherList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="local-offer" size={64} color="#ddd" />
                  <Text style={styles.emptyText}>Không có voucher phù hợp</Text>
                </View>
              }
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  voucherModal: {
    backgroundColor: "#f8f9ff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  closeModalBtn: {
    position: "absolute",
    top: 0,
    right: 20,
    padding: 4,
    zIndex: 10,
  },
  voucherList: {
    padding: 16,
  },
  voucherCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voucherGradient: {
    borderRadius: 16,
    padding: 16,
  },
  voucherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  voucherIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  voucherTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  discountContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  discountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  discountAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  maxDiscount: {
    fontSize: 12,
    marginTop: 2,
  },
  voucherDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
  },
});