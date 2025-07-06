import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList, Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

function renderStars(star, onPress) {
  return (
    <View style={{ flexDirection: 'row', marginVertical: 6 }}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onPress && onPress(i)}>
          <Text style={{ fontSize: 28, color: i <= star ? '#FFD700' : '#ccc', marginHorizontal: 2 }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DanhGia() {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const {
    product_id,
    product_name,
    product_image,
    order_id,
    user_id
  } = useLocalSearchParams();

  const [existingReview, setExistingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Animation values
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.9)).current;

  // State cho đánh giá
  const [star, setStar] = useState(5);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Thêm state để tránh gửi nhiều lần

  // Lấy danh sách đánh giá thật từ API
  useEffect(() => {
    if (!product_id) return; // Không gọi API nếu thiếu product_id
    fetchReviews();
    // Header animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerSlideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(titleScaleAnim, { toValue: 1, tension: 120, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [product_id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/productreviews', {
        params: { 
          product_id, 
           
          order_id, 
        } 
      });
      
      setReviews(res.data || []);
      
      // Tìm đánh giá của user hiện tại
      if (user_id) {
      const userReview = res.data.find(review => 
        (review.user_id?._id === user_id) || 
        (review.user_id?.id === user_id) ||
        (review.user_id === user_id)
      );
      
      if (userReview) {
        setExistingReview(userReview);
        setStar(userReview.rating);
        setText(userReview.comment);
        setImages(userReview.images || []);
        setIsEditing(true);
      }
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
    setReviews([]);
  } finally {
    setLoading(false);
  }
};

  // Cập nhật hàm submitReview
  const submitReview = async () => {
    if (submitting) return;
    
    if (!text.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá!');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        product_id: product_id.toString(),
        user_id: user_id.toString(),
        comment: text.trim(),
        rating: Number(star),
        images: images || []
      };

      if (order_id) {
        payload.order_id = order_id.toString();
      }

      const response = await axiosInstance.post('/productreviews', payload);
      
      Alert.alert(
        'Thành công', 
        isEditing ? 'Đã cập nhật đánh giá!' : 'Đã gửi đánh giá!'
      );
      
      await fetchReviews(); // Tải lại danh sách
      setIsEditing(true); // Chuyển sang chế độ chỉnh sửa

    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Lỗi', 
        error.response?.data?.error || 'Không gửi được đánh giá!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectImageFromLibrary = async () => {
    try {
      // launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8, // Giảm chất lượng để tránh file quá lớn
        allowsEditing: true, // Cho phép chỉnh sửa
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('Selected image URI:', uri); // Debug log
        
        const uploadedUrl = await uploadImage(uri);
        console.log('Uploaded URL:', uploadedUrl); // Debug log
        
        setImages(prev => [...prev, uploadedUrl]);
      }
    } catch (error) {
      console.error('Library pick error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh từ thư viện');
    }
  };

  // helper: take a new picture
  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền sử dụng camera');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8, // Giảm chất lượng
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('Camera image URI:', uri); // Debug log
        
        const uploadedUrl = await uploadImage(uri);
        console.log('Uploaded URL:', uploadedUrl); // Debug log
        
        setImages(prev => [...prev, uploadedUrl]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
  if (!edit) {
    setEdit(true);
  }
  console.log('pickImage called');
  
  try {
    // Kiểm tra quyền truy cập thư viện ảnh.
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Cần quyền truy cập để chọn hình ảnh.'
      );
      return;
    }

    // Hiển thị tùy chọn: chọn ảnh từ thư viện hoặc chụp ảnh.
    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện', onPress: selectImageFromLibrary },
        { text: 'Chụp ảnh', onPress: takePicture },
      ]
    );
  } catch (error) {
    console.error('Pick image error:', error);
    Alert.alert('Lỗi', 'Không thể chọn ảnh.');
  }
};


  const uploadImage = async (uri) => {
    try {
      console.log('Uploading image from URI:', uri); // Debug log
      
      const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      });

      console.log('FormData created:', formData); // Debug log

      const res = await axiosInstance.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('Upload response:', res.data); // Debug log

      if (!res.data.url) {
        throw new Error('Server không trả về URL ảnh');
      }

      return res.data.url;
    } catch (error) {
      console.error('Upload image error:', error);
      
      if (error.response) {
        console.error('Upload error response:', error.response.data);
      }
      
      throw new Error('Không thể tải ảnh lên server');
    }
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Tính điểm trung bình
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  // Header + form đánh giá
  const renderHeader = () => (
    <>
      {/* HEADER */}
      <Animated.View 
        style={[
          styles.modernReviewHeader,
          { opacity: headerFadeAnim, transform: [{ translateY: headerSlideAnim }] }
        ]}
      >
        <View style={styles.premiumBackground} />
        <View style={styles.reviewHeaderContent}>
          <TouchableOpacity style={styles.elegantBackButton} onPress={() => router.back()} activeOpacity={0.8}>
            <View style={styles.backButtonGlow}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <Animated.View style={[styles.titleSection, { transform: [{ scale: titleScaleAnim }] }]}>
            <Text style={styles.elegantTitle}>Đánh giá sản phẩm</Text>
            <View style={styles.titleAccent} />
            <Text style={{ color: '#fff', marginTop: 4, fontSize: 13 }}>{product_name}</Text>
          </Animated.View>
          <View style={styles.ratingBadge}>
            <Text style={styles.badgeRating}>{avgRating}</Text>
            <Text style={styles.badgeStar}>★</Text>
          </View>
        </View>
        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </Animated.View>

      {/* FORM ĐÁNH GIÁ */}
      <View style={styles.summaryBox}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
          {isEditing ? 'Chỉnh sửa đánh giá của bạn' : 'Đánh giá của bạn'}
        </Text>
        {isEditing && (
          <Text style={{ color: '#4CAF50', marginBottom: 8 }}>
            Bạn đã đánh giá sản phẩm này
          </Text>
        )}
        {renderStars(star, setStar)}
        <TextInput
          style={{
            borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
            padding: 8, width: '100%', marginBottom: 10, minHeight: 60, backgroundColor: '#fafbfc'
          }}
          placeholder="Nhập đánh giá của bạn..."
          multiline
          value={text}
          onChangeText={setText}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#eee',
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginRight: 10,
              marginBottom: 6,
              borderWidth: 1,
              borderColor: '#ccc'
            }}
            onPress={pickImage}
          >
            <Text style={{ color: '#2979ff', fontWeight: 'bold' }}>+ Ảnh</Text>
          </TouchableOpacity>
          {images.map((uri, idx) => (
            <View key={idx} style={{ position: 'relative', marginRight: 6, marginBottom: 6 }}>
              <Image
                source={{ uri }}
                style={{ width: 40, height: 40, borderRadius: 6 }}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'red',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => removeImage(idx)}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: submitting ? '#ccc' : '#2979ff',
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 24,
            marginBottom: 8,
            alignSelf: 'center'
          }}
          onPress={submitReview}
          disabled={submitting}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {submitting ? 'Đang xử lý...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TỔNG QUAN ĐÁNH GIÁ */}
      <View style={styles.summaryBox}>
        <Text style={styles.avgRating}>{avgRating}</Text>
        <Text style={styles.stars}>{renderStars(Math.round(avgRating))}</Text>
        <Text style={styles.totalReviews}>{reviews.length} đánh giá</Text>
      </View>
      {loading && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Đang tải đánh giá...</Text>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fafbfc' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <FlatList
        data={reviews}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={[
            styles.reviewCard,
            (item.user_id?._id === user_id || item.user_id?.id === user_id || item.user_id === user_id) && 
            styles.currentUserReview
          ]}>
            <View style={styles.reviewHeader}>
              <Image
                source={product_image ? { uri: product_image } : require('../assets/images/pc1.png')}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.user}>
                  {item.user_id && item.user_id.full_name ? item.user_id.full_name : 'Ẩn danh'}
                </Text>
                <Text style={styles.starsSmall}>{renderStars(item.rating)}</Text>
              </View>
              <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}</Text>
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
            {item.images && item.images.length > 0 && (
              <View style={styles.imagesRow}>
                {item.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img }}
                    style={styles.reviewImg}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fafbfc' 
  },
  
  // ===== MODERN REVIEW HEADER =====
  modernReviewHeader: {
    height: Platform.OS === 'ios' ? 110 : 90,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    position: 'relative',
    overflow: 'hidden',
  },
  
  premiumBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea', // Gradient fallback
    // For a more premium look, you can add gradient libraries
  },
  
  reviewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: '100%',
    position: 'relative',
    zIndex: 3,
  },
  
  elegantBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButtonGlow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  
  titleSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  
  elegantTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  
  titleAccent: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 1,
    marginTop: 4,
  },
  
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  badgeRating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 4,
  },
  
  badgeStar: {
    fontSize: 16,
    color: '#ffd700',
  },
  
  floatingElement1: {
    position: 'absolute',
    top: 15,
    right: 40,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  
  floatingElement2: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  
  floatingElement3: {
    position: 'absolute',
    top: 40,
    left: 60,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  
  // ===== REVIEW CONTENT STYLES =====
  summaryBox: {
    alignItems: 'center',
    marginVertical: 18,
    backgroundColor: '#fff',
    marginHorizontal: 14,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  avgRating: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fbc02d',
    marginBottom: 4,
  },
  
  stars: {
    fontSize: 26,
    color: '#fbc02d',
    marginBottom: 4,
    letterSpacing: 2,
  },
  
  totalReviews: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  
  user: {
    fontWeight: '600',
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
  },
  
  starsSmall: {
    color: '#fbc02d',
    fontSize: 16,
    letterSpacing: 1,
  },
  
  date: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  
  config: {
    color: '#667eea',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  
  comment: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  
  imagesRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  
  reviewImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentUserReview: {
    borderColor: '#2979ff',
    borderWidth: 1,
    backgroundColor: '#f5f9ff'
  },
  yourReviewBadge: {
    backgroundColor: '#2979ff',
    color: 'white',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    fontSize: 12
  }
});
