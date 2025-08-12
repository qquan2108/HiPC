import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get('window');

const FlashSale = ({ flashSale, renderDiscountBadge, renderHotBadge, isLoggedIn, onRequireLogin, router }) => {
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Thời gian kết thúc flash sale (ví dụ: 1 giờ từ lúc load)
  const [timeLeft, setTimeLeft] = useState(3600); // 1 giờ = 3600 giây

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Hàm chuyển đổi giây sang giờ, phút, giây
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTime(timeLeft);

  // Khi bấm nút thêm giỏ hàng
  const handleAddToCart = async (product) => {
    if (product.variants && product.variants.length > 0 && product.variants[0]?.options?.length > 0) {
      setSelectedProduct(product);
      setSelectedOption(null);
      setQuantity(1);
      setShowOptionDialog(true);
      return;
    }

    if (!isLoggedIn) return onRequireLogin();
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', { user_id: userId, productId: product.id, quantity: 1 });
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
    } catch {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
    }
  };

  const handleConfirmOption = async () => {
    if (!selectedOption) {
      Toast.show({ type: 'info', text1: 'Vui lòng chọn phiên bản/cấu hình!' });
      return;
    }

    if (!isLoggedIn) return onRequireLogin();
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
        setShowOptionDialog(false);
        return router.push('/LoginScreen');
      }
      const userObj = JSON.parse(userStr);
      const userId = userObj._id || userObj.id;
      await axiosInstance.post('/cartt/add-to-cart', {
        user_id: userId,
        productId: selectedProduct.id || selectedProduct._id,
        quantity,
        variant: {
          key: selectedProduct.variants[0]?.key || 'Phiên bản',
          label: selectedOption.label || selectedOption.value || selectedOption.key,
          priceDiff: selectedOption.priceDiff || 0
        }
      });
      setShowOptionDialog(false);
      Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
    } catch (err) {
      Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
      setShowOptionDialog(false);
    }
  };

  const handleBuyNow = (product) => {
    if (!isLoggedIn) return onRequireLogin();
    // Thực hiện mua ngay
  };

  const handleFavorite = (product) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    // Thực hiện thêm vào yêu thích
  };

  const handleProductPress = (product) => {
    // Xem chi tiết sản phẩm luôn cho phép
    router.push({ pathname: '/ctsp', params: { id: product.id } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FF6B9D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.flashSaleBox}
      >
        {/* Header với gradient overlay */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={20} color="#FFD700" />
            </View>
            <Text style={styles.sectionTitle}>Khung Giờ Vàng</Text>
            <View style={styles.liveIndicator}>
              <View className="liveDot" style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          
          {/* Timer với hiệu ứng đẹp hơn */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Kết thúc sau</Text>
            <View style={styles.flashSaleTimer}>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{h}</Text>
                <Text style={styles.timerUnit}>H</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{m}</Text>
                <Text style={styles.timerUnit}>M</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{s}</Text>
                <Text style={styles.timerUnit}>S</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Products ScrollView */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={140}
          snapToAlignment="start"
        >
          {flashSale.map((item, index) => (
            <View key={item.id} style={[styles.flashSaleCard, { 
              marginLeft: index === 0 ? 16 : 8,
              marginRight: index === flashSale.length - 1 ? 16 : 0 
            }]}>
              {/* Discount Badge với gradient */}
              <LinearGradient
                colors={['#FF4757', '#FF3742']}
                style={styles.discountBadge}
              >
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </LinearGradient>

              {/* Hot Badge */}
              {item.isHot && (
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={12} color="#FF4757" />
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              )}

              {/* Product Image với shadow */}
              <TouchableOpacity
                onPress={() => handleProductPress(item)}
                style={styles.imageContainer}
              >
                <Image source={item.image} style={styles.flashSaleImage} />
              </TouchableOpacity>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text
                  numberOfLines={2}
                  style={styles.productNameSmall}
                  onPress={() => handleProductPress(item)}
                >
                  {item.name}
                </Text>
                
                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPriceSmall}>{item.price}</Text>
                    <View style={styles.originalPriceContainer}>
                      <Text style={styles.originalPriceSmall}>{item.originalPrice}</Text>
                      <View style={styles.strikethrough} />
                    </View>
                  </View>
                  
                  {/* Progress bar cho sold */}
                  <View style={styles.soldContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#FF6B6B', '#FF8E53']}
                        style={[styles.progressFill, { width: `${Math.min(item.soldPercentage || 60, 100)}%` }]}
                      />
                    </View>
                    <Text style={styles.soldText}>Đã bán {item.sold || Math.floor(Math.random() * 50) + 10}</Text>
                  </View>
                </View>
              </View>

              {/* Shimmer effect overlay */}
              <View style={styles.shimmerOverlay}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </View>

              {/* Buttons thêm vào giỏ hàng và mua ngay */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  onPress={() => handleAddToCart(item)}
                  style={styles.addToCartButton}
                >
                  <Ionicons name="cart" size={16} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Giỏ hàng</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleBuyNow(item)}
                  style={styles.buyNowButton}
                >
                  <Ionicons name="cart" size={16} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {/* View All Card */}
          <TouchableOpacity
            style={[styles.flashSaleCard, styles.viewAllCard]}
            onPress={() => router.push('/danhmucall')}
            activeOpacity={0.8}
          >
            <View style={styles.viewAllContent}>
              <MaterialIcons name="arrow-forward" size={24} color="#FF6B6B" />
              <Text style={styles.viewAllText}>Xem tất cả</Text> 
              <Text style={styles.viewAllSubtext}>Khám phá thêm</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal chọn phiên bản & số lượng */}
        <Modal
          visible={showOptionDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionDialog(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.25)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 22,
              width: '88%',
              maxWidth: 370,
              elevation: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 24,
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#222', letterSpacing: 0.2 }}>
                Chọn phiên bản & số lượng
              </Text>
              {selectedProduct && (
                <>
                  <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 12, color: '#444' }}>
                    {selectedProduct.name}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                    {selectedProduct.variants[0]?.options?.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedOption(option)}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 10,
                          borderRadius: 14,
                          backgroundColor: selectedOption === option ? '#667eea' : '#f3f4f6',
                          marginRight: 10,
                          borderWidth: selectedOption === option ? 2 : 1,
                          borderColor: selectedOption === option ? '#667eea' : '#e0e7ef',
                          flexDirection: 'row',
                          alignItems: 'center',
                          minWidth: 64,
                          position: 'relative',
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={{
                          color: selectedOption === option ? '#fff' : '#333',
                          fontWeight: selectedOption === option ? 'bold' : '500',
                          fontSize: 15,
                        }}>
                          {option.label || option}
                        </Text>
                        {option.priceDiff ? (
                          <Text style={{
                            color: selectedOption === option ? '#fff' : '#888',
                            fontSize: 12,
                            marginLeft: 6,
                            fontWeight: '600'
                          }}>
                            +{option.priceDiff.toLocaleString('vi-VN')}₫
                          </Text>
                        ) : null}
                        {selectedOption === option && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#fff"
                            style={{ marginLeft: 6, position: 'absolute', top: -10, right: -10, backgroundColor: '#667eea', borderRadius: 9 }}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontWeight: '600', marginRight: 14, fontSize: 15, color: '#333' }}>Số lượng:</Text>
                    <TouchableOpacity
                      onPress={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: quantity <= 1 ? '#e5e7eb' : '#f3f4f6',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: '#e0e7ef'
                      }}
                    >
                      <Ionicons name="remove" size={20} color={quantity <= 1 ? "#bbb" : "#667eea"} />
                    </TouchableOpacity>
                    <TextInput
                      style={{
                        width: 48, height: 36, borderRadius: 8,
                        borderWidth: 1, borderColor: '#e0e7ef',
                        marginHorizontal: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 16
                      }}
                      keyboardType="numeric"
                      value={quantity.toString()}
                      onChangeText={txt => {
                        const val = parseInt(txt.replace(/[^0-9]/g, '')) || 1;
                        setQuantity(val);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setQuantity(q => q + 1)}
                      style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: '#e0e7ef'
                      }}
                    >
                      <Ionicons name="add" size={20} color="#667eea" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => setShowOptionDialog(false)}
                      style={{
                        paddingVertical: 10, paddingHorizontal: 22,
                        borderRadius: 10, backgroundColor: '#e0e7ef', marginRight: 10
                      }}
                    >
                      <Text style={{ color: '#333', fontWeight: '700', fontSize: 15 }}>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleConfirmOption}
                      style={{
                        paddingVertical: 10, paddingHorizontal: 22,
                        borderRadius: 10, backgroundColor: '#667eea'
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Thêm vào giỏ</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  flashSaleBox: {
    borderRadius: 20,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timerText: {
    color: '#FF4757',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 18,
  },
  timerUnit: {
    color: '#FF4757',
    fontWeight: '600',
    fontSize: 8,
    marginTop: -2,
  },
  timerSeparator: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    marginHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  flashSaleCard: {
    width: 130,
    height: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 4,
    padding: 6,
    position: 'relative',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    justifyContent: 'flex-start',
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
    elevation: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FF4757',
  },
  hotText: {
    color: '#FF4757',
    fontWeight: '700',
    fontSize: 8,
    marginLeft: 2,
  },
  imageContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
  },
  flashSaleImage: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productNameSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
    textAlign: 'left',
    lineHeight: 14,
    minHeight: 28,
  },
  priceSection: {
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  productPriceSmall: {
    color: '#FF4757',
    fontWeight: '800',
    fontSize: 13,
  },
  originalPriceContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  originalPriceSmall: {
    fontSize: 9,
    color: '#95A5A6',
    fontWeight: '500',
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#95A5A6',
  },
  soldContainer: {
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  soldText: {
    fontSize: 8,
    color: '#74B9FF',
    fontWeight: '600',
    textAlign: 'center',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.6,
  },
  viewAllCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderStyle: 'dashed',
    marginRight: 16,
  },
  viewAllContent: {
    alignItems: 'center',
  },
  viewAllText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },
  viewAllSubtext: {
    color: '#95A5A6',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 4,
    marginRight: 1,
    alignItems: 'center',
    elevation: 1,
    minWidth: 0,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 4,
    marginLeft: 1,
    alignItems: 'center',
    elevation: 1,
    minWidth: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    marginLeft: 2,
  },
});

export default FlashSale;