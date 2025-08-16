import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get('window');

export default function FlashSale  ({ flashSale, renderDiscountBadge, renderHotBadge, isLoggedIn, onRequireLogin, router })  {
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [buyNowInfo, setBuyNowInfo] = useState({ address: '', paymentMethod: '', shippingMethod: '', voucher: '' });
  const [optionDialogMode, setOptionDialogMode] = useState('cart'); // 'cart' hoặc 'buy'

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
  // Xử lý thêm vào giỏ hàng (KHÔNG mở modal mua ngay)
const handleAddToCart = async (product, event) => {
  event?.stopPropagation();

  if (product.variants && product.variants.length > 0 && product.variants[0]?.options?.length > 0) {
    setSelectedProduct(product);
    setSelectedOption(null);
    setQuantity(1);
    setOptionDialogMode('cart'); // mở từ giỏ hàng
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

// Xác nhận chọn biến thể để thêm vào giỏ hàng (KHÔNG mua ngay)
const handleConfirmOption = async () => {
  if (!selectedOption) {
    Toast.show({ type: 'info', text1: 'Vui lòng chọn phiên bản/cấu hình!' });
    return;
  }

  if (optionDialogMode === 'buy') {
    // Sử dụng hàm parsePrice để lấy giá số
    let basePrice = parsePrice(selectedProduct.price);
    let priceDiff = Number(selectedOption.priceDiff) || 0;
    // Log giá trị thực tế để debug
    console.log('DEBUG: basePrice:', basePrice, '| priceDiff:', priceDiff, '| selectedProduct:', selectedProduct);

    if (!basePrice || isNaN(basePrice)) {
      Toast.show({ type: 'error', text1: `Giá sản phẩm không hợp lệ: ${selectedProduct.price}` });
      return;
    }

    const finalPrice = basePrice + priceDiff;

    setShowOptionDialog(false);
    const selected = [{
      id: selectedProduct.id || selectedProduct._id,
      name: selectedProduct.name,
      price: finalPrice,
      image: selectedProduct.image,
      quantity: quantity,
      variant: {
        key: selectedProduct.variants[0]?.key || 'Phiên bản',
        label: selectedOption.label || selectedOption.value || selectedOption.key,
        priceDiff: priceDiff
      }
    }];
    router.push({
      pathname: "/pay",
      params: {
        selectedProducts: JSON.stringify(selected),
      },
    });
    return;
  }

  // Mặc định: thêm vào giỏ hàng
  if (!isLoggedIn) return onRequireLogin();

  try {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      Toast.show({ type:'error', text1:'Vui lòng đăng nhập để mua hàng!', position:'top' });
      return router.push('/LoginScreen');
    }
    const userObj = JSON.parse(userStr);
    const userId = userObj._id || userObj.id;
    await axiosInstance.post('/cartt/add-to-cart', {
      user_id: userId,
      productId: selectedProduct.id || selectedProduct._id,
      quantity: Number(quantity) || 1,
      variant: {
        key: selectedProduct.variants[0]?.key || 'Phiên bản',
        label: selectedOption.label || selectedOption.value || selectedOption.key,
        priceDiff: selectedOption.priceDiff || 0
      }
    });
    Toast.show({ type:'success', text1:'Đã thêm vào giỏ hàng!', position:'bottom' });
    setShowOptionDialog(false);
  } catch {
    Toast.show({ type:'error', text1:'Thêm giỏ hàng thất bại!', position:'top' });
    setShowOptionDialog(false);
  }
};

// Xử lý "Mua ngay"
const handleBuyNow = (product, event) => {
  event?.stopPropagation();

  setSelectedProduct(product);
  setSelectedOption(null);
  setQuantity(1);

  if (product.variants && product.variants.length > 0 && product.variants[0]?.options?.length > 0) {
    setOptionDialogMode('buy'); // mở từ mua ngay
    setShowOptionDialog(true);
  } else {
    const selected = [{
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    }];
    router.push({
      pathname: "/pay",
      params: {
        selectedProducts: JSON.stringify(selected),
      },
    });
  }
};

// Xác nhận chọn biến thể để "Mua ngay"


  const handleFavorite = (product, event) => {
    event?.stopPropagation();
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    // Thực hiện thêm vào yêu thích
  };

  const handleProductPress = (product) => {
    // Đảm bảo navigation hoạt động đúng
    if (router && router.push) {
      router.push({ 
        pathname: '/ctsp', 
        params: { id: product.id || product._id } 
      });
    }
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
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          
          {/* Timer với hiệu ứng đẹp hơn */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Kết thúc sau</Text>
            <View style={styles.flashSaleTimer}>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{h}</Text>
                <Text style={styles.timerUnit}>GIỜ</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{m}</Text>
                <Text style={styles.timerUnit}>PHÚT</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{s}</Text>
                <Text style={styles.timerUnit}>GIÂY</Text>
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
          snapToInterval={150}
          snapToAlignment="start"
        >
          {flashSale.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleProductPress(item)}
              style={[styles.flashSaleCard, { 
                marginLeft: index === 0 ? 16 : 8,
                marginRight: index === flashSale.length - 1 ? 16 : 0 
              }]}
              android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: false }}
            >
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

              {/* Favorite Button */}
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => handleFavorite(item, e)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart-outline" size={16} color="#FF6B6B" />
              </TouchableOpacity>

              {/* Product Image với shadow */}
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.flashSaleImage} />
                {/* Stock indicator */}
                <View style={styles.stockIndicator}>
                  <View style={[styles.stockDot, { backgroundColor: item.inStock ? '#00C851' : '#FF4444' }]} />
                  <Text style={styles.stockText}>{item.inStock ? 'Còn hàng' : 'Con hàng'}</Text>
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productNameSmall}>
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
                  
                  {/* Progress bar cho sold với animation */}
                  <View style={styles.soldContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#FF6B6B', '#FF8E53']}
                        style={[styles.progressFill, { width: `${Math.min(item.soldPercentage || 60, 100)}%` }]}
                      />
                    </View>
                    <View style={styles.soldRow}>
                      <Text style={styles.soldText}>Đã bán {item.sold || Math.floor(Math.random() * 50) + 10}</Text>
                      <Text style={styles.ratingText}>⭐ {item.rating || '4.5'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Shimmer effect overlay */}
              <View style={styles.shimmerOverlay}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                  start={{ x: -1, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </View>

              {/* Buttons với gradient và shadow */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  onPress={(e) => handleAddToCart(item, e)}
                  style={styles.addToCartButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF5252']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Giỏ hàng</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={(e) => handleBuyNow(item, e)}
                  style={styles.buyNowButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFC107']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="flash" size={14} color="#FFFFFF" />
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Mua ngay</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          ))}
          
          {/* View All Card với animation */}
          <TouchableOpacity
            style={[styles.flashSaleCard, styles.viewAllCard]}
            onPress={() => router.push('/danhmucall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
              style={styles.viewAllGradient}
            >
              <View style={styles.viewAllContent}>
                <View style={styles.viewAllIcon}>
                  <MaterialIcons name="arrow-forward" size={28} color="#FF6B6B" />
                </View>
                <Text style={styles.viewAllText}>Xem tất cả</Text> 
                <Text style={styles.viewAllSubtext}>Khám phá thêm sản phẩm hot</Text>
                <View style={styles.viewAllBadge}>
                  <Text style={styles.viewAllBadgeText}>999+</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal chọn phiên bản & số lượng - Enhanced */}
        <Modal
          visible={showOptionDialog}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOptionDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn phiên bản & số lượng</Text>
                <TouchableOpacity
                  onPress={() => setShowOptionDialog(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedProduct && (
                <>
                  <View style={styles.productPreview}>
                    <Image source={selectedProduct.image} style={styles.modalProductImage} />
                    <View style={styles.productDetails}>
                      <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                      <Text style={styles.modalProductPrice}>
                        {selectedProduct.price !== undefined && selectedProduct.price !== null
                          ? (parsePrice(selectedProduct.price) + Number(selectedOption?.priceDiff || 0)).toLocaleString('vi-VN') + '₫'
                          : 'Chưa có giá'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sectionLabel}>Chọn phiên bản:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                    {selectedProduct.variants[0]?.options?.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedOption(option)}
                        style={[
                          styles.optionButton,
                          selectedOption === option && styles.optionButtonSelected
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.optionText,
                          selectedOption === option && styles.optionTextSelected
                        ]}>
                          {option.label || option}
                        </Text>
                        {option.priceDiff ? (
                          <Text style={[
                            styles.priceDiffText,
                            selectedOption === option && styles.priceDiffTextSelected
                          ]}>
                            +{Math.abs(option.priceDiff).toLocaleString('vi-VN')}₫
                          </Text>
                        ) : null}
                        {selectedOption === option && (
                          <View style={styles.selectedIndicator}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.sectionLabel}>Số lượng:</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    >
                      <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#667eea"} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={quantity.toString()}
                      onChangeText={txt => {
                        const val = parseInt(txt.replace(/[^0-9]/g, '')) || 1;
                        setQuantity(val);
                      }}
                      textAlign="center"
                    />
                    <TouchableOpacity
                      onPress={() => setQuantity(q => q + 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={20} color="#667eea" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setShowOptionDialog(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleConfirmOption}
                      style={styles.confirmButton}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.confirmButtonGradient}
                      >
                        <Text style={styles.confirmButtonText}>
                          {optionDialogMode === 'buy' ? 'Mua ngay' : 'Thêm vào giỏ'}
                        </Text>
                      </LinearGradient>
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
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  sectionTitle: {
    fontWeight: '900',
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  timerText: {
    color: '#FF4757',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 20,
  },
  timerUnit: {
    color: '#FF4757',
    fontWeight: '600',
    fontSize: 9,
    marginTop: -1,
    letterSpacing: 0.2,
  },
  timerSeparator: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    marginHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  flashSaleCard: {
    width: 140,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
    padding: 8,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 3,
    elevation: 5,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#FF4757',
  },
  hotText: {
    color: '#FF4757',
    fontWeight: '800',
    fontSize: 9,
    marginLeft: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 6,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    height: 70,
    justifyContent: 'center',
    position: 'relative',
  },
  flashSaleImage: {
    width: '100%',
    height: 55,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  stockIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 3,
  },
  stockText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#333',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
    textAlign: 'left',
    lineHeight: 16,
    minHeight: 32,
  },
  priceSection: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productPriceSmall: {
    color: '#FF4757',
    fontWeight: '800',
    fontSize: 14,
  },
  originalPriceContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  originalPriceSmall: {
    fontSize: 10,
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
    marginTop: 4,
  },
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  soldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soldText: {
    fontSize: 9,
    color: '#74B9FF',
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 9,
    color: '#FFD700',
    fontWeight: '600',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  viewAllCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    borderStyle: 'dashed',
    marginRight: 16,
    overflow: 'hidden',
  },
  viewAllGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  viewAllContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    color: '#FF6B6B',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  viewAllSubtext: {
    color: '#95A5A6',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  viewAllBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  viewAllBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#222',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPreview: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalProductImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'contain',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  modalProductName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  modalProductPrice: {
    color: '#FF4757',
    fontWeight: '800',
    fontSize: 18,
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    position: 'relative',
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  priceDiffText: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  priceDiffTextSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e7ef',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    marginHorizontal: 16,
    fontWeight: '700',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  // Modal mua ngay Styles
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  paymentMethodText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  shippingMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shippingMethodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shippingMethodSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  shippingMethodText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  inputField: {
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e7ef',
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
  },
});

// Hàm phân tích và chuyển đổi giá
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    // Loại bỏ ký tự không phải số
    const cleaned = price.replace(/[^\d]/g, '');
    return Number(cleaned);
  }
  return 0;
}