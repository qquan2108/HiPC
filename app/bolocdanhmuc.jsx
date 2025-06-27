import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import axiosInstance from '../utils/AxiosInstance'; // Đảm bảo đã có file này

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pc', label: 'PC' },
  { key: 'build', label: 'Biuld PC' },
];

export default function BoLocDanhMuc() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/category');
        setCategories(res.data);
      } catch (err) {
        // Có thể dùng Toast ở đây nếu muốn
        console.error('Lỗi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

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
          <View key={cat._id} style={styles.catBlock}>
            <TouchableOpacity
              style={styles.catHeader}
              activeOpacity={0.7}
              onPress={() => handleToggle(cat._id)}
            >
              {/* Nếu có icon thì hiển thị, không thì bỏ */}
              {cat.icon && <Image source={{ uri: cat.icon }} style={styles.catIcon} />}
              <Text style={styles.catLabel}>{cat.name}</Text>
              <Feather
                name={open.includes(cat._id) ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#222"
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
            {/* Nếu có subcategory, render tương tự */}
            {open.includes(cat._id) && cat.sub && cat.sub.length > 0 && (
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