import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReviewBox({ product = {}}) {
  const router = useRouter();
  const handleViewAllReviews = async () => {
    try {
      // Lấy thông tin user từ AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      router.push({
        pathname: '/danhgia',
        params: {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image?.uri || product.images?.[0]?.uri || '',
          user_id: user ? (user._id || user.id) : '', // Thêm user_id nếu có
          order_id: '', // Có thể thêm order_id sau nếu cần
        }
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      // Nếu không lấy được user_id, vẫn chuyển trang nhưng sẽ yêu cầu đăng nhập khi gửi đánh giá
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
  return (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllReviews}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Feather name="chevron-right" size={18} color="#2979ff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.ratingSummary}>
        <Text style={styles.ratingValue}>{product.rating?.toFixed(1) || '0.0'}</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Text 
              key={i} 
              style={{
                fontSize: 20,
                color: i <= Math.round(product.rating || 0) ? '#FFD700' : '#ccc'
              }}
            >
              ★
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#2979ff",
    marginRight: 4,
    fontSize: 14,
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFA000",
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: "row",
  },
});
