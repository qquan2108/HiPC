import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";

export function SectionPopular({ data }) {
  return (
    <View style={styles.sectionBox}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sản phẩm phổ biến</Text>
        <TouchableOpacity>
          <Text style={styles.sectionSeeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.popularCard}>
            <Image source={item.image} style={styles.popularImage} />
            <Text numberOfLines={2} style={styles.popularName}>{item.name}</Text>
            <Text style={styles.popularPrice}>{item.price}</Text>
            <Text style={styles.popularSold}>{item.sold} đã bán</Text>
          </View>
        )}
      />
    </View>
  );
}

export function SectionLiked({ data }) {
  return (
    <View style={styles.sectionBox}>
      <Text style={styles.sectionTitle}>Sản phẩm bạn thích</Text>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.likedCard}>
            <Image source={item.image} style={styles.likedImage} />
            <Text numberOfLines={2} style={styles.likedName}>{item.name}</Text>
            <Text style={styles.likedPrice}>{item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  sectionSeeAll: {
    color: "#2979ff",
    fontSize: 13,
    fontWeight: "600",
  },
  popularCard: {
    width: 140,
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    marginRight: 14,
    padding: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  popularImage: {
    width: 90,
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  popularName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  popularPrice: {
    color: "#f55858",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  popularSold: {
    color: "#888",
    fontSize: 12,
  },
  likedCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    margin: "1%",
    padding: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  likedImage: {
    width: 90,
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  likedName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
    textAlign: "center",
  },
  likedPrice: {
    color: "#f55858",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
});