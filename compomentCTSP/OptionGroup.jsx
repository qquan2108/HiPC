import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from '@expo/vector-icons';

export default function OptionGroup({ label, options, selected, onSelect, type = "default" }) {
  return (
    <View style={styles.optionGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.optionLabel}>{label}</Text>
        <View style={styles.labelUnderline} />
      </View>
      <View style={styles.optionRow}>
        {options.map((option, index) => {
          const displayLabel = option && typeof option === 'object' && 'label' in option
            ? option.label
            : option;
          const isSelected =
            (typeof selected === "string" && displayLabel === selected) ||
            (typeof selected === "object" && selected.label === displayLabel);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.variantBtn,
                isSelected && styles.variantBtnSelected,
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.variantText,
                isSelected && styles.variantTextSelected
              ]}>
                {displayLabel}
              </Text>
              {option.priceDiff ? (
                <Text style={[
                  styles.priceDiff,
                  isSelected && styles.priceDiffSelected
                ]}>
                  +{option.priceDiff.toLocaleString('vi-VN')}₫
                </Text>
              ) : null}
              {isSelected && (
                <Feather name="check-circle" size={18} color="#fff" style={{ marginLeft: 6, position: "absolute", top: 8, right: 8 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionGroup: { marginBottom: 20 },
  labelContainer: { marginBottom: 12 },
  optionLabel: { fontWeight: "700", fontSize: 16, color: "#1a1a1a", marginBottom: 4 },
  labelUnderline: { width: 30, height: 3, backgroundColor: "#4285f4", borderRadius: 2 },
  optionRow: { flexDirection: "row", flexWrap: "wrap" },
  variantBtn: {
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    backgroundColor: "#fff",
    marginRight: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    elevation: 2,
  },
  variantBtnSelected: {
    backgroundColor: "#4285f4",
    borderColor: "#4285f4",
    shadowColor: "#4285f4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  variantText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  variantTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  priceDiff: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  priceDiffSelected: {
    color: "#fff",
  },
});
