import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useWishlist } from '../context/WishlistContext';
import axiosInstance from '../utils/AxiosInstance';

import CartAddressModal from '../compomentCart/CartAddressModal';
import CartEmpty from '../compomentCart/CartEmpty';
import CartProductList from '../compomentCart/CartProductList';
import CartTotalBar from '../compomentCart/CartTotalBar';
import CartWishlist from '../compomentCart/CartWishlist';

const { width } = Dimensions.get('window');
const defaultAddresses = [
  {
    id: 1,
    text: '11 đường Nguyễn Thị A Phường Đông Hưng Thuận Quận 12 Thành Phố Hồ Chí Minh',
    isDefault: true,
  },
];

function formatCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0 đ';
  return num.toLocaleString('vi-VN') + ' đ';
}

export default function CartScreen() {
  const [userId, setUserId] = useState(null);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState(defaultAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editAddressId, setEditAddressId] = useState(null);
  const [editAddressText, setEditAddressText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const router = useRouter();
  const { wishlist } = useWishlist();
  const params = useLocalSearchParams();

  // Load user ID
  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) {
        const user = JSON.parse(data);
        setUserId(user.id || user._id);
      }
    });
  }, []);

  // Fetch cart (pending order only)
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/orders/user/${userId}`);
      const orders = Array.isArray(res.data) ? res.data : [];
      const pending = orders.find(o => o.status === 'pending') || { products: [] };
      const items = (pending.products || []).map(item => ({
        id: item.productId._id,
        name: item.productId.name || 'Không có tên',
        price: item.productId.price ?? 0,
        image: item.productId.image
          ? { uri: item.productId.image }
          : require('../assets/images/pc1.png'),
        quantity: item.quantity ?? 1,
      }));
      setCart(items);
    } catch (err) {
      console.error('Lỗi khi lấy giỏ hàng:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  // Change quantity
  const handleQuantity = async (id, delta) => {
    const prod = cart.find(item => item.id === id);
    if (!prod) return;
    const newQty = Math.max(1, prod.quantity + delta);
    try {
      const res = await axiosInstance.put('/orders/update-quantity', {
        user_id: userId,
        productId: id,
        quantity: newQty,
      });
      const updated = res.data.products || [];
      const items = updated.map(item => ({
        id: item.productId._id,
        name: item.productId.name || 'Không có tên',
        price: item.productId.price ?? 0,
        image: item.productId.image
          ? { uri: item.productId.image }
          : require('../assets/images/pc1.png'),
        quantity: item.quantity ?? 1,
      }));
      setCart(items);
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi cập nhật số lượng sản phẩm',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // Remove product
  const handleRemove = async id => {
    try {
      await axiosInstance.delete(`/orders/remove-product/${userId}/${id}`);
      setCart(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi xóa sản phẩm khỏi giỏ hàng',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // Remove selected products
  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map(id =>
          axiosInstance.delete(`/orders/remove-product/${userId}/${id}`)
        )
      );
      setCart(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi xóa sản phẩm đã chọn',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // Compute total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = cart.length === 0;

  // Address handlers (unchanged)
  const handleSelectAddress = id => { /* ... */ };
  const handleAddAddress = () => { /* ... */ };
  const handleDeleteAddress = id => { /* ... */ };
  const handleEditAddress = (id, text) => { /* ... */ };
  const handleSaveEditAddress = () => { /* ... */ };
  const selectedAddress = addresses.find(addr => addr.isDefault);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === cart.length) setSelectedIds([]);
    else setSelectedIds(cart.map(item => item.id));
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <TouchableOpacity
          style={{ marginLeft: 8, padding: 4 }}
          onPress={handleRemoveSelected}
          disabled={selectedIds.length === 0}
        >
          <Feather name="trash-2" size={22} color={selectedIds.length === 0 ? "#ccc" : "#ff4d4f"} />
        </TouchableOpacity>
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{cart.length}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressBox}>{/* ... */}</View>
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
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        ) : (
          <CartEmpty />
        )}

        <CartWishlist wishlist={wishlist} formatCurrency={formatCurrency} />
      </ScrollView>

      <CartTotalBar
        total={total}
        formatCurrency={formatCurrency}
        onCheckout={() => {
          const selectedProducts = cart.filter(item => selectedIds.includes(item.id));
          if (selectedProducts.length === 0) {
            Toast.show({
              type: 'error',
              text1: 'Vui lòng chọn sản phẩm để thanh toán!',
              position: 'top',
              visibilityTime: 2000,
            });
            return;
          }
          router.push({
            pathname: './pay',
            params: {
              selectedProducts: JSON.stringify(selectedProducts)
            }
          });
        }}
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