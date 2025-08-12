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
  const [showLoginDialog, setShowLoginDialog] = useState(false); // Thêm state này
  const [loading, setLoading] = useState(true); // Thêm state này
  const [brands, setBrands] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
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
    axios.get('/brands')
      .then(res => setBrands(res.data || []))
      .catch(err => console.error('Brand API error', err));
  }, []);

  // Fetch categories + icon
  useEffect(() => {
    (async () => {
      try {
        const [catRes, imgRes] = await Promise.all([
          axios.get('/category'),
          axios.get('/images')
        ]);
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
        // Sửa ở đây: chỉ setSelectedCat nếu có ít nhất 1 category
        if (cats.length > 0) setSelectedCat(cats[0]._id);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Fetch ALL products
  useEffect(() => {
    axios.get('/product')
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]));
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

          {/* DANH SÁCH SẢN PHẨM */}
          
          {/* Filter: Hãng */}
          <FilterSection
            title="Hãng"
            data={brands}
            onSelect={brand =>
              router.push({
                pathname: '/danhmucall',
                params: { type: 'brand', brandId: brand._id }
              })
            }
          />

          {/* Filter: Phân khúc giá */}
          <FilterSection
            title="Phân khúc giá"
            data={PRICE_SEGMENTS}
            onSelect={seg =>
              router.push({
                pathname: '/danhmucall',
                params: { type: 'price', min: seg.min, max: seg.max }
              })
            }
          />

          {/* Filter: HOT */}
          <FilterSection
            title="HOT ⚡️"
            data={products}
            onSelect={p =>
              router.push({
                pathname: '/ctsp',
                params: { id: p._id }
              })
            }
          />

          {/* 🟢 Sản phẩm bán nhiều nhất trong tháng */}
          <FilterSection
            title="Bán nhiều nhất tháng này"
            data={bestSellers}
            onSelect={p =>
              router.push({
                pathname: '/ctsp',
                params: { id: p._id }
              })
            }
          />

          {/* Các filter khác... */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
      {/* TAB BAR */}
      <CustomTabBar router={router} style={styles.tabbar} />
    </SafeAreaView>
  );
}

// Component con cho mỗi section filter
function FilterSection({ title, data, onSelect }) {
  return (
    <View style={styles.sec}>
      <Text style={styles.secTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {data.map((item, i) => {
          // Lấy label cho cả brand (name) và phân khúc giá (label) 
          const label = item.name ?? item.label ?? '';
          return (
            <TouchableOpacity
              key={item._id || i}
              style={styles.tag}               // vẫn dùng style.tag cũ 
              onPress={() => onSelect(item)}
            >
              {item.logo
                // Brand: show logo 
                ? <Image
                  source={{ uri: item.logo }}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                // Price segment hoặc fallback: show text label 
                : <Text style={styles.tagText}>{label}</Text>
              }
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
