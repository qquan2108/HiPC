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

const { width } = Dimensions.get("window");

export default function ForYouGrid({
  products = [],
  renderNewBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  // Default badge components nếu không được provide
  const defaultNewBadge = () => (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
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
      colors={["#ff6b6b", "#ee5a24"]}
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
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [qtyError, setQtyError] = useState(null);
  const [validatingQty, setValidatingQty] = useState(false);
  const qtyDebounceRef = useRef(null);
  const [variantSelections, setVariantSelections] = useState({});

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
      const max = Math.max(
        1,
        Number(variantSelections[key]?.stock ?? selectedVariant?.stock ?? 99)
      );
      setQtyError(null);
      setQuantity((q) => {
        const next = Math.min(Math.max(1, q), max);
        apiValidateQuantity(next);
        return next;
      });
    }
  };

  // 🆕 Khi bấm icon giỏ hàng
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
        position: "top",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Thêm giỏ hàng thất bại!",
        position: "top",
      });
    }
  };

  // 🆕 Xử lý xác nhận trong dialog
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
        position: "top",
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

  const getPriceRange = (product) => {
    const basePrice = Number(product.price) || 0;
    if (!product.variants || !product.variants[0]?.options) {
      return { min: basePrice, max: basePrice };
    }

    const options = product.variants[0].options;
    const prices = options.map((option) => basePrice + (option.priceDiff || 0));
    return {
      min: Math.min(basePrice, ...prices),
      max: Math.max(basePrice, ...prices),
    };
  };

  const formatPriceRange = (product) => {
    const basePrice = Number(product.price);
    // 1. Nếu không có giá gốc (null/undefined/"0"/NaN) → Liên hệ
    if (!product.price || isNaN(basePrice) || basePrice === 0) {
      return "Liên hệ";
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
      { text: "GIẢM 20%", color: ["#FF6B6B", "#FF4B2B"], icon: "local-offer" },
      {
        text: "VOUCHER 30%",
        color: ["#00B4DB", "#0083B0"],
        icon: "confirmation-number",
      },
      { text: "SALE 25%", color: ["#667EEA", "#764BA2"], icon: "bolt" },
      { text: "KHUYẾN MÃI 15%", color: ["#FF9F43", "#FF7E05"], icon: "stars" },
      {
        text: "GIẢM 35%",
        color: ["#F6416C", "#FF0080"],
        icon: "local-fire-department",
      },
    ];
    return vouchers[Math.floor(Math.random() * vouchers.length)];
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header với gradient */}
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
                <MaterialIcons name="computer" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>
                  Linh Kiện Máy Tính
                  <Text style={styles.titleAccent}> Pro</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Hiệu suất cao - Giá tốt
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                router.push({
                  pathname: "/danhmucall",
                  params: { showAll: true },
                })
              }
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Enhanced Product Grid */}
      <View style={styles.forYouGrid}>
        {(products || []).concat(products || []).map((product, idx) => {
          // Khởi tạo voucher ngẫu nhiên cho mỗi product
          const voucher = getRandomVoucher();

          return (
            <TouchableOpacity
              key={`${product._id || product.id || idx}-${idx}`}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "./ctsp",
                  params: { id: product._id || product.id },
                })
              }
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                {/* --- Enhanced Image Section --- */}
                <View style={styles.imageContainer}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={
                        typeof product.image === "string"
                          ? { uri: product.image }
                          : product.image || { uri: "" }
                      }
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.05)"]}
                      style={styles.imageOverlay}
                    />
                  </View>

                  {/* Badges cũ */}
                  <View style={styles.badgeWrapper}>
                    {product.isNew &&
                      (renderNewBadge ? renderNewBadge() : defaultNewBadge())}
                    {product.discount > 0 &&
                      (renderDiscountBadge
                        ? renderDiscountBadge(product.discount)
                        : defaultDiscountBadge(product.discount))}
                  </View>

                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <View style={styles.starWrapper}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {product.rating
                          ? Number(product.rating).toFixed(1)
                          : "4.8"}
                      </Text>
                    </View>
                  </View>

                  {/* Wishlist */}
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
                      <MaterialIcons
                        name="local-shipping"
                        size={8}
                        color="#667eea"
                      />
                      <Text style={styles.featureText}>FREESHIP</Text>
                    </View>
                  </View>

                  {/* 🆕 Khoảng giá */}
                  <View style={styles.priceSection}>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price)}₫
                    </Text>
                    {/* Nếu có giá gốc và khác giá bán, hiển thị giá gốc gạch ngang */}
                    {product.originalPrice &&
                      product.originalPrice !== product.price && (
                        <Text style={styles.originalPrice}>
                          {formatPrice(product.originalPrice)}₫
                        </Text>
                      )}
                  </View>

                  {/* 🆕 Voucher Badge */}
                  <LinearGradient
                    colors={voucher.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.voucherBadge}
                  >
                    <MaterialIcons name={voucher.icon} size={12} color="#fff" />
                    <Text style={styles.voucherText}>{voucher.text}</Text>
                  </LinearGradient>

                  {/* Action Icons */}
                  <View style={styles.actionIcons}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "#333",
                          marginLeft: 3,
                        }}
                      >
                        {product.rating
                          ? Number(product.rating).toFixed(1)
                          : "4.8"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cartButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <LinearGradient
                        colors={["#667eea", "#764ba2"]}
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
        onRequestClose={() => {
          setShowOptionDialog(false);
          setSelectedVariant(null);
          setVariantSelections({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
                    : selectedProduct?.image ||
                      require("../assets/images/pc1.png")
                }
                style={styles.modalProductImage}
                resizeMode="contain"
              />
              <View style={styles.productDetails}>
                <Text style={styles.modalProductName} numberOfLines={2}>
                  {selectedProduct?.name}
                </Text>
                <Text style={styles.modalProductPrice}>
                  {formatPrice(
                    selectedVariant?.price || selectedProduct?.price
                  )}
                  ₫
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
            <ScrollView style={styles.optionsContainer}>
              {extractVariantOptions(selectedProduct).map((variant) => (
                <TouchableOpacity
                  key={variant._id}
                  style={[
                    styles.optionButton,
                    selectedVariant?._id === variant._id &&
                      styles.optionButtonSelected,
                    variant.stock <= 0 && styles.disabledVariant,
                  ]}
                  onPress={() => handleVariantSelect(variant)}
                  disabled={variant.stock <= 0}
                >
                  <View style={styles.variantInfo}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedVariant?._id === variant._id &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {variant.name}
                    </Text>
                    <Text style={styles.variantStock}>
                      {variant.stock <= 0
                        ? "Hết hàng"
                        : `Còn ${variant.stock} sản phẩm`}
                    </Text>
                  </View>
                  <View style={styles.variantPrice}>
                    <Text style={styles.priceText}>
                      {formatPrice(variant.price)}₫
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quantity Section */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionLabel}>Số lượng:</Text>
              <View style={styles.quantityContainer}>
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
                    if (qtyDebounceRef.current)
                      clearTimeout(qtyDebounceRef.current);
                    qtyDebounceRef.current = setTimeout(
                      () => apiValidateQuantity(next),
                      300
                    );
                  }}
                  keyboardType="number-pad"
                  style={styles.quantityInput}
                  maxLength={3}
                />

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= (selectedVariant?.stock ?? 99) &&
                      styles.quantityButtonDisabled,
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
                    color={
                      quantity >= (selectedVariant?.stock ?? 99)
                        ? "#ccc"
                        : "#666"
                    }
                  />
                </TouchableOpacity>
              </View>
              {qtyError && <Text style={styles.errorText}>{qtyError}</Text>}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowOptionDialog(false)}
              >
                <Text style={styles.cancelButtonText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedVariant || selectedVariant.stock <= 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleConfirmOption}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#FF5252"]}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Thêm vào giỏ</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
    backgroundColor: "#fff",
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
    position: "relative",
  },
  imageWrapper: {
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
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
    flexWrap: "wrap",
    gap: 4,
  },
  newBadge: {
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
  discountBadge: {
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
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 2,
  },

  // Enhanced Rating Styles
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

  // Enhanced Wishlist Button
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

  // Enhanced Price Styles
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  productPrice: {
    color: "#e53e3e",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 6,
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
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
  productDetails: {
    flex: 1,
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
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  optionsContainer: {
    maxHeight: 240,
    marginBottom: 16,
  },
  optionButton: {
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
  optionButtonSelected: {
    backgroundColor: "#ebf4ff",
    borderColor: "#2979ff",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
  },
  optionTextSelected: {
    color: "#2979ff",
  },
  quantitySection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
  },
  quantityContainer: {
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  confirmButton: {
    flex: 2,
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
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  voucherBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voucherText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
    letterSpacing: 0.3,
  },
});
