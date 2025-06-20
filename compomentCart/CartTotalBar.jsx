import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CartTotalBar({ total, formatCurrency, onCheckout }) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
      <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
        <Text style={styles.checkoutText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  totalBox: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 18,
    color: "#2979ff",
    fontWeight: "bold",
  },
  checkoutBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    minWidth: 120,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});