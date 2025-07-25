import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundImage from "../assets/images/backroundLogin.png";
import AIChatBox from "../compomentHome/AIChatBox";
import Banner from "../compomentHome/Banner";
import BestSellerList from "../compomentHome/BestSellerList";
import CategoryList from "../compomentHome/CategoryList";
import CustomTabBar from "../compomentHome/CustomTabBar";
import FlashSale from "../compomentHome/FlashSale";
import ForYouGrid from "../compomentHome/ForYouGrid";
import Header from "../compomentHome/Header";
import NewProducts from "../compomentHome/NewProducts";
import PromoPopup from "../compomentHome/PromoPopup";
import axiosInstance from "../utils/AxiosInstance";
import { cacheImages } from "../utils/cacheImages";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const base = axiosInstance.defaults.baseURL;

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
  const [userName, setUserName] = useState("User"); // 🟢 Thêm state

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
  useFocusEffect(
    React.useCallback(() => {
      const loadAvatar = async () => {
        try {
          const raw = await AsyncStorage.getItem("user");
          if (!raw) return;
          const local = JSON.parse(raw);
          const userId = local.id ?? local._id;
          if (!userId) return;

          setUserName(local.full_name || local.name || local.email || "User"); // 🟢 Lấy tên user

          if (local.avatarUrl) {
            setAvatarUri(local.avatarUrl);
          } else {
            // Fetch chi tiết user
            const res = await axiosInstance.get(`/users/${userId}`);
            setAvatarUri(res.data.avatarUrl);
            // Cập nhật AsyncStorage để lần sau khỏi fetch lại
            await AsyncStorage.setItem(
              "user",
              JSON.stringify({ ...local, avatarUrl: res.data.avatarUrl })
            );
          }
        } catch (err) {
          console.error("Load avatar error:", err);
        }
      };
      loadAvatar();
    }, [])
  );
 useEffect(() => {
  if (showPromoPopup) {
    const timer = setTimeout(() => {
      setShowPromoPopup(false);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [showPromoPopup]);

// 2) Bỏ animation khi bấm tắt thủ công
const handleClosePopup = () => {
  setShowPromoPopup(false);
};

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
  useEffect(() => {
    Promise.all([axiosInstance.get("/category"), axiosInstance.get("/images")])
      .then(([catRes, imgRes]) => {
        const images = imgRes.data;
        let cats = catRes.data.slice(0, 7).map((cat, idx) => ({
          key: cat._id,
          label: cat.name,
          icon: categoryImages[idx] || require("../assets/images/cpu.png"),
        }));
        cats.push({
          key: "more",
          label: "Xem thêm",
          icon: require("../assets/images/more.png"),
          isMore: true,
        });
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    axiosInstance
      .get('/product')
      .then(({ data }) => {
        const mapped = (data.products || []).map(p => {
          // build a full image URI, falling back to a local asset
          const raw = p.image;
          const uri = raw
            ? raw.startsWith('http')
              ? raw
              : `${base}${raw}`
            : undefined;

          return {
            ...p,
            id: p._id,
            image: uri
              ? { uri }
              : require('../assets/images/pc1.png'),
            discount:
              p.originalPrice && p.price < p.originalPrice
                ? Math.round(100 - (p.price / p.originalPrice) * 100)
                : 0,
            isHot: (p.sold || 0) > 50,
            isBestSeller: p.isBestSeller ?? false,
            price: (p.price ?? 0).toLocaleString('vi-VN') + ' đ',
          originalPrice: p.originalPrice
            ? p.originalPrice.toLocaleString('vi-VN') + ' đ'
            : undefined,
        };
        });

        setProducts(mapped);
        cacheImages(mapped.map((p) => p.image?.uri || p.image));
        setBestSellers(mapped.filter(p => p.isBestSeller));
        // Lọc flash sale: chỉ những sản phẩm có discount > 0
        setFlashSaleProducts(mapped.filter(p => p.discount > 0));
      })
      .catch(() => {
        setProducts([]);
        setBestSellers([]);
        setFlashSaleProducts([]);
      });
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      // Gọi lại API khi HomeScreen được focus
      axiosInstance
        .get('/product')
        .then(({ data }) => {
          const mapped = (data.products || []).map(p => {
            // build a full image URI, falling back to a local asset
            const raw = p.image;
            const uri = raw
              ? raw.startsWith('http')
                ? raw
                : `${base}${raw}`
              : undefined;

            return {
              ...p,
              id: p._id,
              image: uri
                ? { uri }
                : require('../assets/images/pc1.png'),
              discount:
                p.originalPrice && p.price < p.originalPrice
                  ? Math.round(100 - (p.price / p.originalPrice) * 100)
                  : 0,
              isHot: (p.sold || 0) > 50,
              isBestSeller: p.isBestSeller ?? false,
              price: (p.price ?? 0).toLocaleString('vi-VN') + ' đ',
              originalPrice: p.originalPrice
                ? p.originalPrice.toLocaleString('vi-VN') + ' đ'
                : undefined,
            };
          });

          setProducts(mapped);
          cacheImages(mapped.map((p) => p.image?.uri || p.image));
          setBestSellers(mapped.filter(p => p.isBestSeller));
          // Lọc flash sale: chỉ những sản phẩm có discount > 0
          setFlashSaleProducts(mapped.filter(p => p.discount > 0));
        })
        .catch(() => {
          setProducts([]);
          setBestSellers([]);
          setFlashSaleProducts([]);
        });

      // Gọi lại API danh mục
      Promise.all([
        axiosInstance.get("/category"),
        axiosInstance.get("/images"),
      ])
        .then(([catRes, imgRes]) => {
          const images = imgRes.data;
          setCategories(
            catRes.data.map((cat) => {
              const img = images.find(
                (i) => i.category_id && i.category_id._id === cat._id
              );
              return {
                key: cat.name,
                label: cat.name,
                icon: img
                  ? { uri: img.url }
                  : require("../assets/images/pc.png"),
              };
            })
          );
        })
        .catch(() => setCategories([]));
    }, [])
  );

  // Kiểm tra đăng nhập mỗi lần vào HomeScreen
  useFocusEffect(
    React.useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token);
      };
      checkLogin();
    }, [])
  );

  // Hàm xử lý khi bấm vào các chức năng cần đăng nhập
  const requireLogin = () => {
    router.push("/LoginScreen");
  };

  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={{ flex: 1, justifyContent: "flex-start" }}
      imageStyle={{ opacity: 0.92 }}
    >
      

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Header
            router={router}
            notificationCount={3}
            avatarUri={avatarUri}
            userName={userName} // 🟢 Truyền vào đây
          />

          <View
            style={{ paddingHorizontal: 18, marginTop: 14, marginBottom: 14 }}
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

          {/* Banner đầu */}
          <Banner
            onPress={() => router.push("./DanhMucPC")}
            source={require("../assets/images/pcbanner.jpg")}
            title="Khuyến mãi PC cực sốc"
            subtitle="Giảm giá lên đến 30% cho các dòng PC mới nhất!"
            badge="HOT"
            overlayType="gradient"
          />

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
          <BestSellerList
            bestSellers={bestSellers}
            renderDiscountBadge={renderDiscountBadge}
            renderHotBadge={renderHotBadge}
            renderBestSellerBadge={renderBestSellerBadge}
            isLoggedIn={isLoggedIn}
            onRequireLogin={requireLogin}
            router={router}
          />
          {/* Banner giữa */}
          <Banner source={require("../assets/images/ctgr2.jpg")} />

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
      </View>
    </ImageBackground>
  );
}

// Bạn có thể giữ lại styles này cho các badge và header, các component con đã có style riêng.
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
