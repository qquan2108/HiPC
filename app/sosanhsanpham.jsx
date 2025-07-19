import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosInstance from '../utils/AxiosInstance';

function formatCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return '—';
  return num.toLocaleString('vi-VN') + 'đ';
}

// Fetch chi tiết sản phẩm để lấy đầy đủ thông tin specs
const fetchProductDetails = async (productId) => {
  try {
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
            .join('');
          return { label: '', value: joined };
        }
        return { label: '', value: '' };
      });
    }

    return {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      oldPrice: product.oldPrice || product.price,
      image: product.image ? { uri: product.image } : require('../assets/images/pc1.png'),
      rating: product.rating || 4.5,
      sold: product.sold || 0,
      origin: product.origin || 'Unknown',
      specs: specsArr,
      // Thêm các field có thể có cho RAM và các sản phẩm khác
      cpu: product.cpu,
      ram: product.ram,
      ssd: product.ssd,
      vga: product.vga,
      mainboard: product.mainboard,
      psu: product.psu,
      case: product.case,
      weight: product.weight,
      year: product.year,
      warranty: product.warranty,
      category_id: product.category_id,
      brand_id: product.brand_id,
      stock: product.stock,
      // Specs cho RAM
      capacity: product.capacity,
      speed: product.speed,
      type: product.type,
      bus: product.bus,
      voltage: product.voltage,
      latency: product.latency,
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};

// Helper để lấy thông số kỹ thuật cho mỗi product - ENHANCED
function extractSpecs(product) {
  console.log('extractSpecs for product:', product.name);
  console.log('Full product object:', JSON.stringify(product, null, 2));
  
  let specs = [];
  
  // Ưu tiên specs trước
  if (Array.isArray(product.specs) && product.specs.length) {
    console.log('Found specs:', product.specs);
    specs = product.specs.map(s => ({
      key: s.key || s.label || 'unknown',
      label: s.label || s.key || 'unknown',
      value: s.value || '',
    }));
  }
  // Sau đó là specifications
  else if (Array.isArray(product.specifications) && product.specifications.length) {
    console.log('Found specifications:', product.specifications);
    specs = product.specifications.map(s => ({
      key: s.key || s.label || 'unknown',
      label: s.label || s.key || 'unknown',
      value: s.value || '',
    }));
  }
  // Cuối cùng là các field cố định - ENHANCED
  else {
    console.log('No specs/specifications found, using fixed fields');
    const fields = [
      { key: 'cpu', label: 'CPU' },
      { key: 'ram', label: 'RAM' },
      { key: 'ssd', label: 'Ổ cứng SSD' },
      { key: 'vga', label: 'Card đồ họa' },
      { key: 'mainboard', label: 'Mainboard' },
      { key: 'psu', label: 'Nguồn' },
      { key: 'case', label: 'Case' },
      { key: 'weight', label: 'Khối lượng' },
      { key: 'origin', label: 'Xuất xứ' },
      { key: 'year', label: 'Năm ra mắt' },
      { key: 'warranty', label: 'Bảo hành' },
      { key: 'description', label: 'Mô tả' },
      { key: 'category_id', label: 'Danh mục' },
      { key: 'brand_id', label: 'Thương hiệu' },
      { key: 'stock', label: 'Tồn kho' },
      // Thêm các field có thể có cho RAM
      { key: 'capacity', label: 'Dung lượng' },
      { key: 'speed', label: 'Tốc độ' },
      { key: 'type', label: 'Loại' },
      { key: 'bus', label: 'Bus' },
      { key: 'voltage', label: 'Điện áp' },
      { key: 'latency', label: 'Độ trễ' },
    ];
    
    specs = fields
      .filter(f => {
        const value = product[f.key];
        return value !== undefined && value !== null && value !== '';
      })
      .map(f => ({
        key: f.key,
        label: f.label,
        value: typeof product[f.key] === 'object' && product[f.key].name 
          ? product[f.key].name 
          : product[f.key] || '',
      }));
  }
  
  console.log('Final specs for', product.name, ':', specs);
  return specs;
}

