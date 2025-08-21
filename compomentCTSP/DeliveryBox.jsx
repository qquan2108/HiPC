import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DeliveryBox({ delivery, deliveryType, onSelect, formatCurrency }) {
  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#00cec9', '#00b894']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Feather name="truck" size={20} color="#ffffff" />
            <Text style={styles.headerTitle}>Giao hàng</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>FAST</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Delivery Options */}
      <View style={styles.optionsContainer}>
        {delivery.map((d, index) => {
          const isSelected = deliveryType === d.type;
          const isExpress = d.type.toLowerCase().includes('nhanh') || d.type.toLowerCase().includes('express');
          const isStandard = d.type.toLowerCase().includes('tiêu chuẩn') || d.type.toLowerCase().includes('standard');
          
          return (
            <TouchableOpacity
              key={d.type}
              style={[
                styles.deliveryCard,
                isSelected && styles.deliveryCardSelected,
              ]}
              onPress={() => onSelect(d.type)}
              activeOpacity={0.85}
            >
              {/* Background for selected */}
              {isSelected && (
                <LinearGradient
                  colors={isExpress ? ['#fd79a8', '#e84393'] : ['#74b9ff', '#0984e3']}
                  style={styles.selectedBackground}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                />
              )}

              <View style={styles.cardContent}>
                {/* Icon & Type */}
                <View style={styles.typeSection}>
                  <View style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected
                  ]}>
                    <Feather 
                      name={isExpress ? "zap" : "clock"} 
                      size={16} 
                      color={isSelected ? "#ffffff" : (isExpress ? "#e84393" : "#0984e3")} 
                    />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={[
                      styles.deliveryType,
                      isSelected && styles.deliveryTypeSelected
                    ]}>
                      {d.type}
                    </Text>
                    <Text style={[
                      styles.deliveryTime,
                      isSelected && styles.deliveryTimeSelected
                    ]}>
                      {d.time}
                    </Text>
                  </View>
                </View>

                {/* Price & Selection */}
                <View style={styles.priceSection}>
                  <Text style={[
                    styles.deliveryPrice,
                    isSelected && styles.deliveryPriceSelected
                  ]}>
                    {formatCurrency(d.price)}
                  </Text>
                  
                  {/* Selection Indicator */}
                  <View style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectionIndicatorActive
                  ]}>
                    {isSelected && (
                      <Feather name="check" size={12} color="#ffffff" />
                    )}
                  </View>
                </View>
              </View>

              {/* Express Badge */}
              {isExpress && (
                <View style={styles.expressTag}>
                  <LinearGradient
                    colors={['#fd79a8', '#e84393']}
                    style={styles.expressTagGradient}
                  >
                    <Text style={styles.expressTagText}>⚡ NHANH</Text>
                  </LinearGradient>
                </View>
              )}

              {/* Free Badge */}
              {d.price === 0 && (
                <View style={styles.freeTag}>
                  <LinearGradient
                    colors={['#00b894', '#00cec9']}
                    style={styles.freeTagGradient}
                  >
                    <Text style={styles.freeTagText}>MIỄN PHÍ</Text>
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustIndicators}>
        <View style={styles.trustItem}>
          <Feather name="shield" size={14} color="#00b894" />
          <Text style={styles.trustText}>Bảo hiểm hàng hóa</Text>
        </View>
        <View style={styles.trustItem}>
          <Feather name="phone" size={14} color="#00b894" />
          <Text style={styles.trustText}>Hỗ trợ 24/7</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#00cec9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  // Header
  header: {
    marginBottom: 16,
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
  headerTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Options
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  deliveryCard: {
    borderWidth: 2,
    borderColor: "#f1f3f4",
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  deliveryCardSelected: {
    borderColor: "#74b9ff",
    elevation: 8,
    shadowColor: '#74b9ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    transform: [{ scale: 1.02 }],
  },

  selectedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Card Content
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  typeInfo: {
    flex: 1,
  },
  deliveryType: {
    fontWeight: "700",
    fontSize: 15,
    color: "#2d3436",
    marginBottom: 2,
  },
  deliveryTypeSelected: {
    color: "#ffffff",
  },
  deliveryTime: {
    fontSize: 13,
    color: "#636e72",
  },
  deliveryTimeSelected: {
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Price Section
  priceSection: {
    alignItems: 'flex-end',
  },
  deliveryPrice: {
    fontSize: 15,
    color: "#00b894",
    fontWeight: "700",
    marginBottom: 4,
  },
  deliveryPriceSelected: {
    color: "#ffffff",
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },

  // Tags
  expressTag: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  expressTagGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  expressTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  freeTag: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  freeTagGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Trust Indicators
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 206, 201, 0.1)',
    marginTop: 8,
    paddingTop: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  trustText: {
    fontSize: 11,
    color: '#636e72',
    marginLeft: 4,
    fontWeight: '600',
  },
});