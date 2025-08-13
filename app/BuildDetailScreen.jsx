import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import axiosInstance from "../utils/AxiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      } catch (err) {
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
      if (!userStr) return Alert.alert("Bạn cần đăng nhập");
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      if (!userId) return Alert.alert("Bạn cần đăng nhập");

      const buildIds = [];
      for (const item of products) {
        await axiosInstance.post("/cartt/add-to-cart", {
          user_id: userId,
          productId: item.product_id?._id,
          quantity: item.quantity || 1,
        });
        if (item.product_id?._id) buildIds.push(item.product_id._id);
      }

      await AsyncStorage.setItem("buildCartItems", JSON.stringify(buildIds));
      router.push("/cart");
    } catch (e) {
      Alert.alert("Lỗi", e.response?.data?.error || e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  if (!build) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#888", fontSize: 16 }}>Không tìm thấy build.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fafbff" }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text style={styles.title}>{build.name || "Build không tên"}</Text>
            <Text style={styles.price}>Tổng giá: {formatCurrency(build.total_price)}</Text>
            <Text style={styles.status}>Trạng thái: {build.status}</Text>
            <Text style={styles.date}>Ngày tạo: {new Date(build.createdAt).toLocaleString("vi-VN")}</Text>
            <Text style={styles.section}>Danh sách linh kiện:</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image
              source=
                {item.product_id?.image
                  ? { uri: resolveImageUri(item.product_id.image) }
                  : require("../assets/images/pc.png")}
              style={styles.productImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.productName}>{item.product_id?.name || "Không tên"}</Text>
              <Text style={styles.productCategory}>{item.product_id?.category_id?.name || ""}</Text>
              <Text style={styles.productPrice}>{formatCurrency(item.product_id?.price)}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontWeight: "bold", fontSize: 20, marginBottom: 8 },
  price: { color: "#2979ff", fontWeight: "bold", marginBottom: 2 },
  status: { color: "#888", marginBottom: 2 },
  date: { color: "#aaa", fontSize: 12, marginBottom: 8 },
  section: { fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: { width: 60, height: 60, borderRadius: 6 },
  productName: { fontWeight: "bold" },
  productCategory: { color: "#888", marginTop: 2 },
  productPrice: { color: "#2979ff", marginTop: 2 },
  orderButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  orderButtonText: { color: "#fff", fontWeight: "bold" },
});