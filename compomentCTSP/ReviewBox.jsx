import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axiosInstance from "../utils/AxiosInstance";

function StarRating({ rating, size = 18, color = "#1e88e5" }) {
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

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {stars}
    </View>
  );
}

const getId = (obj) => obj?._id || obj?.id || "";

export default function ReviewBox({ product = {} }) {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const productId = getId(product);

  const productImage =
    product?.image?.uri ||
    product?.images?.[0]?.uri ||
    product?.image ||
    product?.images?.[0] ||
    "";

  const checkBought = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        Toast.show({ type: "error", text1: "Vui lòng đăng nhập để đánh giá!" });
        return false;
      }
      const userId = getId(user);
      if (!/^[a-f\d]{24}$/i.test(userId) || !/^[a-f\d]{24}$/i.test(productId)) {
        Toast.show({
          type: "error",
          text1: "Thiếu thông tin người dùng hoặc sản phẩm!",
        });
        return false;
      }
      const { data } = await axiosInstance.get("/productreviews/check-bought", {
        params: { user_id: userId, product_id: productId },
      });
      if (!data?.hasBought) {
        Toast.show({
          type: "error",
          text1: "Vui lòng mua sản phẩm để đánh giá!",
        });
        return false;
      }
      return true;
    } catch {
      Toast.show({
        type: "error",
        text1: "Vui lòng mua sản phẩm để đánh giá!",
      });
      return false;
    }
  };

  const handleWriteReview = async () => {
    if (await checkBought()) {
      router.push({
        pathname: "/danhgia",
        params: {
          product_id: productId,
          product_name: product?.name || "",
          product_image: productImage,
        },
      });
    }
  };

  const handleAddImage = async () => {
    if (await checkBought()) {
      Toast.show({
        type: "info",
        text1: "Chức năng thêm ảnh đang phát triển.",
      });
    }
  };

  useEffect(() => {
    let ignore = false;
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance
      .get("/productreviews", { params: { product_id: productId } })
      .then((res) => {
        if (!ignore) setReviews(res?.data || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
    return () => {
      ignore = true;
    };
  }, [productId]);

  // Tính điểm trung bình & phân bố
  const { avgRating, counts, total } = useMemo(() => {
    if (!reviews?.length)
      return {
        avgRating: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        total: 0,
      };
    const sum = reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0);
    const avg = sum / reviews.length;
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const star = Math.round(Number(r?.rating) || 0);
      if (star >= 1 && star <= 5) c[star] += 1;
    });
    return {
      avgRating: Number(avg.toFixed(1)),
      counts: c,
      total: reviews.length,
    };
  }, [reviews]);

  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#90caf9", "#42a5f5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="star" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() =>
              router.push({
                pathname: "/xemtatcadanhgia",
                params: { product_id: productId },
              })
            }
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.15)"]}
              style={styles.viewAllGradient}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Feather name="chevron-right" size={14} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <View style={styles.mainRating}>
          <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
          <View style={styles.ratingMeta}>
            <Text style={styles.outOf}>/ 5.0</Text>
            <Text style={styles.reviewCount}>({total} đánh giá)</Text>
          </View>
        </View>

        <View style={styles.starsSection}>
          <View style={styles.starsContainer}>
            <StarRating rating={avgRating} size={18} color="#1e88e5" />
          </View>

          {/* Rating Distribution */}
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = counts[star] || 0;
              const percent = total ? (count / total) * 100 : 0;
              return (
                <View key={star} style={styles.distributionRow}>
                  <Text style={styles.distributionStar}>{star}★</Text>
                  <View style={styles.distributionBar}>
                    <LinearGradient
                      colors={["#64b5f6", "#1e88e5"]}
                      style={[
                        styles.distributionFill,
                        { width: `${percent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Reviews List */}
      <View style={{ marginTop: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            marginBottom: 10,
            color: "#0d47a1",
          }}
        >
          Đánh giá của khách hàng
        </Text>

        {total === 0 ? (
          <Text style={{ color: "#8aa1c4", fontStyle: "italic" }}>
            Chưa có đánh giá nào
          </Text>
        ) : (
          <FlatList
            data={reviews.slice(0, 3)}
            keyExtractor={(item, idx) => item?._id || String(idx)}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      marginRight: 8,
                      color: "#1565c0",
                    }}
                  >
                    {item?.user_id?.full_name || "Ẩn danh"}
                  </Text>
                  <StarRating
                    rating={Number(item?.rating) || 0}
                    size={14}
                    color="#1976d2"
                  />
                  <Text
                    style={{ marginLeft: 8, color: "#90a4ae", fontSize: 12 }}
                  >
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
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#42a5f5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },

  // Header
  header: { marginBottom: 20 },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 12,
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  viewAllButton: { borderRadius: 12, overflow: "hidden" },
  viewAllGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    color: "#ffffff",
    marginRight: 4,
    fontSize: 12,
    fontWeight: "800",
  },

  // Rating Container
  ratingContainer: { paddingHorizontal: 20 },
  mainRating: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1e88e5",
    letterSpacing: -1,
  },
  ratingMeta: { marginLeft: 8 },
  outOf: { fontSize: 16, color: "#455a64", fontWeight: "700" },
  reviewCount: { fontSize: 12, color: "#90a4ae", marginTop: 2 },

  // Stars Section
  starsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    flexShrink: 0,
  },

  // Rating Distribution
  ratingDistribution: { flex: 1, marginLeft: 20 },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  distributionStar: {
    fontSize: 10,
    color: "#1976d2",
    width: 18,
    marginRight: 8,
    fontWeight: "700",
  },
  distributionBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e3f2fd",
    borderRadius: 3,
    overflow: "hidden",
  },
  distributionFill: { height: "100%", borderRadius: 3 },
  distributionCount: {
    width: 28,
    textAlign: "right",
    marginLeft: 8,
    color: "#607d8b",
    fontWeight: "600",
    fontSize: 12,
  },
});
