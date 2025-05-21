import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const initialCart = [
  {
    id: 1,
    name: 'PC chơi game RTX 3060',
    desc: 'i5 12400F + Tản Khí / 16GB / 500GB',
    price: 15280000,
    oldPrice: 18990000,
    image: require('../assets/images/pc1.png'),
    quantity: 2,
  },
  {
    id: 2,
    name: 'PC GAMING CAO RTX 4060',
    desc: 'i5 12400F + Tản Khí / 16GB / 500GB',
    price: 17280000,
    oldPrice: 19990000,
    image: require('../assets/images/pc1.png'),
    quantity: 1,
  },
];

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function Card() {
  const [cart, setCart] = useState(initialCart);

  const handleQuantity = (id, delta) => {
    setCart(cart =>
      cart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemove = id => {
    setCart(cart => cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Feather name="arrow-left" size={22} color="#222" />
          <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
          <Feather name="heart" size={22} color="#222" />
        </View>

        {/* Cart Items */}
        <View style={styles.cartBox}>
          {cart.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={item.image} style={styles.cartImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartDesc}>{item.desc}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={styles.cartPrice}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.cartOldPrice}>{formatCurrency(item.oldPrice)}</Text>
                </View>
                <View style={styles.cartBottomRow}>
                  <Text style={styles.cartTotal}>{formatCurrency(item.price * item.quantity)}</Text>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity onPress={() => handleQuantity(item.id, -1)}>
                      <Text style={styles.qtyBtn}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleQuantity(item.id, 1)}>
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.id)}>
                    <Feather name="trash-2" size={20} color="#222" style={{ marginLeft: 10 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Ghi chú đơn hàng */}
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Ghi chú đơn hàng</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Nhập ghi chú cho đơn hàng"
            placeholderTextColor="#bbb"
            multiline
          />
        </View>

        {/* Phiếu giảm giá */}
        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Áp dụng phiếu giảm giá</Text>
          <TouchableOpacity>
            <Text style={styles.voucherChoose}>Chọn</Text>
          </TouchableOpacity>
        </View>

        {/* Chi tiết thanh toán */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Chi tiết thanh toán đặt hàng</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Số tiền đặt hàng</Text>
            <Text style={styles.paymentValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phiếu giảm giá</Text>
            <Text style={[styles.paymentValue, { color: '#f55858' }]}>Áp dụng phiếu giảm giá</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phí giao hàng</Text>
            <Text style={[styles.paymentValue, { color: '#1a73e8' }]}>miễn phí</Text>
          </View>
        </View>

        {/* Tổng tiền */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>

        {/* Tiếp tục */}
        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueText}>Tiếp Tục</Text>
        </TouchableOpacity>
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
  cartBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },
  cartName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  cartDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  cartPrice: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  cartOldPrice: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  cartBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cartTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginRight: 12,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
  qtyBtn: {
    fontSize: 18,
    color: '#888',
    paddingHorizontal: 6,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 15,
    color: '#222',
    marginHorizontal: 6,
    minWidth: 18,
    textAlign: 'center',
  },
  noteBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 12,
  },
  noteLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noteInput: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    minHeight: 60,
    padding: 8,
    fontSize: 14,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 12,
  },
  voucherLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  voucherChoose: {
    color: '#f55858',
    fontWeight: 'bold',
    fontSize: 15,
  },
  paymentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
  },
  paymentTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#222',
  },
  paymentValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 18,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: '#f55858',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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