import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const product = {
  id: 1,
  name: 'PC ST-MERCURY R5SP (Ryzen 5 4650G, Radeon Graphics, Ram 8GB, SSD 500GB, 450W, Win 11)',
  price: 9800000,
  oldPrice: 19600000,
  image: require('../assets/images/pc1.png'),
  rating: 5,
  sold: 10000,
  cpu: 'R7-5700G',
  main: 'B450M',
  ram: '8GB',
  ssd: '500GB NVMe',
  onboard: true,
  gifts: [
    'QUÀ TẶNG ĐẶC BIỆT cho PC Văn Phòng: Chuột Logitech B100, Bàn phím Logitech K120, Bản quyền Windows 10/Office Professional Plus 2021 (cài sẵn), Lót chuột HIPC',
  ],
  desc: `Ưu đãi sản phẩm
QUÀ TẶNG ĐẶC BIỆT cho PC Văn Phòng:
Chuột Logitech B100, Bàn phím Logitech K120
Bản quyền Windows 10/Office Professional Plus 2021 (cài sẵn), Lót chuột HIPC
Lưu ý: Hình ảnh chỉ mang tính chất minh họa
Hỗ trợ thanh toán thẻ Visa, MasterCard`,
};

const similarProducts = [
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

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function CTSP() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Feather name="arrow-left" size={22} color="#222" />
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <Feather name="share-2" size={22} color="#222" />
        </View>

        {/* Product Image */}
        <Image source={product.image} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.infoBox}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
            <Text style={styles.productOldPrice}>{formatCurrency(product.oldPrice)}</Text>
            <Text style={styles.productDiscount}>50% Off</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>★★★★★</Text>
            <Text style={styles.ratingText}>{product.sold.toLocaleString()} đánh giá</Text>
          </View>
        </View>

        {/* Config Box */}
        <View style={styles.configBox}>
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>CPU</Text>
              <Text style={styles.configValue}>{product.cpu}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Main</Text>
              <Text style={styles.configValue}>{product.main}</Text>
            </View>
          </View>
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>RAM</Text>
              <Text style={styles.configValue}>{product.ram}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>SSD</Text>
              <Text style={styles.configValue}>{product.ssd}</Text>
            </View>
          </View>
        </View>

        {/* Gifts */}
        <View style={styles.giftBox}>
          <Text style={styles.giftTitle}>Ưu đãi sản phẩm</Text>
          {product.gifts.map((gift, idx) => (
            <Text key={idx} style={styles.giftText}>{gift}</Text>
          ))}
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <Text style={styles.descText}>{product.desc}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addCartBtn}>
            <Feather name="shopping-cart" size={18} color="#1a73e8" />
            <Text style={styles.addCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowBtn}>
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Fast Delivery */}
        <View style={styles.deliveryBox}>
          <MaterialIcons name="local-shipping" size={20} color="#f55858" />
          <Text style={styles.deliveryText}>Giao hàng trong 1 giờ</Text>
        </View>

        {/* Similar Products */}
        <View style={styles.similarBox}>
          <View style={styles.similarHeader}>
            <Text style={styles.similarTitle}>Tương tự sản phẩm</Text>
            <TouchableOpacity>
              <Text style={styles.similarSeeAll}>282+ sản phẩm</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={similarProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.similarCard}>
                <Image source={item.image} style={styles.similarImage} />
                <Text numberOfLines={2} style={styles.similarName}>{item.name}</Text>
                <Text style={styles.similarPrice}>{item.price}</Text>
                <View style={styles.similarInfoRow}>
                  <Text style={styles.similarRating}>★★★★★</Text>
                  <Text style={styles.similarSold}>{item.sold} đã bán</Text>
                </View>
              </View>
            )}
          />
        </View>
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
          <TouchableOpacity style={styles.tabCartBtn}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
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
    color: '#222',
    letterSpacing: 1,
  },
  productImage: {
    width: '92%',
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    padding: 12,
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  productOldPrice: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  productDiscount: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 13,
    backgroundColor: '#ffeaea',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingStars: {
    color: '#fbc02d',
    fontSize: 14,
    marginRight: 6,
  },
  ratingText: {
    color: '#888',
    fontSize: 13,
  },
  configBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    flexDirection: 'column',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  configItem: {
    flex: 1,
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  configValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
  },
  giftBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
  },
  giftTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
  giftText: {
    fontSize: 13,
    color: '#1a73e8',
    marginBottom: 2,
  },
  descBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
  },
  descText: {
    fontSize: 13,
    color: '#222',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf3ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  addCartText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  buyNowBtn: {
    backgroundColor: '#4cd964',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buyNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deliveryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  deliveryText: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  similarBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 24,
    padding: 12,
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  similarTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  similarSeeAll: {
    color: '#1a73e8',
    fontSize: 13,
    fontWeight: '600',
  },
  similarCard: {
    width: 140,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginRight: 12,
    padding: 8,
    alignItems: 'center',
  },
  similarImage: {
    width: 90,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  similarName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  similarPrice: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  similarInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    justifyContent: 'center',
  },
  similarRating: {
    color: '#fbc02d',
    fontSize: 12,
    marginRight: 4,
  },
  similarSold: {
    color: '#888',
    fontSize: 12,
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