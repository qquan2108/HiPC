import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function OptionGroup({ label, options, selected, onSelect, type = "default" }) {
  return (
    <View style={styles.optionGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.optionLabel}>{label}</Text>
        <View style={styles.labelUnderline} />
      </View>
      <View style={styles.optionRow}>
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                type === "variant" && styles.variantButton,
                isSelected && type === "variant" && styles.variantButtonSelected,
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              {isSelected && type === "variant" ? (
                <LinearGradient
                  colors={['#4285f4', '#1976d2']}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.optionText, styles.variantTextSelected]}>
                    {option}
                  </Text>
                  <View style={styles.selectedIndicator} />
                </LinearGradient>
              ) : (
                <>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      type === "variant" && styles.variantText,
                    ]}
                  >
                    {option}
                  </Text>
                  {type === "variant" && (
                    <View style={[
                      styles.variantDot,
                      isSelected && styles.variantDotSelected
                    ]} />
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 12,
  },
  optionLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  labelUnderline: {
    width: 30,
    height: 3,
    backgroundColor: "#4285f4",
    borderRadius: 2,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: "#4285f4",
    backgroundColor: "#e8f0fe",
    shadowColor: "#4285f4",
    shadowOpacity: 0.3,
    elevation: 4,
  },
  variantButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 100,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  variantButtonSelected: {
    borderColor: "#4285f4",
    backgroundColor: "transparent",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  optionText: {
    fontSize: 14,
    color: "#5f6368",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#4285f4",
    fontWeight: "700",
  },
  variantText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3c4043",
  },
  variantTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  variantDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dadce0",
    marginLeft: 8,
  },
  variantDotSelected: {
    backgroundColor: "#4285f4",
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
});