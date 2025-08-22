import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundImage from "../assets/images/backroundLogin.png";
import AIChatBox from "../compomentHome/AIChatBox";
import Banner from "../compomentHome/Banner";
import CategoryList from "../compomentHome/CategoryList";
import CustomTabBar from "../compomentHome/CustomTabBar";
import FlashSale from "../compomentHome/FlashSale";
import ForYouGrid from "../compomentHome/ForYouGrid";
import Header from "../compomentHome/Header";
import NewProducts from "../compomentHome/NewProducts";
import axiosInstance from "../utils/AxiosInstance";
import SkeletonHome from "./SkeletonHome";

const { width } = Dimensions.get("window");
const base = axiosInstance.defaults.baseURL;
const PLACEHOLDER_IMG = require("../assets/images/pc1.png");

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [aiChatScale] = useState(new Animated.Value(1));
  const [categories, setCategories] = useState([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [avatarUri, setAvatarUri] = useState(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 🟢 Thêm state cho pull-to-refresh
  const [banners, setBanners] = useState([]);
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUnpaidDialog, setShowUnpaidDialog] = useState(false);

  // 🟢 Thêm flag để track xem đã load dữ liệu lần đầu chưa
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Badge renderers
  const renderDiscountBadge = (discount) => (
    <View style={styles.discountBadge}>
      <Text style={styles.discountTextBadge}>-{discount}%</Text>
    </View>
  );
  const renderNewBadge = () => (
    <View style={styles.newBadge}>
      <Text style={styles.newBadgeText}>Mới</Text>
    </View>
  );
  const renderHotBadge = () => (
    <View style={styles.hotBadge}>
      <Ionicons name="flame" size={12} color="#fff" />
      <Text style={styles.hotBadgeText}>Hot</Text>
    </View>
  );
  const renderBestSellerBadge = () => (
    <View style={styles.bestSellerBadge}>
      <AntDesign name="star" size={12} color="#fff" />
      <Text style={styles.bestSellerBadgeText}>Bán chạy</Text>
    </View>
  );

  // 🟢 Tách logic load avatar thành function riêng để tránh duplicate
  const loadAvatar = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;
      const local = JSON.parse(raw);
      const userId = local.id ?? local._id;
      if (!userId) return;

      setUserName(local.full_name || local.name || local.email || "User");

      if (local.avatarUrl) {
        setAvatarUri(local.avatarUrl);
      } else {
        const res = await axiosInstance.get(`/users/${userId}`);
        setAvatarUri(res.data.avatarUrl);
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...local, avatarUrl: res.data.avatarUrl })
        );
      }
    } catch (err) {
      console.error("Load avatar error:", err);
    }
  }, []);

  // 🟢 Tách logic load products thành function riêng
  const loadProducts = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/product");
      const mapped = (data.products || []).map((p) => {
        // ---- Chuẩn hoá ảnh với nhiều trường hợp và fallback ảnh mặc định ----
        const getImageSource = () => {
          // 1) p.image: có thể là "" | "/uploads/a.jpg" | "http..."
          if (typeof p.image === "string" && p.image.trim() !== "") {
            const u = p.image.trim();
            return { uri: u.startsWith("http") ? u : `${base}${u}` };
          }
          // 2) p.images: mảng string/obj {url}
          if (Array.isArray(p.images) && p.images.length > 0) {
            const first = p.images[0];
            const u = typeof first === "string" ? first : first?.url;
            if (u && typeof u === "string") {
              return { uri: u.startsWith("http") ? u : `${base}${u}` };
            }
          }
          // 3) Fallback
          return PLACEHOLDER_IMG;
        };
        const imageSource = getImageSource();

        return {
          ...p,
          id: p._id,
          // RN Image dùng được cả {uri} hoặc require()
          image: imageSource,
          // Cho các component nào chỉ nhận string URL:
          imageUrl: imageSource?.uri ?? null,
          discount:
            p.originalPrice && p.price < p.originalPrice
              ? Math.round(100 - (p.price / p.originalPrice) * 100)
              : 0,
          isHot: (p.sold || 0) > 50,
          isBestSeller: p.isBestSeller ?? false,
          price: (p.price ?? 0).toLocaleString("vi-VN") + " đ",
          originalPrice: p.originalPrice
            ? p.originalPrice.toLocaleString("vi-VN") + " đ"
            : undefined,
        };
      });

      setProducts(mapped);
      setBestSellers(mapped.filter((p) => p.isBestSeller));
      setFlashSaleProducts(mapped.filter((p) => p.discount > 0));
    } catch (error) {
      console.error("Load products error:", error);
      setProducts([]);
      setBestSellers([]);
      setFlashSaleProducts([]);
    }
  }, []);

  // 🟢 Tách logic load categories thành function riêng
  const loadCategories = useCallback(async () => {
    try {
      const [catRes, imgRes] = await Promise.all([
        axiosInstance.get("/category"),
        axiosInstance.get("/images"),
      ]);

      const images = imgRes.data;
      setCategories(
        catRes.data.map((cat) => {
          const img = images.find(
            (i) => i.category_id && i.category_id._id === cat._id
          );
          return {
            _id: cat._id, // Thêm dòng này để truyền ObjectId
            key: cat.name,
            label: cat.name,
            icon: img ? { uri: img.url } : require("../assets/images/pc.png"),
          };
        })
      );
    } catch (error) {
      console.error("Load categories error:", error);
      setCategories([]);
    }
  }, []);

  // 🟢 Tách logic load banners thành function riêng
  const loadBanners = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/banners");
      setBanners(data);
    } catch (error) {
      console.error("Load banners error:", error);
      setBanners([]);
    }
  }, []);

  // 🟢 Function tổng hợp load tất cả dữ liệu
  const loadAllData = useCallback(
    async (showLoadingSpinner = false) => {
      if (showLoadingSpinner) {
        setLoading(true);
      }

      try {
        await Promise.all([
          loadProducts(),
          loadCategories(),
          loadBanners(),
          loadAvatar(),
        ]);
      } catch (error) {
        console.error("Load all data error:", error);
      } finally {
        if (showLoadingSpinner) {
          setLoading(false);
        }
        setHasInitialLoad(true);
      }
    },
    [loadProducts, loadCategories, loadBanners, loadAvatar]
  );

  // 🟢 Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData(false);
    setRefreshing(false);
  }, [loadAllData]);

  // 🟢 Chỉ load dữ liệu lần đầu khi component mount
  useEffect(() => {
    if (!hasInitialLoad) {
      loadAllData(true);
    }
  }, [loadAllData, hasInitialLoad]);

  // 🟢 useFocusEffect chỉ kiểm tra login status, không load lại dữ liệu
  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token);
      };
      checkLogin();

      // Chỉ load avatar nếu chưa có (user có thể đã đổi avatar)
      if (!avatarUri) {
        loadAvatar();
      }
    }, [avatarUri, loadAvatar])
  );

  // Banner auto scroll
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Promo popup effect
  useEffect(() => {
    if (showPromoPopup) {
      fadeAnim.setValue(1);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowPromoPopup(false));
      }, 2000);
      return () => {
        clearTimeout(timer);
        fadeAnim.setValue(1);
      };
    }
  }, [showPromoPopup]);

  const handleClosePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowPromoPopup(false));
  };

  // AI Chat animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(aiChatScale, {
          toValue: 1.18,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(aiChatScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const requireLogin = () => {
    router.push("/LoginScreen");
  };

  // Kiểm tra đơn hàng chưa thanh toán khi vào Home
  useEffect(() => {
    // Kiểm tra đơn hàng chưa thanh toán khi vào Home
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        if (!userId) return;

        const res = await axiosInstance.get(`/orders/unpaid?user_id=${userId}`);
        const unpaidOrders = res.data || [];
        if (unpaidOrders.length > 0) {
          setShowUnpaidDialog(true); // Hiện dialog nếu có đơn chưa thanh toán
        }
      } catch (err) {
        // Không cần báo lỗi
      }
    })();
  }, [hasInitialLoad]);

  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={{ flex: 1, justifyContent: "flex-start" }}
      imageStyle={{ opacity: 0.92 }}
    >
      {loading ? (
        <SkeletonHome />
      ) : (
        <View style={styles.container}>
          {/* 🟢 Thêm RefreshControl vào ScrollView */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2979ff"
                title="Đang tải..."
                titleColor="#2979ff"
                colors={["#2979ff"]}
              />
            }
          >
            {/* Header */}
            <Header
              router={router}
              notificationCount={3}
              avatarUri={avatarUri}
              userName={userName}
            />

            <View
              style={{ paddingHorizontal: 18, marginTop: 0, marginBottom: 14 }}
            >
              <LinearGradient
                colors={["#2979ff", "#00c6ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 18,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  elevation: 4,
                  shadowColor: "#2979ff",
                  shadowOpacity: 0.18,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <Ionicons
                  name="rocket-outline"
                  size={40}
                  color="#fff"
                  style={{ marginRight: 18 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 22,
                      fontWeight: "bold",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                      textShadowColor: "rgba(0,0,0,0.18)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 6,
                    }}
                  >
                    HIPC chào bạn!
                  </Text>
                  <Text
                    style={{
                      color: "#eaf3ff",
                      fontSize: 15,
                      fontWeight: "500",
                      lineHeight: 22,
                      textShadowColor: "rgba(0,0,0,0.10)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    Đừng bỏ lỡ các ưu đãi hấp dẫn hôm nay nhé.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Slider banner */}
            <View style={{ height: 220, marginVertical: 7 }}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
              >
                {banners.map((item, i) => (
                  <View key={item._id} style={{ width, paddingHorizontal: 7 }}>
                    <Banner
                      onPress={() => router.push("./danhmucall")}
                      source={{
                        uri: item.imageUrl.startsWith("http")
                          ? item.imageUrl
                          : `${base}${item.imageUrl}`,
                      }}
                      title={item.title}
                      subtitle={item.content}
                      overlayType="gradient"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Danh mục */}
            
<View
  style={{
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#e0e7ef",
    backgroundColor: "#fafdff",
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  }}
>
  {console.log("Categories truyền sang CategoryList:", categories)}
  <CategoryList categories={categories} router={router} />
</View>

            {/* Khung giờ vàng */}
            <FlashSale
              flashSale={products}
              renderDiscountBadge={renderDiscountBadge}
              renderHotBadge={renderHotBadge}
              isLoggedIn={isLoggedIn}
              onRequireLogin={requireLogin}
              router={router}
            />

            {/* Sản phẩm mới */}
            <NewProducts
              products={products}
              renderNewBadge={renderNewBadge}
              renderHotBadge={renderHotBadge}
              renderDiscountBadge={renderDiscountBadge}
              isLoggedIn={isLoggedIn}
              onRequireLogin={requireLogin}
              router={router}
            />

            {/* Dành riêng cho bạn */}
            <ForYouGrid
              products={products}
              renderNewBadge={renderNewBadge}
              renderDiscountBadge={renderDiscountBadge}
              isLoggedIn={isLoggedIn}
              onRequireLogin={requireLogin}
              router={router}
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* AI Chat Floating Icon */}
          <Animated.View
            style={[styles.aiChatIcon, { transform: [{ scale: aiChatScale }] }]}
          >
            <TouchableOpacity
              onPress={() => {
                if (!isLoggedIn) requireLogin();
                else setShowAIChat(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={54} color="#4a90e2" />
            </TouchableOpacity>
          </Animated.View>

          {/* AI Chat Box */}
          {showAIChat && isLoggedIn && (
            <AIChatBox
              onClose={() => setShowAIChat(false)}
              onStartChat={() => router.push("./chatboxai")}
            />
          )}

          {/* Custom Tab Bar */}
          <CustomTabBar router={router} />

          {/* Dialog cảnh báo đơn chưa thanh toán */}
          <Modal
            visible={showUnpaidDialog}
            transparent
            animationType="slide"
            onRequestClose={() => setShowUnpaidDialog(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  width: "80%",
                  alignItems: "center",
                  elevation: 8,
                }}
              >
                <Ionicons
                  name="alert-circle"
                  size={48}
                  color="#f55858"
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#f55858",
                    marginBottom: 8,
                  }}
                >
                  Bạn có đơn hàng chưa thanh toán!
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#333",
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  Vui lòng thanh toán, nếu không đơn sẽ bị hủy sau 10 phút.
                </Text>
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#2979ff",
                      borderRadius: 8,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      marginRight: 12,
                    }}
                    onPress={() => {
                      setShowUnpaidDialog(false);
                      router.push("/RetryPay");
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Tiếp tục
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#eee",
                      borderRadius: 8,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                    }}
                    onPress={() => setShowUnpaidDialog(false)}
                  >
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Bỏ qua
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  greeting: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 18,
    marginTop: 8,
  },
  greetingDesc: {
    fontSize: 13,
    color: "#666",
    marginLeft: 18,
    marginBottom: 8,
    marginRight: 18,
    lineHeight: 18,
  },
  discountBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#f55858",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 2,
  },
  discountTextBadge: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#1a73e8",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 2,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  hotBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FF4500",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  hotBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  bestSellerBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  bestSellerBadgeText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  aiChatIcon: {
    position: "absolute",
    bottom: 90,
    right: 24,
    zIndex: 100,
    backgroundColor: "#fff",
    borderRadius: 36,
    elevation: 8,
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    padding: 10,
  },
});
