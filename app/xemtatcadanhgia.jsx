import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axiosInstance from "../utils/AxiosInstance";
import { Feather } from "@expo/vector-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

function StarRating({ rating, size = 16, color = "#1e88e5" }) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  for (let i = 0; i < full; i++) {
    stars.push(
      <FontAwesome key={`full-${i}`} name="star" size={size} color={color} />
    );
  }
  if (hasHalf) {
    stars.push(
      <FontAwesome key="half" name="star-half-full" size={size} color={color} />
    );
  }
  for (let i = 0; i < empty; i++) {
    stars.push(
      <FontAwesome key={`empty-${i}`} name="star-o" size={size} color={color} />
    );
  }
  return <View style={{ flexDirection: "row", alignItems: "center" }}>{stars}</View>;
}

export default function XemTatCaDanhGia() {
  const params = useLocalSearchParams();
  const productId = params.product_id;
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/productreviews", { params: { product_id: productId } })
      .then((res) => setReviews(res?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e3e3e3",
        backgroundColor: "#f5faff"
      }}>
        <Feather name="arrow-left" size={24} color="#1976d2" onPress={() => router.back()} />
        <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 16, color: "#1976d2" }}>
          Tất cả đánh giá
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, idx) => item?._id || String(idx)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{
              marginBottom: 18,
              backgroundColor: "#f7fbff",
              borderRadius: 12,
              padding: 14,
              shadowColor: "#1976d2",
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", marginRight: 8, color: "#1565c0" }}>
                  {item?.user_id?.full_name || "Ẩn danh"}
                </Text>
                <StarRating rating={Number(item?.rating) || 0} size={14} color="#1976d2" />
                <Text style={{ marginLeft: 8, color: "#90a4ae", fontSize: 12 }}>
                  {item?.created_at
                    ? new Date(item.created_at).toLocaleDateString("vi-VN")
                    : ""}
                </Text>
              </View>
              {!!item?.comment && (
                <Text style={{ marginTop: 4, color: "#263238" }}>
                  {item.comment}
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#8aa1c4", fontStyle: "italic", textAlign: "center", marginTop: 32 }}>
              Chưa có đánh giá nào cho sản phẩm này.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}