import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from "react-native";
import Toast from 'react-native-toast-message';
import { useWishlist } from "../context/WishlistContext";
import axiosInstance from "../utils/AxiosInstance";

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.45;

export default function NewProducts({
  products,
  renderNewBadge,
  renderHotBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Enhanced default badge components
  const defaultNewBadge = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.defaultNewBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="flash" size={10} color="#fff" />
      <Text style={styles.defaultBadgeText}>MỚI</Text>
    </LinearGradient>
  );

  const defaultHotBadge = () => (
    <LinearGradient
      colors={['#ff6b6b', '#ee5a24']}
      style={styles.defaultHotBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-fire-department" size={10} color="#fff" />
      <Text style={styles.defaultBadgeText}>HOT</Text>
    </LinearGradient>
  );

  const defaultDiscountBadge = (discount) => (
    <LinearGradient
      colors={['#f093fb', '#f5576c']}
      style={styles.defaultDiscountBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-offer" size={10} color="#fff" />
      <Text style={styles.defaultBadgeText}>-{discount}%</Text>
    </LinearGradient>
  );

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
        Toast.show({ type: 'error', text1: 'Vui lòng đăng nhập để mua hàng!', position: 'top' });
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', {
        user_id: userId,
        productId: product.id || product._id,           // use the function arg here
        quantity,
      });

      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng!', position: 'bottom' });
    } catch {
      Toast.show({ type: 'error', text1: 'Thêm giỏ hàng thất bại!', position: 'top' });
    }
  };
  const handleConfirmOption = async () => {
    if (!selectedOption) {
      Toast.show({ type: 'info', text1: 'Vui lòng chọn phiên bản/cấu hình!' });
      return;
    }

    if (!isLoggedIn) return onRequireLogin();
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type: 'error', text1: 'Vui lòng đăng nhập để mua hàng!', position: 'top' });
        setShowOptionDialog(false);
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', {
        user_id: userId,
        productId: selectedProduct.id || selectedProduct._id,
        quantity,
        variant: {
          key: selectedOption.key || selectedOption.value || selectedOption.label,
          label: selectedOption.label || selectedOption.value || selectedOption.key,
          priceDiff: selectedOption.priceDiff || 0
        }
      });
      setShowOptionDialog(false);
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng!', position: 'bottom' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Thêm giỏ hàng thất bại!', position: 'top' });
      console.error('add-to-cart error:', err);
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
      {/* Enhanced Header */}
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
                <MaterialIcons name="new-releases" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Sản Phẩm Mới</Text>
                <Text style={styles.sectionSubtitle}>Xu hướng 2025</Text>
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

      {/* Product Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
      >
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productCard, {
              marginLeft: index === 0 ? 16 : 6,
              marginRight: index === products.length - 1 ? 16 : 6
            }]}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: './ctsp', params: { id: product.id } })}
          >
            <View style={styles.cardContent}>
              {/* Image Section */}
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={product.image}
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  {/* Image overlay for better text visibility */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)']}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Badges positioned over image */}
                <View style={styles.badgeContainer}>
                  {product.isNew && (
                    renderNewBadge ? renderNewBadge() : defaultNewBadge()
                  )}

                  {product.discount > 0 && (
                    renderDiscountBadge ? renderDiscountBadge(product.discount) : defaultDiscountBadge(product.discount)
                  )}

                  {product.isHot && (
                    renderHotBadge ? renderHotBadge() : defaultHotBadge()
                  )}
                </View>

                {/* Star Rating */}
                <View style={styles.ratingContainer}>
                  <View style={styles.starWrapper}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                </View>

                {/* Wishlist Button */}
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

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>

                <Text numberOfLines={1} style={styles.shortDesc}>
                  {product.shortDesc || "Hiệu suất tối ưu, giá hợp lý"}
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

                {/* Price Section */}
                <View style={styles.priceSection}>
                  <Text style={styles.currentPrice}>
                    {formatPrice(product.price)}₫
                  </Text>
                  {product.originalPrice && product.originalPrice !== product.price && (
                    <View style={styles.originalPriceContainer}>
                      <Text style={styles.originalPrice}>
                        {formatPrice(product.originalPrice)}₫
                      </Text>
                    </View>
                  )}
                </View>

                {product.originalPrice && product.originalPrice !== product.price && Number(product.originalPrice) > Number(product.price) && (
                  <Text style={styles.savingsText}>
                    Tiết kiệm {formatPrice(Number(product.originalPrice) - Number(product.price))}₫
                  </Text>
                )}

                {/* Add to Cart Button */}
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="cart-outline" size={14} color="#fff" />
                    <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
      {/* 🆕 Dialog chọn option và số lượng */}
      {/* Enhanced Modal chọn phiên bản & số lượng */}
      <Modal
        visible={showOptionDialog}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phiên bản & số lượng</Text>
              <TouchableOpacity
                onPress={() => setShowOptionDialog(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.productPreview}>
                  <Image source={selectedProduct.image} style={styles.modalProductImage} />
                  <View style={styles.productDetails}>
                    <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                    <Text style={styles.modalProductPrice}>{selectedProduct.price}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Chọn phiên bản:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                  {selectedProduct.variants[0]?.options?.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedOption(option)}
                      style={[
                        styles.optionButton,
                        selectedOption === option && styles.optionButtonSelected
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedOption === option && styles.optionTextSelected
                      ]}>
                        {option.label || option}
                      </Text>
                      {option.priceDiff ? (
                        <Text style={[
                          styles.priceDiffText,
                          selectedOption === option && styles.priceDiffTextSelected
                        ]}>
                          +{option.priceDiff.toLocaleString('vi-VN')}₫
                        </Text>
                      ) : null}
                      {selectedOption === option && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Số lượng:</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  >
                    <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#667eea"} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity.toString()}
                    onChangeText={txt => {
                      const val = parseInt(txt.replace(/[^0-9]/g, '')) || 1;
                      setQuantity(val);
                    }}
                    textAlign="center"
                  />
                  <TouchableOpacity
                    onPress={() => setQuantity(q => q + 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setShowOptionDialog(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Huỷ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmOption}
                    style={styles.confirmButton}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.confirmButtonGradient}
                    >
                      <Text style={styles.confirmButtonText}>Thêm vào giỏ</Text>
                    </LinearGradient>
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
  linkText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  scrollContainer: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  productCard: {
    width: CARD_WIDTH,
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
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 4,
  },
  defaultNewBadge: {
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
  defaultHotBadge: {
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
  defaultDiscountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
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
  shortDesc: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 14,
  },
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
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  currentPrice: {
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
  addToCartButton: {
    marginTop: 4,
    borderRadius: 10,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#222',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPreview: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalProductImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'contain',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  modalProductName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  modalProductPrice: {
    color: '#667eea',
    fontWeight: '800',
    fontSize: 18,
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    position: 'relative',
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  priceDiffText: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  priceDiffTextSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e7ef',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    marginHorizontal: 16,
    fontWeight: '700',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});