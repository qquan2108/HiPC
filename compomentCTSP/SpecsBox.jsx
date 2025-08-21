import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

export default function SpecsBox({ specs, onCompare }) {
  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#a29bfe', '#6c5ce7']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="cpu" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Thông số kỹ thuật</Text>
          </View>
          <TouchableOpacity 
            style={styles.compareButton} 
            onPress={onCompare}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.compareButtonGradient}
            >
              <Feather name="bar-chart-2" size={16} color="#ffffff" />
              <Text style={styles.compareButtonText}>So sánh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Specs Grid */}
      <ScrollView 
        style={styles.specsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.specsGrid}>
          {specs.map((spec, idx) => (
            <View key={idx} style={styles.specCard}>
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.specCardGradient}
              >
                <View style={styles.specContent}>
                  {/* Icon based on spec type */}
                  <View style={styles.specIcon}>
                    <Feather 
                      name={getSpecIcon(spec.label)} 
                      size={16} 
                      color="#a29bfe" 
                    />
                  </View>
                  
                  <View style={styles.specInfo}>
                    <Text style={styles.specLabel}>{spec.label}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>

                  {/* Decorative Element */}
                  <View style={styles.specDecorator} />
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Premium Features */}
      <View style={styles.premiumFeatures}>
        <View style={styles.featureItem}>
          <Feather name="award" size={14} color="#00b894" />
          <Text style={styles.featureText}>Chứng nhận chất lượng</Text>
        </View>
        <View style={styles.featureDivider} />
        <View style={styles.featureItem}>
          <Feather name="shield-check" size={14} color="#00b894" />
          <Text style={styles.featureText}>Bảo hành chính hãng</Text>
        </View>
      </View>
    </View>
  );
}

// Helper function to get appropriate icon for spec type
function getSpecIcon(label) {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('cpu') || lowerLabel.includes('processor')) return 'cpu';
  if (lowerLabel.includes('ram') || lowerLabel.includes('memory')) return 'hard-drive';
  if (lowerLabel.includes('storage') || lowerLabel.includes('ssd')) return 'database';
  if (lowerLabel.includes('display') || lowerLabel.includes('screen')) return 'monitor';
  if (lowerLabel.includes('battery')) return 'battery';
  if (lowerLabel.includes('weight') || lowerLabel.includes('size')) return 'package';
  if (lowerLabel.includes('gpu') || lowerLabel.includes('graphics')) return 'zap';
  return 'settings';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#a29bfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  compareButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  compareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compareButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  // Specs Container
  specsContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Spec Card
  specCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  specCardGradient: {
    flex: 1,
  },
  specContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
  },
  specIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(162, 155, 254, 0.2)',
  },
  specInfo: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: "#636e72",
    fontWeight: "600",
    marginBottom: 2,
  },
  specValue: {
    fontWeight: "700",
    fontSize: 14,
    color: "#2d3436",
    letterSpacing: -0.2,
  },
  specDecorator: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a29bfe',
    opacity: 0.6,
  },

  // Premium Features
  premiumFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(162, 155, 254, 0.1)',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 11,
    color: '#636e72',
    marginLeft: 6,
    fontWeight: '600',
  },
  featureDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(162, 155, 254, 0.2)',
    marginHorizontal: 16,
  },
});