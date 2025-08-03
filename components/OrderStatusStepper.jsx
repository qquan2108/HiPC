import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../utils/AxiosInstance';

const ORDER_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', description: 'Đơn hàng đang chờ xác nhận' },
  { key: 'packed', label: 'Chờ lấy hàng', description: 'Đơn hàng đã được xác nhận' },
  { key: 'shipping', label: 'Chờ giao hàng', description: 'Đơn hàng đang được giao' },
  { key: 'delivered', label: 'Đã giao', description: 'Đơn hàng đã được giao thành công' },
  { key: 'return_requested', label: 'Trả hàng', description: 'Đã yêu cầu trả hàng' },
  { key: 'cancelled', label: 'Đã huỷ', description: 'Đơn hàng đã bị huỷ' },
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

// Màu sắc cho từng trạng thái
const STEP_COLORS = {
  pending: '#FF9800',
  confirmed: '#2196F3',
  packed: '#9C27B0',
  picked: '#673AB7',
  shipping: '#00BCD4',
  delivered: '#4CAF50',
  cancelled: '#F44336',
  'return_requested': '#FF5722',
  'return_approved': '#3F51B5',
  refunding: '#795548',
  refunded: '#607D8B',
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
              if (onStatusChange) onStatusChange('cancelled');
            } catch (err) {
              Alert.alert('Lỗi', err?.response?.data?.error || 'Không thể hủy đơn hàng');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Lấy index của trạng thái hiện tại
  const currentStepIndex = ORDER_STEPS.findIndex(s => s.key === currentStatus);

  // Nếu trạng thái là cancelled và trạng thái trước là pending hoặc packed, chỉ hiển thị đến bước đó + "Đã huỷ"
  let visibleSteps;
  if (
    currentStatus === 'cancelled' &&
    statusHistory.length > 0
  ) {
    // Tìm trạng thái cuối cùng trước khi huỷ (trong lịch sử)
    // Lấy phần tử có status khác 'cancelled' cuối cùng
    const lastStatusObj = [...statusHistory].reverse().find(h => h.status !== 'cancelled');
    const lastStatus = lastStatusObj ? lastStatusObj.status : null;
    if (lastStatus === 'pending' || lastStatus === 'packed') {
      // Hiển thị các bước từ đầu đến bước lastStatus, rồi thêm "Đã huỷ"
      const lastIndex = ORDER_STEPS.findIndex(s => s.key === lastStatus);
      visibleSteps = [
        ...ORDER_STEPS.slice(0, lastIndex + 1),
        ORDER_STEPS.find(s => s.key === 'cancelled')
      ];
    } else {
      // Nếu huỷ ở trạng thái khác, hiển thị tất cả đến "Đã huỷ"
      visibleSteps = ORDER_STEPS.slice(0, currentStepIndex + 1);
    }
  } else {
    // Bình thường: hiển thị đến trạng thái hiện tại
    visibleSteps = ORDER_STEPS.slice(0, currentStepIndex + 1);
  }

  // Định dạng thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy thời gian của trạng thái từ lịch sử
  const getStatusTime = (statusKey) => {
    const historyItem = statusHistory.find(h => h.status === statusKey);
    return historyItem ? formatDate(historyItem.changedAt) : null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trạng thái đơn hàng</Text>
      
      <View style={styles.stepContainer}>
        {visibleSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const stepColor = STEP_COLORS[step.key] || '#888';
          const statusTime = getStatusTime(step.key);
          
          return (
            <View key={step.key} style={styles.stepItem}>
              {/* Timeline line */}
              {index < visibleSteps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  { backgroundColor: isCompleted ? stepColor : '#E0E0E0' }
                ]} />
              )}
              
              {/* Step content */}
              <View style={styles.stepContent}>
                {/* Icon circle */}
                <View style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isCurrent || isCompleted ? stepColor : '#E0E0E0',
                    borderColor: stepColor,
                    borderWidth: isCurrent ? 3 : 1
                  }
                ]}>
                  <MaterialCommunityIcons
                    name={STEP_ICONS[step.key] || 'checkbox-blank-circle-outline'}
                    size={isCurrent ? 22 : 18}
                    color={isCurrent || isCompleted ? '#fff' : '#888'}
                  />
                </View>
                
                {/* Step info */}
                <View style={styles.stepInfo}>
                  <Text style={[
                    styles.stepLabel,
                    { 
                      color: isCurrent ? stepColor : isCompleted ? '#333' : '#888',
                      fontWeight: isCurrent ? 'bold' : 'normal'
                    }
                  ]}>
                    {step.label}
                  </Text>
                  
                  <Text style={[
                    styles.stepDescription,
                    { color: isCurrent ? '#666' : '#888' }
                  ]}>
                    {step.description}
                  </Text>
                  
                  {/* Hiển thị thời gian nếu có */}
                  {statusTime && (
                    <Text style={styles.stepTime}>
                      {statusTime}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Nút hủy đơn hàng */}
      {isUser && ['pending', 'confirmed'].includes(currentStatus) && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            disabled={loading}
            onPress={handleCancelOrder}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="cancel" size={16} color="#fff" />
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepContainer: {
    paddingLeft: 8,
  },
  stepItem: {
    position: 'relative',
    marginBottom: 0,
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 60,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 20,
    zIndex: 2,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepInfo: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
});