import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

export default function BuyWithList({ data }) {
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
            <View style={styles.iconWrapper}>
              <Feather name="package" size={18} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Mua cùng sản phẩm</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-15%</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Enhanced Product List */}
      <View style={styles.listContainer}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={[styles.productCard, { marginLeft: index === 0 ? 20 : 0 }]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.cardGradient}
              >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.productImage} />
                  
                  {/* Add to Bundle Button */}
                  <TouchableOpacity style={styles.addButton}>
                    <LinearGradient
                      colors={['#00cec9', '#00b894']}
                      style={styles.addButtonGradient}
                    >
                      <Feather name="plus" size={12} color="#ffffff" />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Quick View Button */}
                  <TouchableOpacity style={styles.quickViewButton}>
                    <View style={styles.quickViewBackground}>
                      <Feather name="eye" size={12} color="#636e72" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {item.name || 'Sản phẩm bổ sung'}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>
                      {item.price || '299,000₫'}
                    </Text>
                    <Text style={styles.oldPrice}>
                      {item.oldPrice || '350,000₫'}
                    </Text>
                  </View>
                  
                  {/* Rating */}
                  <View style={styles.ratingContainer}>
                    <Feather name="star" size={10} color="#ffd700" />
                    <Text style={styles.ratingText}>4.5</Text>
                    <Text style={styles.reviewCount}>(128)</Text>
                  </View>
                </View>

                {/* Bundle Indicator */}
                <View style={styles.bundleIndicator}>
                  <LinearGradient
                    colors={['#fd79a8', '#e84393']}
                    style={styles.bundleGradient}
                  >
                    <Text style={styles.bundleText}>COMBO</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bundle Summary */}
      <View style={styles.bundleSummary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryTitle}>Mua combo tiết kiệm</Text>
          <Text style={styles.summarySubtitle}>Giảm giá đến 15% khi mua cùng</Text>
        </View>
        
        <TouchableOpacity style={styles.bundleButton}>
          <LinearGradient
            colors={['#fd79a8', '#e84393']}
            style={styles.bundleButtonGradient}
          >
            <Feather name="shopping-bag" size={16} color="#ffffff" />
            <Text style={styles.bundleButtonText}>Thêm combo</Text>
          </LinearGradient>
        </TouchableOpacity>
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

  // Header Styles
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
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontWeight: "800",
    fontSize: 15,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // List Styles
  listContainer: {
    paddingBottom: 16,
  },
  listContent: {
    paddingRight: 20,
  },
  productCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },

  // Image Container
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f8f9ff',
    margin: 10,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    resizeMode: "contain",
  },
  addButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  addButtonGradient: {
    borderRadius: 12,
    padding: 6,
  },
  quickViewButton: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  quickViewBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 4,
  },

  // Product Info
  productInfo: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 6,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#00b894",
    marginRight: 6,
    letterSpacing: -0.2,
  },
  oldPrice: {
    fontSize: 10,
    color: "#636e72",
    textDecorationLine: 'line-through',
    textDecorationColor: '#636e72',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2d3436',
    marginLeft: 2,
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 9,
    color: '#636e72',
  },

  // Bundle Indicator
  bundleIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  bundleGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bundleText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Bundle Summary
  bundleSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 206, 201, 0.1)',
    backgroundColor: '#f8f9ff',
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '600',
  },
  bundleButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#fd79a8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bundleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bundleButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});