// SearchScreen.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchChip from "../compomentSearch/SearchChip";
import axiosInstance from "../utils/AxiosInstance";
import CustomTabBar from "../compomentHome/CustomTabBar";

const { width, height } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const ITEM_SIZE = (width - 60) / NUM_COLUMNS - 8;

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { id } = useLocalSearchParams();

  const router = useRouter();

  // Animation on mount
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

  // Load products + categories + images
  useEffect(() => {
    // products
    axiosInstance
      .get("/product")
      .then((res) => {
        const arr = Array.isArray(res.data.products) ? res.data.products : [];
        const mapped = arr.map((p) => ({
          ...p,
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image
            ? { uri: p.image }
            : require("../assets/images/pc1.png"),
        }));
        setProducts(mapped);
        setFilteredProducts(mapped);
      })
      .catch(() => setProducts([]));

    // categories + icons
    Promise.all([axiosInstance.get("/category"), axiosInstance.get("/images")])
      .then(([catRes, imgRes]) => {
        const imgs = imgRes.data;
        const cats = catRes.data.map((cat) => {
          const found = imgs.find((i) => i.category_id?._id === cat._id);
          return {
            _id: cat._id,
            name: cat.name,
            icon: found
              ? { uri: found.url }
              : require("../assets/images/pc.png"),
          };
        });
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, []);

  // typing filter
  useEffect(() => {
    if (!search) {
      setFilteredProducts(products);
    } else {
      const kw = search.toLowerCase();
      setFilteredProducts(
        products.filter((p) => p.name.toLowerCase().includes(kw))
      );
    }
  }, [search, products]);

  const handleSearchSubmit = useCallback(() => {
    if (search && !searchHistory.includes(search)) {
      setSearchHistory([search, ...searchHistory.slice(0, 9)]); // Limit to 10 items
    }
    const kw = search.trim().toLowerCase();
    setFilteredProducts(
      products.filter((p) => p.name.toLowerCase().includes(kw))
    );
    setIsSearchFocused(false);
  }, [search, searchHistory, products]);

  const handleRemoveHistory = useCallback(
    (item) => setSearchHistory((h) => h.filter((x) => x !== item)),
    []
  );

  const handleClearHistory = useCallback(() => setSearchHistory([]), []);

  const handleHistoryPress = useCallback(
    (item) => {
      setSearch(item);
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(item.toLowerCase())
        )
      );
      setIsSearchFocused(false);
    },
    [products]
  );

  // Fix: Handle product press with proper navigation
  const handleProductPress = useCallback(async (item) => {
    console.log("Product pressed:", item.id, typeof item.id);
    
    // Clear search and hide dropdown first
    setSearch("");
    setIsSearchFocused(false);
    
    // Navigate to product details
    // Make sure the id is properly formatted
    const productId = item.id || item._id;
    if (productId) {
      try {
        // Use setTimeout to ensure state updates complete first
        setTimeout(() => {
console.log("Navigating to:", `/ctsp?id=${productId}`);
    router.push(`/ctsp?id=${productId}`);
        }, 100);
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback navigation method
        setTimeout(() => {
          router.push({
            pathname: "/ctsp/[id]",
            params: { id: productId }
          });
        }, 100);
      }
    } else {
      console.error("Product ID not found:", item);
    }
  }, [router]);

  useEffect(
    () => setShowProductDropdown(!!search && isSearchFocused),
    [search, isSearchFocused]
  );

  const renderCategory = ({ item, index }) => (
    <Animated.View
      style={[
        styles.categoryContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() =>
          router.push({ pathname: "/DanhMucPC", params: { id: item._id } })
        }
        activeOpacity={0.7}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={item.icon}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.categoryLabel} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPopularSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.popularSearchItem}
      onPress={() => handleHistoryPress(item)}
    >
      <Feather name="trending-up" size={16} color="#6366f1" />
      <Text style={styles.popularSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  const popularSearches = [
    "Laptop Gaming",
    "iPhone",
    "MacBook",
    "Gaming PC",
    "Tai nghe",
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Khám phá</Text>
          <Text style={styles.headerSubtitle}>
            Tìm kiếm sản phẩm công nghệ tốt nhất
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Feather name="user" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}
        >
          <Feather
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Delay hiding results to allow for touch events
              setTimeout(() => setIsSearchFocused(false), 300);
            }}
            placeholderTextColor="#9ca3af"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.filterButton}>
              <Feather name="sliders" size={18} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Overlay - Fixed */}
      {search.length > 0 && isSearchFocused && (
        <View style={styles.searchOverlay}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => String(item.id || item._id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleProductPress(item)}
                activeOpacity={0.7}
                delayPressIn={0}
                delayPressOut={0}
              >
                <Image source={item.image} style={styles.resultImage} />
                <View style={styles.resultContent}>
                  <Text numberOfLines={1} style={styles.resultTitle}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultPrice}>
                    {item.price?.toLocaleString("vi-VN")}₫
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            style={styles.resultList}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.noResultsSubtext}>
                  Thử tìm kiếm với từ khóa khác
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search History Section */}
        {searchHistory.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              <TouchableOpacity
                onPress={handleClearHistory}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyScroll}
            >
              {searchHistory.map((item) => (
                <SearchChip
                  key={item}
                  item={item}
                  onRemove={() => handleRemoveHistory(item)}
                  onPress={() => handleHistoryPress(item)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Popular Searches */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
          <FlatList
            data={popularSearches}
            keyExtractor={(item) => item}
            renderItem={renderPopularSearch}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animated.View>

        {/* Categories Grid */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Danh mục nổi bật</Text>
          <FlatList
            data={categories}
            keyExtractor={(c) => c._id}
            numColumns={NUM_COLUMNS}
            renderItem={renderCategory}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            columnWrapperStyle={styles.categoryRow}
          />
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CustomTabBar router={router} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "400",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search Styles
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchContainerFocused: {
    borderColor: "#6366f1",
    backgroundColor: "#ffffff",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  // Search Overlay Styles - Fixed
  searchOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 140 : 120, // Adjust based on header height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  resultList: {
    flex: 1,
    backgroundColor: "#fff",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    color: "#111",
    marginBottom: 4,
    fontWeight: "500",
  },
  resultPrice: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "500",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Section Styles
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  clearAllText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  // History Scroll
  historyScroll: {
    paddingRight: 20,
  },

  // Popular Search Items
  popularSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  popularSearchText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 32,
  },

  // Category Styles
  categoriesGrid: {
    paddingTop: 8,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categoryContainer: {
    width: ITEM_SIZE,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  categoryImageContainer: {
    width: ITEM_SIZE * 0.6,
    height: ITEM_SIZE * 0.6,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryImage: {
    width: "80%",
    height: "80%",
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 20,
  },
});