// screens/DanhMucPCScreen.js
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image, Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomTabBar from '../compomentHome/CustomTabBar';
import axios from '../utils/AxiosInstance';

const { width } = Dimensions.get('window');
const LEFT_WIDTH = 80;
const RIGHT_WIDTH = width - LEFT_WIDTH;

export default function DanhMucPCScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null); // Thêm state chọn hãng
  const [selectedPrice, setSelectedPrice] = useState(null); // Thêm state chọn giá
  const router = useRouter();

  // Kiểm tra đăng nhập
  // useEffect(() => {
  //   AsyncStorage.getItem("token").then((token) => {
  //     if (!token) {
  //       setShowLoginDialog(true);
  //       setLoading(false);
  //       return;
  //     }
  //     AsyncStorage.getItem("user").then((userStr) => {
  //       if (!userStr || userStr === "undefined") {
  //         setShowLoginDialog(true);
  //         setLoading(false);
  //         return;
  //       }
  //       let stored;
  //       try {
  //         stored = JSON.parse(userStr);
  //       } catch (e) {
  //         setShowLoginDialog(true);
  //         setLoading(false);
  //         return;
  //       }
  //       const userId = stored.id || stored._id;
  //       if (!userId) {
  //         setShowLoginDialog(true);
  //         setLoading(false);
  //         return;
  //       }
  //       setShowLoginDialog(false);
  //       setLoading(false);
  //     });
  //   });
  // }, []);

  // Bộ lọc mẫu (tuỳ ý)

  const PRICE_SEGMENTS = [
    { label: 'Dưới 2 triệu', min: 0, max: 2_000_000 },
    { label: '2–4 triệu', min: 2_000_000, max: 4_000_000 },
    { label: '4–7 triệu', min: 4_000_000, max: 7_000_000 },
    { label: '7–13 triệu', min: 7_000_000, max: 13_000_000 },
    { label: 'Trên 13 triệu', min: 13_000_000, max: Infinity },
  ];
  useEffect(() => {
    (async () => {
      try {
        // song song categories+images + products
        const [catRes, imgRes, prodRes, brandRes] = await Promise.all([
          axios.get('/category'),
          axios.get('/images'),
          axios.get('/product'),
          axios.get('/brands'),
        ]);
        // xử lý categories/images như cũ
        const imgs = imgRes.data;
        const cats = catRes.data.map(cat => {
          const found = imgs.find(i => i.category_id?._id === cat._id);
          return {
            _id: cat._id,
            name: cat.name,
            icon: found ? { uri: found.url } : require('../assets/images/pc.png'),
          };
        });
        setCategories(cats);
        if (cats.length) setSelectedCat(cats[0]._id);

        setProducts(prodRes.data.products || []);
        setBrands(brandRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  // Fetch best sellers mỗi khi đổi danh mục
  useEffect(() => {
    if (!selectedCat) return;
    axios.get(`/product/best-sellers?category=${selectedCat}&limit=5`)
      .then(res => setBestSellers(res.data || []))
      .catch(() => setBestSellers([]));
  }, [selectedCat]);

  // Tìm object category đang chọn
  const catObj = categories.find(c => c._id === selectedCat);

  // Lọc sản phẩm theo category đang chọn (category_id có thể là object hoặc string)
  const filteredProducts = products.filter(p =>
    (typeof p.category_id === 'string' && p.category_id === selectedCat) ||
    (typeof p.category_id === 'object' && (p.category_id._id === selectedCat || p.category_id['$oid'] === selectedCat))
  );

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
                  setLoading(false);
                  router.replace("/HomeScreen");
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2979ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER SEARCH */}
      <View style={styles.header}>
        <Feather name="search" size={20} color="#888" />
        <TextInput
          placeholder="Bạn muốn mua gì hôm nay?"
          placeholderTextColor="blue"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.body}>
        {/* LEFT MENU */}
        <FlatList
          data={categories}
          keyExtractor={i => i._id}
          style={styles.left}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.leftItem,
                item._id === selectedCat && styles.leftItemActive
              ]}
              onPress={() => setSelectedCat(item._id)}
            >
              <Image source={item.icon} style={styles.leftIcon} />
              <Text style={[
                styles.leftLabel,
                item._id === selectedCat && styles.leftLabelActive
              ]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* RIGHT CONTENT */}
        <ScrollView style={styles.right} showsVerticalScrollIndicator={false}>
          {/* TITLE + “Xem tất cả” */}
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{catObj?.name || '—'}</Text>
            <TouchableOpacity onPress={() => router.push("./danhmucall")}> 
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* --- Bộ lọc tuỳ chọn --- */}
          <View style={{marginBottom: 24, padding: 12, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2}}>
            <Text style={{fontWeight:'bold', marginBottom: 8, fontSize: 16}}>Chọn danh mục:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: selectedCat === cat._id ? '#ee4d2d' : '#ccc', marginRight: 10, backgroundColor: selectedCat === cat._id ? '#ee4d2d' : '#f7f7f7'
                  }}
                  onPress={() => setSelectedCat(cat._id)}
                >
                  <Image source={cat.icon} style={{width: 22, height: 22, marginRight: 6, borderRadius: 11}} />
                  <Text style={{color: selectedCat === cat._id ? '#fff' : '#333', fontWeight: selectedCat === cat._id ? 'bold' : 'normal'}}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{fontWeight:'bold', marginBottom: 8, fontSize: 16}}>Chọn hãng:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
              {brands.map(brand => (
                <TouchableOpacity
                  key={brand._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: selectedBrand === brand._id ? '#ee4d2d' : '#ccc', marginRight: 10, backgroundColor: selectedBrand === brand._id ? '#ee4d2d' : '#f7f7f7'
                  }}
                  onPress={() => setSelectedBrand(brand._id)}
                >
                  {brand.logo && <Image source={{uri: brand.logo}} style={{width: 22, height: 22, marginRight: 6, borderRadius: 11, backgroundColor:'#fff'}} />}
                  <Text style={{color: selectedBrand === brand._id ? '#fff' : '#333', fontWeight: selectedBrand === brand._id ? 'bold' : 'normal'}}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{fontWeight:'bold', marginBottom: 8, fontSize: 16}}>Chọn giá:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
              {PRICE_SEGMENTS.map(seg => (
                <TouchableOpacity
                  key={seg.label}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: selectedPrice === seg.label ? '#ee4d2d' : '#ccc', marginRight: 10, backgroundColor: selectedPrice === seg.label ? '#ee4d2d' : '#f7f7f7'
                  }}
                  onPress={() => setSelectedPrice(seg.label)}
                >
                  <Text style={{color: selectedPrice === seg.label ? '#fff' : '#333', fontWeight: selectedPrice === seg.label ? 'bold' : 'normal'}}>{seg.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{marginTop: 8, backgroundColor: '#ee4d2d', borderRadius: 8, paddingVertical: 14, alignItems: 'center', shadowColor:'#ee4d2d', shadowOpacity:0.12, shadowRadius:4, elevation:1}} 
              onPress={() => {
                const priceObj = PRICE_SEGMENTS.find(seg => seg.label === selectedPrice);
                router.push({
                  pathname: '/danhmucall',
                  params: {
                    categoryId: selectedCat,
                    brandId: selectedBrand,
                    min: priceObj ? priceObj.min : undefined,
                    max: priceObj ? priceObj.max : undefined
                  }
                });
              }}
            >
              <Text style={{color:'#fff', fontWeight:'bold', fontSize:16}}>Xem sản phẩm</Text>
            </TouchableOpacity>
          </View>

          {/* DANH SÁCH SẢN PHẨM */}

        </ScrollView>
      </View>
      {/* TAB BAR */}
      <CustomTabBar router={router} style={styles.tabbar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'blue',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    fontSize: 14,
  },
  body: { flex: 1, flexDirection: 'row' },
  left: {
    width: LEFT_WIDTH,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  leftItem: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftItemActive: {
    backgroundColor: '#ffe5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#e60023',
  },
  leftIcon: { width: 36, height: 36, marginBottom: 4 },
  leftLabel: { fontSize: 12, color: '#333', textAlign: 'center' },
  leftLabelActive: { color: '#e60023', fontWeight: '600' },
  right: {
    width: RIGHT_WIDTH,
    paddingHorizontal: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  titleText: { fontSize: 18, fontWeight: '700', color: '#111' },
  viewAll: { color: '#007aff', fontSize: 14 },
  sec: { marginBottom: 16 },
  secTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  filterRow: { flexWrap: 'wrap' },
  tag: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  tagText: { fontSize: 14, color: '#333' },
  tabbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: 350,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    gap: 8, // Nếu chưa hỗ trợ gap thì giữ marginHorizontal cho btn
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2979ff',
  },
  btnSecondary: {
    backgroundColor: '#f2f2f2',
  },
  btnTextWhite: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnTextPrimary: {
    color: '#2979ff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
