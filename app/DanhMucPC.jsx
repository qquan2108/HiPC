// screens/DanhMucPCScreen.js
import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Dimensions, TextInput, FlatList, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from '../utils/AxiosInstance';
import CustomTabBar from '../compomentHome/CustomTabBar';

const { width } = Dimensions.get('window');
const LEFT_WIDTH = 80;
const RIGHT_WIDTH = width - LEFT_WIDTH;

export default function DanhMucPCScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  // Bộ lọc mẫu (tuỳ ý)
  const BRANDS = ['ASUS','MSI','Gigabyte','ASRock','EVGA','Biostar','Colorful'];
  const PRICES = ['Dưới 2 triệu','2–4 triệu','4–7 triệu','7–13 triệu','Trên 13 triệu'];
  const HOT = ['RTX 4060','Ryzen 7 7800X','Corsair Vengeance','NZXT H510','Seagate 2TB','WD Blue'];

  // Fetch categories + icon
  useEffect(() => {
    (async () => {
      try {
        const [catRes, imgRes] = await Promise.all([
          axios.get('/category'),
          axios.get('/images')
        ]);
        const imgs = imgRes.data;
        setCategories(catRes.data.map(cat => {
          const found = imgs.find(i => i.category_id?._id === cat._id);
          return {
            _id: cat._id,
            name: cat.name,
            icon: found ? { uri: found.url } : require('../assets/images/pc.png'),
          };
        }));
        if (catRes.data[0]) setSelectedCat(catRes.data[0]._id);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Fetch ALL products
  useEffect(() => {
    axios.get('/product')
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]));
  }, []);

  // Tìm object category đang chọn
  const catObj = categories.find(c => c._id === selectedCat);

  // Lọc sản phẩm theo category đang chọn (category_id có thể là object hoặc string)
  const filteredProducts = products.filter(p =>
    (typeof p.category_id === 'string' && p.category_id === selectedCat) ||
    (typeof p.category_id === 'object' && (p.category_id._id === selectedCat || p.category_id['$oid'] === selectedCat))
  );

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
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* DANH SÁCH SẢN PHẨM */}
          {filteredProducts.length === 0 ? (
            <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>
              Không có sản phẩm nào
            </Text>
          ) : (
            filteredProducts.map(p => (
              <TouchableOpacity
                key={p._id || p.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  shadowColor: '#eee',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                onPress={() => router.push({ pathname: '/ctsp', params: { id: p._id || p.id } })}
              >
                <Image
                  source={p.image ? { uri: p.image } : require('../assets/images/pc1.png')}
                  style={{ width: 54, height: 54, borderRadius: 8, marginRight: 12, backgroundColor: '#f2f2f2' }}
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ fontWeight: '700' }}>{p.name}</Text>
                  <Text style={{ color: '#009688', marginTop: 2 }}>
                    {Number(p.price).toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Các filter */}
          <FilterSection title="Hãng" data={BRANDS} />
          <FilterSection title="Phân khúc giá" data={PRICES} />
          <FilterSection title="HOT ⚡️" data={HOT} />
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
      {/* TAB BAR */}
      <CustomTabBar router={router} style={styles.tabbar} />
    </SafeAreaView>
  );
}

// Component con cho mỗi section filter
function FilterSection({ title, data }) {
  return (
    <View style={styles.sec}>
      <Text style={styles.secTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {data.map((label, i) => (
          <TouchableOpacity key={i} style={styles.tag}>
            <Text style={styles.tagText}>{label}</Text>
          </TouchableOpacity>
        ))}
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
});
