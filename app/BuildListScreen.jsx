import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/AxiosInstance";
import { useRouter } from "expo-router";

export default function BuildListScreen() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return setLoading(false);
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      if (!userId) return setLoading(false);

      try {
        const res = await axiosInstance.get(`/pcbuild/user/${userId}`);
        setBuilds(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setBuilds([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  if (!builds.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#888", fontSize: 16 }}>Bạn chưa có build nào.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fafbff" }}>
      <FlatList
        data={builds}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.buildCard}
            onPress={() => router.push(`/BuildDetailScreen?id=${item._id}`)}
          >
            <Text style={styles.buildName}>{item.name || "Build không tên"}</Text>
            <Text style={styles.buildPrice}>Tổng giá: {item.total_price?.toLocaleString("vi-VN") || 0} đ</Text>
            <Text style={styles.buildStatus}>Trạng thái: {item.status}</Text>
            <Text style={styles.buildDate}>Ngày tạo: {new Date(item.createdAt).toLocaleString("vi-VN")}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buildCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  buildName: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  buildPrice: { color: "#2979ff", fontWeight: "bold", marginBottom: 2 },
  buildStatus: { color: "#888", marginBottom: 2 },
  buildDate: { color: "#aaa", fontSize: 12 },
});