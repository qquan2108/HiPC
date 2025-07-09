import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ProductPriceRow({ price, oldPrice, onLike }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.productPrice}>{price}</Text>
      <Text style={styles.productOldPrice}>{oldPrice}</Text>
      <TouchableOpacity style={{ marginLeft: 8 }} onPress={onLike}>
        <Feather name="heart" size={24} color="#f55858" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    marginBottom: 8,
  },
  productPrice: {
    color: "#f55858",
    fontWeight: "bold",
    fontSize: 22,
    marginRight: 10,
  },
  productOldPrice: {
    color: "#888",
    fontSize: 16,
    textDecorationLine: "line-through",
    marginRight: 10,
    fontWeight: "bold",
  },
});