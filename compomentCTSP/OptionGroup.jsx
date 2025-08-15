import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OptionGroup({ label, options = [], selected, onSelect, type = "default" }) {
  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.labelGradient}
        >
          <Text style={styles.optionLabel}>{String(label ?? "")}</Text>
          <View style={styles.labelIcon}>
            <Feather name="settings" size={14} color="#ffffff" />
          </View>
        </LinearGradient>
      </View>

      
      <View style={styles.optionGrid}>
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
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.85}
            >
              
              {isSelected && (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.selectedBackground}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                />
              )}

              {/* Content */}
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected
                ]}>
                  {String(displayLabel ?? "")}
                </Text>
                
                {typeof option.priceDiff === "number" && (
                  <Text style={[
                    styles.priceDiff,
                    isSelected && styles.priceDiffSelected
                  ]}>
                    +{option.priceDiff.toLocaleString('vi-VN')}₫
                  </Text>
                )}

                
                {isSelected && (
                  <View style={styles.selectionIndicator}>
                    <Feather name="check" size={14} color="#ffffff" />
                  </View>
                )}
              </View>

              
              <View style={[
                styles.animatedBorder,
                isSelected && styles.animatedBorderActive
              ]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 24,
    marginHorizontal: 16,
  },
  
  
  headerContainer: { 
    marginBottom: 16,
  },
  labelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  optionLabel: { 
    fontWeight: "800", 
    fontSize: 16, 
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  labelIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 4,
  },

  // Options Grid
  optionGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap",
    justifyContent: 'space-between',
  },
  
  // Option Card
  optionCard: {
    minWidth: '47%',
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    // Subtle shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#f1f3f4',
  },
  optionCardSelected: {
    borderColor: '#667eea',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    transform: [{ scale: 1.02 }],
  },

  // Selected Background
  selectedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Content
  optionContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
    position: 'relative',
  },
  optionText: {
    fontSize: 15,
    color: "#2d3436",
    fontWeight: "600",
    textAlign: 'center',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  priceDiff: {
    color: "#74b9ff",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceDiffSelected: {
    color: "#ffffff",
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Selection Indicator
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 4,
  },

  // Animated Border
  animatedBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    width: 0,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  animatedBorderActive: {
    width: '100%',
  },
});