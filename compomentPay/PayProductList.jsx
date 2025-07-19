import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function PayProductList({ products, formatCurrency }) {
  return (
    <View>
      {products.map((item) => (
        <View key={item.id} style={styles.productRow}>
          <Image source={item.image} style={styles.productImg} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              {formatCurrency(item.price)}
            </Text>
          </View>
          <View style={styles.productQtyCircle}>
            <Text style={styles.productQtyText}>{item.quantity}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
  },
  productImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f3f3",
  },
  productName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginBottom: 2,
  },
  productPrice: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  productQtyCircle: {
    backgroundColor: "#2979ff",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  productQtyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});