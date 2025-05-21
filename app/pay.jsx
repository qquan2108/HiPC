import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const paymentMethods = [
  {
    key: 'visa',
    label: 'VISA',
    logo: require('../assets/images/visa.png'), // Thay bằng ảnh logo VISA của bạn
    number: '********2109',
  },
  {
    key: 'paypal',
    label: 'PayPal',
    logo: require('../assets/images/paypal.png'), // Thay bằng ảnh logo PayPal của bạn
    number: '********2109',
  },
  {
    key: 'mastercard',
    label: 'MasterCard',
    logo: require('../assets/images/mastercard.png'), // Thay bằng ảnh logo MasterCard của bạn
    number: '********2109',
  },
  {
    key: 'applepay',
    label: 'Apple Pay',
    logo: require('../assets/images/applepay.png'), // Thay bằng ảnh logo Apple Pay của bạn
    number: '********2109',
  },
];

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function Pay() {
  const [selected, setSelected] = useState('visa');
  const total = 47840000;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Feather name="arrow-left" size={22} color="#222" />
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Tổng kết đơn */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đặt hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vận chuyển</Text>
            <Text style={styles.summaryValue}>0đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Tổng cộng</Text>
            <Text style={styles.summaryValueBold}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Thanh toán bằng */}
        <Text style={styles.payWithLabel}>Thanh toán bằng</Text>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.methodBox,
              selected === method.key && styles.methodBoxActive,
            ]}
            onPress={() => setSelected(method.key)}
            activeOpacity={0.8}
          >
            <View style={styles.methodRow}>
              <Image source={method.logo} style={styles.methodLogo} resizeMode="contain" />
              <Text style={styles.methodLabel}>{method.label}</Text>
            </View>
            <Text style={styles.methodNumber}>{method.number}</Text>
          </TouchableOpacity>
        ))}

        {/* Tiếp tục */}
        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueText}>Tiếp tục</Text>
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
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#222',
  },
  summaryValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  summaryLabelBold: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  summaryValueBold: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  payWithLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 18,
    marginBottom: 10,
  },
  methodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodBoxActive: {
    borderColor: '#f55858',
    backgroundColor: '#fff',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLogo: {
    width: 40,
    height: 24,
    marginRight: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  methodNumber: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
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