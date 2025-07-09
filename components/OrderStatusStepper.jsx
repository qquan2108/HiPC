import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../utils/AxiosInstance';

const ORDER_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Chờ lấy hàng' },
  { key: 'packed', label: 'Đã đóng gói' },
  { key: 'picked', label: 'Đã lấy hàng' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'return_requested', label: 'Yêu cầu trả hàng' },
  { key: 'return_approved', label: 'Duyệt trả' },
  { key: 'refunding', label: 'Hoàn tiền' },
  { key: 'refunded', label: 'Đã hoàn tiền' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

const STEP_ICONS = {
  pending: 'clock',
  confirmed: 'check-circle',
  packed: 'package',
  picked: 'cart-arrow-down',
  shipping: 'truck',
  delivered: 'check-circle-outline',
  cancelled: 'cancel',
  'return_requested': 'arrow-left',
  'return_approved': 'check',
  refunding: 'cash-refund',
  refunded: 'cash',
};

export default function OrderStatusStepper({ orderId, initialStatus, onStatusChange, isUser = true }) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStockReturned, setIsStockReturned] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    axiosInstance.get(`/orders/${orderId}`)
      .then(res => {
        if (ignore) return;
        setCurrentStatus(res.data.status);
        setStatusHistory(res.data.statusHistory || []);
        setIsStockReturned(res.data.isStockReturned || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [orderId]);

  // Hàm gọi API hoàn kho
  const handleReturnStock = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/orders/${orderId}/cancel`);
      setIsStockReturned(true);
      Alert.alert('Thành công', res.data.message || 'Đã hoàn lại kho!');
    } catch (err) {
      Alert.alert('Lỗi', err?.response?.data?.error || 'Lỗi hoàn kho');
    }
    setLoading(false);
  };

  // Hàm gọi API hủy đơn hàng
  const handleCancelOrder = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axiosInstance.put(`/orders/${orderId}/cancel`);
              setCurrentStatus('cancelled');
              Alert.alert('Thành công', 'Đơn hàng đã được hủy.');
              if (onStatusChange) onStatusChange('cancelled'); // Gọi callback để reload danh sách
            } catch (err) {
              Alert.alert('Lỗi', err?.response?.data?.error || 'Không thể hủy đơn hàng');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const stepIndex = ORDER_STEPS.findIndex(s => s.key === currentStatus);

  return (
    <View style={{ marginVertical: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {ORDER_STEPS.map((step, idx) => (
            <React.Fragment key={step.key}>
              <View style={[
                styles.stepCircle,
                idx < stepIndex && styles.stepCompleted,
                idx === stepIndex && styles.stepActive
              ]}>
                <MaterialCommunityIcons
                  name={STEP_ICONS[step.key] || 'checkbox-blank-circle-outline'}
                  size={18}
                  color={
                    idx < stepIndex
                      ? '#fff'
                      : idx === stepIndex
                      ? '#fff'
                      : '#888'
                  }
                />
              </View>
              {idx < ORDER_STEPS.length - 1 && (
                <View style={[
                  styles.stepLine,
                  idx < stepIndex ? styles.stepCompleted : {}
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {ORDER_STEPS.map((step, idx) => (
          <Text key={step.key} style={{ fontSize: 10, color: idx === stepIndex ? '#1976FF' : '#888', width: 60, textAlign: 'center' }}>
            {step.label}
          </Text>
        ))}
      </View>
      {/* Lịch sử trạng thái */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 13 }}>Lịch sử trạng thái:</Text>
        {statusHistory.map((h, i) => (
          <Text key={i} style={{ fontSize: 12 }}>
            {ORDER_STEPS.find(s => s.key === h.status)?.label || h.status} - {new Date(h.changedAt).toLocaleString('vi-VN')}
          </Text>
        ))}
      </View>
      {/* Nút hoàn kho chỉ hiện khi đơn đã hủy, chưa hoàn kho, và là user
      {isUser && currentStatus === 'cancelled' && !isStockReturned && (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.statusBtn}
            disabled={loading}
            onPress={handleReturnStock}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hoàn lại kho</Text>
          </TouchableOpacity>
        </View>
      )} */}
      {/* Nút hủy đơn hàng chỉ hiện khi đơn còn trong trạng thái chờ xác nhận hoặc chờ lấy hàng, và là user */}
      {isUser && ['pending', 'confirmed'].includes(currentStatus) && (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.statusBtn, { backgroundColor: '#FF5252' }]}
            disabled={loading}
            onPress={handleCancelOrder}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#1976FF" />}
    </View>
  );
}

const styles = StyleSheet.create({
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center'
  },
  stepCompleted: {
    backgroundColor: '#4CAF50'
  },
  stepActive: {
    backgroundColor: '#1976FF'
  },
  stepText: {
    fontWeight: 'bold', color: '#888'
  },
  stepLine: {
    width: 24, height: 3, backgroundColor: '#eee'
  },
  statusBtn: {
    backgroundColor: '#1976FF', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 8, marginTop: 8
  }
});