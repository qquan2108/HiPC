import React from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export function SectionPopular({ data, onPressItem }) {
  const router = useRouter();

  return (
    <View style={styles.sectionContainer}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#fd79a8', '#e84393']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="trending-up" size={20} color="#ffffff" />
            </View>
            <Text style={styles.sectionTitle}>Sản phẩm phổ biến</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push("/danhmucall")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.seeAllGradient}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Feather name="arrow-right" size={14} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Enhanced Product List */}
      <View style={styles.listContainer}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.popularCard, { marginLeft: index === 0 ? 20 : 0 }]}
              activeOpacity={0.85}
              onPress={() => onPressItem(item)}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.cardGradient}
              >
                {/* Image Container */}
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.popularImage} />
                  <View style={styles.trendingBadge}>
                    <LinearGradient
                      colors={['#fd79a8', '#e84393']}
                      style={styles.trendingBadgeGradient}
                    >
                      <Feather name="zap" size={10} color="#ffffff" />
                    </LinearGradient>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text numberOfLines={2} style={styles.popularName}>
                    {item.name}
                  </Text>
                  <Text style={styles.popularPrice}>{item.price}</Text>
                  <Text style={styles.popularSold}>{item.sold} đã bán</Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={12} color="#ffd700" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

export function SectionLiked({ data, onPressItem }) {
  const router = useRouter();

  return (
    <View style={styles.sectionContainer}>
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
              <Feather name="heart" size={20} color="#ffffff" />
            </View>
            <Text style={styles.sectionTitle}>Sản phẩm bạn thích</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push("/danhmucall")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.seeAllGradient}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Feather name="arrow-right" size={14} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Enhanced Product Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.likedCard}
              activeOpacity={0.85}
              onPress={() => onPressItem(item)}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.likedCardGradient}
              >
                {/* Image Container */}
                <View style={styles.likedImageContainer}>
                  <Image source={item.image} style={styles.likedImage} />
                  <TouchableOpacity style={styles.likeButton}>
                    <LinearGradient
                      colors={['#fd79a8', '#e84393']}
                      style={styles.likeButtonGradient}
                    >
                      <Feather name="heart" size={12} color="#ffffff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.likedContent}>
                  <Text numberOfLines={2} style={styles.likedName}>
                    {item.name}
                  </Text>
                  <Text style={styles.likedPrice}>{item.price}</Text>
                  
                  
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#fd79a8',
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
    borderRadius: 12,
    padding: 6,
    marginRight: 12,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  seeAllButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  seeAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seeAllText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 6,
  },

  // Popular Section Styles
  listContainer: {
    paddingBottom: 16,
  },
  listContent: {
    paddingRight: 20,
  },
  popularCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    margin: 12,
    marginBottom: 8,
  },
  popularImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    resizeMode: "contain",
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  trendingBadgeGradient: {
    borderRadius: 10,
    padding: 4,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  popularName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 6,
    lineHeight: 18,
  },
  popularPrice: {
    color: "#e84393",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  popularSold: {
    color: "#636e72",
    fontSize: 11,
    fontWeight: "600",
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2d3436',
    marginLeft: 2,
  },

  // Liked Section Styles
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  gridContent: {
    justifyContent: 'space-between',
  },
  likedCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  likedCardGradient: {
    flex: 1,
  },
  likedImageContainer: {
    position: 'relative',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    margin: 12,
    marginBottom: 8,
  },
  likedImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    resizeMode: "contain",
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  likeButtonGradient: {
    borderRadius: 12,
    padding: 6,
  },
  likedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likedName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 6,
    lineHeight: 16,
  },
  likedPrice: {
    color: "#6c5ce7",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  quickBuyButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickBuyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickBuyText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
});