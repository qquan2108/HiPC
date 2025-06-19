import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DeliveryBox({ delivery, deliveryType, onSelect, formatCurrency }) {
  return (
    <View style={styles.deliveryBox}>
      <Text style={styles.deliveryLabel}>Giao hàng</Text>
      {delivery.map((d) => (
        <TouchableOpacity
          key={d.type}
          style={[
            styles.deliveryOption,
            deliveryType === d.type && styles.deliveryOptionActive,
          ]}
          onPress={() => onSelect(d.type)}
        >
          <Text
            style={[
              styles.deliveryType,
              deliveryType === d.type && styles.deliveryTypeActive,
            ]}
          >
            {d.type}
          </Text>
          <Text style={styles.deliveryTime}>{d.time}</Text>
          <Text style={styles.deliveryPrice}>{formatCurrency(d.price)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deliveryBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  deliveryLabel: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    marginRight: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  deliveryOptionActive: {
    borderColor: "#2979ff",
    backgroundColor: "#eaf3ff",
  },
  deliveryType: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginRight: 8,
  },
  deliveryTypeActive: {
    color: "#2979ff",
  },
  deliveryTime: {
    fontSize: 13,
    color: "#888",
    marginRight: 8,
  },
  deliveryPrice: {
    fontSize: 13,
    color: "#2979ff",
    fontWeight: "bold",
  },
});