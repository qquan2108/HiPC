import { Feather } from '@expo/vector-icons'; // Thêm dòng này ở đầu file nếu chưa có
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomTabBar from '../compomentHome/CustomTabBar';
import axios from '../utils/AxiosInstance';
const API_BASE_URL =
  Constants.manifest?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  axios.defaults.baseURL;

function computeSource(uri, fallback) {
  if (!uri) return fallback;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return { uri };
  }
  return {
    uri: API_BASE_URL.replace(/\/$/, '') + '/' + uri.replace(/^\/+/, '')
  };
}

const { width, height } = Dimensions.get('window');
const tabs = ['Mới nhất', 'Giá thấp', 'Giá cao', 'Bộ lọc'];

const FilterModal = ({ visible, onClose, onApply, filters, setFilters, categoryId }) => {
  const [tempFilters, setTempFilters] = useState(filters);
  const [filterFields, setFilterFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); // Danh sách danh mục
  const [brands, setBrands] = useState([]); // Danh sách hãng
  const [selectedCategory, setSelectedCategory] = useState(categoryId); // Danh mục đang chọn

  useEffect(() => {
    if (visible) {
      fetchCategories();
      fetchBrands();
      if (selectedCategory) {
        fetchFilterFields(selectedCategory);
      } else {
        setFilterFields([]);
        setLoading(false);
      }
    }
  }, [visible, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/category/all');
      setCategories(Array.isArray(res.data.categories) ? res.data.categories : []);
    } catch (e) {
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/brands');
      setBrands(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setBrands([]);
    }
  };

  const fetchFilterFields = async (catId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/tsktproducts/filters/${catId}`);
      setFilterFields(response.data.fields || []);
    } catch (error) {
      setFilterFields([]);
    } finally {
      setLoading(false);
    }
  };

  const brandOptions = ['HP', 'ASUS', 'LG', 'Dell', 'MSI', 'Lenovo', 'Gigabyte', 'Acer', 'Apple', 'Huawei', 'Vaio', 'Masstel'];
  const storageOptions = ['256GB', '512GB', '1TB', '2TB', '128GB', '120GB', '8TB', 'HDD: 1TB'];
  const usageOptions = ['Học tập - Văn phòng', 'Gaming', 'Đồ họa - Kỹ thuật', 'Cao cấp - Sang trọng', 'Mỏng nhẹ', 'Laptop sáng tạo nội dung'];
  const cpuOptions = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'];
  const screenSizeOptions = ['13"', '14"', '15.6"', '17"', '16"', '12"'];
  const graphicsOptions = ['Intel UHD', 'NVIDIA GTX 1650', 'NVIDIA RTX 3060', 'NVIDIA RTX 4060', 'AMD Radeon', 'Intel Iris Xe'];
  const resolutionOptions = ['Full HD (1920x1080)', '4K (3840x2160)', 'QHD (2560x1440)', 'HD (1366x768)'];

  const updateFilter = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const updateSpecificationFilter = (specKey, specValue) => {
    setTempFilters(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specKey]: prev.specifications[specKey] && prev.specifications[specKey].includes(specValue)
          ? prev.specifications[specKey].filter(item => item !== specValue)
          : [...(prev.specifications[specKey] || []), specValue]
      }
    }));
  };

  const handleApply = () => {
    setFilters({ ...tempFilters, category: selectedCategory });
    onApply();
    onClose();
  };

  const resetFilters = () => {
    const resetData = {
      priceRange: [0, 200000000],
      status: [],
      brands: [],
      storage: [],
      usage: [],
      cpu: [],
      screenSize: [],
      graphics: [],
      resolution: [],
      specifications: {},
      category: null
    };
    setTempFilters(resetData);
    setSelectedCategory(null);
    setFilterFields([]);
    setFilters(resetData);
  };

  const renderFilterSection = (title, options, filterKey) => (
    <View style={filterStyles.section}>
      <Text style={filterStyles.sectionTitle}>{title}</Text>
      <View style={filterStyles.optionContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              filterStyles.option,
              tempFilters[filterKey].includes(option) && filterStyles.optionSelected
            ]}
            onPress={() => updateFilter(filterKey, option)}
          >
            <Text style={[
              filterStyles.optionText,
              tempFilters[filterKey].includes(option) && filterStyles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSpecificationSection = (specKey) => {
    const options = getSpecificationOptions(specKey);
    return (
      <View style={filterStyles.section}>
        <Text style={filterStyles.sectionTitle}>{specKey}</Text>
        <View style={filterStyles.optionContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                filterStyles.option,
                tempFilters.specifications[specKey]?.includes(option) && filterStyles.optionSelected
              ]}
              onPress={() => updateSpecificationFilter(specKey, option)}
            >
              <Text style={[
                filterStyles.optionText,
                tempFilters.specifications[specKey]?.includes(option) && filterStyles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getSpecificationOptions = (specKey) => {
    switch (specKey.toLowerCase()) {
      case 'cpu':
        return cpuOptions;
      case 'storage':
      case 'dung lượng':
        return storageOptions;
      case 'screen size':
      case 'kích thước màn hình':
        return screenSizeOptions;
      case 'graphics':
      case 'card đồ họa':
        return graphicsOptions;
      case 'resolution':
      case 'độ phân giải':
        return resolutionOptions;
      default:
        return ['Option 1', 'Option 2', 'Option 3'];
    }
  };

  const renderBrandSection = () => (
    <View style={filterStyles.section}>
      <Text style={filterStyles.sectionTitle}>Hãng sản xuất</Text>
      <View style={filterStyles.optionContainer}>
        {brands.map((brand, index) => (
          <TouchableOpacity
            key={brand._id || index}
            style={[
              filterStyles.option,
              tempFilters.brands.includes(brand._id) && filterStyles.optionSelected
            ]}
            onPress={() => updateFilter('brands', brand._id)}
          >
            <Text style={[
              filterStyles.optionText,
              tempFilters.brands.includes(brand._id) && filterStyles.optionTextSelected
            ]}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={filterStyles.container}>
        <View style={filterStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={filterStyles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={filterStyles.title}>Bộ lọc</Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={filterStyles.resetButton}>Thiết lập lại</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={filterStyles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={filterStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#ee4d2d" />
              <Text>Đang tải bộ lọc...</Text>
            </View>
          ) : (
            <>
              {/* Price Range */}
              <View style={filterStyles.section}>
                <Text style={filterStyles.sectionTitle}>Khoảng giá</Text>
                <View style={filterStyles.priceContainer}>
                  <Text style={filterStyles.priceText}>{tempFilters.priceRange[0].toLocaleString()}đ</Text>
                  <Text style={filterStyles.priceText}>{tempFilters.priceRange[1].toLocaleString()}đ</Text>
                </View>
                <MultiSlider
                  values={tempFilters.priceRange}
                  min={0}
                  max={200000000}
                  step={100000}
                  onValuesChange={(values) =>
                    setTempFilters(prev => ({
                      ...prev,
                      priceRange: values
                    }))
                  }
                />
              </View>
              {/* Brand Filter từ API */}
              {renderBrandSection()}
              {/* Category Filter */}
              <View style={filterStyles.section}>
                <Text style={filterStyles.sectionTitle}>Danh mục</Text>
                <View style={filterStyles.optionContainer}>
                  {Array.isArray(categories) && categories.length > 0 ? categories.map((cat, idx) => (
                    <TouchableOpacity
                      key={cat._id || idx}
                      style={[
                        filterStyles.option,
                        selectedCategory === cat._id && filterStyles.optionSelected
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat._id);
                        setFilterFields([]); // reset specs khi đổi danh mục
                        setTempFilters(prev => ({ ...prev, specifications: {} }));
                      }}
                    >
                      <Text style={[
                        filterStyles.optionText,
                        selectedCategory === cat._id && filterStyles.optionTextSelected
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  )) : (
                    <Text style={{ color: '#999' }}>Không có danh mục</Text>
                  )}
                </View>
              </View>
              {/* Dynamic specification filters theo danh mục */}
              {selectedCategory && filterFields.length > 0 && filterFields.map((field, index) => (
                <View key={index}>{renderSpecificationSection(field)}</View>
              ))}
            </>
          )}
        </ScrollView>
        <View style={filterStyles.footer}>
          <TouchableOpacity style={filterStyles.resetBtn} onPress={resetFilters}>
            <Text style={filterStyles.resetBtnText}>Thiết lập lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={filterStyles.applyBtn} onPress={handleApply}>
            <Text style={filterStyles.applyBtnText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function DanhMucAll(props) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 200000000],
    status: [],
    brands: [],
    storage: [],
    usage: [],
    cpu: [],
    screenSize: [],
    graphics: [],
    resolution: [],
    specifications: {}
  });

  // Đọc params từ router để set filters khi chuyển từ DanhMucPC
  useEffect(() => {
    if (router && router.query) {
      const { type, brandId, min, max, categoryId: catId } = router.query;
      if (!type && !brandId && !min && !max && !catId) {
        // Không có filter, reset về mặc định (hiện tất cả)
        setFilters({
          priceRange: [0, 200000000],
          status: [],
          brands: [],
          storage: [],
          usage: [],
          cpu: [],
          screenSize: [],
          graphics: [],
          resolution: [],
          specifications: {}
        });
        setCategoryId(null);
      } else if (type === 'brand' && brandId) {
        setFilters(prev => ({
          ...prev,
          brands: [brandId],
        }));
        setCategoryId(null);
      } else if (type === 'price' && min && max) {
        setFilters(prev => ({
          ...prev,
          priceRange: [parseInt(min), parseInt(max)]
        }));
        setCategoryId(null);
      } else if (catId) {
        setFilters(prev => ({
          ...prev,
          category: catId
        }));
        setCategoryId(catId);
      }
    }
  }, [router.query]);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, filters]);

  useEffect(() => {
    // Nếu có params truyền sang thì lọc theo params
    const { categoryId, brandId, min, max } = router?.params || {};
    if (categoryId || brandId || min || max) {
      setLoading(true);
      axios.get('/product/filter', {
        params: {
          category: categoryId,
          brand: brandId,
          priceMin: min,
          priceMax: max
        }
      })
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
      return; // Không gọi fetchProducts nữa
    }
    // Nếu không có params thì gọi fetchProducts như cũ
    fetchProducts();
  }, [router?.params, activeTab, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      let sortParam = 'newest';
      switch (activeTab) {
        case 0: sortParam = 'newest'; break;
        case 1: sortParam = 'price_asc'; break;
        case 2: sortParam = 'price_desc'; break;
        default: sortParam = 'newest';
      }
      params.append('sort', sortParam);
      params.append('page', '1');
      params.append('limit', '50');
      // Chỉ truyền filter khi ở tab Bộ lọc
      if (activeTab === 3) {
        const catId = filters.category || selectedCategory || categoryId;
        if (catId) {
          params.append('category', catId);
        }
        if (filters.priceRange[0] > 0) {
          params.append('priceMin', filters.priceRange[0].toString());
        }
        if (filters.priceRange[1] < 200000000) {
          params.append('priceMax', filters.priceRange[1].toString());
        }
        if (filters.brands && filters.brands.length > 0) {
          params.append('brand', filters.brands.join(','));
        }
        const specFilters = Object.keys(filters.specifications).filter(
          key => filters.specifications[key] && filters.specifications[key].length > 0
        );
        if (specFilters.length > 0) {
          const firstSpecKey = specFilters[0];
          params.append('specKey', firstSpecKey);
          params.append('specValue', filters.specifications[firstSpecKey].join(','));
        }
      }
      const queryString = params.toString();
      const apiUrl = `/product/filter?${queryString}`;
      const response = await axios.get(apiUrl);
      if (response.data) {
        if (response.data.products && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    if (index === 3) {
      setFilterVisible(true);
    }
  };

  const applyFilters = () => {
    fetchProducts();
  };

  const handleSearch = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ee4d2d" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Enhanced product rendering with better error handling
  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/ctsp', params: { id: item._id || item.id } })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <TouchableOpacity style={styles.heartCircle}>
            <Feather name="heart" size={20} color="#ee4d2d" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={computeSource(item.image, require('../assets/images/pc1.png'))}
            
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.title}>{item.name || 'Tên sản phẩm'}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={[styles.star, i < 4 ? styles.starFilled : styles.starEmpty]}>
                  ★
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>(0)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{(item.price || 0).toLocaleString()}đ</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Miễn phí vận chuyển</Text>
            </View>
            <View style={[styles.badge, styles.stockBadge]}>
              <Text style={styles.badgeText}>
                {item.stock > 0 ? `Còn ${item.stock} sản phẩm` : 'Hết hàng'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ee4d2d" />

      <LinearGradient colors={['#ee4d2d', '#ff6b6b']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Bạn muốn mua gì hôm nay?"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
                <Text style={styles.searchIconText}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, activeTab === index && styles.activeTab]}
              onPress={() => handleTabPress(index)}
            >
              <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                {tab}
                {tab === 'Giá thấp' && ' ↑'}
                {tab === 'Giá cao' && ' ↓'}
                {tab === 'Bộ lọc' && ' ⚙'}
              </Text>
              {activeTab === index && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchProducts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
        filters={filters}
        setFilters={setFilters}
        categoryId={categoryId}
      />

      <CustomTabBar
        router={router}
        style={styles.tabbar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  header: {
    paddingBottom: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 12
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  searchIcon: {
    padding: 4
  },
  searchIconText: {
    fontSize: 16
  },
  tabsContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative'
  },
  activeTab: {
    backgroundColor: '#fff'
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#ee4d2d',
    fontWeight: '600'
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ee4d2d',
    borderRadius: 2
  },
  productList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: (width - 48) / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  },
  image: {
    width: '90%',
    height: '90%'
  },
  info: {
    padding: 12
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4
  },
  star: {
    fontSize: 12
  },
  starFilled: {
    color: '#ffc107'
  },
  starEmpty: {
    color: '#ddd'
  },
  ratingText: {
    fontSize: 12,
    color: '#666'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ee4d2d',
    marginRight: 8
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4
  },
  stockBadge: {
    backgroundColor: '#e8f5e8'
  },
  badgeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '500'
  },
  tabbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  }
});

const filterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  closeButton: {
    fontSize: 20,
    color: '#666'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  resetButton: {
    fontSize: 14,
    color: '#ee4d2d'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  section: {
    marginVertical: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  priceText: {
    fontSize: 14,
    color: '#666'
  },
  slider: {
    width: '100%',
    height: 40
  },
  sliderThumb: {
    backgroundColor: '#ee4d2d'
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff'
  },
  optionSelected: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d'
  },
  optionText: {
    fontSize: 14,
    color: '#666'
  },
  optionTextSelected: {
    color: '#fff'
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  resetBtnText: {
    fontSize: 16,
    color: '#666'
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#ee4d2d',
    alignItems: 'center'
  },
  applyBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600'
  }
});