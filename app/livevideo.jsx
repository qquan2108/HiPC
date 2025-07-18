// ✅ Enhanced VideoFeed screen with beautiful combo section
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";

const { height, width } = Dimensions.get("window");

export default function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [comboModalVisible, setComboModalVisible] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Animate combo section entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/api/videos");
      if (response.data && Array.isArray(response.data)) {
        setVideos(
          response.data.map((video) => ({
            ...video,
            ref: React.createRef(),
            likes: video.likes || 0,
            comments: video.comments || 0,
            shares: video.shares || 0,
            videoUrl: video.videoUrl.startsWith("http")
              ? video.videoUrl
              : `${axiosInstance.defaults.baseURL}${video.videoUrl}`,
          }))
        );
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi khi tải video:", err);
      setError("Không thể tải video. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
  const checkUserId = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    console.log("📦 Đang có user_id trong AsyncStorage:", userId);
  };
  checkUserId();
}, []);

  const viewConfig = { viewAreaCoveragePercentThreshold: 80 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const postComment = () => {
    if (newComment.trim()) {
      setCurrentComments((prev) => [...prev, newComment.trim()]);
      setNewComment("");
    }
  };

const handleAddToCart = async (comboId) => {
  if (!comboId) {
    console.warn("comboId không hợp lệ:", comboId);
    return Alert.alert("Lỗi", "Combo không hợp lệ");
  }

  try {
    const userId = await AsyncStorage.getItem("user_id");
    console.log("✅ user_id lấy từ AsyncStorage:", userId);
    if (!userId) {
      console.warn("Chưa đăng nhập hoặc thiếu user_id");
      return Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm vào giỏ hàng");
    }

    const res = await axiosInstance.post("/admin/api/cart", {
      user_id: userId,
      comboId: comboId,
    });

    Alert.alert("Thành công", "Combo đã được thêm vào giỏ hàng");
  } catch (err) {
    console.error("Lỗi khi thêm combo:", err.response?.data || err.message);
    Alert.alert("Lỗi", err.response?.data?.message || "Không thể thêm combo vào giỏ hàng");
  }
};


  const handleComboPress = (combo) => {
    setSelectedCombo(combo);
    setComboModalVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.page}>
      {!item.videoUrl ? (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam-off" size={50} color="#fff" />
          <Text style={styles.placeholderText}>Không có video</Text>
        </View>
      ) : (
        <Video
          ref={item.ref}
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={index === activeIndex}
          volume={index === activeIndex ? 1.0 : 0.0}
        />
      )}

      <View style={styles.bottomLeft}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person-circle" size={36} color="#fff" />
          </View>
          <Text style={styles.user}>{item.user || "Người dùng"}</Text>
        </View>
        <Text style={styles.description}>{item.description || "Không có mô tả"}</Text>
        <Text style={styles.song}>Nhạc nền</Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome name="heart" size={30} color="#fff" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setCurrentComments([]); setModalVisible(true); }}>
          <FontAwesome name="commenting" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Entypo name="share" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>

      {/* 🆕 Enhanced Combo Section */}
      {item.comboIds && item.comboIds.length > 0 && (
        <EnhancedComboSection
          comboList={item.comboIds}
          onAddToCart={handleAddToCart}
          onSelectCombo={handleComboPress}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />
      )}

      {/* Comments Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.commentBox}>
            <Text style={styles.modalTitle}>Bình luận</Text>
            <FlatList
              data={currentComments}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Text style={styles.commentItem}>• {item}</Text>
              )}
              ListEmptyComponent={<Text>Chưa có bình luận nào.</Text>}
              style={{ flex: 1, width: "100%" }}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Viết bình luận..."
                placeholderTextColor="#888"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={postComment} style={styles.sendBtn}>
                <Text style={styles.sendText}>Gửi</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Combo Detail Modal */}
      <Modal visible={comboModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.comboDetailModal}>
            {selectedCombo && (
              <ComboDetailView
                combo={selectedCombo}
                onClose={() => setComboModalVisible(false)}
                onAddToCart={handleAddToCart}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.loadingContainer} size="large" color="#0000ff" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      pagingEnabled
      snapToInterval={height}
      viewabilityConfig={viewConfig}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

function EnhancedComboSection({ comboList, onAddToCart, onSelectCombo, fadeAnim, slideAnim }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / 166);
    setCurrentIndex(index);
  };

  return (
    <Animated.View 
      style={[
        styles.comboSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)']}
        style={styles.gradientBackground}
      >
        <View style={styles.comboHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.liveContainer}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>Hot combo </Text>
            </View>
            <Text style={styles.comboTitle}>🛍️ Sản phẩm hot</Text>
          </View>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          horizontal
          data={comboList}
          keyExtractor={(combo) => combo._id}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={166}
          decelerationRate="fast"
          renderItem={({ item: combo, index }) => (
            <ComboCard
              combo={combo}
              onPress={() => onSelectCombo(combo)}
              onAddToCart={onAddToCart}
              index={index}
              currentIndex={currentIndex}
            />
          )}
          contentContainerStyle={styles.comboListContainer}
        />

        <View style={styles.pagination}>
          {comboList.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: index === currentIndex ? '#FF6B6B' : 'rgba(255,255,255,0.3)' },
              ]}
            />
          ))}
        </View>

        <View style={styles.shoppingFooter}>
          <Text style={styles.footerText}>💰 Giá đặc biệt chỉ có trong Live</Text>
          <Text style={styles.footerSubtext}>⏰ Ưu đãi có hạn</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function ComboCard({ combo, onPress, onAddToCart, index, currentIndex }) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: index === currentIndex ? 1 : 0.95,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, index]);

  const discountPercent = Math.floor(Math.random() * 30) + 10; // Random discount 10-40%
  const originalPrice = combo.price * (1 + discountPercent / 100);

  return (
    <Animated.View style={[styles.comboCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: combo.productIds?.[0]?.image || 'https://via.placeholder.com/150x150?text=No+Image' 
            }}
            style={styles.comboImage}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>🔥 HOT</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.comboName} numberOfLines={2}>{combo.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
            <Text style={styles.currentPrice}>{formatPrice(combo.price)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={10} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.soldText}>({Math.floor(Math.random() * 500) + 100} đã bán)</Text>
          </View>

          <View style={styles.productPreview}>
            <Text style={styles.previewTitle}>Gồm {combo.productIds?.length || 0} sản phẩm:</Text>
            <View style={styles.miniProducts}>
              {combo.productIds?.slice(0, 3).map((product, idx) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.miniProduct}
                  onPress={() => router.push({ pathname: '/ctsp', params: { id: product._id } })}
                >
                  <Image
                    source={{ uri: product.image || 'https://via.placeholder.com/30x30' }}
                    style={styles.miniProductImage}
                  />
                </TouchableOpacity>
              ))}
              {combo.productIds?.length > 3 && (
                <View style={styles.moreIndicator}>
                  <Text style={styles.moreText}>+{combo.productIds.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart(combo._id);
          }}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.gradientButton}
          >
            <Ionicons name="cart" size={16} color="#fff" />
            <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ComboDetailView({ combo, onClose, onAddToCart }) {
  const router = useRouter();
  const discountPercent = Math.floor(Math.random() * 30) + 10;
  const originalPrice = combo.price * (1 + discountPercent / 100);

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Chi tiết combo</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detailContent}>
        <View style={styles.detailImageContainer}>
          <Image
            source={{ 
              uri: combo.productIds?.[0]?.image || 'https://via.placeholder.com/300x200?text=No+Image' 
            }}
            style={styles.detailImage}
          />
          <View style={styles.detailDiscountBadge}>
            <Text style={styles.detailDiscountText}>Giảm {discountPercent}%</Text>
          </View>
        </View>

        <View style={styles.detailInfo}>
          <Text style={styles.detailName}>{combo.name}</Text>
          
          <View style={styles.detailPriceRow}>
            <Text style={styles.detailOriginalPrice}>{formatPrice(originalPrice)}</Text>
            <Text style={styles.detailCurrentPrice}>{formatPrice(combo.price)}</Text>
            <Text style={styles.detailSaving}>Tiết kiệm {formatPrice(originalPrice - combo.price)}</Text>
          </View>

          <View style={styles.detailRating}>
            <View style={styles.detailStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.detailRatingText}>4.9 (1,234 đánh giá)</Text>
          </View>

          <Text style={styles.productsHeader}>Sản phẩm trong combo:</Text>
          {combo.productIds?.map((product, index) => (
            <TouchableOpacity
              key={product._id}
              style={styles.productDetailItem}
              onPress={() => router.push({ pathname: '/ctsp', params: { id: product._id } })}
            >
              <Image
                source={{ uri: product.image || 'https://via.placeholder.com/60x60' }}
                style={styles.productDetailImage}
              />
              <View style={styles.productDetailInfo}>
                <Text style={styles.productDetailName}>{product.name}</Text>
                <Text style={styles.productDetailPrice}>{formatPrice(product.price)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.detailFooter}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalPrice}>{formatPrice(combo.price)}</Text>
        </View>
        <TouchableOpacity
          style={styles.detailAddToCartBtn}
          onPress={() => {
            onAddToCart(combo._id);
            onClose();
          }}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.detailGradientButton}
          >
            <Text style={styles.detailAddToCartText}>Thêm vào giỏ hàng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width, height, backgroundColor: "#000" },
  video: { position: "absolute", width, height },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },

  // Bottom left overlay styles
  bottomLeft: {
    position: "absolute",
    bottom: 180, // Increased to make room for combo section
    left: 16,
    right: 100,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatarWrapper: { marginRight: 8 },
  user: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  description: { color: "#fff", fontSize: 14, marginBottom: 8 },
  song: { color: "#fff", fontSize: 14 },

  // Right action buttons
  rightActions: {
    position: "absolute",
    right: 16,
    bottom: 200, // Adjusted for combo section
    alignItems: "center",
  },
  actionBtn: {
    alignItems: "center",
    marginBottom: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  actionText: { color: "#fff", fontSize: 12, marginTop: 4 },

  // Enhanced Combo Section
  comboSection: {
    position: "absolute",
    bottom: 20,
    left: 16,
    width: 360,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBackground: {
    padding: 16,
    borderRadius: 16,
  },
  comboHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,107,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B6B",
    marginRight: 4,
  },
  liveText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "bold",
  },
  comboTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginRight: 4,
  },

  // Combo Cards
  comboListContainer: {
    paddingHorizontal: 4,
  },
  comboCard: {
    width: 170,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 100,
  },
  comboImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  hotBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,107,107,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hotText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  cardInfo: {
    padding: 8,
  },
  comboName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stars: {
    flexDirection: "row",
    marginRight: 4,
  },
  ratingText: {
    fontSize: 10,
    color: "#666",
    marginRight: 4,
  },
  soldText: {
    fontSize: 9,
    color: "#999",
  },
  productPreview: {
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  miniProducts: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniProduct: {
    marginRight: 4,
  },
  miniProductImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  moreIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  addToCartBtn: {
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },

  // Footer
  shoppingFooter: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },
  footerSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    marginTop: 2,
  },

  // Comment modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  commentBox: {
    height: height * 0.5,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  commentItem: {
    paddingVertical: 8,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "600" },
  closeBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  closeText: {
    color: "#007AFF",
    fontSize: 16,
  },

  // Combo Detail Modal
  comboDetailModal: {
    height: height * 0.85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  detailContent: {
    flex: 1,
  },
  detailImageContainer: {
    position: "relative",
    height: 200,
  },
  detailImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  detailDiscountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailDiscountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailInfo: {
    padding: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailOriginalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 12,
  },
  detailCurrentPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 12,
  },
  detailSaving: {
    fontSize: 12,
    color: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailStars: {
    flexDirection: "row",
    marginRight: 8,
  },
  detailRatingText: {
    fontSize: 14,
    color: "#666",
  },
  productsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  productDetailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  productDetailInfo: {
    flex: 1,
  },
  productDetailName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  productDetailPrice: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  detailFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  detailAddToCartBtn: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailGradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  detailAddToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Video placeholder
  videoPlaceholder: {
    position: "absolute",
    width,
    height,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
});