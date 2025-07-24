import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput,
  Animated
} from "react-native";
import Toast from "react-native-toast-message";

export default function CartProductList({ 
  cart, 
  onRemove, 
  onQuantity, 
  formatCurrency, 
  onToggleSelect, 
  selectedIds,
  onQuantityInput // Thêm prop mới để xử lý input số lượng
}) {
  const [editingQuantity, setEditingQuantity] = useState({});
  const [tempQuantity, setTempQuantity] = useState({});

  const handleQuantityInputFocus = (itemId, currentQuantity) => {
    setEditingQuantity(prev => ({ ...prev, [itemId]: true }));
    setTempQuantity(prev => ({ ...prev, [itemId]: currentQuantity.toString() }));
  };

  const handleQuantityInputBlur = async (itemId) => {
    const inputValue = tempQuantity[itemId];
    const newQuantity = parseInt(inputValue) || 1;
    
    // Gọi callback để xử lý validation và cập nhật
    if (onQuantityInput) {
      await onQuantityInput(itemId, newQuantity);
    }
    
    setEditingQuantity(prev => ({ ...prev, [itemId]: false }));
    setTempQuantity(prev => ({ ...prev, [itemId]: '' }));
  };

  const handleQuantityTextChange = (itemId, text) => {
    // Chỉ cho phép nhập số
    const numericText = text.replace(/[^0-9]/g, '');
    setTempQuantity(prev => ({ ...prev, [itemId]: numericText }));
  };

  return (
    <View style={styles.cartBox}>
      {cart.map(item => (
        <View key={item.id} style={styles.productCard}>
          {/* Checkbox với animation */}
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

          {/* Product Image với shadow */}
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.productImage} />
            {/* Badge discount nếu có */}
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.variant && (
          <Text style={styles.variantText} numberOfLines={1}>
            Phiên bản: {item.variant.label}
          </Text>
        )}
            {/* Price section với styling giống Shopee/Tiki */}
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

            {/* Quantity controls với input */}
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

              {/* Input số lượng có thể chỉnh sửa */}
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

            {/* Stock info nếu có */}
            {item.stock && item.stock < 10 && (
              <Text style={styles.stockWarning}>
                Chỉ còn {item.stock} sản phẩm
              </Text>
            )}
          </View>

          {/* Remove button với animation */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color="#ff4757" />
          </TouchableOpacity>
        </View>
      ))}
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
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4,
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
  variantText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 4,
    fontStyle: 'italic',
  },
});