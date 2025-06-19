import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackgroundImage from '../assets/images/backroundLogin.png';
import axiosInstance from '../utils/AxiosInstance';
import Banner from '../compomentHome/Banner'; // Thêm ở đầu file

const { width } = Dimensions.get('window');

const DanhMucPCScreen = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Lấy danh sách danh mục có icon
  useEffect(() => {
    Promise.all([
      axiosInstance.get("/category"),
      axiosInstance.get("/images")
    ])
      .then(([catRes, imgRes]) => {
        const images = imgRes.data;
        setCategories(
          catRes.data.map(cat => {
            // Tìm ảnh có category_id trùng với _id của category
            const img = images.find(i => i.category_id && i.category_id._id === cat._id);
            return {
              ...cat,
              icon: img ? { uri: img.url } : require("../assets/images/pc.png"),
            };
          })
        );
      })
      .catch(() => setCategories([]));
  }, []);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    axiosInstance.get('/product')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  // Lọc sản phẩm theo danh mục
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory || p.category_id?._id === selectedCategory)
    : products;

  return (
    <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
      <View style={styles.overlay}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Danh Mục PC</Text>

          {/* Category Scroll */}
          <View style={styles.categoryWrapper}>
            <Text style={styles.categoryTitle}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat._id || idx}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat._id && { borderColor: '#2979ff', borderWidth: 2 }
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat._id)}
                >
                  <View style={styles.categoryIconWrapper}>
                    <Image
                      source={cat.icon}
                      style={styles.categoryIcon}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Banner đẹp đồng bộ với Home */}
          <Banner
            source={require('../assets/images/pc1.png')}
            title="Khuyến mãi PC cực sốc"
            subtitle="Giảm giá lên đến 30% cho các dòng PC mới nhất!"
            badge="HOT"
            overlayType="gradient"
          />

          {/* Header */}
          <View style={styles.productHeader}>
            <Text style={styles.productTitle}>Sản phẩm nổi bật</Text>
            <Feather name="sliders" size={20} color="#444" />
          </View>

          {/* Product List */}
          <View style={styles.productsContainer}>
            {filteredProducts.map((product, index) => (
              <TouchableOpacity
                key={product._id}
                style={[styles.productCardNew, { marginLeft: index % 2 === 0 ? 0 : 12 }]}
                activeOpacity={0.9}
                // onPress={() => ...} // Thêm nếu muốn click vào sản phẩm
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)']}
                  style={styles.cardGradientNew}
                >
                  <View style={styles.imageWrapperNew}>
                    <Image
                      source={product.image ? { uri: product.image } : require('../assets/images/pc1.png')}
                      style={styles.productImageNew}
                      resizeMode="contain"
                    />
                    {/* Badge giảm giá */}
                    {product.discount > 0 && (
                      <LinearGradient
                        colors={['#f093fb', '#f5576c']}
                        style={styles.discountBadgeNew}
                      >
                        <MaterialIcons name="local-offer" size={12} color="#fff" />
                        <Text style={styles.discountBadgeTextNew}>-{product.discount}%</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.productInfoNew}>
                    <Text numberOfLines={2} style={styles.productNameNew}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPriceNew}>
                      {product.price?.toLocaleString('vi-VN') || product.price}₫
                    </Text>
                    {product.oldPrice && (
                      <Text style={styles.productOldPriceNew}>
                        {product.oldPrice?.toLocaleString('vi-VN') || product.oldPrice}₫
                      </Text>
                    )}
                    {/* Nút thêm vào giỏ */}
                    <TouchableOpacity style={styles.addToCartButtonNew}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.buttonGradientNew}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="cart-outline" size={16} color="#fff" />
                        <Text style={styles.buttonTextNew}>Thêm vào giỏ</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.customTabBarContainer}>
          <View style={styles.customTabBar}>
            <TabItem icon="home" label="Trang chủ" active />
            <TabItem icon="heart" label="Yêu thích" />
            <View style={styles.tabCartWrapperCustom}>
              <TouchableOpacity style={styles.tabCartBtnCustom}>
                <Feather name="shopping-cart" size={28} color="#4a90e2" />
              </TouchableOpacity>
            </View>
            <TabItem icon="search" label="Tìm kiếm" />
            <TabItem icon="settings" label="Cài đặt" />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

// TabItem Component
const TabItem = ({ icon, label, active = false }) => (
  <TouchableOpacity style={styles.tabItemCustom}>
    <Feather name={icon} size={22} color={active ? '#4a90e2' : '#555'} />
    <Text style={active ? styles.tabLabelActive : styles.tabLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatarLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  bannerWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#e3e3e3',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productCardNew: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    position: 'relative',
  },
  imageWrapperNew: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  productImageNew: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    zIndex: 1,
  },
  discountLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4d4f',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeNew: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5576c',
  },
  discountBadgeTextNew: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  productInfoNew: {
    alignItems: 'flex-start',
    marginTop: 2,
  },
  productNameNew: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 4,
    lineHeight: 18,
  },
  productPriceNew: {
    color: "#e53e3e",
    fontWeight: "800",
    fontSize: 16,
  },
  productOldPriceNew: {
    fontSize: 12,
    color: "#a0aec0",
    fontWeight: '500',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  customTabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 40,
    height: 70,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    width: width - 32,
  },
  tabItemCustom: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginTop: 2,
  },
  tabCartWrapperCustom: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 20,
  },
  tabCartBtnCustom: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  categoryWrapper: {
    marginVertical: 18,
    paddingLeft: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    marginLeft: 4,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 18,
    width: 80,
  },
  categoryIconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    marginBottom: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    width: 80,
    fontWeight: "500",
  },
  cardGradientNew: {
    padding: 12,
    borderRadius: 20,
  },
  addToCartButtonNew: {
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  buttonGradientNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonTextNew: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default DanhMucPCScreen;
