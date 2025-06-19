import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

import BuyWithList from '../compomentCTSP/BuyWithList';
import DeliveryBox from '../compomentCTSP/DeliveryBox';
import OptionGroup from '../compomentCTSP/OptionGroup';
import ProductImage from '../compomentCTSP/ProductImage';
import ProductPriceRow from '../compomentCTSP/ProductPriceRow';
import ReviewBox from '../compomentCTSP/ReviewBox';
import { SectionLiked, SectionPopular } from '../compomentCTSP/SectionBox';
import SpecsBox from '../compomentCTSP/SpecsBox';

// Hàm gọi API để lấy chi tiết sản phẩm
const fetchProductById = async (productId) => {
  const response = await axiosInstance.get(`/product/${productId}`);
  const product = response.data;

  return {
    id: product._id,
    name: product.name || product.productName || 'Unknown Product',
    price: product.price || product.currentPrice || 0,
    oldPrice: product.oldPrice || product.originalPrice || product.price || 0,
    // Lấy mảng ảnh, nếu không có thì trả về ảnh mặc định
    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(url => ({ uri: url }))
      : [require("../assets/images/pc1.png")],
    // Nếu cần ảnh đại diện:
    image: product.image
      ? { uri: product.image }
      : require("../assets/images/pc1.png"),
    // ... các trường khác giữ nguyên ...
    rating: product.rating || 4.5,
    sold: product.sold || 0,
    origin: product.origin || 'Unknown',
    delivery: product.delivery || [
      { type: 'Tiêu chuẩn', time: 'từ 5 - 7 ngày', price: 42000 },
      { type: 'Nhanh', time: 'từ 1 - 2 ngày', price: 22000 },
    ],
    specs: product.specs || [
      { label: 'Xuất xứ', value: product.origin || 'Unknown' },
    ],
    buyWith: product.relatedProducts || product.buyWith || [],
  };
};


// Hàm gọi API để lấy danh sách sản phẩm
const fetchAllProducts = async () => {
  try {
    const response = await axiosInstance.get('/product'); // Đổi từ /products sang /product
    return response.data.map(product => ({
      id: product._id,
      name: product.name || product.productName || 'Unknown Product',
      price: product.price || product.currentPrice || 0,
      image: typeof product.image === "string" && product.image
        ? { uri: product.image }
        : require("../assets/images/pc1.png"),
      sold: product.sold || 0,
    }));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    return [];
  }
};

