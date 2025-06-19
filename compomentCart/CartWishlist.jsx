import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CartWishlist({ wishlist, formatCurrency }) {
  if (!wishlist || wishlist.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Sản phẩm yêu thích</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {wishlist.map((item, idx) => (
          <View key={item._id || item.id || idx} style={styles.card}>
            <Image
              source={item.image ? (typeof item.image === "string" ? { uri: item.image } : item.image) : require("../assets/images/pc1.png")}
              style={styles.image}
            />
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.price}>
              {formatCurrency
                ? formatCurrency(item.price)
                : (item.price?.toLocaleString("vi-VN") || item.price) + " đ"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    marginBottom: 10,
    paddingLeft: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2979ff",
    marginBottom: 8,
    marginLeft: 2,
  },
  card: {
    width: 110,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginRight: 12,
    alignItems: "center",
    padding: 8,
    elevation: 2,
    shadowColor: "#2979ff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#f3f3f3",
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    color: "#222",
    textAlign: "center",
    marginBottom: 2,
  },
  price: {
    color: "#e53e3e",
    fontWeight: "bold",
    fontSize: 13,
  },
});