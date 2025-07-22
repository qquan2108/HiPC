import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";



export default function OptionGroup({ label, options, selected, onSelect }) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}:</Text>
      <View style={styles.optionRow}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selected === option && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selected === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  optionButtonSelected: {
    borderColor: "#2979ff",
    backgroundColor: "#eaf3ff",
  },
  optionText: {
    fontSize: 13,
    color: "#444",
  },
  optionTextSelected: {
    color: "#2979ff",
    fontWeight: "bold",
  },
});