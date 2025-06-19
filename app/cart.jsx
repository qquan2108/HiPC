import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import axiosInstance from "../utils/AxiosInstance";
import { useWishlist } from "../context/WishlistContext";

import CartAddressModal from "../compomentCart/CartAddressModal";
import CartEmpty from "../compomentCart/CartEmpty";
import CartProductList from "../compomentCart/CartProductList";
import CartTotalBar from "../compomentCart/CartTotalBar";
import CartWishlist from "../compomentCart/CartWishlist";

const { width } = Dimensions.get("window");

const defaultAddresses = [
  {
    id: 1,
    text: "11 đường Nguyễn Thị A Phường Đông Hưng Thuận Quận 12 Thành Phố Hồ Chí Minh",
    isDefault: true,
  },
];

function formatCurrency(num) {
  if (typeof num !== "number" || isNaN(num)) return "0 đ";
  return num.toLocaleString("vi-VN") + " đ";
}

export default function CartScreen() {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState(defaultAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [editAddressId, setEditAddressId] = useState(null);
  const [editAddressText, setEditAddressText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { wishlist } = useWishlist();

  // Hàm fetch giỏ hàng từ API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/oders"); // Đổi từ "/oders" sang "/orders"
      
      if (res.data && Array.isArray(res.data)) {
        // Xử lý dữ liệu từ API
        const cartItems = res.data.flatMap(order => 
          (order.products || []).map(item => ({
            id: item.productId?._id || item.productId,
            name: item.productId?.name || "Không có tên",
            price: item.productId?.price ?? 0,
            image: item.productId?.image
              ? { uri: item.productId.image }
              : require("../assets/images/pc1.png"),
            quantity: item.quantity ?? 1,
            productId: item.productId?._id || item.productId // Thêm trường productId để dễ thao tác
          }))
        );
        setCart(cartItems);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng useFocusEffect để load lại giỏ hàng mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  // Hàm xử lý thay đổi số lượng sản phẩm
  const handleQuantity = async (id, delta) => {
    try {
      // Tìm sản phẩm trong giỏ hàng
      const product = cart.find(item => item.id === id);
      if (!product) return;

      const newQuantity = Math.max(1, product.quantity + delta);

      // Gọi API cập nhật số lượng
      const res = await axiosInstance.put('/oders/update-quantity', {
        productId: id,
        quantity: newQuantity
      });

      // Kiểm tra phản hồi từ backend
      if (res.data && res.data.products) {
        // Cập nhật lại cart từ dữ liệu mới nhất của order
        const updatedCart = res.data.products.map(item => ({
          id: item.productId?._id || item.productId,
          name: item.productId?.name || "Không có tên",
          price: item.productId?.price ?? 0,
          image: item.productId?.image
            ? { uri: item.productId.image }
            : require("../assets/images/pc1.png"),
          quantity: item.quantity ?? 1,
          productId: item.productId?._id || item.productId
        }));
        setCart(updatedCart);
      } else {
        // Nếu không có dữ liệu mới, cập nhật UI tạm thời
        setCart(cart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (err) {
      // Log chi tiết lỗi để debug
      if (err.response) {
        console.error("Lỗi khi cập nhật số lượng:", err.response.data);
        alert("Có lỗi khi cập nhật số lượng sản phẩm: " + (err.response.data?.error || ""));
      } else {
        console.error("Lỗi khi cập nhật số lượng:", err);
        alert("Có lỗi khi cập nhật số lượng sản phẩm");
      }
    }
  };
  

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleRemove = async (id) => {
    try {
      // Gọi API xóa sản phẩm
      await axiosInstance.delete(`/oders/remove-product/${id}`);
      
      // Cập nhật UI nếu API thành công
      setCart(cart.filter(item => item.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert("Có lỗi khi xóa sản phẩm khỏi giỏ hàng");
    }
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = cart.length === 0;

  // Logic xử lý địa chỉ (giữ nguyên)
  const handleSelectAddress = (id) => {
    setAddresses(addrs =>
      addrs.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setShowAddressModal(false);
  };

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setAddresses(addrs => [
        ...addrs,
        { id: Date.now(), text: newAddress.trim(), isDefault: false },
      ]);
      setNewAddress("");
    }
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addrs => {
      let filtered = addrs.filter(addr => addr.id !== id);
      if (!filtered.some(addr => addr.isDefault) && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleEditAddress = (id, text) => {
    setEditAddressId(id);
    setEditAddressText(text);
  };

  const handleSaveEditAddress = () => {
    setAddresses(addrs =>
      addrs.map(addr =>
        addr.id === editAddressId ? { ...addr, text: editAddressText } : addr
      )
    );
    setEditAddressId(null);
    setEditAddressText("");
  };

  const selectedAddress = addresses.find(addr => addr.isDefault);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{cart.length}</Text>
        </View>
      </View>

      {/* Địa chỉ nhận hàng */}
      <View style={styles.addressBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.addressLabel}>Địa chỉ nhận hàng</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {selectedAddress ? selectedAddress.text : "Chưa có địa chỉ"}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addressEditBtn} 
          onPress={() => setShowAddressModal(true)}
        >
          <Feather name="edit-2" size={18} color="#2979ff" />
        </TouchableOpacity>
      </View>

      {/* Modal địa chỉ */}
      <CartAddressModal
        visible={showAddressModal}
        addresses={addresses}
        editAddressId={editAddressId}
        editAddressText={editAddressText}
        newAddress={newAddress}
        setShowAddressModal={setShowAddressModal}
        setEditAddressText={setEditAddressText}
        handleSelectAddress={handleSelectAddress}
        handleEditAddress={handleEditAddress}
        handleDeleteAddress={handleDeleteAddress}
        handleSaveEditAddress={handleSaveEditAddress}
        setNewAddress={setNewAddress}
        handleAddAddress={handleAddAddress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {!isEmpty ? (
          <CartProductList
            cart={cart}
            onRemove={handleRemove}
            onQuantity={handleQuantity}
            formatCurrency={formatCurrency}
          />
        ) : (
          <CartEmpty />
        )}

        <CartWishlist wishlist={wishlist} formatCurrency={formatCurrency} />
      </ScrollView>

      {/* Tổng tiền + Thanh toán */}
      <CartTotalBar
        total={total}
        formatCurrency={formatCurrency}
        onCheckout={() => router.push("./pay")}
        disabled={isEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fafbff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
});