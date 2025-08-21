import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function CartProductList({ 
  cart, 
  onRemove, 
  onQuantity, 
  formatCurrency, 
  onToggleSelect, 
  selectedIds,
  onQuantityInput,
  onProductPress,
  onVariantChange, // Thêm prop để xử lý thay đổi biến thể
  availableVariants // Thêm prop chứa các biến thể có sẵn cho từng sản phẩm
}) {
  const [editingQuantity, setEditingQuantity] = useState({});
  const [tempQuantity, setTempQuantity] = useState({});
  const [variantModalVisible, setVariantModalVisible] = useState(false);
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

  const handleVariantPress = (item) => {
    if (item.type === 'combo') return; // Không cho phép thay đổi biến thể combo
    setSelectedProduct(item);
    setVariantModalVisible(true);
  };

  const handleVariantSelect = (variantType, variantOption) => {
    if (onVariantChange && selectedProduct) {
      onVariantChange(selectedProduct.id, variantType, variantOption);
    }
    setVariantModalVisible(false);
    setSelectedProduct(null);
  };

  // Render từng dòng biến thể riêng biệt
  const renderVariantInfo = (item) => {
    if (!item.variant) return null;

    if (typeof item.variant === 'string') {
      return (
        <TouchableOpacity 
          style={styles.variantRow}
          onPress={() => handleVariantPress(item)}
          disabled={item.type === 'combo'}
        >
          <Text style={styles.variantLabel}>Phân loại:</Text>
          <Text style={styles.variantValue}>{item.variant}</Text>
          {item.type !== 'combo' && (
            <Feather name="chevron-down" size={14} color="#999" />
          )}
        </TouchableOpacity>
      );
    }

    if (typeof item.variant === 'object' && Object.keys(item.variant).length > 0) {
      return (
        <View style={styles.variantContainer}>
          {Object.entries(item.variant).map(([variantType, v], idx) => {
            // Nếu key và label đều có dấu "+" thì tách ra từng dòng
            if (
              variantType.includes('+') &&
              typeof v === 'object' &&
              v.label &&
              v.label.includes(' + ')
            ) {
              const keys = variantType.split('+').map(k => k.trim());
              const labels = v.label.split(' + ').map(l => l.trim());
              return keys.map((key, i) => (
                <TouchableOpacity
                  key={`${key}_${i}_${idx}`}
                  style={styles.variantRow}
                  onPress={() => handleVariantPress(item)}
                  disabled={item.type === 'combo'}
                >
                  <Text style={styles.variantLabel}>{key}:</Text>
                  <Text style={styles.variantValue}>{labels[i] || ''}</Text>
                  {item.type !== 'combo' && (
                    <Feather name="chevron-down" size={14} color="#999" />
                  )}
                </TouchableOpacity>
              ));
            }
            // Trường hợp thông thường
            const displayValue =
              typeof v === 'object' && v !== null
                ? (v.label || v.value || v)
                : v;
            return (
              <TouchableOpacity
                key={`${variantType}_${idx}`}
                style={styles.variantRow}
                onPress={() => handleVariantPress(item)}
                disabled={item.type === 'combo'}
              >
                <Text style={styles.variantLabel}>{variantType}:</Text>
                <Text style={styles.variantValue}>{displayValue}</Text>
                {item.type !== 'combo' && (
                  <Feather name="chevron-down" size={14} color="#999" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return null;
  };

  // Modal chọn biến thể
  const renderVariantModal = () => {
    if (!selectedProduct || !availableVariants || !availableVariants[selectedProduct.id]) {
      return null;
    }

    const productVariants = availableVariants[selectedProduct.id];

    return (
      <Modal
        visible={variantModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVariantModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phân loại</Text>
              <TouchableOpacity 
                onPress={() => setVariantModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {Object.entries(productVariants).map(([variantType, options]) => (
                <View key={variantType} style={styles.variantSection}>
                  <Text style={styles.variantSectionTitle}>{variantType}</Text>
                  <View style={styles.variantOptions}>
                    {options.map((option, index) => {
                      const isSelected = selectedProduct.variant && 
                        selectedProduct.variant[variantType] === option.value;
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.variantOption,
                            isSelected && styles.variantOptionSelected
                          ]}
                          onPress={() => handleVariantSelect(variantType, option)}
                        >
                          <Text style={[
                            styles.variantOptionText,
                            isSelected && styles.variantOptionTextSelected
                          ]}>
                            {option.label}
                          </Text>
                          {option.priceChange && option.priceChange !== 0 && (
                            <Text style={[
                              styles.variantPriceChange,
                              isSelected && styles.variantPriceChangeSelected
                            ]}>
                              {option.priceChange > 0 ? '+' : ''}{formatCurrency(option.priceChange)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.cartBox}>
      {cart.map(item => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          onPress={() => onProductPress && onProductPress(item)}
          disabled={item.type === 'combo'}
        >
          <View
            style={[
              styles.productCard,
              item.type === 'combo' && { backgroundColor: '#fef7f0' },
              item.type === 'build' && { backgroundColor: '#e3f2fd' }
            ]}
          >
            {/* Checkbox */}
            <TouchableOpacity
              style={[
                styles.checkbox,
                selectedIds.includes(item.id) && styles.checkboxSelected
              ]}
              onPress={() => onToggleSelect(item.id)}
              activeOpacity={0.8}
            >
              <Feather
                name={selectedIds.includes(item.id) ? "check" : ""}
                size={16}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Product Image */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.productImage} />
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{item.discount}%</Text>
                </View>
              )}
              {item.type === 'combo' && (
                <View style={styles.comboBadge}>
                  <Text style={styles.comboBadgeText}>COMBO</Text>
                </View>
              )}
              {item.type === 'build' && (
                <View style={styles.buildBadge}>
                  <Text style={styles.buildBadgeText}>BUILD</Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text
                style={[
                  styles.productName,
                  item.type === 'combo' && { color: '#ff6b35' }
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              
              {/* Enhanced Variant Display */}
              {renderVariantInfo(item)}

              {/* Price section */}
              <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>
                  {formatCurrency(item.price)}
                </Text>
                {item.originalPrice && item.originalPrice > item.price && (
                  <Text style={styles.originalPrice}>
                    {formatCurrency(item.originalPrice)}
                  </Text>
                )}
              </View>

              {/* Quantity controls */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  onPress={() => onQuantity(item.id, -1)} 
                  style={[styles.quantityBtn, styles.decreaseBtn]}
                  disabled={item.quantity <= 1}
                >
                  <Feather 
                    name="minus" 
                    size={14} 
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
                    >
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  onPress={() => onQuantity(item.id, 1)} 
                  style={[styles.quantityBtn, styles.increaseBtn]}
                >
                  <Feather name="plus" size={14} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Stock warning */}
              {item.stock && item.stock < 10 && (
                <Text style={styles.stockWarning}>
                  Chỉ còn {item.stock} sản phẩm
                </Text>
              )}
            </View>

            {/* Remove button */}
            <TouchableOpacity
              onPress={() => onRemove(item.id)}
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={18} color="#ff4757" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {/* Variant Selection Modal */}
      {renderVariantModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  cartBox: {
    paddingHorizontal: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff424e',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  comboBadge: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: '#ff6b35',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comboBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buildBadge: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: '#2979ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  buildBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
  },
  // Enhanced Variant Styles
  variantContainer: {
    marginBottom: 8,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  variantLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    minWidth: 60,
  },
  variantValue: {
    fontSize: 12,
    color: '#e53935',
    fontWeight: '600',
    flex: 1,
    marginLeft: 4,
  },
  priceSection: {
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  decreaseBtn: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  increaseBtn: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  quantityInputContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    minWidth: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    fontSize: 14,
    textAlign: 'center',
    padding: 0,
    width: '100%',
    height: '100%',
    color: '#333',
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
    fontWeight: '500',
  },
  stockWarning: {
    fontSize: 11,
    color: '#ff6b35',
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  variantSection: {
    marginBottom: 24,
  },
  variantSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    minWidth: 80,
    alignItems: 'center',
  },
  variantOptionSelected: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff5f5',
  },
  variantOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  variantOptionTextSelected: {
    color: '#ee4d2d',
    fontWeight: '600',
  },
  variantPriceChange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  variantPriceChangeSelected: {
    color: '#ee4d2d',
  },
});