import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';
import SkeletonBuildPC from "./SkeletonBuildPC";

const { width, height } = Dimensions.get('window');

export default function UngDungLapPC() {
  const router = useRouter();

  // State khởi tạo luôn là mảng
  const [cacLoaiCauHinh, setCacLoaiCauHinh] = useState([]);
  const [presetComponents, setPresetComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loaiCauHinh, setLoaiCauHinh] = useState('');
  const [tongGia, setTongGia] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [linhKien, setLinhKien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showCompatibilityAlert, setShowCompatibilityAlert] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentCategoryForSelection, setCurrentCategoryForSelection] = useState(null);
  const [productsForSelection, setProductsForSelection] = useState([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const baseURL = axiosInstance.defaults.baseURL;
  const resolveImageUri = (url) =>
    url?.startsWith('http') ? url : `${baseURL}${url}`;

  const formatCurrency = (num) =>
    typeof num === 'number' && !isNaN(num)
      ? num.toLocaleString('vi-VN') + ' đ'
      : '0 đ';

  const getBrandName = (id) => brands.find((b) => b._id === id)?.name || '';

  // Enhanced category icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'CPU': '🧠',
      'GPU': '🎮',
      'RAM': '💾',
      'Motherboard': '🔌',
      'Storage': '💿',
      'PSU': '⚡',
      'Case': '📦',
      'Cooling': '❄️',
      'Monitor': '🖥️',
      'Keyboard': '⌨️',
      'Mouse': '🖱️',
      'Mainboard': '🔌',
      'VGA': '🎮',
      'SSD': '💿'
    };
    return iconMap[categoryName] || '🔧';
  };

  // Performance calculation logic
  const calculatePerformanceScores = () => {
    const components = Object.values(selectedComponents);
    const baseScore = 60;
    let gamingScore = baseScore;
    let workstationScore = baseScore;
    let overallScore = baseScore;

    components.forEach(component => {
      // Simplified scoring based on component price range
      const price = component.price || 0;
      if (price > 20000000) { // High-end components
        gamingScore += 8;
        workstationScore += 8;
      } else if (price > 10000000) { // Mid-range
        gamingScore += 5;
        workstationScore += 5;
      } else if (price > 5000000) { // Budget
        gamingScore += 2;
        workstationScore += 2;
      }
    });

    overallScore = Math.round((gamingScore + workstationScore) / 2);
    return {
      gaming: Math.min(gamingScore, 100),
      workstation: Math.min(workstationScore, 100),
      overall: Math.min(overallScore, 100)
    };
  };

  // Compatibility check
  const checkCompatibility = () => {
    const issues = [];
    const components = Object.values(selectedComponents);

    // Basic compatibility checks
    if (components.length < 3) {
      issues.push('Cần ít nhất 3 linh kiện cơ bản');
    }

    // Check power consumption vs PSU capacity
    const totalPower = components.reduce((sum, comp) => sum + (comp.power || 100), 0);
    const psu = components.find(c => c.category_id?.name?.includes('PSU'));
    if (psu && totalPower > (psu.wattage || 500)) {
      issues.push('Nguồn không đủ công suất');
    }

    return issues;
  };

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatProduct = (p) => ({
    id: p._id,
    name: p.name,
    price: p.price,
    brand_id: p.brand_id,
    category_id: p.category_id,
    image: p.image
      ? { uri: resolveImageUri(p.image) }
      : require('../assets/images/pc.png'),
    specs: Array.isArray(p.tskt)
      ? p.tskt
      : Array.isArray(p.specifications)
        ? p.specifications.map((s) => ({ label: s.key || '', value: s.value || '' }))
        : [],
    rating: p.rating || 4.5,
    reviews: p.reviews || Math.floor(Math.random() * 500) + 50,
    variants: p.variants || [] // <-- THÊM DÒNG NÀY
  });

  // Tính tổng giá bao gồm cả linh kiện đã chọn
  const calculateTotalPrice = () => {
    const presetPrice = cacLoaiCauHinh.find(build =>
      (build.type || build.id) === loaiCauHinh
    )?.price || 0;

    const selectedPrice = Object.values(selectedComponents)
      .reduce((sum, component) => sum + (component?.price || 0), 0);

    return presetPrice + selectedPrice;
  };

  useEffect(() => {
    const newTotal = calculateTotalPrice();
    setTongGia(newTotal);

    // Update build progress based on selected components
    const totalCategories = categories.length;
    const selectedCount = Object.keys(selectedComponents).length;
    setBuildProgress(totalCategories > 0 ? (selectedCount / totalCategories) * 100 : 0);
  }, [selectedComponents, loaiCauHinh, cacLoaiCauHinh, categories]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [preRes, catRes, prodRes, brandRes] = await Promise.all([
          axiosInstance.get('/pcbuild/presets'),
          axiosInstance.get('/category'),
          axiosInstance.get('/product'),
          axiosInstance.get('/brands')
        ]);
        const presets = Array.isArray(preRes.data.data)
          ? preRes.data.data
          : Array.isArray(preRes.data)
            ? preRes.data
            : [];
        setCacLoaiCauHinh(presets);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.data || []);
        setBrands(Array.isArray(brandRes.data) ? brandRes.data : brandRes.data.data || []);
        const rawProds = prodRes.data.products || prodRes.data || [];
        setProducts(rawProds.map(formatProduct));
        if (presets.length) {
          const first = presets[0];
          const key = first.type || first.id;
          setLoaiCauHinh(key);
          setPresetComponents(first.components || []);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const filtered = products.filter(
      (p) => p.category_id === selectedCategory || p.category_id._id === selectedCategory
    );
    setLinhKien(filtered);
  }, [selectedCategory, products]);

  const onSelectBuild = (build) => {
    const key = build.type || build.id;
    setLoaiCauHinh(key);
    setPresetComponents(build.components || []);
    setSelectedComponents({});
    setIsCustomizing(false);
  };

  // Enhanced product selection with animation
  const openProductSelection = (category) => {
    const categoryProducts = products.filter(
      (p) => p.category_id === category._id || p.category_id._id === category._id
    );
    setCurrentCategoryForSelection(category);
    setProductsForSelection(categoryProducts);
    setShowProductModal(true);
  };

  const selectProduct = (product) => {
    // Nếu có variant thì show dialog, KHÔNG cho thêm vào selectedComponents ngay
    if (product.variants && product.variants.length > 0 && product.variants[0].options?.length > 0) {
      setVariantProduct(product);
      setSelectedVariant(null);
      setShowProductModal(false);      // <-- ĐÓNG MODAL SẢN PHẨM NGAY KHI CHỌN SẢN PHẨM CÓ VARIANT
      setShowVariantDialog(true);
      return;
    }
    // Nếu không có variant thì thêm luôn
    setSelectedComponents(prev => ({
      ...prev,
      [currentCategoryForSelection._id]: { ...product }
    }));
    setShowProductModal(false);

    setTimeout(() => {
      const issues = checkCompatibility();
      if (issues.length > 0) setShowCompatibilityAlert(true);
    }, 500);
  };
  const handleConfirmVariant = () => {
    if (!selectedVariant) {
      Alert.alert('Vui lòng chọn phiên bản/biến thể!');
      return;
    }
    setSelectedComponents(prev => ({
      ...prev,
      [currentCategoryForSelection._id]: {
        ...variantProduct,
        variant: {
          key: variantProduct.variants[0]?.key || 'Phiên bản',
          label: selectedVariant.label,
          priceDiff: selectedVariant.priceDiff || 0
        }
      }
    }));
    setShowVariantDialog(false); // Đóng dialog variant
    // KHÔNG gọi lại setShowProductModal(true) hoặc openProductSelection ở đây!
    setTimeout(() => {
      const issues = checkCompatibility();
      if (issues.length > 0) setShowCompatibilityAlert(true);
    }, 500);
  };

  const removeSelectedProduct = (categoryId) => {
    setSelectedComponents(prev => {
      const newSelected = { ...prev };
      delete newSelected[categoryId];
      return newSelected;
    });
  };

  // Enhanced build card with modern design
  const TheLoaiCauHinh = ({ build }) => {
    const key = build.type || build.id;
    const isSelected = loaiCauHinh === key;

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          style={[styles.buildCard, isSelected && styles.selectedBuild]}
          onPress={() => onSelectBuild(build)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={build.gradient || ['#667eea', '#764ba2']}
            style={styles.buildGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.buildIconContainer}>
              <Text style={styles.buildIcon}>{build.icon}</Text>
            </View>
            <Text style={styles.buildTitle}>{build.name}</Text>
            <Text style={styles.buildSubtitle}>{build.description}</Text>
            <View style={styles.buildPriceContainer}>
              <Text style={styles.buildPrice}>{formatCurrency(build.price)}</Text>
              
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Enhanced category selector with modern design - ĐÂY LÀ PHẦN QUAN TRỌNG
  const CategorySelector = ({ category }) => {
    const selectedProduct = selectedComponents[category._id];
    const hasSelected = !!selectedProduct;
    const icon = getCategoryIcon(category.name);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.categoryCard, hasSelected && styles.categoryCardSelected]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconContainer, hasSelected && styles.categoryIconSelected]}>
              {hasSelected ? (
                <View style={styles.categoryImageWrapper}>
                  <Image
                    source={selectedProduct.image}
                    style={styles.categoryProductImage}
                    resizeMode="cover"
                  />
                  <View style={styles.categorySelectedOverlay}>
                    <Text style={styles.categorySelectedCheck}>✓</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.categoryIcon}>{icon}</Text>
              )}
            </View>

            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              {hasSelected ? (
                <View>
                  <Text style={styles.selectedProductName} numberOfLines={1}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={styles.selectedProductPrice}>
                    {formatCurrency(selectedProduct.price)}
                  </Text>
                  <View style={styles.productRatingContainer}>
                    <Text style={styles.productRating}>⭐ {selectedProduct.rating}</Text>
                    <Text style={styles.productReviews}>({selectedProduct.reviews})</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.categoryPlaceholder}>Chưa chọn sản phẩm</Text>
                  <Text style={styles.categoryHint}>Nhấn để xem danh sách</Text>
                </View>
              )}
            </View>

            <View style={styles.categoryActions}>
              {hasSelected && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSelectedProduct(category._id)}
                  activeOpacity={0.8}>
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.selectButton, hasSelected && styles.selectButtonSelected]}
                onPress={() => openProductSelection(category)}
                activeOpacity={0.8}>
                <Text style={styles.selectButtonText}>
                  {hasSelected ? 'Thay đổi' : 'Chọn'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Enhanced product modal with better UX
  const ProductSelectionModal = () => {
    // Trong ProductSelectionModal, thay đổi phần renderProductItem như sau:

    const renderProductItem = ({ item, index }) => (
      <Animated.View
        style={[
          styles.productItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
        <View style={styles.productItemContent}>
          <View style={styles.productImageContainer}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productBadge}>
              <Text style={styles.productBadgeText}>NEW</Text>
            </View>
          </View>

          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productBrand}>{getBrandName(item.brand_id)}</Text>
            <View style={styles.productRatingRow}>
              <Text style={styles.productRating}>⭐ {item.rating}</Text>
              <Text style={styles.productReviews}>({item.reviews} đánh giá)</Text>
            </View>
            <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            {item.specs[0] && (
              <Text style={styles.productSpecs} numberOfLines={1}>
                {item.specs[0].label}: {item.specs[0].value}
              </Text>
            )}
          </View>

          <View style={styles.productActionContainer}>
            <TouchableOpacity
              style={styles.productSelectButton}
              onPress={() => selectProduct(item)} // <-- GỌI ĐÚNG HÀM NÀY
            >
              <Text style={styles.productSelectButtonText}>Chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );

    return (
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View>
                <Text style={styles.modalTitle}>
                  Chọn {currentCategoryForSelection?.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {productsForSelection.length} sản phẩm có sẵn
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProductModal(false)}
                activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <FlatList
            data={productsForSelection}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            style={styles.productList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productListContent}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  // Performance modal
  const PerformanceModal = () => {
    const scores = calculatePerformanceScores();

    return (
      <Modal
        visible={showPerformanceModal}
        animationType="fade"
        transparent={true}>
        <View style={styles.performanceModalOverlay}>
          <View style={styles.performanceModalContent}>
            <Text style={styles.performanceModalTitle}>Hiệu Năng Dự Kiến</Text>

            <View style={styles.performanceScores}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>🎮</Text>
                <Text style={styles.performanceLabel}>Gaming</Text>
                <Text style={styles.performanceScore}>{scores.gaming}/100</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>💼</Text>
                <Text style={styles.performanceLabel}>Workstation</Text>
                <Text style={styles.performanceScore}>{scores.workstation}/100</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>⚡</Text>
                <Text style={styles.performanceLabel}>Tổng Thể</Text>
                <Text style={styles.performanceScore}>{scores.overall}/100</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.performanceCloseButton}
              onPress={() => setShowPerformanceModal(false)}>
              <Text style={styles.performanceCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Enhanced order function with progress
  const onOrderNow = async () => {
    const compatibilityIssues = checkCompatibility();
    if (compatibilityIssues.length > 0) {
      Alert.alert(
        'Cảnh báo tương thích',
        compatibilityIssues.join('\n'),
        [
          { text: 'Tiếp tục', onPress: () => addAllToCartAndGoCart() },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }
    addAllToCartAndGoCart();
  };

  const addAllToCartAndGoCart = async () => {
    try {
      setIsBuilding(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Tài khoản không hợp lệ! Vui lòng đăng nhập lại.');
        setIsBuilding(false);
        return;
      }

      // Thêm các linh kiện preset (nếu có)
      for (const comp of presetComponents) {
        await axiosInstance.post('/cartt/add-to-cart', {
          user_id: userId,
          productId: comp.productId,
          quantity: comp.quantity || 1
        });
      }

      // Thêm các linh kiện đã chọn
      for (const comp of Object.values(selectedComponents)) {
        const payload = {
          user_id: userId,
          productId: comp.id,
          quantity: 1
        };
        if (comp.variant && comp.variant.key && comp.variant.label) {
          payload.variant = {
            key: comp.variant.key,
            label: comp.variant.label,
            priceDiff: comp.variant.priceDiff || 0
          };
        }
        await axiosInstance.post('/cartt/add-to-cart', payload);
      }

      Alert.alert('Đã thêm vào giỏ hàng!', 'Chuyển đến giỏ hàng để thanh toán.', [
        { text: 'OK', onPress: () => router.push('/cart') }
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setIsBuilding(false);
    }
  };

  const processOrder = async () => {
    try {
      setIsBuilding(true);

      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Tài khoản không hợp lệ! Vui lòng đăng nhập lại.');
        setIsBuilding(false);
        return;
      }

      const allComponents = [
        ...presetComponents.map(comp => ({
          productId: comp.productId,
          quantity: comp.quantity || 1
        })),
        ...Object.values(selectedComponents).map(comp => ({
          productId: comp.id,
          quantity: 1
        }))
      ];

      const payload = {
        userId, // Đảm bảo là ObjectId
        name: loaiCauHinh,
        products: allComponents
      };

      // Simulate build progress
      for (let i = 0; i <= 100; i += 10) {
        setBuildProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const res = await axiosInstance.post('/pcbuild/build', payload);
      const data = res.data.data || res.data;

      Alert.alert(
        'Cấu hình đã được lưu!',
        `Build ID: ${data.buildId}\nTổng giá trị: ${formatCurrency(tongGia)}`,
        [
          { text: 'Tiếp tục mua sắm' },
          { text: 'Xem cấu hình', onPress: () => router.push('/BuildListScreen') }
        ]
      );
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.error || e.message);
    } finally {
      setIsBuilding(false);
    }
  };

  const getUserId = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    const userObj = JSON.parse(userStr);
    // Ưu tiên _id, nếu không có thì lấy id (và phải là ObjectId hợp lệ)
    const id = userObj._id || userObj.id;
    if (id && /^[a-f\d]{24}$/i.test(id)) {
      return id;
    }
    return null;
  };

  if (loading) {
    return <SkeletonBuildPC />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Enhanced Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>⚡ HiPC Builder</Text>
          <Text style={styles.headerSubtitle}>Tạo máy tính hoàn hảo cho bạn</Text>

          {/* Build Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Tiến độ: {Math.round(buildProgress)}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${buildProgress}%` }]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Build Types Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏗️ Chọn Loại Cấu Hình</Text>
            <TouchableOpacity
              style={styles.performanceButton}
              onPress={() => setShowPerformanceModal(true)}>
              <Text style={styles.performanceButtonText}>📊 Hiệu năng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buildTypesContainer}>
            {cacLoaiCauHinh.map((build) => (
              <TheLoaiCauHinh key={build.type || build.id} build={build} />
            ))}
          </ScrollView>
        </View>

        {/* Price Summary */}
        <View style={styles.priceSummaryContainer}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.priceSummary}>
            <View style={styles.priceSummaryContent}>
              <View>
                <Text style={styles.priceSummaryLabel}>Tổng Chi Phí</Text>
                <Text style={styles.priceSummaryAmount}>{formatCurrency(tongGia)}</Text>
              </View>
              <View style={styles.componentCount}>
                <Text style={styles.componentCountText}>
                  {Object.keys(selectedComponents).length} linh kiện
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* PHẦN CHỌN LINH KIỆN - ĐÂY LÀ PHẦN BỊ MẤT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Chọn Linh Kiện</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn linh kiện để tùy chỉnh cấu hình của bạn
          </Text>
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategorySelector key={category._id} category={category} />
            ))
          ) : (
            <View style={styles.noCategoriesContainer}>
              <Text style={styles.noCategoriesText}>Đang tải danh mục linh kiện...</Text>
            </View>
          )}
        </View>

        {/* Current Build Components */}
        {(presetComponents.length > 0 || Object.keys(selectedComponents).length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖥️ Cấu Hình Hiện Tại</Text>

            {presetComponents.length > 0 && (
              <View style={styles.presetComponentsContainer}>
                <Text style={styles.presetTitle}>Linh kiện cơ bản:</Text>
                {presetComponents.map((component, index) => {
                  const product = products.find(p => p.id === component.productId);
                  if (!product) return null;

                  return (
                    <View key={`preset-${index}`} style={styles.presetComponentCard}>
                      <Image source={product.image} style={styles.presetComponentImage} />
                      <View style={styles.presetComponentInfo}>
                        <Text style={styles.presetComponentName}>{product.name}</Text>
                        <Text style={styles.presetComponentBrand}>
                          {getBrandName(product.brand_id)}
                        </Text>
                        <Text style={styles.presetComponentPrice}>
                          {formatCurrency(product.price)}
                        </Text>
                      </View>
                      <View style={styles.presetComponentBadge}>
                        <Text style={styles.presetComponentBadgeText}>Cơ bản</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Selected Additional Components */}
            {Object.keys(selectedComponents).length > 0 && (
              <View style={styles.selectedComponentsContainer}>
                <Text style={styles.selectedTitle}>Linh kiện đã chọn:</Text>
                {Object.entries(selectedComponents).map(([categoryId, component]) => {
                  const category = categories.find(c => c._id === categoryId);
                  return (
                    <View key={`selected-${categoryId}`} style={styles.selectedComponentCard}>
                      <Image source={component.image} style={styles.selectedComponentImage} />
                      <View style={styles.selectedComponentInfo}>
                        <Text style={styles.selectedComponentCategory}>
                          {category?.name || 'Unknown'}
                        </Text>
                        <Text style={styles.selectedComponentName}>{component.name}</Text>
                        <Text style={styles.selectedComponentBrand}>
                          {getBrandName(component.brand_id)}
                        </Text>
                        <Text style={styles.selectedComponentPrice}>
                          {formatCurrency(component.price)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeSelectedButton}
                        onPress={() => removeSelectedProduct(categoryId)}>
                        <Text style={styles.removeSelectedButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.orderButton, isBuilding && styles.orderButtonDisabled]}
            onPress={onOrderNow}
            disabled={isBuilding}
            activeOpacity={0.8}>
            <LinearGradient colors={['#28a745', '#20c997']} style={styles.buttonGradient}>
              {isBuilding ? (
                <View style={styles.buildingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buttonText}>Đang xử lý...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🛒 Đặt Hàng Ngay</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={processOrder}
              disabled={isBuilding}
            >
              <Text style={styles.secondaryButtonText}>💾 Lưu Cấu Hình</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>📤 Chia Sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>📈 Chỉ Số Hiệu Năng</Text>
          <View style={styles.metricsGrid}>
            {[
              { icon: '🎮', title: 'Gaming', score: calculatePerformanceScores().gaming, color: '#ff6b6b' },
              { icon: '💼', title: 'Workstation', score: calculatePerformanceScores().workstation, color: '#4ecdc4' },
              { icon: '⚡', title: 'Tổng Thể', score: calculatePerformanceScores().overall, color: '#45b7d1' }
            ].map((m) => (
              <LinearGradient
                key={m.title}
                colors={[m.color, `${m.color}80`]}
                style={styles.metricCard}>
                <Text style={styles.metricIcon}>{m.icon}</Text>
                <Text style={styles.metricTitle}>{m.title}</Text>
                <Text style={styles.metricScore}>{m.score}/100</Text>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${m.score}%` }]} />
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>
      </ScrollView>

      <ProductSelectionModal />
      <PerformanceModal />

      {/* Compatibility Alert */}
      <Modal
        visible={showCompatibilityAlert}
        animationType="fade"
        transparent={true}>
        <View style={styles.compatibilityModalOverlay}>
          <View style={styles.compatibilityModalContent}>
            <Text style={styles.compatibilityModalIcon}>⚠️</Text>
            <Text style={styles.compatibilityModalTitle}>Cảnh báo tương thích</Text>
            <Text style={styles.compatibilityModalText}>
              Một số linh kiện có thể không tương thích hoàn toàn.
              Vui lòng kiểm tra kỹ trước khi đặt hàng.
            </Text>
            <TouchableOpacity
              style={styles.compatibilityModalButton}
              onPress={() => setShowCompatibilityAlert(false)}>
              <Text style={styles.compatibilityModalButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Variant Selection Dialog */}
      <Modal
        visible={showVariantDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVariantDialog(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 22,
            width: '88%',
            maxWidth: 370,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#222', letterSpacing: 0.2 }}>
              Chọn phiên bản/biến thể
            </Text>
            {variantProduct && (
              <>
                <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 12, color: '#444' }}>
                  {variantProduct.name}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                  {variantProduct.variants[0]?.options?.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedVariant(option)}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 14,
                        backgroundColor: selectedVariant === option ? '#667eea' : '#f3f4f6',
                        marginRight: 10,
                        borderWidth: selectedVariant === option ? 2 : 1,
                        borderColor: selectedVariant === option ? '#667eea' : '#e0e7ef',
                        flexDirection: 'row',
                        alignItems: 'center',
                        minWidth: 64,
                        position: 'relative',
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={{
                        color: selectedVariant === option ? '#fff' : '#333',
                        fontWeight: selectedVariant === option ? 'bold' : '500',
                        fontSize: 15,
                      }}>
                        {option.label || option.key}
                      </Text>
                      {option.priceDiff ? (
                        <Text style={{
                          color: selectedVariant === option ? '#fff' : '#888',
                          fontSize: 12,
                          marginLeft: 6,
                          fontWeight: '600'
                        }}>
                          +{option.priceDiff.toLocaleString('vi-VN')}₫
                        </Text>
                      ) : null}
                      {selectedVariant === option && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#fff"
                          style={{ marginLeft: 6, position: 'absolute', top: -10, right: -10, backgroundColor: '#667eea', borderRadius: 9 }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setShowVariantDialog(false)}
                    style={{
                      paddingVertical: 10, paddingHorizontal: 22,
                      borderRadius: 10, backgroundColor: '#e0e7ef', marginRight: 10
                    }}
                  >
                    <Text style={{ color: '#333', fontWeight: '700', fontSize: 15 }}>Huỷ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmVariant}
                    style={{
                      paddingVertical: 10, paddingHorizontal: 22,
                      borderRadius: 10, backgroundColor: '#667eea'
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Chọn</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  // Loading styles
  loadingContainer: { flex: 1 },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingLogo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    opacity: 0.8
  },

  // Header styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20
  },
  headerContent: { alignItems: 'center' },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 20
  },

  // Progress bar
  progressContainer: { width: '100%', alignItems: 'center' },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3
  },

  scrollView: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B2A38',
    marginBottom: 10
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    fontStyle: 'italic'
  },

  // No categories fallback
  noCategoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  noCategoriesText: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic'
  },

  // Preset components styles
  presetComponentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  presetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  presetComponentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  presetComponentImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f8f9fa'
  },
  presetComponentInfo: {
    flex: 1
  },
  presetComponentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2
  },
  presetComponentBrand: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2
  },
  presetComponentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745'
  },
  presetComponentBadge: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  presetComponentBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },

  // Selected components styles
  selectedComponentsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed'
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#667eea'
  },
  selectedComponentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  selectedComponentImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f8f9fa'
  },
  selectedComponentInfo: {
    flex: 1
  },
  selectedComponentCategory: {
    fontSize: 10,
    color: '#667eea',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  selectedComponentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2
  },
  selectedComponentBrand: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2
  },
  selectedComponentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea'
  },
  removeSelectedButton: {
    backgroundColor: '#dc3545',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeSelectedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  performanceButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  performanceButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },

  // Price summary
  priceSummaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 25
  },
  priceSummary: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  priceSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceSummaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  priceSummaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  componentCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  componentCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },

  // Build types
  buildTypesContainer: { marginBottom: 20 },
  buildCard: {
    width: 160,
    height: 140,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  selectedBuild: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12
  },
  buildGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buildIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buildIcon: { fontSize: 24, color: '#FFFFFF' },
  buildTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  buildSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8
  },
  buildPriceContainer: {
    alignItems: 'center',
    position: 'relative'
  },
  buildPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  selectedBadge: {
    position: 'absolute',
    top: -25,
    right: -15,
    backgroundColor: '#28a745',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // Category styles
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  categoryCardSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
    shadowColor: '#667eea',
    shadowOpacity: 0.3
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e9ecef'
  },
  categoryIconSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea'
  },
  categoryIcon: { fontSize: 28 },
  categoryImageWrapper: {
    position: 'relative',
    width: 48,
    height: 48
  },
  categoryProductImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa'
  },
  categorySelectedOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#28a745',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categorySelectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  categoryInfo: { flex: 1 },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  categoryPlaceholder: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 2
  },
  categoryHint: {
    fontSize: 12,
    color: '#adb5bd'
  },
  selectedProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  selectedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4
  },
  productRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  productRating: {
    fontSize: 12,
    color: '#ffc107',
    marginRight: 4
  },
  productReviews: {
    fontSize: 12,
    color: '#6c757d'
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  selectButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  selectButtonSelected: {
    backgroundColor: '#28a745'
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },

  // Modal styles
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#f7f9fb' },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  productList: { flex: 1 },
  productListContent: { padding: 20 },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  productItemContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center'
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 16
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa'
  },
  productBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  productDetails: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  productBrand: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4
  },
  productRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 6
  },
  productSpecs: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  productActionContainer: {
    justifyContent: 'center'
  },
  productSelectButton: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  productSelectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },

  // Performance modal
  performanceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  performanceModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300
  },
  performanceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20
  },
  performanceScores: {
    marginBottom: 20
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  performanceIcon: {
    fontSize: 20,
    marginRight: 12
  },
  performanceLabel: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50'
  },
  performanceScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea'
  },
  performanceCloseButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  performanceCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  // Action section
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 25
  },
  orderButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  orderButtonDisabled: {
    opacity: 0.7
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  buildingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea'
  },

  // Metrics section
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 30
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  metricIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  metricTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600'
  },
  metricScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  metricBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2
  },

  // Compatibility modal styles
  compatibilityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  compatibilityModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300
  },
  compatibilityModalIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  compatibilityModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center'
  },
  compatibilityModalText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  compatibilityModalButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  compatibilityModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  }
});