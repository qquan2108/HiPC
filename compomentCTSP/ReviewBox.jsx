import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from '../utils/AxiosInstance';

export default function ReviewBox({ product = {} }) {
  const router = useRouter();

  // Hàm kiểm tra đã mua chưa
  const checkBought = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        Toast.show({ type: 'error', text1: 'Vui lòng đăng nhập để đánh giá!' });
        return false;
      }
      const userId = user._id || user.id;
      const productId = product._id || product.id;
      console.log('userId:', userId, 'productId:', productId); // Thêm dòng này
      if (!userId.match(/^[a-f\d]{24}$/i) || !productId.match(/^[a-f\d]{24}$/i)) {
        Toast.show({ type: 'error', text1: 'Thiếu thông tin người dùng hoặc sản phẩm!' });
        return false;
      }
      const { data } = await axiosInstance.get('/productreviews/check-bought', {
        params: { user_id: userId, product_id: productId }
      });
      if (!data.hasBought) {
        Toast.show({ type: 'error', text1: 'Vui lòng mua sản phẩm để đánh giá!' });
        return false;
      }
      return true;
    } catch {
      Toast.show({ type: 'error', text1: 'Vui lòng mua sản phẩm để đánh giá!' });
      return false;
    }
  };

  // Sự kiện cho 2 nút
  const handleWriteReview = async () => {
    if (await checkBought()) {
      router.push({
        pathname: '/danhgia',
        params: {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image?.uri || product.images?.[0]?.uri || '',
          user_id: '',
          order_id: '',
        }
      });
    }
  };

  const handleAddImage = async () => {
    if (await checkBought()) {
      // Thực hiện logic thêm ảnh ở đây, hoặc chuyển sang trang thêm ảnh
      Toast.show({ type: 'info', text1: 'Chức năng thêm ảnh đang phát triển.' });
    }
  };

  const rating = product.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#ffeaa7', '#fdcb6e']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="star" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={handleWriteReview}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.viewAllGradient}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Feather name="chevron-right" size={14} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* Rating Display */}
      <View style={styles.ratingContainer}>
        <View style={styles.mainRating}>
          <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          <View style={styles.ratingMeta}>
            <Text style={styles.outOf}>/ 5.0</Text>
            <Text style={styles.reviewCount}>({product.reviewCount || 0} đánh giá)</Text>
          </View>
        </View>

        <View style={styles.starsSection}>
          <View style={styles.starsContainer}>
            {/* Full Stars */}
            {[...Array(fullStars)].map((_, i) => (
              <View key={`full-${i}`} style={styles.starWrapper}>
                <LinearGradient
                  colors={['#ffd700', '#ffa000']}
                  style={styles.starGradient}
                >
                  <Feather name="star" size={18} color="#ffffff" />
                </LinearGradient>
              </View>
            ))}
            
            {/* Half Star */}
            {hasHalfStar && (
              <View style={styles.starWrapper}>
                <LinearGradient
                  colors={['#ffd700', '#ffa000']}
                  style={[styles.starGradient, { width: '50%' }]}
                >
                  <Feather name="star" size={18} color="#ffffff" />
                </LinearGradient>
                <View style={styles.halfStarOverlay}>
                  <Feather name="star" size={18} color="#e0e0e0" />
                </View>
              </View>
            )}
            
            {/* Empty Stars */}
            {[...Array(emptyStars)].map((_, i) => (
              <View key={`empty-${i}`} style={styles.starWrapper}>
                <Feather name="star" size={18} color="#e0e0e0" />
              </View>
            ))}
          </View>

          {/* Rating Distribution Preview */}
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.distributionRow}>
                <Text style={styles.distributionStar}>{star}★</Text>
                <View style={styles.distributionBar}>
                  <LinearGradient
                    colors={['#ffd700', '#ffa000']}
                    style={[
                      styles.distributionFill,
                      { width: `${Math.random() * 100}%` } // Demo data
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleWriteReview}>
          <LinearGradient
            colors={['#74b9ff', '#0984e3']}
            style={styles.actionGradient}
          >
            <Feather name="edit-3" size={14} color="#ffffff" />
            <Text style={styles.actionText}>Viết đánh giá</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleAddImage}>
          <LinearGradient
            colors={['#fd79a8', '#e84393']}
            style={styles.actionGradient}
          >
            <Feather name="image" size={14} color="#ffffff" />
            <Text style={styles.actionText}>Thêm ảnh</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#ffeaa7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  viewAllButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    color: "#ffffff",
    marginRight: 4,
    fontSize: 12,
    fontWeight: '700',
  },

  // Rating Container
  ratingContainer: {
    paddingHorizontal: 20,
  },
  mainRating: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffa000",
    letterSpacing: -1,
  },
  ratingMeta: {
    marginLeft: 8,
  },
  outOf: {
    fontSize: 16,
    color: "#636e72",
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: "#636e72",
    marginTop: 2,
  },

  // Stars Section
  starsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    marginRight: 4,
    position: 'relative',
  },
  starGradient: {
    borderRadius: 10,
    padding: 2,
  },
  halfStarOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Rating Distribution
  ratingDistribution: {
    flex: 1,
    marginLeft: 20,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  distributionStar: {
    fontSize: 10,
    color: '#ffa000',
    width: 16,
    marginRight: 8,
  },
  distributionBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f1f3f4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 234, 167, 0.2)',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});