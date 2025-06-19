import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CartEmpty() {
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconBox}>
        <Feather name="shopping-bag" size={64} color="#2979ff" />
      </View>
      <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eaf3ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});