const cpuOptions = [
  'i5 12400F + Tán nhiệt khí',
  'i5 12400F + Tán nước AIO 240',
  'i5 13400F + Tán nhiệt khí',
  'i5 13400F + Tán nước AIO 240',
  'i5 12600KF + Tán nhiệt khí',
  'i5 12600KF + Tán nước AIO 240',
  'i5 14500 + Tán nhiệt khí',
  'i5 14500 + Tán nước AIO 240'
];
const ramOptions = ['Ram 16GB', 'Ram 32GB'];
const ssdOptions = ['SSD 512GB', 'SSD 1TB'];

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function CTSP() {
  const [deliveryType, setDeliveryType] = useState('Tiêu chuẩn');
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();
  const [compareVisible, setCompareVisible] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState(cpuOptions[0]);
  const [selectedRam, setSelectedRam] = useState(ramOptions[0]);
  const [selectedSsd, setSelectedSsd] = useState(ssdOptions[0]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!productId) {
          throw new Error('Không có ID sản phẩm');
        }

        // Tải chi tiết sản phẩm
        const fetchedProduct = await fetchProductById(productId);
        if (!fetchedProduct) {
          throw new Error('Không tìm thấy sản phẩm');
        }

        // Log dữ liệu ảnh để debug
        console.log("Ảnh sản phẩm chính:", fetchedProduct.images);

        setProduct(fetchedProduct);
        setDeliveryType(fetchedProduct.delivery?.[0]?.type || 'Tiêu chuẩn');
        setCompareProducts([fetchedProduct]);

        // Tải danh sách sản phẩm
        const products = await fetchAllProducts();
        setAllProducts(products);
      } catch (err) {
        console.error('Load data error:', err);
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  useEffect(() => {
    const fetchCart = async () => {
      const res = await axiosInstance.get("/oders");
      // Xử lý dữ liệu như bạn đã làm:
      const cartItems = res.data.flatMap(order =>
        (order.products || []).map(item => ({
          id: item.productId?._id || item.productId,
          name: item.productId?.name || "Không có tên",
          price: item.productId?.price ?? 0,
          image: item.productId?.image
            ? { uri: item.productId.image }
            : require("../assets/images/pc1.png"),
          quantity: item.quantity ?? 1,
        }))
      );
      setCart(cartItems);
    };

    fetchCart();
  }, []);

  const filteredProducts = allProducts.filter(
    (p) => p.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !compareProducts.find(item => item.id === p.id)
  );

  const handleAddCompare = (p) => {
    if (compareProducts.length < 3 && !compareProducts.find(item => item.id === p.id)) {
      setCompareProducts([...compareProducts, p]);
      setAddModalVisible(false);
      setSearchText('');
    }
  };

  const handleRemoveCompare = (id) => {
    setCompareProducts(compareProducts.filter(p => p.id !== id));
  };

  const handleClearCompare = () => {
    setCompareProducts([]);
    setAddModalVisible(false);
  };

  const handleGoCompare = () => {
    router.push('/sosanhsanpham');
  };
  

  const addToCart = async (product) => {
    try {
      await axiosInstance.post('/oders/add-to-cart', {
        productId: product.id,
        quantity: 1
      });
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào giỏ hàng!',
        text2: 'Bạn có thể kiểm tra trong giỏ hàng.',
        position: 'bottom',
        visibilityTime: 1200, // Giảm thời gian để chuyển trang nhanh hơn
      });
      setTimeout(() => {
        router.push('./cart');
      }, 1200); // Chờ toast hiện xong rồi chuyển trang
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi thêm vào giỏ hàng!',
        text2: 'Vui lòng thử lại.',
        position: 'top',
        visibilityTime: 1800,
      });
      console.error(err);
    }
  };

  const handleQuantity = async (id, delta) => {
    try {
      const product = cart.find(item => item.id === id);
      if (!product) return;
      const newQuantity = Math.max(1, product.quantity + delta);
      await axiosInstance.put(`/orders/update-quantity`, {
        productId: id,
        quantity: newQuantity
      });
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      alert("Có lỗi khi cập nhật số lượng sản phẩm");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity onPress={() => loadData()}>
          <Text style={styles.retryButton}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <Feather name="share-2" size={22} color="#222" />
        </View>

        <ProductImage images={product.images} />
        <Text style={styles.productName}>{product.name}</Text>
        <ProductPriceRow
          price={formatCurrency(product.price)}
          oldPrice={formatCurrency(product.oldPrice)}
          onLike={() => alert('Chuyển sang trang yêu thích!')}
        />
        <BuyWithList data={product.buyWith} />
        <SpecsBox specs={product.specs} onCompare={() => setCompareVisible(true)} />
        <View style={styles.componentBox}>
          <Text style={styles.componentTitle}>Tùy chọn cấu hình</Text>
          <OptionGroup label="CPU" options={cpuOptions} selected={selectedCpu} onSelect={setSelectedCpu} />
          <OptionGroup label="RAM" options={ramOptions} selected={selectedRam} onSelect={setSelectedRam} />
          <OptionGroup label="SSD" options={ssdOptions} selected={selectedSsd} onSelect={setSelectedSsd} />
        </View>
        <DeliveryBox
          delivery={product.delivery}
          deliveryType={deliveryType}
          onSelect={setDeliveryType}
          formatCurrency={formatCurrency}
        />
        <ReviewBox />
        <SectionPopular data={allProducts.slice(0, 3)} />
        <SectionLiked data={allProducts.slice(3, 7)} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomCartBtn} onPress={() => router.push('./cart')}>
          <Feather name="shopping-cart" size={18} color="#1a73e8" />
          <Text style={styles.bottomCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBuyBtn} onPress={() => addToCart(product)}>
          <Text style={styles.bottomBuyText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Modal so sánh sản phẩm */}
      <Modal
        visible={compareVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCompareVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>So sánh sản phẩm</Text>
              <TouchableOpacity onPress={() => setCompareVisible(false)}>
                <Feather name="x" size={22} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={styles.compareRow}>
              {Array.from({ length: 3 }).map((_, idx) => {
                const p = compareProducts[idx];
                if (p) {
                  return (
                    <View style={styles.compareItem} key={p.id}>
                      <Image source={{ uri: p.image }} style={styles.compareImage} />
                      <TouchableOpacity style={styles.compareRemove} onPress={() => handleRemoveCompare(p.id)}>
                        <Feather name="x" size={18} color="#888" />
                      </TouchableOpacity>
                      <Text style={styles.compareName} numberOfLines={2}>{p.name}</Text>
                    </View>
                  );
                }
                return (
                  <TouchableOpacity
                    style={styles.compareItemEmpty}
                    key={'empty-' + idx}
                    onPress={() => setAddModalVisible(true)}
                  >
                    <Feather name="plus" size={32} color="#bbb" />
                    <Text style={styles.compareAddText}>Thêm sản phẩm</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.compareFooter}>
              <TouchableOpacity onPress={handleClearCompare}>
                <Text style={styles.compareFooterText}>Xóa tất cả sản phẩm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.compareNowBtn,
                  compareProducts.length > 1
                    ? { backgroundColor: '#2979ff' }
                    : { backgroundColor: '#ccc' }
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

      {/* Modal thêm sản phẩm */}
      <Modal
        visible={addModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addModalOverlay}>
          <View style={styles.addModalBox}>
            <Text style={styles.addModalTitle}>Tìm kiếm sản phẩm</Text>
            <View style={styles.addModalSearchBox}>
              <Feather name="search" size={18} color="#888" />
              <TextInput
                style={styles.addModalInput}
                placeholder="Nhập tên sản phẩm..."
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <ScrollView style={{ maxHeight: 250 }}>
              {filteredProducts.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.addModalItem}
                  onPress={() => handleAddCompare(p)}
                >
                  <Image
                    source={
                      typeof p.image === "string"
                        ? { uri: p.image }
                        : p.image // nếu đã là require(...)
                    }
                    style={styles.addModalItemImg}
                  />
                  <Text numberOfLines={2} style={{ flex: 1 }}>{p.name}</Text>
                </TouchableOpacity>
              ))}
              {filteredProducts.length === 0 && (
                <Text style={styles.addModalEmpty}>Không tìm thấy sản phẩm</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.addModalCloseBtn}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={{ color: '#222' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  componentBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  componentTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  bottomCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf3ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    elevation: 2,
  },
  bottomCartText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomBuyBtn: {
    backgroundColor: '#2979ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    elevation: 2,
  },
  bottomBuyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 260,
    paddingBottom: 0,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  compareItem: {
    width: 110,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    position: 'relative',
  },
  compareImage: {
    width: 48,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  compareRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  compareName: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
    marginTop: 2,
  },
  compareItemEmpty: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fafbfc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    height: 110,
  },
  compareAddText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  compareFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  compareFooterText: {
    color: '#2979ff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  compareNowBtn: {
    backgroundColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  compareNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    maxHeight: 400,
  },
  addModalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  addModalSearchBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  addModalInput: {
    flex: 1,
    height: 36,
    marginLeft: 6,
  },
  addModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addModalItemImg: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 10,
  },
  addModalEmpty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  addModalCloseBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    color: '#2979ff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});