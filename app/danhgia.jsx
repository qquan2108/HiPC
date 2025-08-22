import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../utils/AxiosInstance';

// StarRating giống ReviewBox.jsx
function StarRating({ rating, onRatingChange, interactive = false, size = 28 }) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  for (let i = 1; i <= full; i++) {
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => interactive && onRatingChange && onRatingChange(i)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <FontAwesome name="star" size={size} color="#1e88e5" />
      </TouchableOpacity>
    );
  }
  if (hasHalf) {
    stars.push(
      <TouchableOpacity
        key="half"
        onPress={() => interactive && onRatingChange && onRatingChange(full + 1)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <FontAwesome name="star-half-full" size={size} color="#1e88e5" />
      </TouchableOpacity>
    );
  }
  for (let i = full + hasHalf + 1; i <= 5; i++) {
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => interactive && onRatingChange && onRatingChange(i)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <FontAwesome name="star-o" size={size} color="#E0E0E0" />
      </TouchableOpacity>
    );
  }
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
}

export default function DanhGia() {
  const router = useRouter();
  const { product_id, product_name, product_image, order_id, user_id } = useLocalSearchParams();

  // State
  const [star, setStar] = useState(5);
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Image picker
  const handleImagePicker = async () => {
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
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      if (response.data?.url) {
        setImages(prev => [...prev, response.data.url]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit review
  const submitReview = async () => {
    if (submitting) return;
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
        user_id: user_id?.toString(),
        comment: text.trim(),
        rating: Number(star),
        images: images || [],
      };
      if (order_id) payload.order_id = order_id.toString();
      await axiosInstance.post('/productreviews', payload);
      Alert.alert('Thành công', 'Đánh giá đã được gửi!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết đánh giá sản phẩm</Text>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
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
      </View>

      {/* Star Rating */}
      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Xếp hạng của bạn</Text>
        <StarRating rating={star} onRatingChange={setStar} interactive size={32} />
      </View>

      {/* Comment */}
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

      {/* Image upload */}
      <View style={styles.imageSection}>
        <Text style={styles.imageLabel}>Hình ảnh (tùy chọn)</Text>
        <View style={styles.imageControls}>
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleImagePicker}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#1976d2" />
            ) : (
              <Feather name="camera" size={20} color="#1976d2" />
            )}
            <Text style={styles.addImageText}>
              {uploadingImage ? 'Đang tải...' : 'Thêm ảnh'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageGallery}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.galleryImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(idx)}
              >
                <Feather name="x" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Submit */}
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
          <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976d2',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 18,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: 56,
    height: 56,
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
  ratingSection: {
    marginBottom: 18,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  starContainer: {
    marginHorizontal: 2,
  },
  commentSection: {
    marginBottom: 18,
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
    marginBottom: 18,
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
    borderColor: '#1976d2',
    borderRadius: 8,
    padding: 12,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 16,
    color: '#1976d2',
    marginLeft: 8,
    fontWeight: '500',
  },
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
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});