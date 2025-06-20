import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function SuggestionChip({ item }) {
  return (
    <TouchableOpacity style={styles.suggestionChip} accessibilityLabel={`Tìm kiếm ${item}`}>
      <Feather name="tag" size={14} color="#4681f4" style={styles.chipIcon} />
      <Text style={styles.suggestionChipText}>{item}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f0ff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipIcon: {
    marginRight: 6,
  },
  suggestionChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4681f4",
  },
});