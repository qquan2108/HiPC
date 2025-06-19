import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function SpecsBox({ specs, onCompare }) {
  return (
    <View style={styles.specsBox}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={styles.specsTitle}>Thông số kĩ thuật</Text>
        <TouchableOpacity style={styles.compareBtn} onPress={onCompare}>
          <Feather name="bar-chart-2" size={18} color="#2979ff" />
          <Text style={styles.compareBtnText}>So sánh</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.specsRow}>
        {specs.map((spec, idx) => (
          <View key={idx} style={styles.specItem}>
            <Text style={styles.specLabel}>{spec.label}</Text>
            <Text style={styles.specValue}>{spec.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  specsBox: {
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
  specsTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  specItem: {
    marginRight: 24,
    marginBottom: 6,
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specLabel: {
    fontSize: 13,
    color: "#888",
  },
  specValue: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginLeft: 6,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  compareBtnText: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },
});