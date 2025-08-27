import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get("window");

export default function FlashSale({
  flashSale = [],
  renderDiscountBadge,
  renderHotBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  function formatCurrency(num = 0) {
    const n = Number(num) || 0;
    return n.toLocaleString("vi-VN") + "đ";
  }

  // Giá áp dụng: nếu option có price => dùng price; nếu có priceDiff => base + priceDiff; không có => base
  function getVariantPrice(product, variant) {
    const base = Number(product?.price || 0);
    if (!variant) return base;
    if (typeof variant.price === "number") return variant.price;
    const diff = Number(variant.priceDiff || 0);
    return base + diff;
  }

  // --- Helpers (đặt sau getVariantPrice) ---
  const getUserId = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) return null;
    const u = JSON.parse(userStr);
    return u?._id || u?.id || null;
  };

  const getProductId = (p) => p?._id || p?.id;

  const getVariantId = (v) => v?._id || v?.id;

  // Trả về mảng "option" để UI map; hỗ trợ cả 2 dạng:
  // 1) variants = [{ key, options: [...] }]
  // 2) variants = [ { _id/id, label/name, price/priceDiff, stock } ]
  const extractVariantOptions = (product) => {
    const v = product?.variants || [];
    if (!Array.isArray(v) || v.length === 0) return [];
    // Nếu là dạng group
    if (v[0]?.options && Array.isArray(v[0].options)) return v[0].options;
    // Nếu là dạng phẳng
    return v;
  };

  // Tính giá hiển thị cho 1 option (ưu tiên price, fallback priceDiff)
  const getDisplayPrice = (product, option) => {
    const base = Number(product?.price || 0);
    if (!option) return base;
    if (typeof option.price === "number") return option.price;
    return base + Number(option.priceDiff || 0);
  };

  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [optionDialogMode, setOptionDialogMode] = useState("cart"); // 'cart' or 'buy'
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantSelections, setVariantSelections] = useState({});
  const [qtyError, setQtyError] = useState(null);
  const [validatingQty, setValidatingQty] = useState(false);
  const qtyDebounceRef = useRef(null); // nhớ import useRef từ react

  const apiValidateQuantity = async (qty) => {
    if (!selectedProduct || !selectedVariant) return { ok: true };
    try {
      setValidatingQty(true);
      const userStr = await AsyncStorage.getItem("user");
      const userId = userStr ? JSON.parse(userStr)?._id : null;

      // Payload gợi ý — đổi field nếu backend khác tên
      const payload = {
        user_id: userId,
        productId: selectedProduct._id || selectedProduct.id,
        variantId: selectedVariant._id || selectedVariant.id,
        quantity: qty,
        checkOnly: true, // gợi ý: để server chỉ kiểm tra, không ghi DB
        context: optionDialogMode, // 'cart' | 'buy' (tuỳ bạn dùng)
      };

      const res = await axiosInstance.post("/cartt/update-quantity", payload);
      // Gợi ý format response: { allowed: boolean, max: number, quantity: number, message?: string }
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
      // fallback local theo tồn kho hiện có của biến thể
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

  // Thời gian kết thúc flash sale (ví dụ: 1 giờ từ lúc load)
  const [timeLeft, setTimeLeft] = useState(3600); // 1 giờ = 3600 giây

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Hàm chuyển đổi giây sang giờ, phút, giây
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTime(timeLeft);

  const openOptionDialog = (product, mode) => {
    setSelectedProduct(product);
    setOptionDialogMode(mode);
    setQuantity(1);
    setSelectedVariant(null);
    setVariantSelections({});

    const options = extractVariantOptions(product);
    const firstAvailable =
      options.find((o) => (o?.stock ?? 1) > 0) || options[0];

    if (firstAvailable) {
      setSelectedVariant(firstAvailable);
      // nếu có group.key thì lưu chọn theo key; nếu không thì bỏ qua
      const key = product?.variants?.[0]?.key;
      if (key) setVariantSelections({ [key]: firstAvailable });
    }
    setShowOptionDialog(true);
  };

  const handleAddToCart = async (product, event) => {
    event?.stopPropagation();
    if (!isLoggedIn) return onRequireLogin();
    if (product?.variants?.length > 0) {
      openOptionDialog(product, "cart");
    } else {
      Toast.show({
        type: "error",
        text1: "Vui lòng chọn biến thể sản phẩm",
        position: "top",
      });
    }
  };

  const handleBuyNow = (product, event) => {
    event?.stopPropagation();
    if (!isLoggedIn) return onRequireLogin();
    if (product?.variants?.length > 0) {
      openOptionDialog(product, "buy");
    } else {
      Toast.show({
        type: "error",
        text1: "Vui lòng chọn biến thể sản phẩm",
        position: "top",
      });
    }
  };

  // Handle variant selection confirmation
  const handleConfirmOption = async () => {
    if (!selectedProduct || !selectedVariant) {
      return Toast.show({
        type: "error", 
        text1: "Vui lòng chọn biến thể sản phẩm",
        position: "top"
      });
    }

    // Validate quantity
    const check = await apiValidateQuantity(quantity);
    if (!check?.ok) {
      return Toast.show({
        type: "error",
        text1: "Số lượng vượt tồn kho",
        text2: `Vui lòng giảm số lượng (tối đa ${check?.max ?? ""}).`,
        position: "top"
      });
    }

    if (optionDialogMode === "buy") {
      const selected = [{
        id: selectedProduct._id,
        variantId: selectedVariant._id,
        name: selectedProduct.name,
        // Fix image handling
        image: typeof selectedProduct.image === 'string' 
          ? { uri: selectedProduct.image }
          : selectedProduct.image || require("../assets/images/pc1.png"),
        quantity: quantity,
        price: getDisplayPrice(selectedProduct, selectedVariant),
        variant: {
          _id: selectedVariant._id,
          key: 'Phiên bản',
          label: selectedVariant.label || selectedVariant.name,
          price: selectedVariant.price,
          stock: selectedVariant.stock
        }
      }];

      setShowOptionDialog(false);
      router.push({
        pathname: "/pay",
        params: {
          selectedProducts: JSON.stringify(selected)
        }
      });
      return;
    }

    // add-to-cart
    // add-to-cart
    try {
      const userId = await getUserId();
      if (!userId) {
        setShowOptionDialog(false);
        Toast.show({
          type: "error",
          text1: "Vui lòng đăng nhập để mua hàng!",
          position: "top",
        });
        return router.push("/LoginScreen");
      }

      const pid = getProductId(selectedProduct);
      const vid = getVariantId(selectedVariant);

      if (!pid || !vid) {
        return Toast.show({
          type: "error",
          text1: "Thiếu productId hoặc variantId",
          position: "top",
        });
      }

      await axiosInstance.post("/cartt/add-to-cart", {
        user_id: userId,
        productId: pid,
        variantId: vid,
        quantity,
      });

      setShowOptionDialog(false);
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

  // Update handleVariantSelect function
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    const key = selectedProduct?.variants?.[0]?.key;
    if (key) setVariantSelections({ [key]: variant });

    const max = Number(variant?.stock ?? 99);
    setQtyError(null);
    setQuantity((q) => {
      const next = Math.min(Math.max(1, q), max);
      // kiểm tra với server (debounce đã có cho TextInput; ở đây gọi ngay)
      apiValidateQuantity(next);
      return next;
    });
  };

  // Add this function after your other handler functions
  const handleProductPress = (product) => {
    if (!product) return;
    router.push({
      pathname: "/ctsp",
      params: { id: product._id || product.id },
    });
  };

  // Add handleFavorite function since it's used in the template
  const handleFavorite = (product, event) => {
    event?.stopPropagation(); // Prevent triggering product press

    if (!isLoggedIn) {
      return onRequireLogin();
    }

    // TODO: Implement favorite functionality
    Toast.show({
      type: "info",
      text1: "Tính năng đang phát triển",
      position: "top",
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF6B6B", "#FF8E53", "#FF6B9D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.flashSaleBox}
      >
        {/* Header với gradient overlay */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={20} color="#FFD700" />
            </View>
            <Text style={styles.sectionTitle}>Khung Giờ Vàng</Text>
            <View style={styles.liveIndicator}>
            </View>
          </View>

          {/* Timer với hiệu ứng đẹp hơn */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Kết thúc sau</Text>
            <View style={styles.flashSaleTimer}>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{h}</Text>
                <Text style={styles.timerUnit}>GIỜ</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{m}</Text>
                <Text style={styles.timerUnit}>PHÚT</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{s}</Text>
                <Text style={styles.timerUnit}>GIÂY</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Products ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={150}
          snapToAlignment="start"
        >
          {(flashSale || []).map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleProductPress(item)}
              style={[
                styles.flashSaleCard,
                {
                  marginLeft: index === 0 ? 16 : 8,
                  marginRight: index === flashSale.length - 1 ? 16 : 0,
                },
              ]}
              android_ripple={{
                color: "rgba(255,255,255,0.3)",
                borderless: false,
              }}
            >
              {/* Discount Badge với gradient */}
              <LinearGradient
                colors={["#FF4757", "#FF3742"]}
                style={styles.discountBadge}
              >
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </LinearGradient>

              {/* Hot Badge */}
              {item.isHot && (
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={12} color="#FF4757" />
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              )}

              {/* Favorite Button */}
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => handleFavorite(item, e)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart-outline" size={16} color="#FF6B6B" />
              </TouchableOpacity>

              {/* Product Image với shadow */}
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.flashSaleImage} />
                {/* Stock indicator */}
                <View style={styles.stockIndicator}>
                  <View
                    style={[
                      styles.stockDot,
                      { backgroundColor: item.inStock ? "#00C851" : "#FF4444" },
                    ]}
                  />
                  <Text style={styles.stockText}>
                    {item.inStock ? "Còn hàng" : "Con hàng"}
                  </Text>
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productNameSmall}>
                  {item.name}
                </Text>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPriceSmall}>{item.price}</Text>
                    <View style={styles.originalPriceContainer}>
                      <Text style={styles.originalPriceSmall}>
                        {item.originalPrice}
                      </Text>
                      <View style={styles.strikethrough} />
                    </View>
                  </View>

                  {/* Progress bar cho sold với animation */}
                  <View style={styles.soldContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={["#FF6B6B", "#FF8E53"]}
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              item.soldPercentage || 60,
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.soldRow}>
                      <Text style={styles.soldText}>
                        Đã bán{" "}
                        {item.sold || Math.floor(Math.random() * 50) + 10}
                      </Text>
                      <Text style={styles.ratingText}>
                        ⭐ {item.rating || "4.5"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Shimmer effect overlay */}
              <View style={styles.shimmerOverlay}>
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(255,255,255,0.2)",
                    "transparent",
                  ]}
                  start={{ x: -1, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </View>

              {/* Buttons với gradient và shadow */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={(e) => handleAddToCart(item, e)}
                  style={styles.addToCartButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF5252"]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Giỏ hàng</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={(e) => handleBuyNow(item, e)}
                  style={styles.buyNowButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FFD700", "#FFC107"]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="flash" size={14} color="#FFFFFF" />
                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                      Mua ngay
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          ))}

          {/* View All Card với animation */}
          <TouchableOpacity
            style={[styles.flashSaleCard, styles.viewAllCard]}
            onPress={() => router.push("/danhmucall")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.95)"]}
              style={styles.viewAllGradient}
            >
              <View style={styles.viewAllContent}>
                <View style={styles.viewAllIcon}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={28}
                    color="#FF6B6B"
                  />
                </View>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Text style={styles.viewAllSubtext}>
                  Khám phá thêm sản phẩm hot
                </Text>
                <View style={styles.viewAllBadge}>
                  <Text style={styles.viewAllBadgeText}>999+</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal chọn phiên bản & số lượng */}
        {/* Modal chọn phiên bản & số lượng */}
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
                      : selectedProduct?.image ||
                        require("../assets/images/pc1.png")
                  }
                  style={styles.modalProductImage}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.modalProductName} numberOfLines={2}>
                    {selectedProduct?.name}
                  </Text>
                  <Text style={styles.modalProductPrice}>
  {formatCurrency(getDisplayPrice(selectedProduct, selectedVariant))}
</Text>

                  {selectedVariant && (
                    <Text style={styles.stockInfo}>
                      Còn {Number(selectedVariant?.stock ?? 0)} sản phẩm
                    </Text>
                  )}
                </View>
              </View>

              {/* Variants List */}
              {/* Variants List */}
              <Text style={styles.sectionLabel}>Phiên bản:</Text>
              <ScrollView style={styles.variantList}>
                {extractVariantOptions(selectedProduct).map((opt) => {
                  const isSelected =
                    getVariantId(selectedVariant) === getVariantId(opt);
                  const priceShown = getDisplayPrice(selectedProduct, opt);
                  const stock = Number(opt?.stock ?? 0);
                  const label = opt?.label || opt?.name || "Tuỳ chọn";

                  return (
                    <TouchableOpacity
                      key={getVariantId(opt)}
                      style={[
                        styles.variantItem,
                        isSelected && styles.selectedVariant,
                        stock <= 0 && styles.disabledVariant,
                      ]}
                      onPress={() => handleVariantSelect(opt)}
                      disabled={stock <= 0}
                    >
                      <View style={styles.variantInfo}>
                        <Text
                          style={[
                            styles.variantLabel,
                            isSelected && styles.selectedVariantText,
                          ]}
                        >
                          {label}
                        </Text>
                        <Text
                          style={[
                            styles.variantStock,
                            isSelected && styles.selectedVariantText,
                          ]}
                        >
                          {stock <= 0 ? "Hết hàng" : `Còn ${stock} sản phẩm`}
                        </Text>
                      </View>
                      <View style={styles.variantPrice}>
                        <Text
                          style={[
                            styles.priceText,
                            isSelected && styles.selectedVariantText,
                          ]}
                        >
                          {formatCurrency(priceShown)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
                    onChangeText={(t) => {
                      // chỉ nhận số dương
                      const num = Math.max(
                        1,
                        parseInt((t || "").replace(/[^\d]/g, ""), 10) || 1
                      );
                      // kẹp theo stock hiện biết
                      const limit = Number(selectedVariant?.stock ?? 99);
                      const desired = Math.min(num, limit);
                      setQuantity(desired);
                      setQtyError(null);
                      if (qtyDebounceRef.current)
                        clearTimeout(qtyDebounceRef.current);
                      qtyDebounceRef.current = setTimeout(() => {
                        apiValidateQuantity(desired);
                      }, 300);
                    }}
                    keyboardType="number-pad"
                    style={[
                      styles.quantityInput,
                      qtyError ? { borderColor: "#ff3b30" } : null,
                    ]}
                    maxLength={4}
                  />

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantity >= (selectedVariant?.stock ?? 99) &&
                        styles.quantityButtonDisabled,
                    ]}
                    onPress={() =>
                      setQuantity((q) => {
                        const limit = Number(selectedVariant?.stock ?? 99);
                        const next = Math.min(limit, q + 1);
                        setQtyError(null);
                        apiValidateQuantity(next);
                        return next;
                      })
                    }
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
              </View>

              {/* Confirm Button */}
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
                  <Text style={styles.confirmButtonText}>
                    {optionDialogMode === "buy"
                      ? "Mua ngay"
                      : "Thêm vào giỏ hàng"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  flashSaleBox: {
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    elevation: 12,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 215, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: 20,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00FF88",
    marginRight: 6,
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: "center",
  },
  timerLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  flashSaleTimer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  timerText: {
    color: "#FF4757",
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 20,
  },
  timerUnit: {
    color: "#FF4757",
    fontWeight: "600",
    fontSize: 9,
    marginTop: -1,
    letterSpacing: 0.2,
  },
  timerSeparator: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    marginHorizontal: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  flashSaleCard: {
    width: 140,
    height: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 4,
    padding: 8,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  discountBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 3,
    elevation: 5,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hotBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#FF4757",
  },
  hotText: {
    color: "#FF4757",
    fontWeight: "800",
    fontSize: 9,
    marginLeft: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 6,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    height: 70,
    justifyContent: "center",
    position: "relative",
  },
  flashSaleImage: {
    width: "100%",
    height: 55,
    borderRadius: 8,
    resizeMode: "contain",
  },
  stockIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 3,
  },
  stockText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#333",
  },
  productInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  productNameSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
    textAlign: "left",
    lineHeight: 16,
    minHeight: 32,
  },
  priceSection: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPriceSmall: {
    color: "#FF4757",
    fontWeight: "800",
    fontSize: 14,
  },
  originalPriceContainer: {
    position: "relative",
    alignItems: "center",
  },
  originalPriceSmall: {
    fontSize: 10,
    color: "#95A5A6",
    fontWeight: "500",
  },
  strikethrough: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#95A5A6",
  },
  soldContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 5,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  soldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldText: {
    fontSize: 9,
    color: "#74B9FF",
    fontWeight: "600",
  },
  ratingText: {
    fontSize: 9,
    color: "#FFD700",
    fontWeight: "600",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: "hidden",
    pointerEvents: "none",
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  viewAllCard: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 107, 107, 0.4)",
    borderStyle: "dashed",
    marginRight: 16,
    overflow: "hidden",
  },
  viewAllGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  viewAllContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  viewAllText: {
    color: "#FF6B6B",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 4,
  },
  viewAllSubtext: {
    color: "#95A5A6",
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  viewAllBadge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  viewAllBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: "#222",
    letterSpacing: 0.3,
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
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4757",
  },
  stockInfo: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  variantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  selectedVariant: {
    backgroundColor: "#2979ff",
  },
  selectedVariantText: {
    color: "#fff",
  },
  variantInfo: {
    flex: 1,
  },
  variantLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  variantStock: {
    fontSize: 13,
    color: "#666",
  },
  variantPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF4757",
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#eee",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  confirmButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  variantList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  disabledVariant: {
    opacity: 0.5,
    backgroundColor: "#f0f0f0",
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantityInput: {
    width: 56,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
});

// Hàm phân tích và chuyển đổi giá
function parsePrice(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    // Loại bỏ ký tự không phải số
    const cleaned = price.replace(/[^\d]/g, "");
    return Number(cleaned);
  }
  return 0;
}

function formatCurrency(amount) {
  if (typeof amount !== "number") return "";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
