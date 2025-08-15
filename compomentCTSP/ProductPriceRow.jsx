import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function ProductPriceRow({
  price,      // number: ví dụ 3200000
  oldPrice,   // number hoặc null: giá gốc
  liked,      // boolean: trạng thái đã thích
  onLike,     // () => void
}) {
  // Kiểm tra giảm giá
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // Format VND
  const formatVND = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f9ff']}
      style={styles.container}
    >
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>{formatVND(price)}</Text>
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                style={styles.discountGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </LinearGradient>
            </View>
          )}
        </View>
        
        {hasDiscount && (
          <View style={styles.oldPriceRow}>
            <Text style={styles.oldPrice}>{formatVND(oldPrice)}</Text>
            <Text style={styles.saveAmount}>
              Tiết kiệm {formatVND(oldPrice - price)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.likeButton}
        onPress={onLike}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={liked ? ['#ff6b6b', '#ee5a24'] : ['#f1f3f4', '#e8eaed']}
          style={styles.likeButtonGradient}
        >
          <Feather 
            name="heart" 
            size={20} 
            color={liked ? '#ffffff' : '#5f6368'} 
            style={liked ? styles.likedIcon : null}
          />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    // Premium shadow
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2d3436",
    letterSpacing: -0.5,
    marginRight: 12,
  },
  discountBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  discountGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  oldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 16,
    color: '#74b9ff',
    textDecorationLine: 'line-through',
    textDecorationColor: '#74b9ff',
    marginRight: 8,
  },
  saveAmount: {
    fontSize: 13,
    color: '#00b894',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  likeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  likeButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
});