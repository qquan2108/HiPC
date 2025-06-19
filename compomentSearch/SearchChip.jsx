import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function SearchChip({ item, onRemove }) {
  return (
    <View style={styles.chip}>
      <Feather name="search" size={14} color="#666" style={styles.chipIcon} />
      <Text style={styles.chipText}>{item}</Text>
      <TouchableOpacity onPress={() => onRemove(item)} accessibilityLabel={`Xóa ${item}`}>
        <Feather name="x-circle" size={16} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: "#1f2937",
    marginRight: 8,
  },
});