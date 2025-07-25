import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
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
          // Determine display label and selection status
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
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                type === "variant" && styles.variantButton,
                isSelected && type === "variant" && styles.variantButtonSelected,
                isSelected && type === "variant" && styles.selectedGlow,
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
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      type === "variant" && styles.variantText,
                    ]}
                  >
                    {displayLabel}
                  </Text>

                  {isSelected && (
                    <Feather
                      name="check-circle"
                      size={18}
                      color={type === "variant" ? "#fff" : "#4285f4"}
                      style={{ marginLeft: 6 }}
                    />
                  )}
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
                    {displayLabel}
                  </Text>
                  {type === "variant" && (
                    <View
                      style={[
                        styles.variantDot,
                        isSelected && styles.variantDotSelected,
                      ]}
                    />
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
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  optionButtonSelected: {
    backgroundColor: "#e8f0fe",
    borderColor: "#4285f4",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#4285f4",
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
    backgroundColor: "#f0f7ff",
  },
  variantText: {
    fontSize: 14,
    color: "#333",
  },
  variantTextSelected: {
    fontWeight: "700",
    color: "#ffffff",
  },
  gradientBackground: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
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
  variantDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginTop: 4,
    alignSelf: "center",
  },
  variantDotSelected: {
    backgroundColor: "#4285f4",
  },
  selectedGlow: {
    borderWidth: 2,
    borderColor: "#4285f4",
    shadowColor: "#4285f4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
});
