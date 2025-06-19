import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWishlist } from "../context/WishlistContext";

export default function NewProducts({
  products,
  renderNewBadge,
  renderHotBadge,
  renderDiscountBadge,
  isLoggedIn,
  onRequireLogin,
  router,
}) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Default badge components với gradient đẹp
  const defaultNewBadge = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.defaultNewBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="flash" size={12} color="#fff" />
      <Text style={styles.defaultBadgeText}>MỚI</Text>
    </LinearGradient>
  );

  const defaultHotBadge = () => (
    <LinearGradient
      colors={['#ff6b6b', '#ee5a24']}
      style={styles.defaultHotBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-fire-department" size={12} color="#fff" />
      <Text style={styles.defaultBadgeText}>HOT</Text>
    </LinearGradient>
  );

  const defaultDiscountBadge = (discount) => (
    <LinearGradient
      colors={['#f093fb', '#f5576c']}
      style={styles.defaultDiscountBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialIcons name="local-offer" size={12} color="#fff" />
      <Text style={styles.defaultBadgeText}>-{discount}%</Text>
    </LinearGradient>
  );

  const handleAddToCart = (product) => {
    if (!isLoggedIn) return onRequireLogin();
    // Thực hiện thêm vào giỏ hàng
  };

  return (
    <View style={styles.container}>
      {/* Modern Header với gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.sectionRow}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="new-releases" size={24} color="#fff" style={styles.titleIcon} />
            <Text style={styles.sectionTitle}>
              Sản Phẩm Mới
              <Text style={styles.titleAccent}> 2025</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.linkText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Horizontal Product Scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productCard, { marginLeft: index === 0 ? 16 : 8 }]}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: './ctsp', params: { id: product.id } })}
          >
            {/* Card với glassmorphism */}
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)']}
              style={styles.cardGradient}
            >
              {/* Shine effect */}
              <View style={styles.shineEffect} />

              {/* Image Container với modern styling */}
              <View style={styles.imageWrapper}>
                <Image
                  source={product.image}
                  style={styles.productImage}
                  resizeMode="contain"
                />
                
                {/* Image overlay gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(102,126,234,0.05)']}
                  style={styles.imageOverlay}
                />

                {/* Premium frame effect */}
                <View style={styles.imageFrame} />

                {/* Badges Container */}
                <View style={styles.badgeContainer}>
                  {product.isNew && (
                    <View style={styles.newBadgeWrapper}>
                      {renderNewBadge ? renderNewBadge() : defaultNewBadge()}
                    </View>
                  )}
                  
                  <View style={styles.badgeRow}>
                    {product.discount > 0 && (
                      renderDiscountBadge ? renderDiscountBadge(product.discount) : defaultDiscountBadge(product.discount)
                    )}
                    {product.isHot && (
                      renderHotBadge ? renderHotBadge() : defaultHotBadge()
                    )}
                  </View>
                </View>

                {/* Enhanced Star Rating */}
                <View style={styles.starWrapper}>
                  <LinearGradient
                    colors={['#ffd700', '#ffb347']}
                    style={styles.starGradient}
                  >
                    <Ionicons name="star" size={14} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.ratingText}>4.9</Text>
                </View>

                {/* Wishlist Button */}
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
              </View>

              {/* Product Info Section */}
              <View style={styles.productInfo}>
                {/* Product Name */}
                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>

                {/* Short Description */}
                <Text numberOfLines={1} style={styles.shortDesc}>
                  {product.shortDesc || "Hiệu suất tối ưu, giá hợp lý"}
                </Text>

                {/* Features Tags */}
                <View style={styles.featureTags}>
                  <View style={styles.featureTag}>
                    <MaterialIcons name="verified" size={10} color="#00d4aa" />
                    <Text style={styles.featureText}>CHÍNH HÃNG</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <MaterialIcons name="local-shipping" size={10} color="#667eea" />
                    <Text style={styles.featureText}>MIỄN PHÍ SHIP</Text>
                  </View>
                </View>

                {/* Enhanced Price Block */}
                <View style={styles.priceBlock}>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{product.price}₫</Text>
                    {product.originalPrice && (
                      <View style={styles.originalPriceContainer}>
                        <Text style={styles.originalPrice}>{product.originalPrice}₫</Text>
                        <View style={styles.strikeThrough} />
                      </View>
                    )}
                  </View>
                  
                  {product.originalPrice && (
                    <Text style={styles.savingsText}>
                      Tiết kiệm {((product.originalPrice - product.price) / 1000).toFixed(0)}K
                    </Text>
                  )}

                  {/* Installment Info */}
                  <Text style={styles.installmentText}>
                    Trả góp từ {Math.floor(product.price / 12).toLocaleString()}₫/tháng
                  </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity onPress={() => handleAddToCart(product)}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Premium Badge */}
              <View style={styles.premiumBadge}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.premiumGradient}
                >
                  <MaterialIcons name="diamond" size={12} color="#fff" />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        
        {/* Add spacing after last item */}
        <View style={{ width: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    marginBottom: 24,
  },
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
  linkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  scrollContainer: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 8,
  },
  productCard: {
    width: 200,
    marginRight: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  cardGradient: {
    padding: 16,
    position: 'relative',
    minHeight: 320,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: 100,
    height: 90,
    resizeMode: "contain",
    zIndex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imageFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(102,126,234,0.1)',
    borderRadius: 16,
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  newBadgeWrapper: {
    alignSelf: 'flex-start',
  },
  badgeRow: {
    flexDirection: "row",
    gap: 4,
  },
  defaultNewBadge: {
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
  defaultHotBadge: {
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
  defaultDiscountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  starWrapper: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starGradient: {
    borderRadius: 8,
    padding: 2,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 12,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  wishlistGradient: {
    padding: 6,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    alignItems: 'stretch',
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 4,
    lineHeight: 18,
    fontFamily: 'System',
  },
  shortDesc: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 8,
    fontStyle: 'italic',
  },
  featureTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102,126,234,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(102,126,234,0.2)',
  },
  featureText: {
    fontSize: 8,
    color: '#667eea',
    fontWeight: '700',
    marginLeft: 2,
  },
  priceBlock: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
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
    marginBottom: 2,
  },
  installmentText: {
    fontSize: 9,
    color: '#667eea',
    fontWeight: '500',
  },
  addToCartButton: {
    borderRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
});