import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const CANCEL_REASONS = [
  'Tôi muốn thay đổi thông tin địa chỉ',
  'Tôi không có nhu cầu mua nữa',
  'Tôi tìm được giá tốt hơn ở nơi khác',
  'Thời gian giao hàng quá lâu',
  'Khác'
];

export default function OrderStatusStepper({ orderId, initialStatus, onStatusChange, isUser = true }) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStockReturned, setIsStockReturned] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

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
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/orders/${orderId}/cancel`, {
        reason: selectedReason === 'Khác' ? customReason : selectedReason
      });
      setCurrentStatus('cancelled');
      setShowCancelModal(false);
      Alert.alert('Thành công', 'Đơn hàng đã được hủy.');
      if (onStatusChange) onStatusChange('cancelled');
    } catch (err) {
      Alert.alert('Lỗi', err?.response?.data?.error || 'Không thể hủy đơn hàng');
    }
    setLoading(false);
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

      {/* Modal chọn lý do hủy */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            width: '85%',
            elevation: 4
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
              Chọn lý do hủy đơn hàng
            </Text>
            {CANCEL_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10
                }}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#6366F1',
                  marginRight: 10,
                  backgroundColor: selectedReason === reason ? '#6366F1' : '#fff'
                }} />
                <Text style={{ fontSize: 15, color: '#333' }}>{reason}</Text>
              </TouchableOpacity>
            ))}
            {selectedReason === 'Khác' && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Nhập lý do khác:</Text>
                <View style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  padding: 8,
                  backgroundColor: '#F9FAFB'
                }}>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder="Nhập lý do hủy..."
                    style={{ fontSize: 14, color: '#333' }}
                  />
                </View>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 8,
                  marginRight: 8
                }}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  backgroundColor: '#FF5252',
                  borderRadius: 8
                }}
                disabled={!selectedReason || (selectedReason === 'Khác' && !customReason)}
                onPress={confirmCancelOrder}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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