import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { useWishlist } from "../context/WishlistContext";
import axiosInstance from "../utils/AxiosInstance";
import SkeletonCart from "./SkeletonCart";
import CartAddressModal from "../compomentCart/CartAddressModal";
import CartEmpty from "../compomentCart/CartEmpty";
import CartProductList from "../compomentCart/CartProductList";
import CartTotalBar from "../compomentCart/CartTotalBar";
import CartWishlist from "../compomentCart/CartWishlist";
import PayVoucherModal from "../compomentPay/PayVoucherModal";
const base = axiosInstance.defaults.baseURL;
const { width } = Dimensions.get("window");
const defaultAddresses = [
  {
    id: 1,
    text: "11 đường Nguyễn Thị A Phường Đông Hưng Thuận Quận 12 Thành Phố Hồ Chí Minh",
    isDefault: true,
  },
];
const resolveImageUri = (img) =>
  img?.startsWith("http") ? img : `${base}${img}`;


function formatCurrency(num) {
  if (typeof num !== "number" || isNaN(num)) return "0 đ";
  return num.toLocaleString("vi-VN") + " đ";
}

export default function CartScreen() {
  const [userId, setUserId] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false); // Thêm state này
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState(defaultAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [editAddressId, setEditAddressId] = useState(null);
  const [editAddressText, setEditAddressText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const router = useRouter();
  const { wishlist } = useWishlist();
  const params = useLocalSearchParams();
  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);

  // Load user ID
  useEffect(() => {
    AsyncStorage.getItem("user").then((data) => {
      if (data) {
        const user = JSON.parse(data);
        const uid = user.id || user._id;
        setUserId(uid);
        console.log('CartScreen userId:', uid);
      }
    });
  }, []);

  // Kiểm tra đăng nhập
  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (!token) {
        setShowLoginDialog(true);
        setLoading(false);
        return;
      }
      AsyncStorage.getItem("user").then((userStr) => {
        if (!userStr || userStr === "undefined") {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        let stored;
        try {
          stored = JSON.parse(userStr);
        } catch (e) {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        const userId = stored.id || stored._id;
        if (!userId) {
          setShowLoginDialog(true);
          setLoading(false); // Thêm dòng này
          return;
        }
        setUserId(userId);
        setShowLoginDialog(false);
      });
    });
  }, []);

  // Fetch cart (pending order only)
  const fetchCart = useCallback(async () => {
    if (!userId) {
      console.log('No userId, skipping cart fetch');
      setLoading(false);
      return;
    }

    console.log('Fetching cart for userId:', userId);
    console.log('Base URL:', base);
    setLoading(true);

    try {
      const requestUrl = `/cartt/user/${userId}`;
      console.log('Making request to:', requestUrl);

      const res = await axiosInstance.get(requestUrl);
      console.log('Response status:', res.status);
      console.log('Response data:', res.data);

      const products = Array.isArray(res.data.products) ? res.data.products : [];
      console.log("Fetched cart items count:", products.length);

      // 🆕 Xử lý cả product và combo items
      const items = [];

      for (const item of products) {
        // Xử lý regular products
        if (item.productId && typeof item.productId === "object") {
          const variant = item.variant || {};
          const basePrice = item.productId.price || 0;
          const priceDiff = variant.priceDiff || 0;
          const displayPrice = basePrice + priceDiff;

          // xử lý ảnh
          let imageUri = require("../assets/images/pc1.png");
          const img = item.productId.image;
          if (img) {
            if (typeof img === "string") {
              imageUri = { uri: resolveImageUri(img) };
            }
            else if (Array.isArray(img) && img.length > 0) {
              imageUri = { uri: `${base}${img[0]}` };
            } else if (img.uri) {
              const raw = img.uri;
              imageUri = { uri: raw.startsWith("http") ? raw : `${base}${raw}` };
            }
          }

          items.push({
            id: item.productId._id,
            name: item.productId.name || "Không có tên",
            price: displayPrice,
            originalPrice: item.productId.originalPrice,
            discount: item.productId.discount,
            stock: item.productId.stock ?? 0,
            image: imageUri,
            quantity: item.quantity ?? 1,
            variant,
            type: 'product' // 🆕 Thêm type để phân biệt
          });
        }

        // 🆕 Xử lý combo items
        else if (item.comboId) {
          try {
            // Fetch combo details
            const comboRes = await axiosInstance.get(`/combo/${item.comboId}`);
            const combo = comboRes.data;

            if (combo) {
              let imageUri = require("../assets/images/pc1.png");

              // Xử lý ảnh combo
              if (combo.image) {
                if (typeof combo.image === "string") {
                  imageUri = { uri: combo.image.startsWith("http") ? combo.image : `${base}${combo.image}` };
                }
              } else if (combo.productIds && combo.productIds.length > 0 && combo.productIds[0].image) {
                const firstProductImage = combo.productIds[0].image;
                imageUri = { uri: firstProductImage.startsWith("http") ? firstProductImage : `${base}${firstProductImage}` };
              }

              items.push({
                id: `combo_${item.comboId}`, // 🆕 Unique ID for combo
                comboId: item.comboId, // 🆕 Keep original comboId
                name: `🎁 ${combo.name}` || "Combo không có tên",
                price: item.price || combo.price || 0,
                originalPrice: combo.originalPrice,
                discount: combo.discount,
                stock: 99, // Combos usually don't have stock limit
                image: imageUri,
                quantity: item.quantity ?? 1,
                variant: item.variant || {},
                type: 'combo', // 🆕 Mark as combo
                productCount: combo.productIds ? combo.productIds.length : 0 // 🆕 Show product count
              });
            }
          } catch (comboErr) {
            console.error('Error fetching combo details:', comboErr);
            // Fallback: add basic combo info
            items.push({
              id: `combo_${item.comboId}`,
              comboId: item.comboId,
              name: "🎁 Combo sản phẩm",
              price: item.price || 0,
              stock: 99,
              image: require("../assets/images/pc1.png"),
              quantity: item.quantity ?? 1,
              variant: item.variant || {},
              type: 'combo'
            });
          }
        } else {
          console.log('Filtered out item with invalid productId/comboId:', item);
        }
      }

      console.log('Final mapped items:', items.length);
      setCart(items);
    } catch (err) {
      console.error("Detailed error when fetching cart:");
      console.error("Error message:", err.message);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);

      setCart([]);

      Toast.show({
        type: "error",
        text1: "Không thể tải giỏ hàng",
        text2: err.response?.data?.error || err.message,
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, base]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchCart();
    }, [fetchCart, userId])
  );

  // Change quantity
  const handleQuantity = async (id, delta) => {
    const prod = cart.find((item) => item.id === id);
    if (!prod) return;

    const newQty = Math.max(1, prod.quantity + delta);

    // Optimistic update
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );

    try {
      if (prod.type === 'combo') {
        await axiosInstance.put("/cartt/update-quantity", {
          user_id: userId,
          comboId: prod.comboId,
          quantity: newQty
        });
      } else {
        await axiosInstance.put("/cartt/update-quantity", {
          user_id: userId,
          productId: prod.id,
          variant: prod.variant,
          quantity: newQty
        });
      }
      // Không cần fetchCart() ở đây nữa
    } catch (err) {
      // Nếu lỗi, rollback lại số lượng cũ và báo lỗi
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: prod.quantity } : item
        )
      );
      console.error("Lỗi khi cập nhật số lượng:", err);
      Toast.show({
        type: "error",
        text1: "Có lỗi khi cập nhật số lượng sản phẩm",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/vouchers");
        setVoucherList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi khi lấy voucher:", err);
      }
    })();
  }, []);

  // Remove product
  const handleRemove = async (id) => {
    const prod = cart.find((item) => item.id === id);
    if (!prod) return;

    try {
      if (prod.type === 'combo') {
        // Remove combo
        await axiosInstance.delete("/cartt/remove-combo", {
          data: {
            user_id: userId,
            comboId: prod.comboId
          }
        });
      } else {
        // Remove product
        await axiosInstance.delete("/cartt/remove-product", {
          data: {
            user_id: userId,
            productId: prod.id,
            variant: prod.variant
          }
        });
      }
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      Toast.show({
        type: "error",
        text1: "Có lỗi khi xóa sản phẩm khỏi giỏ hàng",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  // Remove selected products
  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          axiosInstance.delete(`/cartt/remove-product/${userId}/${id}`)
        )
      );
      setCart((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Có lỗi khi xóa sản phẩm đã chọn",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  // Compute total
  const selectedProducts = cart.filter(item => selectedIds.includes(item.id));

  // 2) Tính tổng tiền của các món được chọn
  const selectedTotal = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 3) Tính discount dựa trên selectedTotal
  let discount = 0;
  if (selectedVoucher) {
    const dv = selectedVoucher.discount_value;
    // nếu discount_value < 100, coi như %; còn lại coi như tiền cố định
    if (dv > 0 && dv < 100) {
      discount = Math.round((selectedTotal * dv) / 100);
    } else {
      discount = dv;
    }
  }

  // 4) Tổng cuối cùng = selectedTotal – discount
  const finalTotal = Math.max(0, selectedTotal - discount);
  // Thêm hàm này sau hàm handleQuantity
  const handleQuantityInput = async (id, newQuantity) => {
    const prod = cart.find((item) => item.id === id);
    if (!prod) return;

    // Kiểm tra với stock từ server (giả sử bạn có thông tin stock)
    // Nếu không có stock info, có thể set max là 99
    const maxStock = prod.stock || 99;

    if (newQuantity > maxStock) {
      Toast.show({
        type: "error",
        text1: "Số lượng vượt quá kho",
        text2: `Sản phẩm này chỉ còn ${maxStock} trong kho`,
        position: "top",
        visibilityTime: 3000,
      });

      // Reset về số lượng tối đa có thể
      try {
        if (prod.type === 'combo') {
          await axiosInstance.put("/cartt/update-quantity", {
            user_id: userId,
            comboId: prod.comboId,
            quantity: maxStock,
          });
        } else {
          await axiosInstance.put("/cartt/update-quantity", {
            user_id: userId,
            productId: prod.id,
            quantity: maxStock,
          });
        }
        await fetchCart();
      } catch (err) {
        console.error("Lỗi khi cập nhật số lượng:", err);
      }
      return;
    }

    // Cập nhật số lượng bình thường
    try {
      if (prod.type === 'combo') {
        await axiosInstance.put("/cartt/update-quantity", {
          user_id: userId,
          comboId: prod.comboId,
          quantity: Math.max(1, newQuantity),
        });
      } else {
        await axiosInstance.put("/cartt/update-quantity", {
          user_id: userId,
          productId: prod.id,
          quantity: Math.max(1, newQuantity),
        });
      }
      await fetchCart();
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
      Toast.show({
        type: "error",
        text1: "Có lỗi khi cập nhật số lượng sản phẩm",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };
  // danh sách sản phẩm đã chọn
  const isEmpty = cart.length === 0;
  const isNothingSelected = selectedProducts.length === 0;

  // Address handlers (unchanged)
  const handleSelectAddress = (id) => {
    /* ... */
  };
  const handleAddAddress = () => {
    /* ... */
  };
  const handleDeleteAddress = (id) => {
    /* ... */
  };
  const handleEditAddress = (id, text) => {
    /* ... */
  };
  const handleSaveEditAddress = () => {
    /* ... */
  };
  const selectedAddress = addresses.find((addr) => addr.isDefault);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === cart.length) setSelectedIds([]);
    else setSelectedIds(cart.map((item) => item.id));
  };

  // Đặt showLoginDialog lên trên loading
  if (showLoginDialog) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>😺</Text>
            <Text style={styles.modalTitle}>Bạn chưa đăng nhập!</Text>
            <Text style={styles.modalMessage}>
              Hãy đăng nhập để sử dụng đầy đủ chức năng của ứng dụng nhé!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => {
                  setShowLoginDialog(false);
                  router.replace("./LoginScreen");
                }}
              >
                <Text style={styles.btnTextWhite}>Đăng nhập ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  setShowLoginDialog(false);
                  setLoading(false); // Đảm bảo không bị loading
                  router.replace("/HomeScreen"); // Chuyển về trang home
                }}
              >
                <Text style={styles.btnTextPrimary}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (loading) {
  return <SkeletonCart />;
}

  // Xử lý nhấn vào sản phẩm
  const handleProductPress = (item) => {
    // Nếu là combo thì không chuyển, chỉ chuyển với sản phẩm thường
    if (item.type === 'product' && item.id) {
      router.push(`/ctsp?id=${item.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <TouchableOpacity
          style={{ marginLeft: 8, padding: 4 }}
          onPress={handleRemoveSelected}
          disabled={selectedIds.length === 0}
        >
          <Feather
            name="trash-2"
            size={22}
            color={selectedIds.length === 0 ? "#ccc" : "#ff4d4f"}
          />
        </TouchableOpacity>
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{cart.length}</Text>
        </View>
      </View>

     
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >

        {!isEmpty ? (
          <CartProductList
            cart={cart}
            onRemove={handleRemove}
            onQuantity={handleQuantity}
            onQuantityInput={handleQuantityInput}
            formatCurrency={formatCurrency}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onProductPress={handleProductPress} // 🆕 truyền prop này
          />
        ) : (
          <CartEmpty />
        )}

        <CartWishlist wishlist={wishlist} formatCurrency={formatCurrency} />
      </ScrollView>

      <CartTotalBar
        total={finalTotal}
        formatCurrency={formatCurrency}
        selectedIds={selectedIds}
        discount={discount}
        allSelected={selectedIds.length === cart.length}
        onToggleSelectAll={selectAll}
        onCheckout={() => {
          const selectedProducts = cart.filter((item) =>
            selectedIds.includes(item.id)
          );
          if (selectedProducts.length === 0) {
            Toast.show({
              type: "error",
              text1: "Vui lòng chọn sản phẩm để thanh toán!",
              position: "top",
              visibilityTime: 2000,
            });
            return;
          }
          router.push({
            pathname: "./pay",
            params: {
              selectedProducts: JSON.stringify(selectedProducts),
              selectedVoucher: JSON.stringify(selectedVoucher),
            },
          });
        }}

        onShowVoucher={() => setShowVoucher(true)}
        onClearVoucher={() => setSelectedVoucher(null)}
        disabled={isNothingSelected}

      />
      {/* Voucher modal vẫn để trong CartScreen */}
      <PayVoucherModal
        visible={showVoucher}
        vouchers={voucherList}
        selectedVoucher={selectedVoucher}
        setSelectedVoucher={setSelectedVoucher}
        setShowVoucher={setShowVoucher}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafbff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#f5f6fa",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#222",
    flex: 1,
    marginLeft: 8,
  },
  cartCount: {
    backgroundColor: "#2979ff",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  cartCountText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#222",
  },
  selectAllCount: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#888",
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addressLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
  },
  addressEditBtn: {
    backgroundColor: "#eaf3ff",
    borderRadius: 16,
    padding: 6,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: 350,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  modalMessage: {
    color: "#444",
    textAlign: "center",
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    gap: 8, // nếu không hỗ trợ gap thì dùng marginHorizontal cho btn
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#2979ff" },
  btnSecondary: { backgroundColor: "#f0f4fa" },
  btnTextWhite: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnTextPrimary: { color: "#2979ff", fontWeight: "bold", fontSize: 16 },
});
