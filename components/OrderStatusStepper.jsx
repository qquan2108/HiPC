import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import axiosInstance from '../utils/AxiosInstance';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['picked', 'cancelled'],
  picked: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: ['return_requested'],
  return_requested: ['return_approved'],
  return_approved: ['refunding'],
  refunding: ['refunded'],
  refunded: [],
  cancelled: [],
};

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

export default function OrderStatusStepper({ orderId, initialStatus, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextStatuses, setNextStatuses] = useState([]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    axiosInstance.get(`/orders/${orderId}`)
      .then(res => {
        if (ignore) return;
        setCurrentStatus(res.data.status);
        setStatusHistory(res.data.statusHistory || []);
        setNextStatuses(STATUS_TRANSITIONS[res.data.status] || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [orderId]);

  const handleChangeStatus = async (newStatus) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      setCurrentStatus(newStatus);
      setStatusHistory(h => [...h, { status: newStatus, changedAt: new Date() }]);
      setNextStatuses(STATUS_TRANSITIONS[newStatus] || []);
      onStatusChange && onStatusChange(newStatus);
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công!');
    } catch (err) {
      Alert.alert('Lỗi', err?.response?.data?.error || 'Lỗi cập nhật trạng thái');
    }
    setLoading(false);
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
      {/* Chuyển trạng thái */}
      {nextStatuses.length > 0 && (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>Chuyển trạng thái: </Text>
          {nextStatuses.map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.statusBtn, loading && { opacity: 0.5 }]}
              disabled={loading}
              onPress={() => handleChangeStatus(status)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {ORDER_STEPS.find(s => s.key === status)?.label || status}
              </Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#1976FF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 6, marginLeft: 8
  }
});