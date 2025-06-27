import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

import BuyWithList from '../compomentCTSP/BuyWithList';
import OptionGroup from '../compomentCTSP/OptionGroup';
import ProductImage from '../compomentCTSP/ProductImage';
import ProductPriceRow from '../compomentCTSP/ProductPriceRow';
import ReviewBox from '../compomentCTSP/ReviewBox';
import { SectionLiked, SectionPopular } from '../compomentCTSP/SectionBox';
import SpecsBox from '../compomentCTSP/SpecsBox';

// Hàm gọi API để lấy chi tiết sản phẩm
const fetchProductById = async (productId) => {
  const { data: product } = await axiosInstance.get(`/product/${productId}`);

  // Xử lý TSKT:
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

  return {
    id:       product._id,
    name:     product.name,
    price:    product.price,
    oldPrice: product.price,
    images: Array.isArray(product.images) && product.images.length
      ? product.images.map((url) => ({ uri: url }))
      : [require("../assets/images/pc1.png")],
    image: product.image ? { uri: product.image } : require("../assets/images/pc1.png"),
    rating: product.rating || 4.5,
    sold:   product.sold || 0,
    origin: product.origin || "Unknown",
    specs: specsArr,
    buyWith: product.relatedProducts || product.buyWith || [],
  };
};

