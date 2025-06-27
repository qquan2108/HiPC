// Searchscreen.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import SearchChip from "../compomentSearch/SearchChip";
import SuggestionChip from "../compomentSearch/SuggestionChip";
import ProductCard from "../compomentSearch/ProductCard";
import CustomTabBar from "../compomentSearch/CustomTabBar";
import axiosInstance from "../utils/AxiosInstance";

const { width, height } = Dimensions.get("window");

const searchHistoryInit = ["PC chơi game", "Ram"];
const suggestions = ["PC", "SSD", "RAM", "VGA", "Mainboard"];

// Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      setTimeout(onFinish, 100);
    });
  }, []);

  return (
    <View style={styles.splashContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.splashGradient}
      >
        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.logoCircle}
            >
              <Feather name="search" size={40} color="#667eea" />
            </LinearGradient>
          </View>
          <Text style={styles.splashTitle}>Tìm Kiếm AI</Text>
          <Text style={styles.splashSubtitle}>Khám phá công nghệ tương lai</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState(searchHistoryInit);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchScaleAnim = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Load sản phẩm từ API
  useEffect(() => {
    axiosInstance.get("/product")
      .then(res => {
        // Sửa ở đây: lấy đúng mảng sản phẩm
        const arr = Array.isArray(res.data.products) ? res.data.products : [];
        const mapped = arr.map(p => ({
          ...p,
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image ? { uri: p.image } : require("../assets/images/pc1.png"),
        }));
        setProducts(mapped);
        setFilteredProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  // Khi search thay đổi, tự động lọc (dành cho typing)
  useEffect(() => {
    if (!search) {
      setFilteredProducts(products);
    } else {
      const keyword = search.toLowerCase();
      setFilteredProducts(
        products.filter(
          p =>
            p.name?.toLowerCase().includes(keyword) ||
            (p.desc && p.desc.toLowerCase().includes(keyword))
        )
      );
    }
  }, [search, products]);

  // Hiệu ứng khi Splash kết thúc
  useEffect(() => {
    if (!showSplash) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSplash]);

  // Xử lý khi nhấn submit trên bàn phím
  const handleSearchSubmit = useCallback(() => {
    if (search && !searchHistory.includes(search)) {
      setSearchHistory([search, ...searchHistory]);
    }
    const keyword = search.trim().toLowerCase();
    setFilteredProducts(
      products.filter(
        p =>
          p.name?.toLowerCase().includes(keyword) ||
          (p.desc && p.desc.toLowerCase().includes(keyword))
      )
    );
    Animated.sequence([
      Animated.timing(searchScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(searchScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [search, searchHistory, products]);

  // Xóa 1 mục lịch sử
  const handleRemoveHistory = useCallback(
    (item) => {
      setSearchHistory(searchHistory.filter(h => h !== item));
    },
    [searchHistory]
  );

  // Xóa hết lịch sử
  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Nhấn vào ô gõ tìm kiếm
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowProductDropdown(true);
    Animated.timing(searchScaleAnim, {
      toValue: 1.02,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // setShowProductDropdown(false); // Nếu muốn ẩn khi blur
    Animated.timing(searchScaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Nhấn vào 1 item lịch sử
  const handleHistoryPress = useCallback((item) => {
    setSearch(item);
    const keyword = item.toLowerCase();
    setFilteredProducts(
      products.filter(
        p =>
          p.name?.toLowerCase().includes(keyword) ||
          (p.desc && p.desc.toLowerCase().includes(keyword))
      )
    );
  }, [products]);

  // Nhấn vào 1 suggestion
  const handleSuggestionPress = useCallback((item) => {
    setSearch(item);
    const keyword = item.toLowerCase();
    setFilteredProducts(
      products.filter(
        p =>
          p.name?.toLowerCase().includes(keyword) ||
          (p.desc && p.desc.toLowerCase().includes(keyword))
      )
    );
    if (!searchHistory.includes(item)) {
      setSearchHistory([item, ...searchHistory]);
    }
  }, [products, searchHistory]);

  useEffect(() => {
    if (search.length === 0) setShowProductDropdown(false);
    else setShowProductDropdown(true);
  }, [search]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Khám phá</Text>
            <Text style={styles.headerSubtitle}>Tìm kiếm sản phẩm công nghệ</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.profileGradient}
            >
              <Feather name="user" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Search Box */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: searchScaleAnim }
            ],
          },
        ]}
      >
        <BlurView intensity={20} tint="light" style={styles.searchBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.searchGradient}
          >
            <View style={styles.searchInputBox}>
              <Feather name="search" size={20} color="#667eea" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm công nghệ..."
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearchSubmit}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholderTextColor="#8B5CF6"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
                  <Feather name="x" size={16} color="#8B5CF6" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Product Dropdown */}
      {showProductDropdown && search.length > 0 && (
        <View style={{
          position: 'absolute',
          top: 110, // điều chỉnh theo vị trí search box
          left: 20,
          right: 20,
          backgroundColor: '#fff',
          borderRadius: 12,
          maxHeight: 340,
          zIndex: 100,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          paddingVertical: 4,
        }}>
          <ScrollView>
            {products.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f1f1',
                  gap: 12,
                }}
                onPress={() => {
                  setShowProductDropdown(false);
                  setSearch('');
                  router.push({ pathname: '/ctsp', params: { id: item.id } });
                }}
              >
                <View style={{
                  width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                  backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center',
                  marginRight: 10,
                }}>
                  <Image
                    source={item.image}
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '600', color: '#222' }}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={{ color: '#888', fontSize: 13 }}>
                    {item.desc || item.category?.name || ''}
                  </Text>
                </View>
                <Text style={{ color: '#2979ff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }}>
                  {item.price?.toLocaleString()}₫
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Lịch sử tìm kiếm */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.sectionIcon}
                >
                  <Feather name="clock" size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
              </View>
              {searchHistory.length > 0 && (
                <TouchableOpacity onPress={handleClearHistory} style={styles.clearHistoryButton}>
                  <LinearGradient
                    colors={['#ff6b6b', '#ff8e8e']}
                    style={styles.clearButtonGradient}
                  >
                    <Feather name="trash-2" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.chipContainer}>
              {searchHistory.map((item, idx) => (
                <Animated.View
                  key={item}
                  style={[
                    styles.chipWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 30 + idx * 10],
                        })
                      }],
                    },
                  ]}
                >
                  <SearchChip
                    item={item}
                    onRemove={handleRemoveHistory}
                    onPress={handleHistoryPress}
                  />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Gợi ý xu hướng */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <LinearGradient
                colors={['#764ba2', '#f093fb']}
                style={styles.sectionIcon}
              >
                <Feather name="trending-up" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Xu hướng tìm kiếm</Text>
            </View>
            <View style={styles.chipContainer}>
              {suggestions.map((item, idx) => (
                <Animated.View
                  key={item}
                  style={[
                    styles.chipWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 20 + idx * 8],
                        })
                      }],
                    },
                  ]}
                >
                  <SuggestionChip
                    item={item}
                    onPress={handleSuggestionPress}
                  />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Sản phẩm */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.sectionIcon}
              >
                <Feather name="star" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            </View>
            <FlatList
              data={filteredProducts}
              numColumns={2}
              keyExtractor={item => item.id.toString()}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item, index }) => (
                <Animated.View
                  style={[
                    styles.productWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 40 + index * 15],
                        })
                      }],
                    },
                  ]}
                >
                  <ProductCard item={item} />
                </Animated.View>
              )}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <CustomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  splashContainer: { flex: 1 },
  splashGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center' },
  logoContainer: { marginBottom: 24 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  splashTitle: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  splashSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  profileGradient: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 22,
  },

  searchContainer: {
    marginHorizontal: 20, marginTop: -25, marginBottom: 10,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 15,
  },
  searchBlur: { borderRadius: 20, overflow: 'hidden' },
  searchGradient: {
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  searchInputBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#1f2937', fontWeight: '500' },
  clearButton: {
    padding: 4, borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },

  mainContent: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 16 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  clearHistoryButton: { borderRadius: 12, overflow: 'hidden' },
  clearButtonGradient: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, gap: 10 },
  chipWrapper: { marginBottom: 4 },

  productRow: { justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16 },
  productWrapper: { flex: 1, marginHorizontal: 4 },
});
