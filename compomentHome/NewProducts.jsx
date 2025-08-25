import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AddToCartDialog from "../components/AddToCartDialog";
import { useWishlist } from "../context/WishlistContext";
import axiosInstance from "../utils/AxiosInstance";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.45;

export default function NewProducts({
  products = [], // Add default empty array
  renderNewBadge,
  renderHotBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  // Add validation check
  if (!Array.isArray(products)) {
    return null; // Or return a loading state/placeholder
  }

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantSelections, setVariantSelections] = useState({});
  const [qtyError, setQtyError] = useState(null);
  const [validatingQty, setValidatingQty] = useState(false);
  const qtyDebounceRef = useRef(null);

  const getUserId = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) return null;
    const u = JSON.parse(userStr);
    return u?._id || u?.id || null;
  };

  const getProductId = (p) => p?._id || p?.id;
  const getVariantId = (v) => v?._id || v?.id;

  const extractVariantOptions = (product) => {
    const v = product?.variants || [];
    if (!Array.isArray(v) || v.length === 0) return [];
    if (v[0]?.options && Array.isArray(v[0].options)) return v[0].options;
    return v;
  };

  const apiValidateQuantity = async (qty) => {
    if (!selectedProduct || !selectedVariant) return { ok: true };
    try {
      setValidatingQty(true);
      const userStr = await AsyncStorage.getItem("user");
      const userId = userStr ? JSON.parse(userStr)?._id : null;

      const payload = {
        user_id: userId,
        productId: getProductId(selectedProduct),
        variantId: getVariantId(selectedVariant),
        quantity: qty,
        checkOnly: true,
      };

      const res = await axiosInstance.post("/cartt/update-quantity", payload);
      const { allowed, max, quantity: serverQty, message } = res.data || {};

      if (allowed === false) {
        const limit = Number(max ?? selectedVariant?.stock ?? qty);
        setQtyError(message || `Tối đa ${limit} sản phẩm`);
        setQuantity((q) => Math.min(q, limit));
        return { ok: false, max: limit, serverQty };
      }

      setQtyError(null);
      return { ok: true, max, serverQty };
    } catch (e) {
      const limit = Number(selectedVariant?.stock ?? 99);
      if (qty > limit) {
        setQtyError(`Tối đa ${limit} sản phẩm`);
        setQuantity(limit);
        return { ok: false, max: limit, serverQty: limit };
      }
      setQtyError(null);
      return { ok: true, max: limit, serverQty: qty };
    } finally {
      setValidatingQty(false);
    }
  };

  const openOptionDialog = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedVariant(null);
    setVariantSelections({});

    const options = extractVariantOptions(product);
    const firstAvailable =
      options.find((o) => (o?.stock ?? 1) > 0) || options[0];
    if (firstAvailable) {
      setSelectedVariant(firstAvailable);
      const key = product?.variants?.[0]?.key;
      if (key) setVariantSelections({ [key]: firstAvailable });
    }

    setShowOptionDialog(true);
  };

  const handleVariantSelect = (option, key) => {
    setVariantSelections((prev) => ({ ...prev, [key]: option }));
    if (selectedProduct?.variants?.[0]?.key === key) {
      setSelectedVariant(option);
 const max = Math.max(1, Number(variantSelections[key]?.stock ?? selectedVariant?.stock ?? 99));      setQtyError(null);
      setQuantity((q) => {
        const next = Math.min(Math.max(1, q), max);
        apiValidateQuantity(next);
        return next;
      });
    }
  };

  // Enhanced default badge components
  const defaultNewBadge = () => (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
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
      colors={["#ff6b6b", "#ee5a24"]}
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
      colors={["#f093fb", "#f5576c"]}
      style={styles.defaultDiscountBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-offer" size={10} color="#fff" />
      <Text style={styles.defaultBadgeText}>-{discount}%</Text>
    </LinearGradient>
  );

  const handleAddToCart = async (product, event) => {
    event?.stopPropagation();

    if (!isLoggedIn) return onRequireLogin();
    if (product?.variants?.length > 0) {
      openOptionDialog(product);
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Vui lòng đăng nhập để mua hàng!",
          position: "top",
        });
        return router.push("/LoginScreen");
      }
      await axiosInstance.post("/cartt/add-to-cart", {
        user_id: userId,
        productId: getProductId(product),
        quantity: 1,
      });
      Toast.show({
        type: "success",
        text1: "Đã thêm vào giỏ hàng!",
        position: "bottom",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Thêm giỏ hàng thất bại!",
        position: "top",
      });
    }
  };
  const handleConfirmOption = async () => {
    if (!selectedProduct || !selectedVariant) {
      return Toast.show({
        type: "error",
        text1: "Vui lòng chọn biến thể sản phẩm",
        position: "top",
      });
    }

    try {
      const userId = await getUserId();
      if (!userId) {
        setShowDialog(false);
        Toast.show({
          type: "error",
          text1: "Vui lòng đăng nhập để mua hàng!",
          position: "top",
        });
        return router.push("/LoginScreen");
      }

      await axiosInstance.post("/cartt/add-to-cart", {
        user_id: userId,
        productId: selectedProduct._id,
        variantId: selectedVariant._id,
        quantity: quantity,
      });

      setShowDialog(false);
      Toast.show({
        type: "success",
        text1: "Đã thêm vào giỏ hàng!",
        position: "bottom",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Thêm giỏ hàng thất bại!",
        text2: err?.response?.data?.error || err.message,
        position: "top",
      });
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";

    // Nếu price đã là string có định dạng sẵn, trả về luôn
    if (
      typeof price === "string" &&
      (price.includes(".") || price.includes("đ") || price.includes(","))
    ) {
      return price.replace("đ", ""); // Loại bỏ đ nếu có
    }

    // Convert sang number và format
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice === 0) return "Liên hệ";

    return new Intl.NumberFormat("vi-VN").format(numPrice);
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
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
              onPress={() => router.push("/danhmucall")}
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
        {(products || []).map((product, index) => (
          <TouchableOpacity
            key={product._id || product.id}
            style={[
              styles.productCard,
              {
                marginLeft: index === 0 ? 16 : 6,
                marginRight: index === products.length - 1 ? 16 : 6,
              },
            ]}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "./ctsp",
                params: { id: product._id || product.id },
              })
            }
          >
            <View style={styles.cardContent}>
              {/* Image Section */}
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={
                      typeof product.image === "string"
                        ? { uri: product.image }
                        : product.image || require("../assets/images/pc1.png")
                    }
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  {/* Image overlay for better text visibility */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.1)"]}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Badges positioned over image */}
                <View style={styles.badgeContainer}>
                  {product.isNew &&
                    (renderNewBadge ? renderNewBadge() : defaultNewBadge())}

                  {product.discount > 0 &&
                    (renderDiscountBadge
                      ? renderDiscountBadge(product.discount)
                      : defaultDiscountBadge(product.discount))}

                  {product.isHot &&
                    (renderHotBadge ? renderHotBadge() : defaultHotBadge())}
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
                    name={
                      wishlist.some((p) => p._id === product._id)
                        ? "heart"
                        : "hearto"
                    }
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
                    <MaterialIcons
                      name="local-shipping"
                      size={8}
                      color="#667eea"
                    />
                    <Text style={styles.featureText}>FREESHIP</Text>
                  </View>
                </View>

                {/* Price Section */}
                <View style={styles.priceSection}>
                  <Text style={styles.currentPrice}>
                    {formatPrice(product.price)}₫
                  </Text>
                  {product.originalPrice &&
                    product.originalPrice !== product.price && (
                      <View style={styles.originalPriceContainer}>
                        <Text style={styles.originalPrice}>
                          {formatPrice(product.originalPrice)}₫
                        </Text>
                      </View>
                    )}
                </View>

                {product.originalPrice &&
                  product.originalPrice !== product.price &&
                  Number(product.originalPrice) > Number(product.price) && (
                    <Text style={styles.savingsText}>
                      Tiết kiệm{" "}
                      {formatPrice(
                        Number(product.originalPrice) - Number(product.price)
                      )}
                      ₫
                    </Text>
                  )}

                {/* Add to Cart Button */}
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
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
        onRequestClose={() => {
          setShowOptionDialog(false);
          setSelectedVariant(null);
          setVariantSelections({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phiên bản</Text>
              <TouchableOpacity onPress={() => setShowOptionDialog(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Product Preview */}
            <View style={styles.productPreview}>
              <Image
                source={
                  typeof selectedProduct?.image === "string"
                    ? { uri: selectedProduct.image }
                    : selectedProduct?.image || require("../assets/images/pc1.png")
                }
                style={styles.modalProductImage}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text style={styles.modalProductName} numberOfLines={2}>
                  {selectedProduct?.name}
                </Text>
                <Text style={styles.modalProductPrice}>
                  {formatPrice(selectedVariant?.price || selectedProduct?.price)}₫
                </Text>
                {selectedVariant && (
                  <Text style={styles.stockInfo}>
                    Còn {Number(selectedVariant?.stock ?? 0)} sản phẩm
                  </Text>
                )}
              </View>
            </View>

            {/* Variants List */}
            <Text style={styles.sectionLabel}>Phiên bản:</Text>
            <ScrollView style={styles.variantList}>
              {extractVariantOptions(selectedProduct).map((variant) => (
                <TouchableOpacity
                  key={variant._id}
                  style={[
                    styles.variantItem,
                    selectedVariant?._id === variant._id && styles.selectedVariant,
                    variant.stock <= 0 && styles.disabledVariant,
                  ]}
                  onPress={() => handleVariantSelect(variant)}
                  disabled={variant.stock <= 0}
                >
                  <View style={styles.variantInfo}>
                    <Text
                      style={[
                        styles.variantLabel,
                        selectedVariant?._id === variant._id && styles.selectedVariantText,
                      ]}
                    >
                      {variant.name}
                    </Text>
                    <Text
                      style={[
                        styles.variantStock,
                        selectedVariant?._id === variant._id && styles.selectedVariantText,
                      ]}
                    >
                      {variant.stock <= 0 ? "Hết hàng" : `Còn ${variant.stock} sản phẩm`}
                    </Text>
                  </View>
                  <View style={styles.variantPrice}>
                    <Text
                      style={[
                        styles.priceText,
                        selectedVariant?._id === variant._id && styles.selectedVariantText,
                      ]}
                    >
                      {formatPrice(variant.price)}₫
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quantity Section */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Số lượng:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => {
                    setQtyError(null);
                    setQuantity((q) => {
                      const next = Math.max(1, q - 1);
                      apiValidateQuantity(next);
                      return next;
                    });
                  }}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>

                <TextInput
                  value={String(quantity)}
                  onChangeText={(text) => {
                    const num = parseInt(text.replace(/[^0-9]/g, "")) || 1;
                    const max = selectedVariant?.stock ?? 99;
                    const next = Math.min(Math.max(1, num), max);
                    setQuantity(next);
                    setQtyError(null);
                    if (qtyDebounceRef.current) clearTimeout(qtyDebounceRef.current);
                    qtyDebounceRef.current = setTimeout(() => apiValidateQuantity(next), 300);
                  }}
                  keyboardType="number-pad"
                  style={[styles.quantityInput, qtyError && styles.inputError]}
                  maxLength={3}
                />

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= (selectedVariant?.stock ?? 99) && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => {
                    const max = selectedVariant?.stock ?? 99;
                    setQuantity((q) => {
                      const next = Math.min(max, q + 1);
                      setQtyError(null);
                      apiValidateQuantity(next);
                      return next;
                    });
                  }}
                  disabled={quantity >= (selectedVariant?.stock ?? 99)}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={quantity >= (selectedVariant?.stock ?? 99) ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedVariant || selectedVariant.stock <= 0) && styles.disabledButton,
              ]}
              onPress={handleConfirmOption}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF5252"]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Thêm vào giỏ hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddToCartDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        selectedProduct={selectedProduct}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={(qty) => {
          setQuantity(qty);
          apiValidateQuantity(qty);
        }}
        onVariantSelect={(variant) => {
          setSelectedVariant(variant);
          setQtyError(null);
        }}
        onConfirm={handleConfirmOption}
        qtyError={qtyError}
        formatCurrency={formatPrice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
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
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  imageWrapper: {
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f7fafc",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imageOverlay: {
    position: "absolute",
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
    flexWrap: "wrap",
    gap: 4,
  },
  defaultNewBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 2,
  },
  ratingContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  starWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
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
    fontWeight: "600",
    color: "#333",
    marginLeft: 2,
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
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
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
    lineHeight: 20,
  },
  shortDesc: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 14,
  },
  featureTags: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102,126,234,0.08)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(102,126,234,0.2)",
  },
  featureText: {
    fontSize: 7,
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 2,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2979ff",
  },
  originalPriceContainer: {
    position: "relative",
  },
  originalPrice: {
    fontSize: 11,
    color: "#a0aec0",
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  savingsText: {
    fontSize: 9,
    color: "#00d4aa",
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productPreview: {
    flexDirection: "row",
    backgroundColor: "#f7fafc",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginRight: 12,
  },
  productInfo: {
    padding: 12,
  },
  modalProductName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  modalProductPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2979ff",
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 13,
    color: "#718096",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  variantList: {
    maxHeight: 240,
  },
  variantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedVariant: {
    backgroundColor: "#ebf4ff",
    borderColor: "#2979ff",
  },
  variantInfo: {
    flex: 1,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  selectedVariantText: {
    color: "#2979ff",
  },
  variantStock: {
    fontSize: 13,
    color: "#718096",
  },
  variantPrice: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2979ff",
  },
  disabledVariant: {
    opacity: 0.5,
    backgroundColor: "#f7fafc",
  },
  quantitySection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quantityButtonDisabled: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
  },
  quantityInput: {
    width: 60,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    paddingHorizontal: 8,
  },
  confirmButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    paddingVertical: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#e0e7ef",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
