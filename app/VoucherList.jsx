import { Feather, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import axiosInstance from "../utils/AxiosInstance";
import { useRouter } from "expo-router"; // Thêm dòng này

export default function VoucherListScreen() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Thêm dòng này

  useEffect(() => {
    axiosInstance.get("/vouchers")
      .then(res => setVouchers(res.data))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="pricetag-outline" size={32} color="#fff" />
      </View>
      <View style={styles.info}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.desc}>{item.description || "Không có mô tả"}</Text>
        <View style={styles.row}>
          <Text style={styles.discount}>
            {item.code?.toLowerCase().includes("phantram") || item.description?.includes("%")
              ? `Giảm ${item.discount_value}%`
              : `Giảm ${item.discount_value?.toLocaleString()}đ`}
          </Text>
        </View>
        <View style={styles.row}>
          {item.start_date && (
            <Text style={styles.expiry}>
              Áp dụng: {new Date(item.start_date).toLocaleDateString()}
            </Text>
          )}
          {item.end_date && (
            <Text style={styles.expiry}>
              Hết hạn: {new Date(item.end_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Dùng ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="arrow-left" size={24} color="#1976ff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Danh sách Voucher</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1976ff" style={{ marginTop: 40 }} />
      ) : vouchers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="ticket-outline" size={60} color="#b0b9c8" />
          <Text style={styles.emptyText}>Không có voucher nào</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f8fc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaf2ff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1976ff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: "#1976ff",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1976ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  info: { flex: 1 },
  code: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1976ff",
    marginBottom: 2,
  },
  desc: {
    color: "#444",
    fontSize: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  discount: {
    color: "#ff3d00",
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 10,
  },
  expiry: {
    color: "#888",
    fontSize: 13,
    marginLeft: 10,
  },
  btn: {
    backgroundColor: "#ff9800",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginTop: 12,
  },
});