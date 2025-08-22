import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";
import SkeletonCTSP from "./SkeletonCTSP";

import ProductDescription from "../compomentCTSP/Description";
import OptionGroup from "../compomentCTSP/OptionGroup";
import ProductImage from "../compomentCTSP/ProductImage";
import ProductPriceRow from "../compomentCTSP/ProductPriceRow";
import ReviewBox from "../compomentCTSP/ReviewBox";
import { SectionLiked, SectionPopular } from "../compomentCTSP/SectionBox";
import SpecsBox from "../compomentCTSP/SpecsBox";

// right after importing axiosInstance
const base = axiosInstance.defaults.baseURL; // e.g. "http://192.168.0.5:3000"

// Fetch product detail
const fetchProductById = async (productId) => {
  const { data: product } = await axiosInstance.get(`/product/${productId}`);
  let specsArr = [];

  if (Array.isArray(product.tskt) && product.tskt.length) {
    specsArr = product.tskt;
  } else if (Array.isArray(product.specifications)) {
    specsArr = product.specifications.map((spec) => {
      if (spec.key && spec.value) {
        return { label: spec.key, value: spec.value };
      }
      const idxKeys = Object.keys(spec).filter((k) => /^\d+$/.test(k));
      if (idxKeys.length) {
        const joined = idxKeys
          .sort((a, b) => a - b)
          .map((i) => spec[i])
          .join("");
        return { label: "", value: joined };
      }
      return { label: "", value: "" };
    });
  }

  const resolveImageUri = (url) =>
    url?.startsWith("http") ? url : `${base}${url}`;

  return {
    id: product._id,
    name: product.name,
    price: product.price,
    description: product.description,
    oldPrice: product.price,
    images:
      Array.isArray(product.images) && product.images.length
        ? product.images.map((url) =>
            typeof url === "string" ? { uri: resolveImageUri(url) } : url
          )
        : [require("../assets/images/pc1.png")],
    image: product.image
      ? { uri: resolveImageUri(product.image) }
      : require("../assets/images/pc1.png"),
    rating: product.rating || 4.5,
    sold: product.sold || 0,
    origin: product.origin || "Unknown",
    specs: specsArr,
    buyWith: product.relatedProducts || product.buyWith || [],
    variants: product.variants || [], // <-- Sửa dòng này
    brand: product.brand_id?.name || "Unknown",
    category: product.category_id?.name || "Unknown",
  };
};

// Fetch all products
const fetchAllProducts = async () => {
  try {
    const { data } = await axiosInstance.get("/product");
    const list = (data.products || []).map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.image
        ? { uri: p.image.startsWith("http") ? p.image : `${base}${p.image}` }
        : require("../assets/images/pc1.png"),
      sold: p.sold || 0,
      // Thêm dòng này để có category cho filter
      category: p.category || "", // hoặc p.category_id?.name || ''
    }));
    return list;
  } catch {
    return [];
  }
};

// Tạm thời giữ lại các options cố định cho demo

function formatCurrency(num) {
  return num.toLocaleString("vi-VN") + "đ";
}