// Hàm tạo specs mặc định cho tất cả sản phẩm
function createUniversalSpecs(products) {
  const universalSpecs = [
    { key: 'price', label: 'Giá bán' },
    { key: 'rating', label: 'Đánh giá' },
    { key: 'sold', label: 'Đã bán' },
    { key: 'origin', label: 'Xuất xứ' },
    { key: 'category', label: 'Danh mục' },
    { key: 'brand', label: 'Thương hiệu' },
    { key: 'warranty', label: 'Bảo hành' },
    { key: 'description', label: 'Mô tả' },
    { key: 'stock', label: 'Tồn kho' },
    // Thêm các specs thường gặp cho RAM
    { key: 'capacity', label: 'Dung lượng' },
    { key: 'speed', label: 'Tốc độ' },
    { key: 'type', label: 'Loại' },
    { key: 'bus', label: 'Bus' },
    { key: 'voltage', label: 'Điện áp' },
    { key: 'cpu', label: 'CPU' },
    { key: 'ram', label: 'RAM' },
    { key: 'ssd', label: 'Ổ cứng SSD' },
    { key: 'vga', label: 'Card đồ họa' },
  ];
  
  return universalSpecs.filter(spec => 
    products.some(p => {
      const value = p[spec.key];
      return value !== undefined && value !== null && value !== '';
    })
  );
}

