import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import { useWishlist } from "../context/WishlistContext";
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get("window");

export default function ForYouGrid({
  products,
  renderNewBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  // Default badge components nếu không được provide
  const defaultNewBadge = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.newBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="flash" size={10} color="#fff" />
      <Text style={styles.badgeText}>MỚI</Text>
    </LinearGradient>
  );

  const defaultDiscountBadge = (discount) => (
    <LinearGradient
      colors={['#ff6b6b', '#ee5a24']}
      style={styles.discountBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-fire-department" size={10} color="#fff" />
      <Text style={styles.badgeText}>-{discount}%</Text>
    </LinearGradient>
  );

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // 🆕 State cho dialog chọn option và số lượng
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
 

  // 🆕 Khi bấm icon giỏ hàng
  const handleAddToCart = async (product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setSelectedOption(null);
      setQuantity(1);
      setShowOptionDialog(true);
      return;
    }

    if (!isLoggedIn) return onRequireLogin();
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', { user_id: userId, productId: product.id, quantity: 1 });
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
    } catch {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
    }
  };

  // 🆕 Xử lý xác nhận trong dialog
  const handleConfirmOption = async () => {
    if (!selectedOption) {
      Toast.show({ type: 'info', text1: 'Vui lòng chọn phiên bản/cấu hình!' });
      return;
    }

    const maxStock =
      (selectedOption && selectedOption.stock) ||
      (selectedProduct && selectedProduct.stock) ||
      99;

    if (quantity > maxStock) {
      Toast.show({
        type: "error",
        text1: "Số lượng vượt quá kho",
        text2: `Sản phẩm này chỉ còn ${maxStock} trong kho`,
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    if (!isLoggedIn) return onRequireLogin();
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
        setShowOptionDialog(false);
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', {
        user_id: userId,
        productId: selectedProduct.id || selectedProduct._id,
        quantity,
        variant: selectedOption
          ? {
              key: selectedOption.key || selectedOption.value || selectedOption.label,
              label: selectedOption.label || selectedOption.value || selectedOption.key,
              priceDiff: selectedOption.priceDiff || 0
            }
          : undefined,
      });
      setShowOptionDialog(false);
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
    } catch (err) {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
      console.error('add-to-cart error:', err?.response?.data || err);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    
    // Nếu price đã là string có định dạng sẵn, trả về luôn
    if (typeof price === 'string' && (price.includes('.') || price.includes('đ') || price.includes(','))) {
      return price.replace('đ', ''); // Loại bỏ đ nếu có
    }
    
    // Convert sang number và format
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice === 0) return 'Liên hệ';
    
    return new Intl.NumberFormat('vi-VN').format(numPrice);
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header với gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.sectionRow}>
            <View style={styles.titleContainer}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name="computer" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>
                  Linh Kiện Máy Tính
                  <Text style={styles.titleAccent}> Pro</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>Hiệu suất cao - Giá tốt</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/danhmucall')}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Enhanced Product Grid */}
      <View style={styles.forYouGrid}>
        {products.concat(products).map((product, idx) => (
          <TouchableOpacity
            key={product.id + idx}
            style={styles.card}
            onPress={() => router.push({ pathname: './ctsp', params: { id: product.id } })}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              {/* Enhanced Image Section */}
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <Image 
                    source={product.image} 
                    style={styles.image} 
                    resizeMode="cover"
                  />
                  
                  {/* Image overlay for better visual */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.05)']}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Enhanced Badges */}
                <View style={styles.badgeWrapper}>
                  {product.isNew && (renderNewBadge ? renderNewBadge() : defaultNewBadge())}
                  {product.discount > 0 && (renderDiscountBadge ? renderDiscountBadge(product.discount) : defaultDiscountBadge(product.discount))}
                </View>

                {/* Enhanced Rating Star */}
                <View style={styles.ratingContainer}>
                  <View style={styles.starWrapper}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>

                {/* Wishlist Icon */}
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={() =>
                    wishlist.some((p) => p._id === product._id)
                      ? removeFromWishlist(product._id)
                      : addToWishlist(product)
                  }
                >
                  <AntDesign
                    name={wishlist.some((p) => p._id === product._id) ? "heart" : "hearto"}
                    size={16}
                    color="#ff4d4f"
                  />
                </TouchableOpacity>
              </View>

              {/* Enhanced Product Info */}
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>
                
                <Text numberOfLines={1} style={styles.productDesc}>
                  {product.shortDesc || "Hiệu suất mạnh, công nghệ cao"}
                </Text>

                {/* Feature Tags */}
                <View style={styles.featureTags}>
                  <View style={styles.featureTag}>
                    <MaterialIcons name="verified" size={8} color="#00d4aa" />
                    <Text style={styles.featureText}>CHÍNH HÃNG</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <MaterialIcons name="local-shipping" size={8} color="#667eea" />
                    <Text style={styles.featureText}>FREESHIP</Text>
                  </View>
                </View>

                {/* Enhanced Price Section */}
                <View style={styles.priceSection}>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}₫</Text>
                  {product.originalPrice && product.originalPrice !== product.price && (
                    <View style={styles.originalPriceContainer}>
                      <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}₫</Text>
                    </View>
                  )}
                </View>
                
                {product.originalPrice && product.originalPrice !== product.price && Number(product.originalPrice) > Number(product.price) && (
                  <Text style={styles.savingsText}>
                    Tiết kiệm {formatPrice(Number(product.originalPrice) - Number(product.price))}₫
                  </Text>
                )}

                {/* Enhanced Action Icons */}
                <View style={styles.actionIcons}>
                  {/* Thay thế icon share bằng rating */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', marginLeft: 3 }}>
                      {product.rating || '4.8'}
                    </Text>
                  </View>
                  
                  <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(product)}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="cart-outline" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🆕 Dialog chọn option và số lượng */}
      <Modal
        visible={showOptionDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionDialog(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 22,
            width: '88%',
            maxWidth: 370,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#222', letterSpacing: 0.2 }}>
              Chọn phiên bản & số lượng
            </Text>
            {selectedProduct && (
              <>
                <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 12, color: '#444' }}>
                  {selectedProduct.name}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                  {selectedProduct.variants[0]?.options?.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedOption(option)}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 14,
                        backgroundColor: selectedOption === option ? '#667eea' : '#f3f4f6',
                        marginRight: 10,
                        borderWidth: selectedOption === option ? 2 : 1,
                        borderColor: selectedOption === option ? '#667eea' : '#e0e7ef',
                        flexDirection: 'row',
                        alignItems: 'center',
                        minWidth: 64,
                        position: 'relative',
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={{
                        color: selectedOption === option ? '#fff' : '#333',
                        fontWeight: selectedOption === option ? 'bold' : '500',
                        fontSize: 15,
                      }}>
                        {option.label || option}
                      </Text>
                      {option.priceDiff ? (
                        <Text style={{
                          color: selectedOption === option ? '#fff' : '#888',
                          fontSize: 12,
                          marginLeft: 6,
                          fontWeight: '600'
                        }}>
                          +{option.priceDiff.toLocaleString('vi-VN')}₫
                        </Text>
                      ) : null}
                      {selectedOption === option && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#fff"
                          style={{ marginLeft: 6, position: 'absolute', top: -10, right: -10, backgroundColor: '#667eea', borderRadius: 9 }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontWeight: '600', marginRight: 14, fontSize: 15, color: '#333' }}>Số lượng:</Text>
                  <TouchableOpacity
                    onPress={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: quantity <= 1 ? '#e5e7eb' : '#f3f4f6',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: '#e0e7ef'
                    }}
                  >
                    <Ionicons name="remove" size={20} color={quantity <= 1 ? "#bbb" : "#667eea"} />
                  </TouchableOpacity>
                  <TextInput
                    style={{
                      width: 48, height: 36, borderRadius: 8,
                      borderWidth: 1, borderColor: '#e0e7ef',
                      marginHorizontal: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 16
                    }}
                    keyboardType="numeric"
                    value={quantity.toString()}
                    onChangeText={txt => {
                      const val = parseInt(txt.replace(/[^0-9]/g, '')) || 1;
                      setQuantity(val);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setQuantity(q => q + 1)}
                    style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: '#e0e7ef'
                    }}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setShowOptionDialog(false)}
                    style={{
                      paddingVertical: 10, paddingHorizontal: 22,
                      borderRadius: 10, backgroundColor: '#e0e7ef', marginRight: 10
                    }}
                  >
                    <Text style={{ color: '#333', fontWeight: '700', fontSize: 15 }}>Huỷ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmOption}
                    style={{
                      paddingVertical: 10, paddingHorizontal: 22,
                      borderRadius: 10, backgroundColor: '#667eea'
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Thêm vào giỏ</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
  },

  // Enhanced Header Styles
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerGradient: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 10,
    marginRight: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
    lineHeight: 20,
  },
  titleAccent: {
    fontWeight: "400",
    fontSize: 14,
  },
  sectionSubtitle: {
    fontWeight: "400",
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },

  // Enhanced Grid Styles
  forYouGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  // Enhanced Card Styles
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
  },

  // Enhanced Image Styles
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },

  // Enhanced Badge Styles
  badgeWrapper: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 4,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },

  // Enhanced Rating Styles
  ratingContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  starWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },

  // Enhanced Wishlist Button
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Enhanced Product Info Styles
  productInfo: {
    padding: 12,
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
    lineHeight: 16,
  },
  productDesc: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 14,
  },

  // Feature Tags
  featureTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102,126,234,0.08)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(102,126,234,0.2)',
  },
  featureText: {
    fontSize: 7,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 2,
  },

  // Enhanced Price Styles
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  productPrice: {
    color: "#e53e3e",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 6,
  },
  originalPriceContainer: {
    position: 'relative',
  },
  originalPrice: {
    fontSize: 11,
    color: "#a0aec0",
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 9,
    color: "#00d4aa",
    fontWeight: '600',
    marginBottom: 8,
  },

  // Enhanced Action Styles
  actionIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  heartButton: {
    borderRadius: 10,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButton: {
    borderRadius: 10,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconGradient: {
    padding: 8,
    borderRadius: 10,
  },
});