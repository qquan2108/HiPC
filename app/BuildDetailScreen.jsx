import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams,useRouter } from "expo-router";
import axiosInstance from "../utils/AxiosInstance";

export default function BuildDetailScreen() {
  const { id } = useLocalSearchParams();
  const [build, setBuild] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    <View style={{ flex: 1, backgroundColor: "#fafbff", padding: 16 }}>
      <Text style={styles.title}>{build.name || "Build không tên"}</Text>
      <Text style={styles.price}>Tổng giá: {build.total_price?.toLocaleString("vi-VN") || 0} đ</Text>
      <Text style={styles.status}>Trạng thái: {build.status}</Text>
      <Text style={styles.date}>Ngày tạo: {new Date(build.createdAt).toLocaleString("vi-VN")}</Text>
      <Text style={styles.section}>Danh sách linh kiện:</Text>
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.product_id?.name || "Không tên"}</Text>
            <Text style={styles.productQty}>Số lượng: {item.quantity}</Text>
            <Text style={styles.productPrice}>Giá: {item.product_id?.price?.toLocaleString("vi-VN") || 0} đ</Text>
          </View>
        )}
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
  productCard: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 },
  productName: { fontWeight: "bold" },
  productQty: { color: "#888" },
  productPrice: { color: "#2979ff" },
});