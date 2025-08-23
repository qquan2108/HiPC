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
  const [variantSelections, setVariantSelections] = useState({});


  // 🆕 Khi bấm icon giỏ hàng
  const handleAddToCart = async (product) => {
  if (product.variants && product.variants.length > 0) {
    setSelectedProduct(product);
    // Khởi tạo lựa chọn mặc định cho từng nhóm
    const defaults = {};
    product.variants.forEach(group => {
      if (group.options && group.options.length > 0) {
        defaults[group.key] = group.options[0];
      }
    });
    setVariantSelections(defaults);
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
      await axiosInstance.post('/cartt/add-to-cart', { user_id: userId, productId: product.id, quantity: 1 });
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng!', position: 'bottom' });
    } catch {
      Toast.show({ type: 'error', text1: 'Thêm giỏ hàng thất bại!', position: 'top' });
    }
  };

  // 🆕 Xử lý xác nhận trong dialog
  const handleConfirmOption = async () => {
    // Kiểm tra đã chọn đủ biến thể
    const groups = selectedProduct.variants || [];
    for (const group of groups) {
      if (!variantSelections[group.key]) {
        Toast.show({ type: 'info', text1: `Vui lòng chọn ${group.key}!` });
        return;
      }
    }

    let variantPayload;
    if (groups.length === 1) {
      const group = groups[0];
      const selected = variantSelections[group.key];
      variantPayload = {
        key: group.key,
        label: selected.label,
        priceDiff: selected.priceDiff || 0
      };
    } else {
      const keys = Object.keys(variantSelections);
      const labels = keys.map(k => variantSelections[k]?.label).filter(Boolean);
      const priceDiffSum = keys.reduce((sum, k) => sum + (variantSelections[k]?.priceDiff || 0), 0);

      variantPayload = {
        key: keys.join(' + '),
        label: labels.join(' + '),
        priceDiff: priceDiffSum
      };
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
        variant: variantPayload
      });
      setShowOptionDialog(false);
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng!', position: 'bottom' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Thêm giỏ hàng thất bại!', position: 'top' });
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

  const getPriceRange = (product) => {
    const basePrice = Number(product.price) || 0;
    if (!product.variants || !product.variants[0]?.options) {
      return { min: basePrice, max: basePrice };
    }

    const options = product.variants[0].options;
    const prices = options.map(option => basePrice + (option.priceDiff || 0));
    return {
      min: Math.min(basePrice, ...prices),
      max: Math.max(basePrice, ...prices)
    };
  };

  const formatPriceRange = (product) => {
  const basePrice = Number(product.price);
  // 1. Nếu không có giá gốc (null/undefined/"0"/NaN) → Liên hệ
  if (!product.price || isNaN(basePrice) || basePrice === 0) {
    return 'Liên hệ';
  }

  const { min, max } = getPriceRange(product);

  // 2. Nếu tất cả variants cùng giá gốc
  if (min === max) {
    return formatPrice(min);
  }

  // 3. Nếu min lẻ (bằng 0) nhưng max >0, chỉ show max
  if (min === 0 && max > 0) {
    return formatPrice(max);
  }

  // 4. Bình thường: "min – max"
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

  const getRandomVoucher = () => {
    const vouchers = [
      { text: "GIẢM 20%", color: "#ff6b6b" },
      { text: "VOUCHER 30%", color: "#00d4aa" },
      { text: "SALE 25%", color: "#667eea" },
      { text: "KHUYẾN MÃI 15%", color: "#ff9f43" },
      { text: "GIẢM 35%", color: "#e74c3c" }
    ];
    return vouchers[Math.floor(Math.random() * vouchers.length)];
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
  {products.concat(products).map((product, idx) => {
    // Khởi tạo voucher ngẫu nhiên cho mỗi product
    const voucher = getRandomVoucher();

    return (
      <TouchableOpacity
        key={`${product.id}-${idx}`}
        style={styles.card}
        onPress={() => router.push({ pathname: './ctsp', params: { id: product.id } })}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          {/* --- Enhanced Image Section --- */}
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={product.image}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.05)']}
                style={styles.imageOverlay}
              />
            </View>

            {/* Badges cũ */}
            <View style={styles.badgeWrapper}>
              {product.isNew && (renderNewBadge ? renderNewBadge() : defaultNewBadge())}
              {product.discount > 0 && (renderDiscountBadge ? renderDiscountBadge(product.discount) : defaultDiscountBadge(product.discount))}
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starWrapper}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
                </Text>
              </View>
            </View>

            {/* Wishlist */}
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={() =>
                wishlist.some(p => p._id === product._id)
                  ? removeFromWishlist(product._id)
                  : addToWishlist(product)
              }
            >
              <AntDesign
                name={wishlist.some(p => p._id === product._id) ? "heart" : "hearto"}
                size={16}
                color="#ff4d4f"
              />
            </TouchableOpacity>
          </View>

          {/* --- Enhanced Product Info --- */}
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

            {/* 🆕 Khoảng giá */}
             <View style={styles.priceSection}>
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}₫
          </Text>
          {/* Nếu có giá gốc và khác giá bán, hiển thị giá gốc gạch ngang */}
          {product.originalPrice && product.originalPrice !== product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}₫
            </Text>
          )}
        </View>

            {/* 🆕 Voucher Badge */}
            <LinearGradient
              colors={[voucher.color, voucher.color]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.voucherBadge}
            >
              <MaterialIcons name="local-offer" size={12} color="#fff" />
              <Text style={styles.voucherText}>{voucher.text}</Text>
            </LinearGradient>

            {/* Action Icons */}
            <View style={styles.actionIcons}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', marginLeft: 3 }}>
                  {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
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
    );
  })}
      </View>

      {/* 🆕 Dialog chọn option và số lượng */}
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
                    <Text style={styles.modalProductPrice}>{formatPrice(selectedProduct.price)}₫</Text>
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

                {selectedProduct?.variants?.map(group => (
  <View key={group.key} style={{ marginBottom: 12 }}>
    <Text style={styles.sectionLabel}>Chọn {group.key}:</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
      {group.options.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => setVariantSelections(prev => ({
            ...prev,
            [group.key]: option
          }))}
          style={[
            styles.optionButton,
            variantSelections[group.key] === option && styles.optionButtonSelected
          ]}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.optionText,
            variantSelections[group.key] === option && styles.optionTextSelected
          ]}>
            {option.label || option}
          </Text>
          {option.priceDiff ? (
            <Text style={[
              styles.priceDiffText,
              variantSelections[group.key] === option && styles.priceDiffTextSelected
            ]}>
              +{option.priceDiff.toLocaleString('vi-VN')}₫
            </Text>
          ) : null}
          {variantSelections[group.key] === option && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
))}

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
  voucherBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginBottom: 8,
},
voucherText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '700',
  marginLeft: 4,
},
});