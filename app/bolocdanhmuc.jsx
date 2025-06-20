import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
const categories = [
  {
    key: 'PC',
    label: 'PC',
    icon: require('../assets/images/pc.png'),
    sub: ['PC I3', 'PC I5', 'PC I7', 'PC I9', 'PC R3', 'PC R5', 'PC R7', 'PC R9'],
  },
  {
    key: 'RAM',
    label: 'RAM',
    icon: require('../assets/images/ram.png'),
    sub: ['DDR3', 'DDR4', 'DDR5', 'Laptop', 'Desktop'],
  },
  {
    key: 'TANNHIET',
    label: 'Tản nhiệt',
    icon: require('../assets/images/pc1.png'),
    sub: ['Fan 120mm', 'Fan 140mm', 'Water Cooling', 'Air Cooling'],
  },
  {
    key: 'VGA',
    label: 'VAG',
    icon: require('../assets/images/the.png'),
    sub: ['GTX 1650', 'RTX 3060', 'RTX 4060', 'RX 6600'],
  },
  {
    key: 'OCUNG',
    label: 'Ổ cứng',
    icon: require('../assets/images/DC.png'),
    sub: ['SSD 256GB', 'SSD 512GB', 'HDD 1TB', 'HDD 2TB'],
  },
  {
    key: 'FORYOU',
    label: 'Dành cho bạn',
    icon: require('../assets/images/pc1.png'),
    sub: [],
    special: true,
  },
];

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pc', label: 'PC' },
  { key: 'build', label: 'Biuld PC' },
];

export default function BoLocDanhMuc() {
  // Lưu trạng thái mở/đóng từng danh mục
  const [open, setOpen] = useState([]);

  const [activeTab, setActiveTab] = useState('all');

  // Toggle mở/đóng từng danh mục
  const handleToggle = (key) => {
    setOpen(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bộ lọc danh mục</Text>
        <TouchableOpacity>
          <Feather name="x" size={28} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeTab === tab.key && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {categories.map((cat, idx) => (
          <View key={cat.key} style={styles.catBlock}>
            <TouchableOpacity
              style={styles.catHeader}
              activeOpacity={0.7}
              onPress={() => handleToggle(cat.key)}
            >
              <Image source={cat.icon} style={styles.catIcon} />
              <Text style={styles.catLabel}>{cat.label}</Text>
              {cat.special ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                  <MaterialIcons name="star" size={20} color="#2979ff" />
                  <TouchableOpacity style={styles.specialBtn}>
                    <Feather name="arrow-right" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Feather
                  name={open.includes(cat.key) ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#222"
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
            {/* Subcategory grid */}
            {open.includes(cat.key) && cat.sub && cat.sub.length > 0 && (
              <View style={styles.subGrid}>
                {cat.sub.map((sub, i) => (
                  <View key={sub} style={styles.subItemWrap}>
                    <TouchableOpacity style={styles.subItem}>
                      <Text style={styles.subText}>{sub}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#222',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  tabBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f5f6fa',
    marginRight: 10,
  },
  tabBtnActive: {
    backgroundColor: '#2979ff',
  },
  tabText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  catBlock: {
    marginBottom: 16,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f6fa',
  },
  catLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  subItemWrap: {
    width: '48%',
    margin: '1%',
  },
  subItem: {
    borderWidth: 1,
    borderColor: '#ffd6d6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  subText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  specialBtn: {
    marginLeft: 8,
    backgroundColor: '#2979ff',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});