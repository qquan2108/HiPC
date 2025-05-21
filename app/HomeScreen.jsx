import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const categories = [
  { key: 'PC', icon: require('../assets/images/pc.png'), label: 'PC' },
  { key: 'Ram', icon: require('../assets/images/ram.png'), label: 'Ram' },
  { key: 'Ổ cứng', icon: require('../assets/images/DC.png'), label: 'Ổ cứng' },
  { key: 'Thẻ nhớ', icon: require('../assets/images/the.png'), label: 'Thẻ nhớ' },
  { key: 'NAS', icon: require('../assets/images/mag.png'), label: 'NAS' },
];

const products = [
  {
    id: '1',
    name: 'PC SE-MERCURY G7 Ryzen 5 5600G, Radeon Graphics, Ram 8GB, SSD 500GB, Win 11',
    price: '9.190.000đ',
    image: require('../assets/images/pc1.png'),
    rating: 5,
    sold: 100,
  },
  {
    id: '2',
    name: 'PC SE-MERCURY G7 Ryzen 5 4650G, Radeon Graphics, Ram 8GB, SSD 500GB, Win 11',
    price: '9.190.000đ',
    image: require('../assets/images/pc1.png'),
    rating: 5,
    sold: 100,
  },
];

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Feather name="menu" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HIPC SALE</Text>
          <TouchableOpacity style={styles.avatarBtn}>
            <Image
              source={require('../assets/images/avatar.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
       <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color="#aaa" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#aaa"
              style={{ flex: 1, fontSize: 15 }}
            />
            <Feather name="mic" size={18} color="#ccc" style={{ marginLeft: 8 }} />
             <MaterialCommunityIcons name="google-lens" size={20} color="#ccc" style={{ marginLeft: 8 }} />
          </View>
        </View>

        {/* Danh mục nổi bật */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tất cả nổi bật</Text>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Lọc</Text>
            <Feather name="filter" size={16} color="#222" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          style={{ marginBottom: 10, marginLeft: 10 }}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Image source={item.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </View>
          )}
        />

        {/* Banner */}
        <Image source={require('../assets/images/banner1.png')} style={styles.banner} />

        {/* Ưu đãi trong ngày */}
    
              <View style={styles.dealBox}>
                  <View style={styles.sectionRow}>
                      <Text style={styles.sectionTitle}>Ưu đãi trong ngày</Text>
                      <TouchableOpacity>
                          <Text style={styles.linkText}>Xem tất cả &gt;</Text>
                      </TouchableOpacity>
                  </View>
                  <Text style={styles.timeText}>⏰ 20 giờ 30 phút 30 giây</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                      {products.map(product => (
                          <View key={product.id} style={styles.productCard}>
                              <Image source={product.image} style={styles.productImage} />
                              <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
                              <Text style={styles.productPrice}>{product.price}</Text>
                              <View style={styles.productInfoRow}>
                                  <Text style={styles.rating}>★★★★★</Text>
                                  <Text style={styles.soldText}>{product.sold} đã bán</Text>
                              </View>
                          </View>
                      ))}
                  </ScrollView>
              </View>

        {/* Banner nhỏ */}
        <Image source={require('../assets/images/banner1.png')} style={styles.bannerSmall} />

        {/* Sản phẩm thịnh hành */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sản phẩm thịnh hành</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Xem tất cả &gt;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {products.map(product => (
            <View key={product.id + 'hot'} style={styles.productCard}>
              <Image source={product.image} style={styles.productImage} />
              <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
              <View style={styles.productInfoRow}>
                <Text style={styles.rating}>★★★★★</Text>
                <Text style={styles.soldText}>{product.sold} đã bán</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Banner SanDisk */}
        <Image source={require('../assets/images/banner1.png')} style={styles.bannerSandisk} />

        {/* Hàng mới về */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Hàng mới về</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Xem tất cả &gt;</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.newTag}># Top PC hot nhất Hè 2025</Text>

        {/* Được tài trợ */}
        <Image source={require('../assets/images/banner1.png')} style={styles.bannerSponsor} />

        {/* Giảm giá */}
        <Text style={styles.discountText}>Giảm giá 50%</Text>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={22} color="#f55858" />
          <Text style={styles.tabLabelActive}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="heart" size={22} color="#222" />
          <Text style={styles.tabLabel}>Yêu thích</Text>
        </TouchableOpacity>

        <View style={styles.tabCartWrapper}>
          <TouchableOpacity style={styles.tabCartBtn} >
            <Feather name="shopping-cart" size={28} color="#222" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="search" size={22} color="#222" />
          <Text style={styles.tabLabel}>Tìm kiếm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="settings" size={22} color="#222" />
          <Text style={styles.tabLabel}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ...existing code...
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#fafafa' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1a73e8',
    letterSpacing: 1,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 10,
  },

  // Filter chip (danh mục nổi bật)
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  linkText: {
    color: '#1a73e8',
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    color: '#1a73e8',
    fontSize: 13,
    marginLeft: 18,
    marginBottom: 8,
  },

  // Category
  categoryItem: {
    alignItems: 'center',
    marginRight: 22,
    width: 72,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    marginBottom: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
  },

  // Banner
  banner: {
    width: width - 36,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'cover',
  },
  bannerSmall: {
    width: width - 36,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'cover',
  },
  bannerSandisk: {
    width: width - 36,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'cover',
  },
  bannerSponsor: {
    width: width - 36,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 18,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'cover',
  },

  // Deal box (Ưu đãi trong ngày)
  dealBox: {
    backgroundColor: 'pink',
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 10,
    shadowColor: '#f55858',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  // Product
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'contain',
    backgroundColor: '#f3f3f3',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productPrice: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  productInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    color: '#fbc02d',
    fontSize: 12,
    marginRight: 6,
  },
  soldText: {
    color: '#888',
    fontSize: 12,
  },

  // Tag & Discount
  newTag: {
    color: '#222',
    fontSize: 13,
    marginLeft: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  discountText: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 18,
    marginBottom: 20,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#222',
  },
  tabLabelActive: {
    fontSize: 12,
    color: '#f55858',
    fontWeight: 'bold',
  },
  tabCartWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
  },
  tabCartBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});