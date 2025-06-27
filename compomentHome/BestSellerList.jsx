import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

export default function BestSellerList({
  bestSellers,
  renderDiscountBadge,
  renderHotBadge,
  renderBestSellerBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  // Hàm thêm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
        return router.push('/LoginScreen');
      }
      const userId = JSON.parse(userStr).id;
      await axiosInstance.post('/orders/add-to-cart', { user_id: userId, productId: product.id, quantity: 1 });
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
      setTimeout(() => router.push('./cart'), 1200);
    } catch {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
    }
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) return onRequireLogin();
    addToCart(product);
  };

  return (
    <View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Phổ biến nhất trong tháng</Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {bestSellers.map((product) => (
          <View key={product.id} style={styles.productCardSmall}>
            {product.discount > 0 && renderDiscountBadge(product.discount)}
            {product.isHot && renderHotBadge()}
            {product.isBestSeller && renderBestSellerBadge()}
            <Image source={product.image} style={styles.productImageSmall} />
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <AntDesign name="star" size={10} color="#FFD700" />
              <Text style={{ fontSize: 10, color: "#888", marginLeft: 2 }}>{product.rating}</Text>
              <Text style={{ fontSize: 10, color: "#888", marginLeft: 4 }}>| {product.sold} đã bán</Text>
            </View>
            <Text numberOfLines={1} style={styles.productNameSmall}>{product.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPriceSmall}>{product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPriceSmall}>{product.originalPrice}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleAddToCart(product)}>
              <Text style={{ color: "#1a73e8", marginTop: 4 }}>Thêm vào giỏ</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  linkText: {
    color: "#1a73e8",
    fontSize: 13,
    fontWeight: "600",
  },
  productCardSmall: {
    width: 135,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 6,
    padding: 6,
    alignItems: "center",
    position: "relative",
  },
  productImageSmall: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
    resizeMode: "contain",
  },
  productNameSmall: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  productPriceSmall: {
    color: "#f55858",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
    textAlign: "center",
  },
  originalPriceSmall: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});