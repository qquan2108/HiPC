import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Star Rating Component
function StarRating({ rating, onRatingChange, interactive = false, size = 28 }) {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => interactive && onRatingChange && onRatingChange(i)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <Feather
          name="star"
          size={size}
          color={i <= rating ? '#FFD700' : '#E0E0E0'}
          style={i <= rating ? styles.filledStar : styles.emptyStar}
        />
      </TouchableOpacity>
    );
  }
  
  return <View style={styles.starRow}>{stars}</View>;
}

// Image Gallery Component
function ImageGallery({ images, onRemoveImage, editable = false }) {
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!images || images.length === 0) return null;
  
  return (
    <>
      <View style={styles.imageGallery}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <TouchableOpacity
              onPress={() => setSelectedImage(uri)}
              style={styles.imageWrapper}
            >
              <Image source={{ uri }} style={styles.galleryImage} />
            </TouchableOpacity>
            {editable && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => onRemoveImage(index)}
              >
                <Feather name="x" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      
      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedImage(null)}
          >
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
}

// Rating Distribution Component
function RatingDistribution({ reviews }) {
  const distribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));
  
  return (
    <View style={styles.distributionContainer}>
      {distribution.map(({ rating, count, percentage }) => (
        <View key={rating} style={styles.distributionRow}>
          <Text style={styles.distributionRating}>{rating}</Text>
          <Feather name="star" size={12} color="#FFD700" />
          <View style={styles.distributionBarContainer}>
            <View style={[styles.distributionBar, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.distributionCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DanhGia() {
  const router = useRouter();
  const {
    product_id,
    product_name,
    product_image,
    order_id,
    user_id
  } = useLocalSearchParams();

  // State management
  const [existingReview, setExistingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [star, setStar] = useState(5);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;

  // Effects
  useEffect(() => {
    if (!product_id) return;
    
    initializeComponent();
  }, [product_id]);

  const initializeComponent = async () => {
    await fetchReviews();
    animateEntry();
  };

  const animateEntry = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(titleScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/productreviews', {
        params: {
          product_id,
          order_id,
        },
      });

      const reviewsData = response.data || [];
      setReviews(reviewsData);

      // Check for existing user review
      if (user_id) {
        const userReview = reviewsData.find(review =>
          review.user_id?._id === user_id ||
          review.user_id?.id === user_id ||
          review.user_id === user_id
        );

        if (userReview) {
          setExistingReview(userReview);
          setStar(userReview.rating);
          setText(userReview.comment);
          setImages(userReview.images || []);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Lỗi', 'Không thể tải đánh giá. Vui lòng thử lại.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (submitting) return;

    // Validation
    if (!text.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (text.trim().length < 10) {
      Alert.alert('Thông báo', 'Đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        product_id: product_id.toString(),
        user_id: user_id.toString(),
        comment: text.trim(),
        rating: Number(star),
        images: images || [],
      };

      if (order_id) {
        payload.order_id = order_id.toString();
      }

      await axiosInstance.post('/productreviews', payload);

      Alert.alert(
        'Thành công',
        isEditing ? 'Đã cập nhật đánh giá!' : 'Đánh giá đã được gửi!',
        [
          {
            text: 'OK',
            onPress: () => {
              fetchReviews();
              setIsEditing(true);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Thêm hình ảnh',
      'Chọn nguồn hình ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện', onPress: selectFromLibrary },
        { text: 'Chụp ảnh', onPress: takePhoto },
      ],
      { cancelable: true }
    );
  };

  const selectFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Library picker error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần quyền truy cập camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploadingImage(true);

      const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type,
      });

      const response = await axiosInstance.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (response.data?.url) {
        setImages(prev => [...prev, response.data.url]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderHeader = () => {
    const avgRating = calculateAverageRating();
    
    return (
      <>
        {/* Premium Header */}
        <Animated.View
          style={[
            styles.premiumHeader,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          <View style={styles.headerGradient} />
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Animated.View
              style={[
                styles.headerTitle,
                { transform: [{ scale: titleScaleAnim }] },
              ]}
            >
              <Text style={styles.headerTitleText}>Đánh giá sản phẩm</Text>
              <View style={styles.headerTitleUnderline} />
            </Animated.View>
            
            <View style={styles.headerRating}>
              <Text style={styles.headerRatingText}>{avgRating}</Text>
              <Feather name="star" size={16} color="#FFD700" />
            </View>
          </View>
        </Animated.View>

        {/* Product Info */}
        <Animated.View
          style={[
            styles.productInfo,
            { transform: [{ translateY: cardSlideAnim }] },
          ]}
        >
          <Image
            source={
              product_image
                ? { uri: product_image }
                : require('../assets/images/pc1.png')
            }
            style={styles.productImage}
          />
          <Text style={styles.productName} numberOfLines={2}>
            {product_name}
          </Text>
        </Animated.View>

        {/* Rating Overview */}
        <Animated.View
          style={[
            styles.ratingOverview,
            { transform: [{ translateY: cardSlideAnim }] },
          ]}
        >
          <View style={styles.ratingOverviewLeft}>
            <Text style={styles.averageRating}>{avgRating}</Text>
            <StarRating rating={Math.round(parseFloat(avgRating))} size={20} />
            <Text style={styles.totalReviews}>
              {reviews.length} đánh giá
            </Text>
          </View>
          <View style={styles.ratingOverviewRight}>
            <RatingDistribution reviews={reviews} />
          </View>
        </Animated.View>

        {/* Review Form */}
        <Animated.View
          style={[
            styles.reviewForm,
            { transform: [{ translateY: cardSlideAnim }] },
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </Text>
            {isEditing && (
              <View style={styles.editingBadge}>
                <Text style={styles.editingBadgeText}>Đã đánh giá</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Xếp hạng của bạn</Text>
            <StarRating
              rating={star}
              onRatingChange={setStar}
              interactive
              size={32}
            />
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Nhận xét</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              multiline
              numberOfLines={4}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Hình ảnh (tùy chọn)</Text>
            <View style={styles.imageControls}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePicker}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Feather name="camera" size={20} color="#007AFF" />
                )}
                <Text style={styles.addImageText}>
                  {uploadingImage ? 'Đang tải...' : 'Thêm ảnh'}
                </Text>
              </TouchableOpacity>
            </View>
            <ImageGallery
              images={images}
              onRemoveImage={removeImage}
              editable
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={submitReview}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  };

  const renderReviewItem = ({ item, index }) => {
    const isUserReview =
      item.user_id?._id === user_id ||
      item.user_id?.id === user_id ||
      item.user_id === user_id;

    return (
      <Animated.View
        style={[
          styles.reviewCard,
          isUserReview && styles.userReviewCard,
          {
            transform: [
              {
                translateY: cardSlideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {item.user_id?.full_name?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewUsername}>
              {item.user_id?.full_name || 'Người dùng ẩn danh'}
            </Text>
            <StarRating rating={item.rating} size={16} />
          </View>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewDate}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString('vi-VN')
                : ''}
            </Text>
            {isUserReview && (
              <View style={styles.yourReviewBadge}>
                <Text style={styles.yourReviewText}>Của bạn</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.reviewComment}>{item.comment}</Text>

        <ImageGallery images={item.images} />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => item._id || index.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // Premium Header Styles
  premiumHeader: {
    height: Platform.OS === 'ios' ? 120 : 100,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    position: 'relative',
    overflow: 'hidden',
  },

  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#007AFF',
    // Add gradient background if needed
  },

  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },

  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },

  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  headerTitleUnderline: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1,
    marginTop: 4,
  },

  headerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  headerRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 4,
  },

  // Product Info Styles
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },

  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },

  // Rating Overview Styles
  ratingOverview: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  ratingOverviewLeft: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 20,
  },

  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },

  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  ratingOverviewRight: {
    flex: 1,
  },

  // Rating Distribution Styles
  distributionContainer: {
    flex: 1,
  },

  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  distributionRating: {
    fontSize: 12,
    color: '#666',
    width: 12,
    marginRight: 4,
  },

  distributionBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginHorizontal: 8,
  },

  distributionBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },

  distributionCount: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },

  // Review Form Styles
  reviewForm: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  editingBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  editingBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  ratingSection: {
    marginBottom: 20,
  },

  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },

  commentSection: {
    marginBottom: 20,
  },

  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },

  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    minHeight: 100,
  },

  imageSection: {
    marginBottom: 20,
  },

  imageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },

  imageControls: {
    marginBottom: 12,
  },

  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    borderStyle: 'dashed',
  },

  addImageText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },

  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Star Rating Styles
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  starContainer: {
    marginHorizontal: 2,
  },

  filledStar: {
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  emptyStar: {
    opacity: 0.3,
  },

  // Image Gallery Styles
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  imageContainer: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },

  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },

  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },

  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  modalImage: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    borderRadius: 12,
  },

  // Review Card Styles
  reviewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  userReviewCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  reviewAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  reviewInfo: {
    flex: 1,
  },

  reviewUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  reviewMeta: {
    alignItems: 'flex-end',
  },

  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  yourReviewBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  yourReviewText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },

  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },

  // List Content Styles
  listContent: {
    paddingBottom: 32,
  },

  // Enhanced animations and micro-interactions
  touchableScale: {
    transform: [{ scale: 0.98 }],
  },

  // Accessibility improvements
  accessibilityLabel: {
    fontSize: 0,
    opacity: 0,
  },

  // Premium visual enhancements
  premiumShadow: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },

  // Responsive design adjustments
  responsiveContainer: {
    maxWidth: screenWidth > 768 ? 600 : screenWidth,
    alignSelf: 'center',
  },

  // Enhanced loading states
  skeletonLoader: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },

  shimmerEffect: {
    backgroundColor: '#F2F8FC',
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },

  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },

  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Enhanced typography
  headingLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 34,
  },

  headingMedium: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 28,
  },

  headingSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 24,
  },

  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    color: '#1D1D1F',
    lineHeight: 24,
  },

  bodyMedium: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1D1D1F',
    lineHeight: 22,
  },

  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 18,
  },

  // Enhanced spacing system
  spacingXS: { margin: 4 },
  spacingS: { margin: 8 },
  spacingM: { margin: 16 },
  spacingL: { margin: 24 },
  spacingXL: { margin: 32 },

  // Enhanced color system
  colorPrimary: { color: '#007AFF' },
  colorSecondary: { color: '#5856D6' },
  colorSuccess: { color: '#34C759' },
  colorWarning: { color: '#FF9500' },
  colorError: { color: '#FF3B30' },
  colorNeutral: { color: '#8E8E93' },

  // Enhanced button variants
  buttonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },

  // Enhanced input styles
  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },

  inputField: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#fff',
  },

  inputFieldFocused: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  inputError: {
    borderColor: '#FF3B30',
  },

  inputErrorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },

  // Enhanced card styles
  cardElevated: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  cardPressed: {
    backgroundColor: '#F2F2F7',
    transform: [{ scale: 0.98 }],
  },

  // Enhanced dividers
  dividerThin: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },

  dividerThick: {
    height: 8,
    backgroundColor: '#F2F2F7',
    marginVertical: 24,
  },

  // Enhanced badges
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  badgePrimary: {
    backgroundColor: '#007AFF',
  },

  badgeSuccess: {
    backgroundColor: '#34C759',
  },

  badgeWarning: {
    backgroundColor: '#FF9500',
  },

  badgeError: {
    backgroundColor: '#FF3B30',
  },

  badgeTextLight: {
    color: '#fff',
  },

  // Enhanced animations
  fadeIn: {
    opacity: 0,
  },

  fadeInVisible: {
    opacity: 1,
  },

  slideUp: {
    transform: [{ translateY: 20 }],
  },

  slideUpVisible: {
    transform: [{ translateY: 0 }],
  },

  // Enhanced accessibility
  accessibilityFocused: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },

  screenReaderOnly: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});