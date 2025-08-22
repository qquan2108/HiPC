import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axiosInstance from "../utils/AxiosInstance";

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
      .get(`/productreviews/by-product/${productId}`)
      .then((res) => setReviews(res?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <Feather name="arrow-left" size={24} color="#1976d2" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>
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
            <View style={styles.reviewItem}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.userName}>
                  {item?.user_id?.full_name || "Ẩn danh"}
                </Text>
                <Text style={styles.reviewDate}>
                  {item?.created_at
                    ? new Date(item.created_at).toLocaleDateString("vi-VN")
                    : ""}
                </Text>
              </View>
              {/* Đưa rating xuống dòng riêng */}
              <View style={{ marginTop: 2, marginBottom: 2 }}>
                <StarRating rating={Number(item?.rating) || 0} size={14} color="#1976d2" />
              </View>
              
              {/* Hiển thị biến thể đã mua nếu có */}
              {item?.variant && (
                <View style={{ marginTop: 6 }}>
                  {/* Kiểu cũ: { key: "A + B", label: "X + Y" } */}
                  {item.variant.key && item.variant.label && item.variant.key.includes(' + ') && item.variant.label.includes(' + ')
                    ? (() => {
                        const keys = item.variant.key.split(' + ').map(k => k.trim());
                        const labels = item.variant.label.split(' + ').map(l => l.trim());
                        return keys.map((k, idx) => (
                          <View key={`${k}_${idx}`} style={{ flexDirection: 'row', marginBottom: 2 }}>
                            <Text style={styles.variantLabel}>{k}:</Text>
                            <Text style={styles.variantText}>{labels[idx] || ''}</Text>
                          </View>
                        ));
                      })()
                    : null}

                  {/* Kiểu mới: object, nhiều thuộc tính */}
                  {typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && !item.variant.key && !item.variant.label
                    ? Object.entries(item.variant).map(([variantType, variantValue], idx) => {
                        if (['key', 'label', 'priceDiff'].includes(variantType)) return null;
                        const displayValue = typeof variantValue === 'object' && variantValue !== null
                          ? (variantValue.label || variantValue.value || variantValue)
                          : variantValue;
                        return (
                          <View key={`${variantType}_${idx}`} style={{ flexDirection: 'row', marginBottom: 2 }}>
                            <Text style={styles.variantLabel}>{variantType}:</Text>
                            <Text style={styles.variantText}>{displayValue}</Text>
                          </View>
                        );
                      })
                    : null}

                  {/* Key/label đơn */}
                  {item.variant.key && item.variant.label && !(item.variant.key.includes(' + ') && item.variant.label.includes(' + '))
                    ? (
                      <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={styles.variantLabel}>{item.variant.key}:</Text>
                        <Text style={styles.variantText}>{item.variant.label}</Text>
                      </View>
                    )
                    : null}

                  {/* String */}
                  {typeof item.variant === 'string'
                    ? (
                      <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={styles.variantLabel}>Phân loại:</Text>
                        <Text style={styles.variantText}>{item.variant}</Text>
                      </View>
                    )
                    : null}
                </View>
              )}

              {/* Hiển thị ảnh sản phẩm đã mua nếu có */}
              {(item?.boughtImage || item?.variant?.image) && (
                <View style={styles.productImageContainer}>
                  <Image
                    source={{ uri: item.boughtImage || item.variant.image }}
                    style={styles.productImage}
                  />
                </View>
              )}

              {!!item?.comment && (
                <Text style={styles.commentText}>
                  {item.comment}
                </Text>
              )}

              {/* Hiển thị hình ảnh đánh giá nếu có */}
              {Array.isArray(item.images) && item.images.length > 0 && (
                <View style={styles.reviewImagesContainer}>
                  {item.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={styles.reviewImage}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Chưa có đánh giá nào cho sản phẩm này.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    backgroundColor: "#f5faff"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    color: "#1976d2"
  },
  reviewItem: {
    marginBottom: 18,
    backgroundColor: "#f7fbff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#1976d2",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontWeight: "700",
    marginRight: 8,
    color: "#1565c0"
  },
  reviewDate: {
    marginLeft: 8,
    color: "#90a4ae",
    fontSize: 12
  },
  variantContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 3,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  variantLabel: {
    color: "#1976d2",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  variantText: {
    color: "#1976d2",
    fontSize: 13,
    fontWeight: "500",
  },
  variantPrice: {
    color: "#1976d2",
    fontSize: 13,
    fontWeight: "600",
  },
  productImageContainer: {
    marginTop: 8,
    marginBottom: 6,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  commentText: {
    marginTop: 4,
    color: "#263238",
    lineHeight: 20,
  },
  reviewImagesContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
    flexWrap: "wrap",
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emptyText: {
    color: "#8aa1c4",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 32
  }
});