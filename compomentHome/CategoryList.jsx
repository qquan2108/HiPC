import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const CategoryList = ({ categories, router }) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>Danh mục</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((cat, idx) => (
        <TouchableOpacity
          key={cat.key || idx}
          style={styles.item}
          activeOpacity={0.8}
          onPress={() => router.push(`/DanhMucPC`)}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={cat.icon}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.label} numberOfLines={1}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 18,
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    marginLeft: 4,
  },
  item: {
    alignItems: "center",
    marginRight: 18,
    width: 80,
  },
  iconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    marginBottom: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    width: 80,
    fontWeight: "500",
  },
});

export default CategoryList;