export default function SoSanhSanPham() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [compareProducts, setCompareProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        let initialProducts = [];
        
        if (params.compare) {
          initialProducts = JSON.parse(params.compare);
          console.log('Parsed compare products:', initialProducts);
        }

        if (!initialProducts.length) {
          setError('Không có sản phẩm để so sánh');
          setLoading(false);
          return;
        }

        // Fetch chi tiết cho tất cả sản phẩm
        const detailedProducts = await Promise.all(
          initialProducts.map(async (product) => {
            const productId = product.id || product._id;
            if (!productId) {
              console.warn('Product without ID:', product);
              return product; // Trả về sản phẩm gốc nếu không có ID
            }
            
            const detailedProduct = await fetchProductDetails(productId);
            return detailedProduct || product; // Fallback về sản phẩm gốc nếu fetch thất bại
          })
        );

        console.log('Detailed products:', detailedProducts);
        setCompareProducts(detailedProducts.filter(p => p !== null));
        setLoading(false);
      } catch (error) {
        console.error('Error loading product details:', error);
        setError('Lỗi khi tải thông tin sản phẩm');
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [params.compare]);

  // Hàm lấy giá trị spec cho sản phẩm cụ thể - ENHANCED
  const getSpecValue = (product, specKey) => {
    console.log(`Getting spec value for ${product.name}, key: ${specKey}`);
    
    // Tìm trong specs
    if (Array.isArray(product.specs)) {
      const found = product.specs.find(s => 
        (s.key === specKey || s.label === specKey)
      );
      if (found && (found.value || found.value === 0)) {
        console.log(`Found in specs:`, found.value);
        return found.value;
      }
    }
    
    // Tìm trong specifications
    if (Array.isArray(product.specifications)) {
      const found = product.specifications.find(s => 
        (s.key === specKey || s.label === specKey)
      );
      if (found && (found.value || found.value === 0)) {
        console.log(`Found in specifications:`, found.value);
        return found.value;
      }
    }
    
    // Tìm trong các field trực tiếp
    if (product[specKey] !== undefined && product[specKey] !== null && product[specKey] !== '') {
      console.log(`Found in direct field:`, product[specKey]);
      const value = product[specKey];
      // Nếu là object có thuộc tính name (như category_id, brand_id)
      if (typeof value === 'object' && value.name) {
        return value.name;
      }
      return value;
    }
    
    // Xử lý đặc biệt cho một số field
    switch (specKey) {
      case 'price':
        return formatCurrency(product.price);
      case 'rating':
        return product.rating ? `★ ${product.rating}` : '—';
      case 'sold':
        return product.sold || 0;
      case 'category':
        return product.category_id?.name || product.category?.name || '—';
      case 'brand':
        return product.brand_id?.name || product.brand?.name || '—';
      default:
        break;
    }
    
    console.log(`No value found for ${specKey}`);
    return '—';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>So sánh sản phẩm</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2979ff" />
          <Text style={styles.emptyText}>Đang tải thông tin sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !compareProducts.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>So sánh sản phẩm</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="search" size={64} color="#ddd" />
          <Text style={styles.emptyText}>{error || 'Không có sản phẩm để so sánh'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Gom tất cả specs từ tất cả sản phẩm ----
  let allSpecs = [];
  const allSpecsMap = new Map();

  compareProducts.forEach((product, index) => {
    console.log(`Processing product ${index + 1}:`, product.name);
    const specsArr = extractSpecs(product);
    console.log(`Specs for ${product.name}:`, specsArr);
    
    specsArr.forEach(spec => {
      if (spec.key && (spec.value || spec.value === 0)) {
        // Sử dụng key làm key chính để nhóm các thông số giống nhau
        const normalizedKey = spec.key;
        allSpecsMap.set(normalizedKey, {
          key: normalizedKey,
          label: spec.label || spec.key,
        });
      }
    });
  });

  // Chuyển Map thành array
  allSpecs = Array.from(allSpecsMap.values());

  // Nếu không có specs nào hoặc ít specs, bổ sung specs universal
  if (allSpecs.length < 3) {
    const universalSpecs = createUniversalSpecs(compareProducts);
    universalSpecs.forEach(spec => {
      if (!allSpecsMap.has(spec.key)) {
        allSpecsMap.set(spec.key, spec);
      }
    });
    allSpecs = Array.from(allSpecsMap.values());
  }

  console.log('Final allSpecs:', allSpecs);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>So sánh sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Sticky Header với tên sản phẩm */}
        <View style={styles.stickyHeader}>
          <View style={styles.labelColumn}>
            <Text style={styles.stickyLabel}>Sản phẩm</Text>
          </View>
          {compareProducts.map((product, index) => (
            <View key={product.id || index} style={styles.stickyProductCol}>
              <Text style={styles.stickyProductName} numberOfLines={2}>
                {product.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>THÔNG TIN CƠ BẢN</Text>
          </View>
          
          {/* Hình ảnh sản phẩm */}
          <View style={styles.specRow}>
            <View style={styles.specLabelCol}>
              <Text style={styles.specLabel}>Hình ảnh</Text>
            </View>
            {compareProducts.map((product, index) => (
              <View key={product.id || index} style={styles.specValueCol}>
                <View style={styles.productImgWrap}>
                  <Image 
                    source={
                      product.image && typeof product.image === 'string' 
                        ? { uri: product.image } 
                        : product.image && typeof product.image === 'object' && product.image.uri 
                        ? product.image 
                        : require('../assets/images/pc1.png')
                    } 
                    style={styles.productImg} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Giá */}
          <View style={[styles.specRow, styles.specRowAlt]}>
            <View style={styles.specLabelCol}>
              <Text style={styles.specLabel}>Giá bán</Text>
            </View>
            {compareProducts.map((product, index) => (
              <View key={product.id || index} style={styles.specValueCol}>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>{formatCurrency(product.price)}</Text>
                  {product.oldPrice && product.oldPrice !== product.price && (
                    <Text style={styles.oldPrice}>{formatCurrency(product.oldPrice)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Đánh giá */}
          <View style={styles.specRow}>
            <View style={styles.specLabelCol}>
              <Text style={styles.specLabel}>Đánh giá</Text>
            </View>
            {compareProducts.map((product, index) => (
              <View key={product.id || index} style={styles.specValueCol}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>★ {product.rating || "—"}</Text>
                  <Text style={styles.soldText}>Đã bán: {product.sold || 0}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Nút xem chi tiết */}
          <View style={[styles.specRow, styles.specRowAlt]}>
            <View style={styles.specLabelCol}>
              <Text style={styles.specLabel}>Thao tác</Text>
            </View>
            {compareProducts.map((product, index) => (
              <View key={product.id || index} style={styles.specValueCol}>
                <TouchableOpacity 
                  style={styles.detailBtn}
                  onPress={() => router.push(`/ctsp?id=${product.id || product._id}`)}
                >
                  <Text style={styles.detailBtnText}>XEM CHI TIẾT</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Thông số kỹ thuật */}
        {allSpecs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG SỐ KỸ THUẬT</Text>
            </View>
            
            {allSpecs.map((spec, index) => (
              <View
                key={spec.key}
                style={[
                  styles.specRow,
                  index % 2 === 1 && styles.specRowAlt
                ]}
              >
                <View style={styles.specLabelCol}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                </View>
                {compareProducts.map((product, productIndex) => {
                  const value = getSpecValue(product, spec.key);
                  return (
                    <View key={product.id || product._id || productIndex} style={styles.specValueCol}>
                      <Text style={styles.specValue}>
                        {value !== '—' ? value : '—'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Padding bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.back()}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2979ff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  backButton: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  stickyHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#2979ff',
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  
  labelColumn: {
    flex: 1.2,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  
  stickyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2979ff',
  },
  
  stickyProductCol: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stickyProductName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  
  sectionHeader: {
    backgroundColor: '#f5faff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e3eaf3',
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2979ff',
    letterSpacing: 0.5,
  },
  
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 60,
    alignItems: 'center',
  },
  
  specRowAlt: {
    backgroundColor: '#f8fafc',
  },
  
  specLabelCol: {
    flex: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  
  specLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.2,
  },
  
  specValueCol: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  specValue: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  productImgWrap: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 8,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  productImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  
  priceContainer: {
    alignItems: 'center',
  },
  
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 4,
  },
  
  oldPrice: {
    fontSize: 12,
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  
  ratingContainer: {
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: 14,
    color: '#fbc02d',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  soldText: {
    fontSize: 12,
    color: '#888',
  },
  
  detailBtn: {
    backgroundColor: '#2979ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    elevation: 1,
  },
  
  detailBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2979ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});