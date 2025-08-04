import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ProductPriceRow({
  price,      // number: ví dụ 3200000
  oldPrice,   // number hoặc null: giá gốc
  liked,      // boolean: trạng thái đã thích
  onLike,     // () => void
}) {
  // Kiểm tra giảm giá
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;

  // Format VND
  const formatVND = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <View style={styles.container}>
      <Text style={styles.priceText}>{formatVND(price)}</Text>

      <TouchableOpacity
        style={[
          styles.likeButton,
          liked ? styles.likedButton : styles.unlikedButton,
        ]}
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Feather
          name="heart"
          size={20}
          color={liked ? "#E0245E" : "#BBB"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    // shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // elevation Android
    elevation: 3,
  },
  priceText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FF5722",
  },
  likeButton: {
    borderRadius: 20,
    padding: 8,
  },
  likedButton: {
    backgroundColor: "#FFE5EC",
  },
  unlikedButton: {
    backgroundColor: "#F5F5F5",
  },
});
