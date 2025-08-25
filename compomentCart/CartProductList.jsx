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

  // Fixed: Open variant selection modal
  const handleVariantPress = (product) => {
    if (product.type === 'combo') return;

    const productVariants = product.productId?.variants?.[0]?.options || [];
    
    if (!productVariants.length) {
      console.log('Product has no variants');
      return;
    }

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

  // Fixed: Handle variant selection
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

  // Fixed: Render variant info
  const renderVariantInfo = (item) => {
    if (!item.variant || item.type === 'combo') return null;

    return (
      <TouchableOpacity
        style={styles.variantButton}
        onPress={() => handleVariantPress(item)}
      >
        <View style={styles.variantContent}>
          <View style={styles.variantDetails}>
            <Text style={styles.variantLabel}>
              Phiên bản: {item.variant.label}
            </Text>
            <Feather name="edit-2" size={14} color="#2979ff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ENHANCED: Render combo products with improved spacing and layout
  const renderComboProducts = (item) => {
    if (item.type !== 'combo') return null;

    const cd = item.comboDetails;
    const productList = Array.isArray(cd?.products) ? cd.products : [];

    if (!productList.length) {
      return (
        <View style={styles.comboProductsWrap}>
          <View style={styles.comboHeaderRow}>
            <View style={styles.comboHeaderContent}>
              <Feather name="package" size={14} />
              <Text style={styles.comboHeaderText}>
                🎮 {cd?.name || 'Combo'}
              </Text>
            </View>
          </View>
          <Text style={styles.comboEmptyText}>Đang tải thông tin combo...</Text>
        </View>
      );
    }

    // Map products with just name, variant and image
    const lineItems = productList.map((p) => {
      const v = p?._displayVariant || p?.selectedVariant;
      const variantLabel = v?.name || null;
      const image = p?.image || p?.productId?.image || item.image || '';

      return {
        _id: p?._id || p?.productId?._id || p?.productId || Math.random().toString(36).slice(2),
        name: p?.name || p?.productId?.name || 'Sản phẩm',
        variantLabel,
        image,
      };
    });

    return (
      <View style={styles.comboProductsWrap}>
        <View style={styles.comboHeaderRow}>
          <View style={styles.comboHeaderContent}>
            <Feather name="package" size={14} />
            <Text style={styles.comboHeaderText}>
              🎮 {cd?.name || 'Combo'}
            </Text>
          </View>
          <Text style={styles.comboPriceText}>
            {formatCurrency ? formatCurrency(item.price) : `${item.price.toLocaleString()} đ`}
          </Text>
        </View>

        {lineItems.map((row, index) => (
          <View key={row._id} style={styles.comboLine}>
            <View style={styles.productIndex}>
              <Text style={styles.productIndexText}>{index + 1}</Text>
            </View>

            <Image
              source={typeof row.image === 'string' && row.image ? { uri: row.image } : require('../assets/images/pc1.png')}
              style={styles.comboThumb}
            />
            
            <View style={styles.comboLineContent}>
              {/* Product name with better spacing */}
              <Text style={styles.comboProdName}>
                {row.name}
              </Text>

              {/* Variant display with improved layout */}
              {row.variantLabel ? (
                <View style={styles.variantBadgeWrap}>
                  <Text style={styles.variantBadge}>
                    {row.variantLabel}
                  </Text>
                </View>
              ) : (
                <View style={styles.variantBadgeWrap}>
                  <Text style={styles.variantBadgeMuted}>Chưa có biến thể</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Fixed: Get unique item ID
  const getItemUniqueId = (item) => {
    if (item.type === 'combo') {
      return `combo_${item.comboId?._id || item.comboId}`;
    }
    return item.variant?._id 
      ? `${item.productId?._id || item.productId}-${item.variant._id}`
      : item.productId?._id || item.productId;
  };

  // ✅ Update image handling with priority order
  const getProductImage = (item) => {
    if (item.type === 'combo') {
      const cd = item.comboDetails;
      if (cd?.image) return cd.image;
      const firstImg = cd?.products?.[0]?.image || item.productIds?.[0]?.image;
      return firstImg || item.image || '';
    }
    return item.productId?.image || item.image || '';
  };

  // ✅ Update combo name handling
  const getProductName = (item) => {
    if (item.type === 'combo') {
      return item.comboDetails?.name || item.name || `Combo ${item.comboId}`;
    }
    return item.productId?.name || item.name || 'Sản phẩm';
  };

  return (
    <View style={styles.cartBox}>
      {Array.isArray(cart) && cart.map(item => {
        const uniqueId = getItemUniqueId(item);
        const isSelected = selectedIds.includes(uniqueId);
        
        return (
          <TouchableOpacity
            key={uniqueId}
            activeOpacity={0.9}
            onPress={() => onProductPress && onProductPress(item)}
            disabled={item.type === 'combo'}
          >
            <View style={[
              styles.productCard,
              item.type === 'combo' && styles.comboCard,
              isSelected && styles.selectedCard
            ]}>
              {/* Checkbox */}
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected
                ]}
                onPress={() => onToggleSelect && onToggleSelect(uniqueId)}
                activeOpacity={0.8}
              >
                <View style={styles.checkboxInner}>
                  {isSelected && (
                    <Feather name="check" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: getProductImage(item) }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                
                {/* Combo badge */}
                {item.type === 'combo' && (
                  <View style={styles.comboBadge}>
                    <Feather name="package" size={10} color="#fff" />
                    <Text style={styles.comboBadgeText}>COMBO</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                {/* Product Name */}
                <Text style={[
                  styles.productName, 
                  item.type === 'combo' && styles.comboName
                ]} numberOfLines={2}>
                  {item.type === 'combo' ? '🎮 ' : ''}{getProductName(item)}
                </Text>

                {/* Variant Info for regular products */}
                {renderVariantInfo(item)}

                {/* Combo Products List */}
                {renderComboProducts(item)}

                {/* Price section */}
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    {formatCurrency ? formatCurrency(item.price) : `${item.price}đ`}
                  </Text>
                </View>
              </View>

              {/* Quantity controls */}
              <View style={styles.rightActions}>
                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => onRemove && onRemove(uniqueId)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={16} color="#ff4757" />
                </TouchableOpacity>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    onPress={() => onQuantity && onQuantity(uniqueId, -1)} 
                    style={styles.quantityBtn}
                    disabled={item.quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Feather name="minus" size={12} color="#666" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.quantityInput}
                    value={String(item.quantity || 1)}
                    onChangeText={(text) => handleQuantityTextChange(uniqueId, text)}
                    keyboardType="numeric"
                    maxLength={3}
                  />

                  <TouchableOpacity 
                    onPress={() => onQuantity && onQuantity(uniqueId, 1)} 
                    style={styles.quantityBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={12} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Variant Selection Modal */}
      {selectedProduct && (
        <VariantSelectionModal
          visible={showVariantModal}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedProduct(null);
          }}
          variants={selectedProduct.variants || []}
          selectedVariant={selectedProduct.variant}
          onSelect={handleVariantSelect}
          formatCurrency={formatCurrency}
        />
      )}
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
    backgroundColor: '#fff',
    borderColor: '#ff6b3520',
    borderWidth: 1,
    minHeight: 300, // Increased for better combo display
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
    marginLeft: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  comboBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comboBadgeText: {
    color: '#fff', 
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  comboName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b35',
    marginBottom: 8,
  },
  variantButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  variantContent: {
    gap: 4,
  },
  variantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
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
  quantityInput: {
    width: 36,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 0,
    backgroundColor: '#fff',
  },
  // ENHANCED: Improved Combo styles for better spacing
  comboProductsWrap: {
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ff6b3520',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  comboHeaderRow: {
    padding: 12,
    backgroundColor: '#fff8f3',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4d6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comboHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  comboHeaderText: {
    fontSize: 13,
    color: '#ff6b35',
    fontWeight: '600',
    flex: 1,
  },
  comboPriceText: {
    fontSize: 13,
    color: '#ee4d2d',
    fontWeight: '600',
    marginLeft: 8,
  },
  comboLine: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'flex-start',
    minHeight: 70, // Ensure minimum height for proper spacing
  },
  comboLineContent: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'flex-start',
  },
  comboProdName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 18, // Better line height for readability
    flexWrap: 'wrap',
  },
  variantBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  variantBadge: {
    fontSize: 12,
    color: '#2979ff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4, // Increased vertical padding
    borderRadius: 12,
    lineHeight: 16, // Better line height
    textAlign: 'left',
    flexShrink: 1,
  },
  variantBadgeMuted: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4, // Increased vertical padding
    borderRadius: 12,
    fontStyle: 'italic',
    lineHeight: 16, // Better line height
    textAlign: 'left',
    flexShrink: 1,
  },
  comboThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
    marginRight: 12,
    flexShrink: 0,
  },
  productIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
    marginTop: 2, // Slight top margin to align with text
  },
  productIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  comboEmptyText: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});