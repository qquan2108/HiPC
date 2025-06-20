import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

// Demo dữ liệu sản phẩm PC để so sánh
const compareProducts = [
  {
    id: 1,
    name: 'PC GVN Intel i3-12100F/ VGA RX 6500XT',
    price: 10490000,
    oldPrice: 11430000,
    image: require('../assets/images/pc1.png'),
    cpu: 'Intel i3-12100F',
    ram: '16GB DDR4',
    ssd: '512GB NVMe',
    vga: 'RX 6500XT',
    mainboard: 'B660M',
    psu: '550W',
    case: 'Xigmatek NYX 3F',
    weight: '7 kg',
    origin: 'Việt Nam',
    warranty: '36 tháng',
    year: 2024,
    sold: 1780,
    rating: 4.5,
  },
  {
    id: 2,
    name: 'PC GVN Intel i5-12400F/ RTX 3050',
    price: 15490000,
    oldPrice: 16490000,
    image: require('../assets/images/pc1.png'),
    cpu: 'Intel i5-12400F',
    ram: '16GB DDR4',
    ssd: '1TB NVMe',
    vga: 'RTX 3050',
    mainboard: 'B660M',
    psu: '650W',
    case: 'Xigmatek NYX 3F',
    weight: '7.5 kg',
    origin: 'Việt Nam',
    warranty: '36 tháng',
    year: 2024,
    sold: 1200,
    rating: 4.7,
  },
  {
    id: 3,
    name: 'PC GVN Intel i7-12700F/ RTX 3060',
    price: 23490000,
    oldPrice: 24990000,
    image: require('../assets/images/pc1.png'),
    cpu: 'Intel i7-12700F',
    ram: '32GB DDR4',
    ssd: '1TB NVMe',
    vga: 'RTX 3060',
    mainboard: 'B660M',
    psu: '750W',
    case: 'Xigmatek NYX 3F',
    weight: '8 kg',
    origin: 'Việt Nam',
    warranty: '36 tháng',
    year: 2025,
    sold: 800,
    rating: 4.9,
  },
];

const specs = [
  { label: 'CPU', key: 'cpu' },
  { label: 'RAM', key: 'ram' },
  { label: 'Ổ cứng SSD', key: 'ssd' },
  { label: 'Card đồ họa', key: 'vga' },
  { label: 'Mainboard', key: 'mainboard' },
  { label: 'Nguồn', key: 'psu' },
  { label: 'Case', key: 'case' },
  { label: 'Khối lượng', key: 'weight' },
  { label: 'Xuất xứ', key: 'origin' },
  { label: 'Năm ra mắt', key: 'year' },
  { label: 'Bảo hành', key: 'warranty' },
];

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function SoSanhSanPham() {
  return (
    <ScrollView style={styles.container}>
      {/* Header sản phẩm */}
      <View style={styles.productRow}>
        {compareProducts.map((p, idx) => (
          <View style={styles.productCol} key={p.id}>
            <View style={styles.productImgWrap}>
              <Image source={p.image} style={styles.productImg} />
            </View>
            <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
            <View style={styles.priceBox}>
              <View style={styles.priceCol}>
                <Text style={styles.price} numberOfLines={1}>{formatCurrency(p.price)}</Text>
                <Text style={styles.oldPrice} numberOfLines={1}>{formatCurrency(p.oldPrice)}</Text>
              </View>
            </View>
            <View style={styles.ratingSoldRow}>
              <Text style={styles.rating}>★ {p.rating}</Text>
              <Text style={styles.sold}>Đã bán {p.sold}</Text>
            </View>
            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailBtnText}>XEM CHI TIẾT</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Thông số kỹ thuật */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG SỐ KỸ THUẬT</Text>
        {specs.map((spec, idx) => (
          <View
            style={[
              styles.specRow,
              idx % 2 === 1 && styles.specRowAlt
            ]}
            key={spec.key}
          >
            <Text style={styles.specLabel}>{spec.label}</Text>
            {compareProducts.map((p, i) => (
              <Text style={styles.specValue} key={p.id + '-' + spec.key}>
                {p[spec.key] || 'Không có'}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  productRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 18,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minWidth: 120,
    maxWidth: 160,
  },
  productImgWrap: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  productImg: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 38,
    maxWidth: 130,
  },
  priceBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceCol: {
    alignItems: 'center',
    width: '100%',
  },
  price: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 16,
    maxWidth: 110,
    textAlign: 'center',
  },
  oldPrice: {
    color: '#aaa',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 0,
    maxWidth: 110,
    textAlign: 'center',
  },
  ratingSoldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rating: {
    color: '#fbc02d',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sold: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  detailBtn: {
    backgroundColor: '#2979ff',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginTop: 6,
    elevation: 1,
  },
  detailBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  divider: {
    height: 10,
    backgroundColor: '#f5f5f5',
    width: '100%',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 0,
    paddingBottom: 20,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2979ff',
    backgroundColor: '#f5faff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e3eaf3',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  specRowAlt: {
    backgroundColor: '#f8fafc',
  },
  specLabel: {
    flex: 1.2,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  specValue: {
    flex: 1,
    color: '#444',
    fontSize: 13.5,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});