export default function CTSP() {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [compareVisible, setCompareVisible] = useState(false);

  const [basePrice, setBasePrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);

  // Thêm state cho variant
  const [compareProducts, setCompareProducts] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Thêm state lưu lựa chọn từng nhóm biến thể
  const [variantSelections, setVariantSelections] = useState({});

  // Thêm state cho liked
  const [liked, setLiked] = useState(false); // Thêm state này

  // Load product & all products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!productId) throw new Error("Thiếu ID sản phẩm");
        const fetched = await fetchProductById(productId);
        setProduct(fetched);
        setVariants(fetched.variants || []);
        setCompareProducts([fetched]);
        setAllProducts(await fetchAllProducts());

        // Khởi tạo lựa chọn mặc định cho từng nhóm biến thể
        if (fetched.variants && fetched.variants.length > 0) {
          const defaults = {};
          fetched.variants.forEach((group) => {
            if (group.options && group.options.length > 0) {
              defaults[group.key] = group.options[0];
            }
          });
          setVariantSelections(defaults);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);
  const handleProductPress = (product) => {
    router.push({
      pathname: "/ctsp",
      params: { id: product.id || product._id },
    });
  };

  useEffect(() => {
    if (product) {
      setBasePrice(product.price);
      setDisplayPrice(product.price);
    }
  }, [product]);

  useEffect(() => {
    if (selectedVariant) {
      setDisplayPrice(basePrice + (selectedVariant.priceDiff || 0));
    }
  }, [selectedVariant, basePrice]);

  useEffect(() => {
    if (!product) return;
    // Tính tổng chênh lệch giá từ các biến thể đã chọn
    let priceDiff = 0;
    Object.values(variantSelections).forEach(opt => {
      if (opt && typeof opt.priceDiff === 'number') priceDiff += opt.priceDiff;
    });
    setDisplayPrice(product.price + priceDiff);
  }, [variantSelections, product]);

  // Filter for compare modal
  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !compareProducts.find((item) => item.id === p.id) &&
      // Lọc cùng danh mục với sản phẩm hiện tại
      product &&
      p.category === product.category
  );

  const handleAddCompare = (p) => {
    console.log("Adding to compare:", p);
    if (compareProducts.length < 3) {
      setCompareProducts((cp) => [...cp, p]);
      setAddModalVisible(false);
      setSearchText("");
    }
  };
  const handleRemoveCompare = (id) =>
    setCompareProducts((cp) => cp.filter((p) => p.id !== id));
  const handleClearCompare = () => {
    setCompareProducts([]);
    setAddModalVisible(false);
  };

  const handleGoCompare = () => {
    console.log("handleGoCompare - compareProducts:", compareProducts);
    if (compareProducts.length < 2) {
      Toast.show({
        type: "error",
        text1: "Vui lòng chọn ít nhất 2 sản phẩm để so sánh!",
        position: "top",
      });
      return;
    }
    setCompareVisible(false);
    try {
      router.push({
        pathname: "/sosanhsanpham",
        params: { compare: JSON.stringify(compareProducts) },
      });
    } catch (err) {
      console.error("Error in router.push:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi khi chuyển hướng đến trang so sánh!",
        position: "top",
      });
    }
  };

  // Hàm thêm vào giỏ hàng với kiểm tra tồn kho
  const AddToCart = async (prod) => {
    try {
      // Kiểm tra tồn kho
      const maxStock = prod.stock ?? 99;
      if (maxStock < 1) {
        Toast.show({
          type: "error",
          text1: "Sản phẩm đã hết hàng!",
          position: "top",
        });
        return;
      }

      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        Toast.show({
          type: "error",
          text1: "Vui lòng đăng nhập để mua hàng!",
          position: "top",
        });
        return router.replace("/LoginScreen");
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;

      // Gộp tất cả lựa chọn biến thể thành một object duy nhất
      let variantPayload = undefined;
      if (prod.variants && prod.variants.length > 0) {
        if (prod.variants.length === 1) {
          const group = prod.variants[0];
          const selected = variantSelections[group.key];
          if (selected && selected.label && group.key) {
            variantPayload = {
              key: group.key,
              label: selected.label,
              priceDiff: selected.priceDiff || 0,
            };
          }
        } else {
          const keys = Object.keys(variantSelections);
          const labels = keys
            .map((k) => variantSelections[k]?.label)
            .filter(Boolean);
          const priceDiffSum = keys.reduce(
            (sum, k) => sum + (variantSelections[k]?.priceDiff || 0),
            0
          );
          variantPayload = {
            key: keys.join(" + "),
            label: labels.join(" + "),
            priceDiff: priceDiffSum,
          };
        }
      }

      await axiosInstance.post("/cartt/add-to-cart", {
        user_id: userId,
        productId: prod._id || prod.id,
        quantity: 1,
        variant: variantPayload,
      });

      Toast.show({
        type: "success",
        text1: "Đã thêm vào giỏ hàng!",
        text2: variantPayload
          ? `Cấu hình: ${variantPayload.label}`
          : "Mặc định",
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

  const handleGoReview = async () => {
    let userId = null;
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        userId = JSON.parse(userStr).id || JSON.parse(userStr)._id;
      }
    } catch {}
    if (!product?.id) {
      Toast.show({ type: "error", text1: "Không xác định được sản phẩm!" });
      return;
    }
    // Kiểm tra đã mua chưa
    try {
      const { data } = await axiosInstance.get("/orders/user", {
        params: { user_id: userId },
      });
      const hasBought = data.orders?.some(
        (order) =>
          order.status === "delivered" &&
          order.products?.some((p) => p.productId === product.id)
      );
      if (!hasBought) {
        Toast.show({
          type: "error",
          text1: "Bạn cần mua sản phẩm này mới được đánh giá!",
        });
        return;
      }
    } catch {
      Toast.show({ type: "error", text1: "Không kiểm tra được đơn hàng!" });
      return;
    }
    router.push({
      pathname: "/danhgia",
      params: {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image?.uri || product.images[0]?.uri || "",
        user_id: userId,
      },
    });
  };

  // Hàm mua ngay với kiểm tra tồn kho
  const handleBuyNow = async () => {
    // Kiểm tra tồn kho
    const maxStock = product.stock ?? 99;
    if (maxStock < 1) {
      Toast.show({
        type: "error",
        text1: "Sản phẩm đã hết hàng!",
        position: "top",
      });
      return;
    }

    // Kiểm tra đăng nhập
    let userStr;
    try {
      userStr = await AsyncStorage.getItem("user");
    } catch {}
    if (!userStr) {
      Toast.show({
        type: "error",
        text1: "Vui lòng đăng nhập để mua hàng!",
        position: "top",
      });
      return router.replace("/LoginScreen");
    }

    // Lấy biến thể đã chọn (nếu có)
    let variant = null;
    if (product.variants && product.variants.length > 0) {
      if (product.variants.length === 1) {
        const group = product.variants[0];
        const selected = variantSelections[group.key];
        if (selected && selected.label && group.key) {
          variant = {
            key: group.key,
            label: selected.label,
            priceDiff: selected.priceDiff || 0,
          };
        }
      } else {
        const keys = Object.keys(variantSelections);
        const labels = keys
          .map((k) => variantSelections[k]?.label)
          .filter(Boolean);
        const priceDiffSum = keys.reduce(
          (sum, k) => sum + (variantSelections[k]?.priceDiff || 0),
          0
        );
        variant = {
          key: keys.join(" + "),
          label: labels.join(" + "),
          priceDiff: priceDiffSum,
        };
      }
    }

    // Tính giá tổng
    const basePrice =
      typeof product.price === "number"
        ? product.price
        : Number(String(product.price).replace(/[^\d]/g, ""));
    const variantTotalPrice = variant ? variant.priceDiff : 0;
    const totalPrice = basePrice + variantTotalPrice;

    router.push({
      pathname: "/pay",
      params: {
        selectedProducts: JSON.stringify([
          {
            id: product._id || product.id,
            name: product.name,
            price: totalPrice,
            image: product.image,
            quantity: 1,
            variant, // LUÔN TRUYỀN ĐỦ key, label, priceDiff
          },
        ]),
      },
    });
  };

  if (loading) {
    return <SkeletonCTSP />;
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity
          onPress={() => router.replace(`/ctsp?id=${productId}`)}
        >
          <Text style={styles.retryButton}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#222" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
              <TouchableOpacity
                onPress={() => router.push("/cart")}
                style={{ marginLeft: 8 }}
              >
                <Feather name="shopping-cart" size={24} color="#1976ff" />
              </TouchableOpacity>
            </View>

            {/* Image & Info */}
            <ProductImage images={product.images} />
            <View style={styles.infoCard}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.productMeta}>
                <Text style={styles.brandText}>
                  Thương hiệu: {product.brand}
                </Text>
                <Text style={styles.categoryText}>
                  Danh mục: {product.category}
                </Text>
              </View>
            </View>
            <ProductPriceRow
              price={formatCurrency(displayPrice)}
              oldPrice={formatCurrency(basePrice)}
              onLike={() => setLiked(l => !l)} // Đổi thành setLiked
              liked={liked} // Truyền prop liked
            />

            {/* Mô tả sản phẩm (HTML) */}
            {product.description ? (
              <ProductDescription htmlContent={product.description} />
            ) : null}

            {/* Specs & Compare */}
            <SpecsBox
              specs={product.specs}
              onCompare={() => setCompareVisible(true)}
            />

            {/* Configuration Options */}
            <View style={styles.configContainer}>
              <View style={styles.configHeader}>
                <Text style={styles.configTitle}>Tùy chọn cấu hình</Text>
                <View style={styles.configBadge}>
                  <Text style={styles.configBadgeText}></Text>
                </View>
              </View>

              {/* Hiển thị variants từ API nếu có */}
              {/* Hiển thị variants từ API */}
              {product.variants &&
                product.variants.length > 0 &&
                product.variants.map((group) => (
                  <OptionGroup
                    key={group.key}
                    label={group.key}
                    options={group.options}
                    selected={variantSelections[group.key]}
                    onSelect={(opt) =>
                      setVariantSelections((prev) => ({
                        ...prev,
                        [group.key]: opt,
                      }))
                    }
                    type="variant"
                  />
                ))}

              {/* Hiển thị cấu hình đã chọn */}
              <View style={styles.selectedConfigContainer}>
                <Text style={styles.selectedConfigTitle}>
                  Cấu hình đã chọn:
                </Text>
                <View style={styles.selectedConfigList}>
                  {Object.entries(variantSelections).map(([key, opt]) => (
                    <Text key={key}>
                      • {key}: {opt.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Reviews & Sections */}
            <ReviewBox product={product} />
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sản phẩm phổ biến</Text>
              <SectionPopular
                data={allProducts.slice(0, 3)}
                onPressItem={handleProductPress}
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Có thể bạn thích</Text>
              <SectionLiked
                data={allProducts.slice(3, 7)}
                onPressItem={handleProductPress}
              />
            </View>
          </>
        )}
      />

      {/* Hiển thị giá cuối cùng theo biến thể đã chọn */}
      <View style={styles.finalPriceBox}>
        <Text style={styles.finalPriceLabel}>Giá cấu hình đã chọn:</Text>
        <Text style={styles.finalPriceValue}>
          {formatCurrency(displayPrice)}
        </Text>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomCartBtn}
          onPress={() => AddToCart(product)}
        >
          <Feather name="shopping-cart" size={20} color="#1a73e8" />
          <Text style={styles.bottomCartText}>Giỏ hàng</Text>
        </TouchableOpacity>

        <View style={styles.bottomBarPriceBox}>
          <Text style={styles.bottomBarPriceLabel}>Tổng:</Text>
          <Text style={styles.bottomBarPriceValue}>{formatCurrency(displayPrice)}</Text>
        </View>

        <TouchableOpacity
          style={styles.bottomBuyBtn}
          onPress={handleBuyNow}
        >
          <Text style={styles.bottomBuyText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Compare Modal */}
      <Modal
        visible={compareVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setCompareVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>So sánh sản phẩm</Text>
              <TouchableOpacity onPress={() => setCompareVisible(false)}>
                <Feather name="x" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={styles.compareRow}>
              {Array.from({ length: 3 }).map((_, idx) => {
                const p = compareProducts[idx];
                return p ? (
                  <View style={styles.compareItem} key={p.id}>
                    <Image source={p.image} style={styles.compareImage} />
                    <TouchableOpacity
                      style={styles.compareRemove}
                      onPress={() => handleRemoveCompare(p.id)}
                    >
                      <Feather name="x" size={16} color="#888" />
                    </TouchableOpacity>
                    <Text style={styles.compareName} numberOfLines={2}>
                      {p.name}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.compareEmpty}
                    key={`empty-${idx}`}
                    onPress={() => setAddModalVisible(true)}
                  >
                    <Feather name="plus" size={32} color="#bbb" />
                    <Text style={styles.compareAddText}>Thêm sản phẩm</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.sheetFooter}>
              <TouchableOpacity onPress={handleClearCompare}>
                <Text style={styles.clearAll}>Xóa tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.compareNowBtn,
                  compareProducts.length > 1 && styles.compareNowActive,
                ]}
                disabled={compareProducts.length < 2}
                onPress={handleGoCompare}
              >
                <Text style={styles.compareNowText}>So sánh ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Compare Modal */}
      <Modal
        visible={addModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addOverlay}>
          <View style={styles.addBox}>
            <Text style={styles.addTitle}>Tìm kiếm sản phẩm</Text>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Nhập tên sản phẩm..."
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <View style={{ maxHeight: 250, width: "100%" }}>
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => (
                  <Text style={styles.noResults}>Không tìm thấy sản phẩm</Text>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchItem}
                    onPress={() => handleAddCompare(item)}
                  >
                    <Image source={item.image} style={styles.searchImage} />
                    <Text numberOfLines={2} style={styles.searchName}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <TouchableOpacity
              style={styles.closeSearch}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Login Prompt Modal */}
      <Modal
        visible={showLoginDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginDialog(false)}
      >
        <View style={styles.loginOverlay}>
          <View style={styles.loginBox}>
            <Text style={styles.loginIcon}>😺</Text>
            <Text style={styles.loginTitle}>Bạn chưa đăng nhập!</Text>
            <Text style={styles.loginMsg}>Vui lòng đăng nhập để tiếp tục.</Text>
            <View style={styles.loginActions}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => {
                  setShowLoginDialog(false);
                  router.replace("./LoginScreen");
                }}
              >
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginLater}
                onPress={() => setShowLoginDialog(false)}
              >
                <Text style={styles.loginLaterText}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { paddingBottom: 100 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16, marginBottom: 8 },
  retryButton: { color: "#2979ff", fontSize: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  productName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  brandText: {
    fontSize: 14,
    color: "#666",
    marginRight: 16,
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },

  configContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f2f5",
  },
  configHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  configBadge: {
    backgroundColor: "",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  configBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "",
  },
  selectedConfigContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4285f4",
  },
  selectedConfigTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  selectedConfigList: {
    gap: 6,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  configItemText: {
    fontSize: 14,
    color: "#3c4043",
    lineHeight: 20,
  },

  sectionContainer: { marginVertical: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f0f7ff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1a73e8",
  },
  bottomCartText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#1a73e8",
    fontWeight: "600",
  },
  bottomBuyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#2979ff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2979ff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBuyText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  bottomBarPriceBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 4,
    backgroundColor: '#fffbe7',
    borderRadius: 10,
    minWidth: 90,
    height: 48,
    alignSelf: 'center',
  },
  bottomBarPriceLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  bottomBarPriceValue: {
    fontSize: 17,
    color: '#e53935',
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Compare modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  compareRow: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-around",
  },
  compareItem: {
    width: 100,
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  compareImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 8,
  },
  compareRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  compareName: {
    textAlign: "center",
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  compareEmpty: {
    width: 100,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  compareAddText: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    fontWeight: "500",
  },
  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clearAll: { color: "#2979ff", fontWeight: "600", fontSize: 16 },
  compareNowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },
  compareNowActive: {
    backgroundColor: "#2979ff",
    shadowColor: "#2979ff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  compareNowText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Add compare modal
  addOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  addBox: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  searchInput: { flex: 1, marginLeft: 12, height: 40, fontSize: 16 },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  searchImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  searchName: { flex: 1, fontSize: 14, fontWeight: "500", color: "#333" },
  noResults: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
  closeSearch: { alignSelf: "flex-end", padding: 12 },
  closeText: { color: "#2979ff", fontWeight: "700", fontSize: 16 },

  // Login modal
  loginOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  loginBox: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  loginIcon: { fontSize: 56, marginBottom: 16 },
  loginTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1976ff",
    marginBottom: 8,
  },
  loginMsg: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  loginActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  loginBtn: {
    flex: 1,
    backgroundColor: "#1976ff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
    shadowColor: "#1976ff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  loginLater: {
    flex: 1,
    backgroundColor: "#f0f4fa",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  loginLaterText: { color: "#1976ff", fontWeight: "600", fontSize: 16 },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  finalPriceBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  finalPriceLabel: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    marginRight: 8,
  },
  finalPriceValue: {
    fontSize: 22,
    color: '#e53935',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