// Hàm gọi API để lấy danh sách sản phẩm
const fetchAllProducts = async () => {
  try {
    const { data } = await axiosInstance.get("/product");
    return (data.products || []).map((p) => ({
      id:    p._id,
      name:  p.name,
      price: p.price,
      image: p.image ? { uri: p.image } : require("../assets/images/pc1.png"),
      sold:  p.sold || 0,
    }));
  } catch {
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
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Load dữ liệu sản phẩm và danh sách
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!productId) throw new Error("Thiếu ID sản phẩm");
        const fetched = await fetchProductById(productId);
        setProduct(fetched);
        setCompareProducts([fetched]);
        setAllProducts(await fetchAllProducts());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // Load giỏ hàng
  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get("/orders");
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
    })();
  }, []);

  const filteredProducts = allProducts.filter(
    p => p.name.toLowerCase().includes(searchText.toLowerCase())
      && !compareProducts.find(item => item.id === p.id)
  );

  const handleAddCompare = p => {
    if (compareProducts.length < 3 && !compareProducts.find(item => item.id === p.id)) {
      setCompareProducts([...compareProducts, p]);
      setAddModalVisible(false);
      setSearchText('');
    }
  };
  const handleRemoveCompare = id => setCompareProducts(cp => cp.filter(p => p.id !== id));
  const handleClearCompare  = () => { setCompareProducts([]); setAddModalVisible(false); };
  const handleGoCompare     = () => {
    // Truyền dữ liệu qua params (dùng JSON.stringify)
    router.push({
      pathname: '/sosanhsanpham',
      params: {
        compare: JSON.stringify(compareProducts)
      }
    });
  };

  const addToCart = async prod => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setShowLoginDialog(true); // Hiện dialog thay vì chuyển trang luôn
        return;
      }
      const userId = JSON.parse(userStr).id;
      await axiosInstance.post('/orders/add-to-cart', { user_id: userId, productId: prod.id, quantity: 1 });
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
      setTimeout(() => router.push('./cart'), 1200);
    } catch {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#2979ff" /></View>;
  if (error)   return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Lỗi: {error}</Text>
      <TouchableOpacity onPress={() => router.replace(`/ctsp?id=${productId}`)}>
        <Text style={styles.retryButton}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
  if (!product) return <View style={styles.container}><Text style={styles.errorText}>Không tìm thấy sản phẩm</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <Feather name="share-2" size={22} color="#222" />
        </View>

        {/* Ảnh & tên */}
        <ProductImage images={product.images} />
        <Text style={styles.productName}>{product.name}</Text>
        <ProductPriceRow
          price={formatCurrency(product.price)}
          oldPrice={formatCurrency(product.oldPrice)}
          onLike={() => alert("Chuyển sang Yêu thích")}
        />

        {/* Mua kèm */}
        <BuyWithList data={product.buyWith} />

        {/* Thông số kĩ thuật */}
        <SpecsBox specs={product.specs} onCompare={() => setCompareVisible(true)} />

        {/* Tùy chọn cấu hình */}
        <View style={styles.componentBox}>
          <Text style={styles.componentTitle}>Tùy chọn cấu hình</Text>
          <OptionGroup label="CPU" options={cpuOptions} selected={selectedCpu} onSelect={setSelectedCpu} />
          <OptionGroup label="RAM" options={ramOptions} selected={selectedRam} onSelect={setSelectedRam} />
          <OptionGroup label="SSD" options={ssdOptions} selected={selectedSsd} onSelect={setSelectedSsd} />
        </View>

        {/* Review & sections */}
        <ReviewBox />
        <SectionPopular data={allProducts.slice(0,3)} />
        <SectionLiked   data={allProducts.slice(3,7)} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomCartBtn} onPress={() => router.push('./cart')}>
          <Feather name="shopping-cart" size={18} color="#1a73e8" />
          <Text style={styles.bottomCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBuyBtn} onPress={() => addToCart(product)}>
          <Text style={styles.bottomBuyText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Modal so sánh */}
      <Modal visible={compareVisible} animationType="slide" transparent onRequestClose={() => setCompareVisible(false)}>
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
                if (p) return (
                  <View style={styles.compareItem} key={p.id}>
                    <Image source={p.image} style={styles.compareImage} />
                    <TouchableOpacity style={styles.compareRemove} onPress={() => handleRemoveCompare(p.id)}>
                      <Feather name="x" size={18} color="#888" />
                    </TouchableOpacity>
                    <Text style={styles.compareName} numberOfLines={2}>{p.name}</Text>
                  </View>
                );
                return (
                  <TouchableOpacity style={styles.compareItemEmpty} key={`empty-${idx}`} onPress={() => setAddModalVisible(true)}>
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
                style={[styles.compareNowBtn, compareProducts.length>1?{backgroundColor:'#2979ff'}:{backgroundColor:'#ccc'}]}
                disabled={compareProducts.length<2}
                onPress={handleGoCompare}>
                <Text style={styles.compareNowText}>So sánh ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thêm sản phẩm */}
      <Modal visible={addModalVisible} animationType="fade" transparent onRequestClose={()=>setAddModalVisible(false)}>
        <View style={styles.addModalOverlay}>
          <View style={styles.addModalBox}>
            <Text style={styles.addModalTitle}>Tìm kiếm sản phẩm</Text>
            <View style={styles.addModalSearchBox}>
              <Feather name="search" size={18} color="#888" />
              <TextInput style={styles.addModalInput} placeholder="Nhập tên sản phẩm..."
                value={searchText} onChangeText={setSearchText} />
            </View>
            <ScrollView style={{maxHeight:250}}>
              {filteredProducts.map(p=>(
                <TouchableOpacity key={p.id} style={styles.addModalItem} onPress={()=>handleAddCompare(p)}>
                  <Image source={p.image} style={styles.addModalItemImg}/>
                  <Text numberOfLines={2} style={{flex:1}}>{p.name}</Text>
                </TouchableOpacity>
              ))}
              {filteredProducts.length===0&&<Text style={styles.addModalEmpty}>Không tìm thấy sản phẩm</Text>}
            </ScrollView>
            <TouchableOpacity style={styles.addModalCloseBtn} onPress={()=>setAddModalVisible(false)}>
              <Text>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal đăng nhập */}
      <Modal
        visible={showLoginDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginDialog(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 28,
            alignItems: 'center',
            width: 320,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5
          }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>😺</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#1976ff' }}>
              Bạn chưa đăng nhập!
            </Text>
            <Text style={{ color: '#444', textAlign: 'center', marginBottom: 18 }}>
              Hãy đăng nhập để sử dụng đầy đủ chức năng của ứng dụng nhé!
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#1976ff',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  marginRight: 8
                }}
                onPress={() => {
                  setShowLoginDialog(false);
                  router.replace('./LoginScreen');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f0f4fa',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 22
                }}
                onPress={() => setShowLoginDialog(false)}
              >
                <Text style={{ color: '#1976ff', fontWeight: 'bold' }}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff' },
  header: {
    flexDirection:'row', alignItems:'center',
    paddingHorizontal:12, paddingTop:18, paddingBottom:10,
    justifyContent:'space-between', borderBottomWidth:0.5, borderBottomColor:'#eee'
  },
  headerTitle: { flex:1, textAlign:'center', fontWeight:'bold', fontSize:18, color:'#222' },
  productName:{ fontWeight:'bold', fontSize:16, margin:12, textAlign:'center', color:'#222' },
  componentBox:{ margin:12, padding:12, backgroundColor:'#fff', borderRadius:16, elevation:2 },
  componentTitle:{ fontWeight:'bold', fontSize:15, marginBottom:12 },
  bottomBar:{
    flexDirection:'row', backgroundColor:'#fff',
    borderTopWidth:1, borderTopColor:'#ddd', height:64,
    alignItems:'center', justifyContent:'space-between',
    paddingHorizontal:14, borderTopLeftRadius:18, borderTopRightRadius:18,
    elevation:8, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, shadowOffset:{width:0,height:-2}
  },
  bottomCartBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
    backgroundColor:'#eaf3ff', borderRadius:12, paddingVertical:12, paddingHorizontal:18, marginRight:10, elevation:2 },
  bottomCartText:{ color:'#1a73e8', fontWeight:'bold', fontSize:16, marginLeft:8 },
  bottomBuyBtn:{ flex:1, backgroundColor:'#2979ff', borderRadius:12, paddingVertical:12, paddingHorizontal:28, justifyContent:'center', alignItems:'center', elevation:2 },
  bottomBuyText:{ color:'#fff', fontWeight:'bold', fontSize:16 },
  errorText:{ color:'red', fontSize:16, textAlign:'center', marginTop:20 },
  retryButton:{ color:'#2979ff', fontSize:16, textAlign:'center', marginTop:10 },
  modalOverlay:{ flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.15)' },
  bottomSheet:{ backgroundColor:'#fff', borderTopLeftRadius:18, borderTopRightRadius:18, minHeight:260 },
  bottomSheetHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, borderBottomWidth:1, borderBottomColor:'#eee' },
  bottomSheetTitle:{ fontWeight:'bold', fontSize:16 },
  compareRow:{ flexDirection:'row', padding:12, borderBottomWidth:1, borderBottomColor:'#eee', backgroundColor:'#fff' },
  compareItem:{ width:110, alignItems:'center', marginHorizontal:4, backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor:'#eee', padding:8, position:'relative' },
  compareImage:{ width:48, height:60, resizeMode:'contain', marginBottom:4 },
  compareRemove:{ position:'absolute', top:4, right:4, backgroundColor:'#fff', borderRadius:10, padding:2 },
  compareName:{ fontSize:13, color:'#222', textAlign:'center', marginTop:2 },
  compareItemEmpty:{ width:110, alignItems:'center', justifyContent:'center', marginHorizontal:4, backgroundColor:'#fafbfc', borderRadius:8, borderWidth:1, borderColor:'#ddd', padding:8, height:110 },
  compareAddText:{ fontSize:13, color:'#888', marginTop:6, textAlign:'center' },
  compareFooter:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:18, paddingVertical:10, backgroundColor:'#fff' },
  compareFooterText:{ color:'#2979ff', fontWeight:'bold', fontSize:15 },
  compareNowBtn:{ borderRadius:6, paddingVertical:8, paddingHorizontal:22 },
  compareNowText:{ color:'#fff', fontWeight:'bold', fontSize:15 },
  addModalOverlay:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.2)' },
  addModalBox:{ width:'90%', backgroundColor:'#fff', borderRadius:14, padding:18, maxHeight:400 },
  addModalTitle:{ fontWeight:'bold', fontSize:16, marginBottom:10 },
  addModalSearchBox:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#ddd', borderRadius:8, paddingHorizontal:8, marginBottom:10 },
  addModalInput:{ flex:1, height:36, marginLeft:6 },
  addModalItem:{ flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  addModalItemImg:{ width:36, height:36, borderRadius:6, marginRight:10 },
  addModalEmpty:{ textAlign:'center', marginTop:20, color:'#888' },
  addModalCloseBtn:{ marginTop:12, alignSelf:'flex-end', paddingVertical:6, paddingHorizontal:18, borderRadius:8, backgroundColor:'#eee' }
});
