import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useWishlist } from "../context/WishlistContext";

const { width } = Dimensions.get("window");

export default function ForYouGrid({
  products,
  renderNewBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  // Default badge components nếu không được provide
  const defaultNewBadge = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.newBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="flash" size={10} color="#fff" />
      <Text style={styles.badgeText}>MỚI</Text>
    </LinearGradient>
  );

  const defaultDiscountBadge = (discount) => (
    <LinearGradient
      colors={['#ff6b6b', '#ee5a24']}
      style={styles.discountBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-fire-department" size={10} color="#fff" />
      <Text style={styles.badgeText}>-{discount}%</Text>
    </LinearGradient>
  );

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleAddToCart = (product) => {
    if (!isLoggedIn) return onRequireLogin();
    // Thêm vào giỏ hàng
  };

  return (
    <View style={styles.container}>
      {/* Header Section với gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.sectionRow}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="computer" size={24} color="#fff" style={styles.titleIcon} />
            <Text style={styles.sectionTitle}>
              Linh Kiện Máy Tính 
              <Text style={styles.titleAccent}> Pro</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Product Grid */}
      <View style={styles.forYouGrid}>
        {products.concat(products).map((product, idx) => (
          <TouchableOpacity
            key={product.id + idx}
            style={styles.card}
            onPress={() => router.push({ pathname: './ctsp', params: { id: product.id } })}
            activeOpacity={0.9}
          >
            {/* Card với glassmorphism effect */}
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.cardGradient}
            >
              {/* Shine effect */}
              <View style={styles.shineEffect} />

              {/* Badges */}
              <View style={styles.badgeWrapper}>
                {product.isNew && (renderNewBadge ? renderNewBadge() : defaultNewBadge())}
                {product.discount > 0 && (renderDiscountBadge ? renderDiscountBadge(product.discount) : defaultDiscountBadge(product.discount))}
              </View>

              {/* Rating Star với gradient */}
              <View style={styles.starIcon}>
                <LinearGradient
                  colors={['#ffd700', '#ffb347']}
                  style={styles.starGradient}
                >
                  <Ionicons name="star" size={14} color="#fff" />
                </LinearGradient>
                <Text style={styles.ratingText}>4.8</Text>
              </View>

              {/* Product Image với modern styling */}
              <View style={styles.imageContainer}>
                <Image source={product.image} style={styles.image} />
                <LinearGradient
                  colors={['transparent', 'rgba(102,126,234,0.1)']}
                  style={styles.imageOverlay}
                />
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>
                
                <Text numberOfLines={1} style={styles.productDesc}>
                  {product.shortDesc || "Hiệu suất mạnh, công nghệ cao"}
                </Text>

                {/* Price với strikethrough effect */}
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{product.price}₫</Text>
                    {product.originalPrice && (
                      <View style={styles.originalPriceContainer}>
                        <Text style={styles.originalPrice}>{product.originalPrice}₫</Text>
                        <View style={styles.strikeThrough} />
                      </View>
                    )}
                  </View>
                  {product.discount > 0 && (
                    <Text style={styles.savingsText}>
                      Tiết kiệm {((product.originalPrice - product.price) / 1000).toFixed(0)}K
                    </Text>
                  )}
                </View>
              </View>

              {/* Action Icons với modern styling */}
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.heartButton}>
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a24']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="share-outline" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(product)}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Tech Badge */}
              <View style={styles.techBadge}>
                <MaterialIcons name="verified" size={12} color="#00d4aa" />
                <Text style={styles.techText}>CHÍNH HÃNG</Text>
              </View>
            </LinearGradient>

            {/* Wishlist Icon */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 4,
                elevation: 2,
              }}
              onPress={() =>
                wishlist.some((p) => p._id === product._id)
                  ? removeFromWishlist(product._id)
                  : addToWishlist(product)
              }
            >
              <AntDesign
                name={wishlist.some((p) => p._id === product._id) ? "heart" : "hearto"}
                size={20}
                color="#ff4d4f"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },

  // Header Styles
  headerGradient: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 18,
    color: "#fff",
    fontFamily: 'System',
  },
  titleAccent: {
    fontWeight: "300",
    fontSize: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },

  // Grid Styles
  forYouGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  // Card Styles
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
    position: 'relative',
    alignItems: "center",
    minHeight: 280,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // Badge Styles
  badgeWrapper: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "column",
    gap: 4,
    zIndex: 2,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },

  // Rating Styles
  starIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starGradient: {
    borderRadius: 10,
    padding: 2,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },

  // Image Styles
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 30,
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#f8fafc",
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  // Product Info Styles
  productInfo: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
    fontFamily: 'System',
  },
  productDesc: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
    fontStyle: 'italic',
  },

  // Price Styles
  priceContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    color: "#e53e3e",
    fontWeight: "800",
    fontSize: 16,
    fontFamily: 'System',
  },
  originalPriceContainer: {
    position: 'relative',
  },
  originalPrice: {
    fontSize: 12,
    color: "#a0aec0",
    fontWeight: '500',
  },
  strikeThrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#a0aec0',
  },
  savingsText: {
    fontSize: 10,
    color: "#00d4aa",
    fontWeight: '600',
    marginTop: 2,
  },

  // Action Styles
  actionIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
    paddingHorizontal: 4,
  },
  heartButton: {
    borderRadius: 12,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cartButton: {
    borderRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    padding: 8,
    borderRadius: 12,
  },

  // Tech Badge
  techBadge: {
    position: 'absolute',
    top: 12,           // đổi từ bottom: 12 thành top: 12
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  techText: {
    fontSize: 8,
    color: '#00d4aa',
    fontWeight: '700',
    marginLeft: 2,
  },
});