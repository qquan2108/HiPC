import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

function formatCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return '—';
  return num.toLocaleString('vi-VN') + 'đ';
}

// Helper để lấy thông số kỹ thuật cho mỗi product
function extractSpecs(product) {
  // Nếu truyền thẳng specs/specifications dạng mảng object {key,value}
  if (Array.isArray(product.specs) && product.specs.length) {
    return product.specs.map(s => ({
      key: s.label || s.key,
      value: s.value,
    }));
  }
  if (Array.isArray(product.specifications) && product.specifications.length) {
    return product.specifications.map(s => ({
      key: s.label || s.key,
      value: s.value,
    }));
  }
  // Nếu truyền flat field (thường chỉ có ở sample hoặc cứng code)
  const fields = ['cpu', 'ram', 'ssd', 'vga', 'mainboard', 'psu', 'case', 'weight', 'origin', 'year', 'warranty'];
  return fields.map(k => ({
    key: k,
    value: product[k] || '',
  }));
}

export default function SoSanhSanPham() {
  const params = useLocalSearchParams();
  let compareProducts = [];

  try {
    if (params.compare) {
      compareProducts = JSON.parse(params.compare);
    }
  } catch {
    compareProducts = [];
  }

  if (!compareProducts.length) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>Không có sản phẩm để so sánh.</Text>
      </View>
    );
  }

  // ---- Auto union key spec ----
  // 1. Gom hết keys specs xuất hiện ở tất cả sp
  let allSpecs = [];
  compareProducts.forEach(p => {
    let specsArr = extractSpecs(p);
    specsArr.forEach(s => {
      if (s.key && !allSpecs.find(ax => ax.key === s.key)) {
        allSpecs.push({ key: s.key, label: s.key });
      }
    });
  });

  // 2. Đặt lại tên hiển thị cho specs phổ biến (nếu key khớp)
  const labelMap = {
    cpu: 'CPU',
    ram: 'RAM',
    ssd: 'Ổ cứng SSD',
    vga: 'Card đồ họa',
    mainboard: 'Mainboard',
    psu: 'Nguồn',
    case: 'Case',
    weight: 'Khối lượng',
    origin: 'Xuất xứ',
    year: 'Năm ra mắt',
    warranty: 'Bảo hành',
    // nếu muốn auto detect thêm thì add ở đây
  };
  allSpecs = allSpecs.map(s => ({
    ...s,
    label: labelMap[s.key?.toLowerCase()] || s.label || s.key
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Header sản phẩm */}
      <View style={styles.productRow}>
        {compareProducts.map((p, idx) => (
          <View style={styles.productCol} key={p.id || idx}>
            <View style={styles.productImgWrap}>
              <Image source={p.image || require('../assets/images/pc1.png')} style={styles.productImg} />
            </View>
            <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
            <View style={styles.priceBox}>
              <View style={styles.priceCol}>
                <Text style={styles.price} numberOfLines={1}>{formatCurrency(p.price)}</Text>
                <Text style={styles.oldPrice} numberOfLines={1}>{formatCurrency(p.oldPrice)}</Text>
              </View>
            </View>
            <View style={styles.ratingSoldRow}>
              <Text style={styles.rating}>★ {p.rating || "—"}</Text>
              <Text style={styles.sold}>Đã bán {p.sold || "—"}</Text>
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
        {allSpecs.map((spec, idx) => (
          <View
            style={[
              styles.specRow,
              idx % 2 === 1 && styles.specRowAlt
            ]}
            key={spec.key}
          >
            <Text style={styles.specLabel}>{spec.label}</Text>
            {compareProducts.map((p, i) => {
              let value = '';
              // Tìm thông số key này trong specs/specifications hoặc flat object
              let arr = extractSpecs(p);
              let found = arr.find(s => (s.key?.toLowerCase?.() === spec.key?.toLowerCase?.()));
              value = found?.value ?? p[spec.key] ?? '—';
              return (
                <Text style={styles.specValue} key={(p.id || i) + '-' + spec.key}>
                  {value || '—'}
                </Text>
              );
            })}
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
