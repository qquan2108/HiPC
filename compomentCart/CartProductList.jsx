import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import VariantSelectionModal from './VariantSelectionModal';

export default function CartProductList({ 
  cart, 
  onRemove, 
  onQuantity,
  onQuantityInput,
  onVariantChange,
  formatCurrency,
  selectedIds = [],
  onToggleSelect,
  onProductPress,
  ...props 
}) {
  const [editingQuantity, setEditingQuantity] = useState({});
  const [tempQuantity, setTempQuantity] = useState({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleQuantityInputFocus = (itemId, currentQuantity) => {
    setEditingQuantity(prev => ({ ...prev, [itemId]: true }));
    setTempQuantity(prev => ({ ...prev, [itemId]: currentQuantity.toString() }));
  };

  const handleQuantityInputBlur = async (itemId) => {
    const inputValue = tempQuantity[itemId];
    const newQuantity = parseInt(inputValue) || 1;
    
    if (onQuantityInput) {
      await onQuantityInput(itemId, newQuantity);
    }
    
    setEditingQuantity(prev => ({ ...prev, [itemId]: false }));
    setTempQuantity(prev => ({ ...prev, [itemId]: '' }));
  };

  const handleQuantityTextChange = (itemId, text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setTempQuantity(prev => ({ ...prev, [itemId]: numericText }));
  };

  // ✅ FIXED: Hàm mở modal chọn variant
  const handleVariantPress = (product) => {
    if (product.type === 'combo') return;

    // Lấy danh sách variants từ sản phẩm
    const productVariants = product.productId?.variants?.[0]?.options || [];
    
    if (!productVariants.length) {
      console.log('Product has no variants');
      return;
    }

    // Map variants sang format mới
    const variants = productVariants.map(option => ({
      _id: option._id,
      name: option.label,
      price: option.price || (product.productId.price + (option.priceDiff || 0)),
      stock: option.stock || 0,
      label: option.label
    }));

    setSelectedProduct({
      ...product,
      variants
    });
    setShowVariantModal(true);
  };

  // ✅ FIXED: Hàm xử lý khi chọn variant mới
  const handleVariantSelect = async (newVariant) => {
    if (selectedProduct && onVariantChange) {
      await onVariantChange(
        selectedProduct.id,
        selectedProduct.variant,
        newVariant._id
      );
    }
    setShowVariantModal(false);
    setSelectedProduct(null);
  };

  // ✅ IMPROVED: Render variant info với UI đẹp hơn
  const renderVariantInfo = (item) => {
    if (!item.variant || item.type === 'combo') return null;

    return (
      <TouchableOpacity
        style={styles.variantButton}
        onPress={() => handleVariantPress(item)}
      >
        <View style={styles.variantContent}>
          <Text style={styles.variantLabel}>
            {item.variant.label}
          </Text>
          <Text style={styles.variantStock}>
            Còn {item.variant.stock} sản phẩm
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  // Create a unique item ID function
  const getItemUniqueId = (item) => {
    return item.variant?._id 
      ? `${item.productId._id}-${item.variant._id}`
      : item.productId._id;
  };

  return (
    <View style={styles.cartBox}>
      {Array.isArray(cart) && cart.map(item => (
        typeof item === 'object' && item !== null && item.productId && item.productId.name ? (
          <TouchableOpacity
            // Create unique key combining product ID, variant ID and timestamp if exists
            key={getItemUniqueId(item)}
            activeOpacity={0.9}
            onPress={() => onProductPress && onProductPress(item)}
            disabled={item.type === 'combo'}
          >
            <View style={[
              styles.productCard,
              item.type === 'combo' && styles.comboCard,
              item.type === 'build' && styles.buildCard,
              selectedIds.includes(getItemUniqueId(item)) && styles.selectedCard
            ]}>
              {/* Checkbox với animation */}
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedIds.includes(getItemUniqueId(item)) && styles.checkboxSelected
                ]}
                onPress={() => onToggleSelect(getItemUniqueId(item))}
                activeOpacity={0.8}
              >
                <View style={styles.checkboxInner}>
                  {selectedIds.includes(getItemUniqueId(item)) && (
                    <Feather name="check" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Product Image Container */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.productId.image }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                
                {/* Badges */}
                {item.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                  </View>
                )}
                
                {item.type === 'combo' && (
                  <View style={styles.comboBadge}>
                    <Feather name="package" size={10} color="#fff" />
                    <Text style={styles.comboBadgeText}>COMBO</Text>
                  </View>
                )}
                
                {item.type === 'build' && (
                  <View style={styles.buildBadge}>
                    <Feather name="cpu" size={10} color="#fff" />
                    <Text style={styles.buildBadgeText}>BUILD</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text
                  style={[
                    styles.productName,
                    item.type === 'combo' && styles.comboProductName
                  ]}
                  numberOfLines={2}
                >
                  {item.productId.name}
                </Text>
                
                {/* Variant info */}
                {renderVariantInfo(item)}

                {/* Price section với thiết kế mới */}
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>
                      {formatCurrency(item.originalPrice)}
                    </Text>
                  )}
                </View>

                {/* Stock warning */}
                {item.stock && item.stock < 10 && (
                  <View style={styles.stockWarningContainer}>
                    <Feather name="alert-triangle" size={12} color="#ff6b35" />
                    <Text style={styles.stockWarning}>
                      Chỉ còn {item.stock} sản phẩm
                    </Text>
                  </View>
                )}
              </View>

              {/* Right Actions */}
              <View style={styles.rightActions}>
                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={16} color="#ff4757" />
                </TouchableOpacity>

                {/* Quantity controls */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    onPress={() => onQuantity(item.id, -1)} 
                    style={[styles.quantityBtn, styles.decreaseBtn]}
                    disabled={item.quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Feather 
                      name="minus" 
                      size={12} 
                      color={item.quantity <= 1 ? "#ccc" : "#666"} 
                    />
                  </TouchableOpacity>

                  <View style={styles.quantityInputContainer}>
                    {editingQuantity[item.id] ? (
                      <TextInput
                        style={styles.quantityInput}
                        value={tempQuantity[item.id] || ''}
                        onChangeText={(text) => handleQuantityTextChange(item.id, text)}
                        onBlur={() => handleQuantityInputBlur(item.id)}
                        keyboardType="numeric"
                        selectTextOnFocus
                        maxLength={3}
                        autoFocus
                      />
                    ) : (
                      <TouchableOpacity 
                        onPress={() => handleQuantityInputFocus(item.id, item.quantity)}
                        style={styles.quantityDisplay}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity 
                    onPress={() => onQuantity(item.id, 1)} 
                    style={[styles.quantityBtn, styles.increaseBtn]}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={12} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : null
      ))}

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        visible={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setSelectedProduct(null);
        }}
        variants={selectedProduct?.variants || []}
        selectedVariant={selectedProduct?.variant}
        onSelect={handleVariantSelect}
        formatCurrency={formatCurrency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cartBox: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
    minHeight: 120,
  },
  selectedCard: {
    borderColor: '#2979ff',
    borderWidth: 2,
    shadowColor: '#2979ff',
    shadowOpacity: 0.15,
  },
  comboCard: {
    backgroundColor: '#fef9f5',
    borderColor: '#ff6b35',
    borderWidth: 1,
  },
  buildCard: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2979ff',
    borderWidth: 1,
  },
  checkbox: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  checkboxSelected: {
    backgroundColor: '#2979ff',
    borderColor: '#2979ff',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 88,
    height: 88,
    marginRight: 16,
    position: 'relative',
    marginLeft: 12, // Space for checkbox
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  comboBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '#ff6b35',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  buildBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '#2979ff',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  comboProductName: {
    color: '#ff6b35',
  },
  variantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  variantContent: {
    flex: 1,
  },
  variantLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  variantStock: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stockWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockWarning: {
    fontSize: 11,
    color: '#ff6b35',
    fontWeight: '500',
    marginLeft: 4,
  },
  rightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 4,
    minHeight: 80,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  decreaseBtn: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  increaseBtn: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  quantityInputContainer: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 0,
  },
  quantityDisplay: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
});