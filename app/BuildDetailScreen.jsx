import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosInstance from "../utils/AxiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

export default function BuildDetailScreen() {
  const { id } = useLocalSearchParams();
  const [build, setBuild] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseURL = axiosInstance.defaults.baseURL;
  const resolveImageUri = (url) => (url?.startsWith("http") ? url : `${baseURL}${url}`);
  const formatCurrency = (num) =>
    typeof num === "number" && !isNaN(num)
      ? num.toLocaleString("vi-VN") + " đ"
      : "0 đ";

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/pcbuild/${id}`);
        setBuild(res.data.build);
        setProducts(res.data.products || []);
      } catch (_err) {
        setBuild(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleOrder = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return Alert.alert("Thông báo", "Bạn cần đăng nhập để đặt hàng");
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      if (!userId) return Alert.alert("Thông báo", "Bạn cần đăng nhập để đặt hàng");

      const buildIds = [];
      for (const item of products) {
        const payload = {
          user_id: userId,
          productId: item.product_id?._id,
          quantity: item.quantity || 1,
        };
        if (item.variant) {
          payload.variant = item.variant;
        }
        await axiosInstance.post("/cartt/add-to-cart", payload);
        if (item.product_id?._id) buildIds.push(item.product_id._id);
      }

      await AsyncStorage.setItem("buildCartItems", JSON.stringify(buildIds));
      Alert.alert("Thành công", "Đã thêm tất cả sản phẩm vào giỏ hàng!", [
        { text: "OK", onPress: () => router.push("/cart") }
      ]);
    } catch (e) {
      Alert.alert("Lỗi", e.response?.data?.error || e.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      default: return 'document-text';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      default: return 'Bản nháp';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.loadingHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết cấu hình</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.center}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2979ff" />
            <Text style={styles.loadingText}>Đang tải cấu hình...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!build) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.loadingHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết cấu hình</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.center}>
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={64} color="#ff5722" />
            <Text style={styles.errorTitle}>Không tìm thấy cấu hình</Text>
            <Text style={styles.errorDescription}>Cấu hình có thể đã bị xóa hoặc không tồn tại</Text>
            <TouchableOpacity style={styles.backToListButton} onPress={() => router.back()}>
              <Text style={styles.backToListText}>Quay lại danh sách</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderProductCard = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.productCard, { marginTop: index === 0 ? 0 : 16 }]}
      onPress={() =>
        item.product_id?._id && router.push(`/ctsp?id=${item.product_id._id}`)
      }
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={
            item.product_id?.image
              ? { uri: resolveImageUri(item.product_id.image) }
              : require("../assets/images/pc.png")
          }
          style={styles.productImage}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {item.product_id?.category_id?.name || "N/A"}
          </Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product_id?.name || "Sản phẩm không tên"}
        </Text>
        
        {item.variant && (
          <View style={styles.variantContainer}>
            <MaterialIcons name="tune" size={14} color="#666" />
            <Text style={styles.productVariant}>
              {item.variant.label}
            </Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {formatCurrency(
              (item.product_id?.price || 0) + (item.variant?.priceDiff || 0)
            )}
          </Text>
          {item.quantity > 1 && (
            <Text style={styles.quantityText}>x{item.quantity}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết cấu hình</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProductCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.buildInfoContainer}>
            {/* Build Header Card */}
            <View style={styles.buildHeaderCard}>
              <View style={styles.buildTitleRow}>
                <MaterialIcons name="computer" size={32} color="#2979ff" />
                <View style={styles.buildTitleInfo}>
                  <Text style={styles.buildTitle}>{build.name || "Cấu hình không tên"}</Text>
                  <View style={styles.statusContainer}>
                    <Ionicons 
                      name={getStatusIcon(build.status)} 
                      size={16} 
                      color={getStatusColor(build.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(build.status) }]}>
                      {getStatusText(build.status)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Price Section */}
              <View style={styles.priceSection}>
                <LinearGradient 
                  colors={["#2979ff", "#1565c0"]} 
                  style={styles.priceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.priceLabel}>Tổng giá trị</Text>
                  <Text style={styles.totalPrice}>{formatCurrency(build.total_price)}</Text>
                </LinearGradient>
              </View>

              {/* Build Info */}
              <View style={styles.buildMetaContainer}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="calendar-today" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {new Date(build.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="inventory" size={16} color="#666" />
                  <Text style={styles.metaText}>{products.length} linh kiện</Text>
                </View>
              </View>
            </View>

            {/* Components Section Header */}
            <View style={styles.sectionHeader}>
              <MaterialIcons name="list" size={24} color="#333" />
              <Text style={styles.sectionTitle}>Danh sách linh kiện</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
              <LinearGradient
                colors={["#4CAF50", "#45a049"]}
                style={styles.orderButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="shopping-cart" size={24} color="#fff" />
                <Text style={styles.orderButtonText}>Thêm vào giỏ hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  
  header: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  
  loadingHeader: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  
  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: width - 40,
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  
  backToListButton: {
    backgroundColor: "#2979ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  
  backToListText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  
  buildInfoContainer: {
    marginBottom: 8,
  },
  
  buildHeaderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  buildTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  
  buildTitleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
  buildTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 28,
  },
  
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  
  priceSection: {
    marginBottom: 16,
  },
  
  priceGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  
  priceLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  
  totalPrice: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  
  buildMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  metaText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  productImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  
  categoryBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#2979ff",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  categoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  
  productInfo: {
    flex: 1,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },
  
  variantContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  productVariant: {
    color: "#666",
    fontSize: 14,
    marginLeft: 4,
  },
  
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  productPrice: {
    color: "#2979ff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  quantityText: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  arrowContainer: {
    marginLeft: 12,
  },
  
  footerContainer: {
    marginTop: 20,
  },
  
  orderButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  orderButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});