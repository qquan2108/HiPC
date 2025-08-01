import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import axiosInstance from "../utils/AxiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function PaymentRetryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return setLoading(false);
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      try {
        const res = await axiosInstance.get(`/orders/unpaid?user_id=${userId}`);
        setOrders(res.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePayAgain = (order) => {
    // Chuyển sang trang quét QR hoặc trang thanh toán lại
    router.push({ pathname: "/pay", params: { order_id: order._id } });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#888", fontSize: 16 }}>Không có đơn hàng chờ thanh toán.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fafbff" }}>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Đơn hàng #{item._id.slice(-6)}</Text>
            <Text style={styles.orderPrice}>Tổng tiền: {item.total?.toLocaleString("vi-VN")} đ</Text>
            <Text style={styles.orderStatus}>Trạng thái: {item.status}</Text>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => handlePayAgain(item)}
            >
              <Text style={styles.payBtnText}>Thanh toán lại</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  orderTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  orderPrice: { color: "#2979ff", fontWeight: "bold", marginBottom: 2 },
  orderStatus: { color: "#888", marginBottom: 8 },
  payBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  payBtnText: { color: "#fff", fontWeight: "bold" },
});