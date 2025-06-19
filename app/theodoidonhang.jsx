import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function formatCurrency(num) {
  if (typeof num !== "number" || isNaN(num)) return "";
  return num.toLocaleString("vi-VN") + " đ";
}

const TABS = [
  { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
  { key: 'cho_lay_hang', label: 'Chờ lấy hàng' },
  { key: 'cho_giao_hang', label: 'Chờ giao hàng' },
  { key: 'da_giao', label: 'Đã giao' },
  { key: 'tra_hang', label: 'Trả hàng' },
  { key: 'da_huy', label: 'Đã huỷ' },
];

const API_URL = 'http://localhost:3000/oders'; // Đúng với backend của bạn

export default function TrackOrderScreen() {
  const [activeTab, setActiveTab] = useState('cho_xac_nhan');
  const [ratedOrders, setRatedOrders] = useState([]); // Lưu id các đơn đã đánh giá
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [media, setMedia] = useState([]); // Lưu ảnh/video đã chọn
  const [showViewRatingModal, setShowViewRatingModal] = useState(false);
  const [viewedOrder, setViewedOrder] = useState(null);
  const [agreedOrders, setAgreedOrders] = useState([]); // Lưu id đơn đã đồng ý
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRequestRefundModal, setShowRequestRefundModal] = useState(false);
  const [selectedReturnReason, setSelectedReturnReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundMedia, setRefundMedia] = useState([]);
  const [refundOption, setRefundOption] = useState('-');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // Lấy userId thực tế từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('user').then(userStr => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id || user._id); // tuỳ theo backend trả về id hay _id
      }
    });
  }, []);

  // Lấy danh sách đơn hàng khi có userId
  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/user/${userId}`);
        console.log(res.data); // Kiểm tra dữ liệu trả về
        setOrders(res.data);
      } catch (err) {
        // Xử lý lỗi nếu cần
      }
      setLoading(false);
    };
    fetchOrders();
  }, [userId]);

  // Lọc đơn theo tab
  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'cho_xac_nhan': return order.status === 'pending';
      case 'cho_lay_hang': return order.status === 'confirmed';
      case 'cho_giao_hang': return order.status === 'shipping';
      case 'da_giao': return order.status === 'delivered';
      case 'tra_hang': return order.status === 'returned';
      case 'da_huy': return order.status === 'cancelled';
      default: return false;
    }
  });

  // Hàm xử lý đánh giá sản phẩm
  const handleRate = (orderId) => {
    setRatingOrderId(orderId);
    setShowRatingModal(true);
  };

  // Hàm chọn ảnh/video
  const handlePickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      // result.assets là mảng các file đã chọn
      setMedia([...media, ...result.assets]);
    }
  };

  // Hàm chọn ảnh/video cho refund
  const handlePickRefundMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setRefundMedia([...refundMedia, ...result.assets]);
    }
  };

  // Khi gửi đánh giá
  const handleSubmitRating = () => {
    setRatedOrders([...ratedOrders, ratingOrderId]);
    setShowRatingModal(false);
    setRatingOrderId(null);
    setRatingValue(5);
    setRatingComment('');
    setMedia([]); // Reset media
    // Gửi dữ liệu đánh giá + media lên server tại đây nếu cần
  };

  // Khi bấm Xem đánh giá
  const handleViewRating = (order) => {
    setViewedOrder(order);
    setShowViewRatingModal(true);
  };

  // Khi bấm Đồng ý
  const handleAgree = () => {
    setAgreedOrders([...agreedOrders, viewedOrder.id]);
    setShowViewRatingModal(false);
  };

  // Khi bấm Trả hàng/Hoàn tiền
  const handleReturn = () => {
    setShowViewRatingModal(false);
    setShowReturnModal(true);
  };

  // Khi chọn 1 tình huống trả hàng
  const handleSelectReturnReason = (reason) => {
    setSelectedReturnReason(reason);
    setShowReturnModal(false);
    setShowRequestRefundModal(true);
  };

  // Khi nhập lý do, nếu hợp lệ thì tự động set phương án
  const handleRefundReasonChange = (text) => {
    setRefundReason(text);
    if (text.trim().length > 5) { // ví dụ: hợp lệ khi dài hơn 5 ký tự
      setRefundOption('Trả hàng và hoàn tiền');
    } else {
      setRefundOption('-');
    }
  };

  // Xác nhận đã nhận hàng
  const handleConfirmDelivered = async (orderId) => {
    await axios.put(`${API_URL}/${orderId}/deliver`);
    // Sau khi cập nhật, reload lại danh sách đơn
    const res = await axios.get(`${API_URL}/user/${userId}`);
    setOrders(res.data);
  };

  // Hủy đơn
  const handleCancelOrder = async (orderId) => {
    await axios.put(`${API_URL}/${orderId}/cancel`);
    const res = await axios.get(`${API_URL}/user/${userId}`);
    setOrders(res.data);
  };

  // Trả hàng
  const handleReturnOrder = async (orderId) => {
    await axios.put(`${API_URL}/${orderId}/return`);
    const res = await axios.get(`${API_URL}/user/${userId}`);
    setOrders(res.data);
  };

  const renderOrder = (order) => (
    <View style={styles.orderCard} key={order._id}>
      <View style={styles.orderHeader}>
        <Text style={styles.shopName}>HiPC</Text>
        <Text style={[
          styles.orderStatus,
          order.status === 'cancelled' ? styles.statusCancel :
          order.status === 'delivered' ? styles.statusDone : styles.statusOther
        ]}>
          {(() => {
            switch (order.status) {
              case 'pending': return 'Chờ xác nhận';
              case 'confirmed': return 'Chờ lấy hàng';
              case 'shipping': return 'Chờ giao hàng';
              case 'delivered': return 'Đã giao';
              case 'returned': return 'Trả hàng';
              case 'cancelled': return 'Đã huỷ';
              default: return order.status;
            }
          })()}
        </Text>
      </View>
      {/* Nếu không có sản phẩm, hiển thị thông báo */}
      {(!order.products || order.products.length === 0) ? (
        <Text style={{ color: '#888', marginBottom: 8 }}>Đơn hàng này không có sản phẩm.</Text>
      ) : (
        order.products.map((prod, idx) => (
          <View
            style={styles.orderBody}
            key={`${prod.productId._id || prod._id}-${idx}`}
          >
            <Image
              source={{ uri: prod.productId.image || 'https://via.placeholder.com/60' }}
              style={styles.productImg}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text numberOfLines={1} style={styles.productName}>{prod.productId.name}</Text>
              <Text style={styles.productPrice}>
                <Text style={styles.salePrice}>{formatCurrency(prod.productId.price)}</Text>
              </Text>
            </View>
            <Text style={styles.productQty}>x{prod.quantity}</Text>
          </View>
        ))
      )}
      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>
          Tổng số tiền ({order.products.reduce((sum, p) => sum + p.quantity, 0)} sản phẩm):
        </Text>
        <Text style={styles.totalPrice}>{formatCurrency(order.total)}</Text>
      </View>
      {/* Thêm các nút thao tác nếu cần */}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('./HomeScreen')} >
          <Feather name="arrow-left" size={22} color="#1976ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn đã mua</Text>
        <View style={{ width: 22 }} />
      </View>
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive
            ]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Orders */}
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>Đang tải...</Text>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào cả</Text>
          </View>
        ) : (
          filteredOrders.map(renderOrder)
        )}
      </ScrollView>

      {/* Modal xem đánh giá */}
      <Modal
        visible={showViewRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewRatingModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Đánh giá của bạn</Text>
            <View style={modalStyles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <Text
                  key={i}
                  style={[
                    modalStyles.star,
                    { color: i <= ratingValue ? '#FFD700' : '#ccc' }
                  ]}
                >★</Text>
              ))}
            </View>
            <Text style={{ marginBottom: 16 }}>{ratingComment || "Không có nhận xét"}</Text>
            {/* Hiển thị media nếu có */}
            <ScrollView horizontal style={{ marginBottom: 16 }}>
              {media.map((item, idx) => (
                <View key={idx} style={{ marginRight: 8 }}>
                  {item.type?.startsWith('video') ? (
                    <View style={modalStyles.mediaThumb}>
                      <Text style={{ fontSize: 12, color: '#1976ff' }}>Video</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: item.uri }} style={modalStyles.mediaThumb} />
                  )}
                </View>
              ))}
            </ScrollView>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={handleAgree}>
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Đồng ý</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.submitBtn} onPress={handleReturn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Trả hàng/Hoàn tiền</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chọn tình huống trả hàng/hoàn tiền */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Tình huống bạn đang gặp?</Text>
            <TouchableOpacity
              style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => handleSelectReturnReason('received_issue')}
            >
              <Text style={{ fontWeight: 'bold', color: '#222', flex: 1 }}>
                Tôi đã nhận hàng nhưng hàng có vấn đề (bể vỡ, sai mẫu, hàng lỗi, khác mô tả...) - Miễn ship hoàn về
              </Text>
            </TouchableOpacity>
            <Text style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Lưu ý: Trường hợp yêu cầu Trả hàng Hoàn tiền của bạn được chấp nhận, Voucher có thể sẽ không được hoàn lại
            </Text>
            <TouchableOpacity
              style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => handleSelectReturnReason('not_received')}
            >
              <Text style={{ fontWeight: 'bold', color: '#222', flex: 1 }}>
                Tôi chưa nhận hàng/nhận thiếu hàng
              </Text>
            </TouchableOpacity>
            <Text style={{ color: '#888', fontSize: 13 }}>
              Lưu ý: Trong trường hợp yêu cầu Trả Hàng Hoàn tiền của bạn được chấp nhận, Shopee Xu, Voucher, Phí vận chuyển có thể không được hoàn lại
            </Text>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowReturnModal(false)}>
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal yêu cầu trả hàng/hoàn tiền */}
      <Modal
        visible={showRequestRefundModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestRefundModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.box, { alignItems: 'flex-start' }]}>
            <Text style={[modalStyles.title, { alignSelf: 'center', width: '100%', textAlign: 'center' }]}>
              Yêu cầu Trả hàng/Hoàn tiền
            </Text>
            {/* Thông tin sản phẩm */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={viewedOrder?.image}
                style={{ width: 48, height: 48, borderRadius: 8, marginRight: 10, backgroundColor: '#f2f2f2' }}
              />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>{viewedOrder?.name}</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>{viewedOrder?.color}</Text>
                <Text style={{ color: '#f55858', fontWeight: 'bold', fontSize: 15 }}>
                  {formatCurrency(viewedOrder?.salePrice || viewedOrder?.price)}
                </Text>
              </View>
              <Text style={{ color: '#888', fontSize: 13 }}>x{viewedOrder?.quantity}</Text>
            </View>
            {/* Lý do */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Lý do <Text style={{ color: '#f55858' }}>*</Text></Text>
            <TextInput
              style={{ width: '100%', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, marginBottom: 12 }}
              placeholder="Chọn lý do"
              value={refundReason}
              onChangeText={handleRefundReasonChange}
            />
            {/* Thêm ảnh/video */}
            <View style={{ width: '100%', marginBottom: 12 }}>
              <TouchableOpacity style={modalStyles.mediaBtn} onPress={handlePickRefundMedia}>
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>+ Thêm ảnh/video</Text>
              </TouchableOpacity>
              <ScrollView horizontal style={{ marginTop: 8 }}>
                {refundMedia.map((item, idx) => (
                  <View key={idx} style={{ marginRight: 8 }}>
                    {item.type?.startsWith('video') ? (
                      <View style={modalStyles.mediaThumb}>
                        <Text style={{ fontSize: 12, color: '#1976ff' }}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: item.uri }} style={modalStyles.mediaThumb} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
            {/* Phương án */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Phương án <Text style={{ color: '#f55858' }}>*</Text></Text>
            <TouchableOpacity style={{ width: '100%', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <Text style={{ color: refundOption === '-' ? '#888' : '#222', fontWeight: refundOption === '-' ? 'normal' : 'bold' }}>
                {refundOption}
              </Text>
            </TouchableOpacity>
            {/* Số tiền hoàn lại */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Số tiền hoàn lại</Text>
            <Text style={{ fontWeight: 'bold', color: '#f55858', fontSize: 18, marginBottom: 8 }}>
              {formatCurrency(viewedOrder?.refund || 42500)}
            </Text>
            {/* Hoàn tiền vào */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Hoàn tiền vào</Text>
            <Text style={{ marginBottom: 8 }}>Số dư TK Shopee</Text>
            {/* Mô tả */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Mô tả</Text>
            <TextInput
              style={{ width: '100%', minHeight: 60, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginBottom: 12, textAlignVertical: 'top' }}
              placeholder="Ghi chú thêm"
              multiline
              maxLength={2000}
            />
            {/* Email */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Email <Text style={{ color: '#f55858' }}>*</Text></Text>
            <Text style={{ marginBottom: 12 }}>quocanhjaki@gmail.com</Text>
            {/* Gửi yêu cầu */}
            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 }}
              disabled
            >
              <Text style={{ color: '#888', fontWeight: 'bold' }}>Gửi yêu cầu</Text>
            </TouchableOpacity>
            {/* Đóng */}
            <TouchableOpacity
              style={{ alignSelf: 'center', marginTop: 10 }}
              onPress={() => setShowRequestRefundModal(false)}
            >
              <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal đánh giá sản phẩm */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Đánh giá sản phẩm</Text>
            <View style={modalStyles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRatingValue(i)}>
                  <Text style={[
                    modalStyles.star,
                    { color: i <= ratingValue ? '#FFD700' : '#ccc' }
                  ]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={modalStyles.input}
              placeholder="Nhập nhận xét của bạn..."
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
            />
            {/* Thêm nút chọn ảnh/video */}
            <View style={{ width: '100%', marginBottom: 12 }}>
              <TouchableOpacity style={modalStyles.mediaBtn} onPress={handlePickMedia}>
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>+ Thêm ảnh/video</Text>
              </TouchableOpacity>
              <ScrollView horizontal style={{ marginTop: 8 }}>
                {media.map((item, idx) => (
                  <View key={idx} style={{ marginRight: 8 }}>
                    {item.type?.startsWith('video') ? (
                      <View style={modalStyles.mediaThumb}>
                        <Text style={{ fontSize: 12, color: '#1976ff' }}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: item.uri }} style={modalStyles.mediaThumb} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowRatingModal(false)}>
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.submitBtn} onPress={handleSubmitRating}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Thêm style cho modal
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center'
  },
  box: {
    width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center'
  },
  title: {
    fontSize: 18, fontWeight: 'bold', color: '#1976ff', marginBottom: 12
  },
  starsRow: {
    flexDirection: 'row', marginBottom: 12
  },
  star: {
    fontSize: 32, marginHorizontal: 2
  },
  input: {
    width: '100%', minHeight: 60, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    padding: 8, marginBottom: 16, textAlignVertical: 'top'
  },
  btnRow: {
    flexDirection: 'row', justifyContent: 'flex-end', width: '100%'
  },
  cancelBtn: {
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#e3f0ff', marginRight: 8
  },
  submitBtn: {
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1976ff'
  },
  mediaBtn: {
    borderWidth: 1, borderColor: '#1976ff', borderRadius: 8, padding: 8, alignItems: 'center'
  },
  mediaThumb: {
    width: 48, height: 48, borderRadius: 8, backgroundColor: '#f2f2f2', justifyContent: 'center', alignItems: 'center'
  },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1976ff',
  },
  tabBar: {
    flexGrow: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1976ff', 
  },
  tabLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1976ff', 
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 14,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteTag: {
    backgroundColor: '#ff5722',
    color: '#fff',
    fontSize: 12,
    borderRadius: 4,
    paddingHorizontal: 6,
    marginRight: 6,
    fontWeight: 'bold',
  },
  shopName: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusCancel: {
    color: '#f55858',
  },
  statusDone: {
    color: '#4caf50',
  },
  statusOther: {
    color: '#1976ff',
  },
  orderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  productColor: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    color: '#888',
    textDecorationLine: 'line-through',
    fontSize: 13,
  },
  salePrice: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 15,
  },
  productQty: {
    color: '#888',
    fontSize: 13,
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    color: '#888',
    fontSize: 13,
  },
  totalPrice: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 15,
  },
  refundText: {
    color: '#1976ff',
    fontSize: 13,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  actionBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
  },
  buyAgainBtn: {
    backgroundColor: '#1976ff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  buyAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
  },
});